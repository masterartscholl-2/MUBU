/**
 * Security Rules Dirty Dozen Adversarial Verification Harness
 * Validates all 12 Dirty Dozen attack payloads documented in security_spec.md.
 */

export interface AdversarialTestCase {
  id: number;
  name: string;
  operation: 'create' | 'update' | 'delete' | 'get' | 'list';
  path: string;
  auth: {
    uid: string;
    email?: string;
    email_verified?: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_PAYLOADS: AdversarialTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Track Creation',
    operation: 'create',
    path: '/uploadedTracks/trk-evil-1',
    auth: null,
    payload: { id: 'trk-evil-1', title: 'Unauthorized Track' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Non-Admin Track Creation',
    operation: 'create',
    path: '/uploadedTracks/trk-nonadmin-1',
    auth: { uid: 'attacker-uid-1', email: 'attacker@example.com', email_verified: true },
    payload: {
      id: 'trk-nonadmin-1',
      title: 'Attacker Track',
      artist: 'Attacker',
      duration: 180,
      audioUrl: 'synth:chill',
      coverUrl: 'https://example.com/a.jpg',
      audioChunkCount: 0,
      coverChunkCount: 0,
      genre: 'Chill',
      mood: 'Sakin & Rahatlatıcı',
      sectors: ['Kafe & Kahve Dükkanı'],
      bpm: 110,
      price: 299,
      isCommercialCleared: true,
      playsCount: 0,
      releaseDate: '2026-11-13',
      tags: ['chill'],
      synthPreset: 'chill',
      targetPlaylistIds: [],
      ownerUid: 'attacker-uid-1',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Admin Email Spoof',
    operation: 'create',
    path: '/uploadedTracks/trk-spoof-1',
    auth: { uid: 'spoof-uid', email: 'masterartscholl@gmail.com', email_verified: false },
    payload: { id: 'trk-spoof-1', title: 'Spoofed Email Track', ownerUid: 'spoof-uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection (Ghost Field)',
    operation: 'create',
    path: '/uploadedTracks/trk-ghost-1',
    auth: { uid: 'admin-uid-1', email: 'masterartscholl@gmail.com', email_verified: true },
    payload: {
      id: 'trk-ghost-1',
      title: 'Ghost Track',
      artist: 'Admin',
      duration: 180,
      audioUrl: 'synth:chill',
      coverUrl: 'https://example.com/a.jpg',
      audioChunkCount: 0,
      coverChunkCount: 0,
      genre: 'Chill',
      mood: 'Sakin & Rahatlatıcı',
      sectors: ['Kafe & Kahve Dükkanı'],
      bpm: 110,
      price: 299,
      isCommercialCleared: true,
      playsCount: 0,
      releaseDate: '2026-11-13',
      tags: ['chill'],
      synthPreset: 'chill',
      targetPlaylistIds: [],
      ownerUid: 'admin-uid-1',
      isVerifiedAdmin: true, // Ghost field
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Owner Identity Spoofing',
    operation: 'create',
    path: '/uploadedTracks/trk-id-spoof',
    auth: { uid: 'admin-uid-1', email: 'masterartscholl@gmail.com', email_verified: true },
    payload: { id: 'trk-id-spoof', title: 'Spoofed Owner', ownerUid: 'someone-else-uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Client-Forged Timestamp',
    operation: 'create',
    path: '/uploadedTracks/trk-time-forge',
    auth: { uid: 'admin-uid-1', email: 'masterartscholl@gmail.com', email_verified: true },
    payload: {
      id: 'trk-time-forge',
      title: 'Forged Time',
      ownerUid: 'admin-uid-1',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Path ID Poisoning',
    operation: 'create',
    path: '/uploadedTracks/invalid$$$id',
    auth: { uid: 'admin-uid-1', email: 'masterartscholl@gmail.com', email_verified: true },
    payload: { id: 'invalid$$$id', title: 'Bad ID', ownerUid: 'admin-uid-1' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Denial-of-Wallet Oversized Chunk String',
    operation: 'create',
    path: '/uploadedTracks/trk-1/chunks/audio_0',
    auth: { uid: 'admin-uid-1', email: 'masterartscholl@gmail.com', email_verified: true },
    payload: {
      kind: 'audio',
      index: 0,
      totalChunks: 1,
      data: 'A'.repeat(950000),
      ownerUid: 'admin-uid-1',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Orphaned Media Chunk',
    operation: 'create',
    path: '/uploadedTracks/nonexistent-parent/chunks/audio_0',
    auth: { uid: 'admin-uid-1', email: 'masterartscholl@gmail.com', email_verified: true },
    payload: {
      kind: 'audio',
      index: 0,
      totalChunks: 1,
      data: 'data:audio/mpeg;base64,AAAA',
      ownerUid: 'admin-uid-1',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable Field Tampering on Update',
    operation: 'update',
    path: '/uploadedTracks/trk-1',
    auth: { uid: 'admin-uid-1', email: 'masterartscholl@gmail.com', email_verified: true },
    payload: { ownerUid: 'hijacked-uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value Poisoning on Update',
    operation: 'update',
    path: '/uploadedTracks/trk-1',
    auth: { uid: 'admin-uid-1', email: 'masterartscholl@gmail.com', email_verified: true },
    payload: { bpm: 'not-a-number', title: '' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Self-Assigned Admin Escalation',
    operation: 'create',
    path: '/admins/attacker-uid-1',
    auth: { uid: 'attacker-uid-1', email: 'attacker@example.com', email_verified: true },
    payload: { uid: 'attacker-uid-1', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
];
