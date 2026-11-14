# Security Specification — müzikbank Persistent MP3 Catalog

## 1. Data Invariants
1. **Admin-Only Catalog Mutation**: Only verified administrators (`request.auth.token.email_verified == true` and either `request.auth.token.email == 'masterartscholl@gmail.com'` or an existing `/admins/{uid}` record) may create, update, or delete documents in `uploadedTracks`, `uploadedTracks/{trackId}/chunks`, or `deletedTracks`.
2. **No Self-Assigned Admin Roles**: Arbitrary authenticated users cannot create `/admins/{uid}` documents or inject `role`/`isAdmin` fields on any document.
3. **Orphan-Free Chunk Storage (Master Gate)**: Every `uploadedTracks/{trackId}/chunks/{chunkId}` document requires the parent `uploadedTracks/{trackId}` document to exist (`exists(...)` or `existsAfter(...)` on atomic creation).
4. **Strict Schema & No Shadow Fields**: Every write validates exact key sets via `hasAll` and `hasOnly` (on create) and `affectedKeys().hasOnly(...)` (on update), rejecting unexpected ghost fields.
5. **Bounded Payloads & 1MB Protection**: Every string field enforces strict `.size()` bounds (`data.size() <= 600000` per chunk, `title.size() <= 200`, `id.size() <= 128`, etc.), and every array (`sectors`, `tags`, `targetPlaylistIds`) is strictly bounded in size with element type guards.
6. **Immutable Ownership & Server Timestamps**: `ownerUid` and `createdAt` must equal `request.auth.uid` and `request.time` on create and cannot be altered on update; `updatedAt` must equal `request.time` on update.
7. **PII-Free Public Catalog Reads**: Catalog collections (`uploadedTracks`, `chunks`, `deletedTracks`) store zero PII (`email`, `phone`, `address`) and require explicit field checks on `list` queries (`existing().isCommercialCleared is bool`, `existing().kind in ['audio', 'cover']`, `existing().trackId is string`).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Track Creation**: Anonymous caller attempts `create` on `/uploadedTracks/trk-evil-1`. Expect `PERMISSION_DENIED`.
2. **Non-Admin Track Creation**: Verified non-admin user attempts `create` on `/uploadedTracks/trk-nonadmin-1`. Expect `PERMISSION_DENIED`.
3. **Unverified Admin Email Spoof**: Caller with `email: 'masterartscholl@gmail.com'` and `email_verified: false` attempts `create` on `/uploadedTracks/trk-spoof-1`. Expect `PERMISSION_DENIED`.
4. **Shadow Field Injection ("Ghost Field")**: Admin attempts `create` on `/uploadedTracks/trk-ghost-1` with extra `isVerifiedAdmin: true`. Expect `PERMISSION_DENIED`.
5. **Owner Identity Spoofing**: Admin attempts `create` on `/uploadedTracks/trk-id-spoof` with `ownerUid: 'other-user-uid'`. Expect `PERMISSION_DENIED`.
6. **Client-Forged Timestamp**: Admin attempts `create` on `/uploadedTracks/trk-time-forge` with backdated `createdAt` instead of `request.time`. Expect `PERMISSION_DENIED`.
7. **Path ID Poisoning**: Admin attempts write with oversized/invalid characters in `{trackId}` (`trk$$$invalid...`). Expect `PERMISSION_DENIED`.
8. **Denial-of-Wallet Oversized String**: Admin attempts `create` on `/uploadedTracks/trk-1/chunks/c-0` with `data.length > 600000` (e.g. 950KB). Expect `PERMISSION_DENIED`.
9. **Orphaned Media Chunk**: Admin attempts `create` on `/uploadedTracks/nonexistent-parent/chunks/audio_0` without an existing or atomic `existsAfter` parent. Expect `PERMISSION_DENIED`.
10. **Immutable Field Tampering on Update**: Admin attempts `update` on `/uploadedTracks/trk-1` changing `createdAt` or `ownerUid`. Expect `PERMISSION_DENIED`.
11. **Value Poisoning on Update**: Admin attempts `update` on `/uploadedTracks/trk-1` setting `bpm: "fast"` (wrong type) or `title: ""` (empty string). Expect `PERMISSION_DENIED`.
12. **Self-Assigned Admin Escalation**: Non-admin user attempts `create` on `/admins/{theirUid}` with `{ uid: theirUid, role: 'admin' }`. Expect `PERMISSION_DENIED`.
