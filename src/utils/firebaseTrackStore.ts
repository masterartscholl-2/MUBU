import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Track } from '../types';
import { getTrackMedia, saveTrackMedia, deleteTrackMedia } from './audioStorage';

export const CHUNK_SIZE = 450000; // ~450KB characters per Firestore document
export const INLINE_COVER_LIMIT = 200000;
export const MAX_INLINE_AUDIO_URL = 1900;
export const MAX_AUDIO_CHUNKS = 200;
export const MAX_COVER_CHUNKS = 50;
const VALID_PRESETS = ['chill', 'lofi', 'ambient', 'house', 'jazz', 'bossa'] as const;

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Dosya okunamadı.'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Dosya okuma hatası.'));
    reader.readAsDataURL(file);
  });
}

export async function resolveMediaUrlToDataUrl(url: string): Promise<string> {
  if (!url || !url.startsWith('blob:')) return url;
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Blob verisi çözümlenemedi.'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Blob dönüştürme hatası.'));
    reader.readAsDataURL(blob);
  });
}

function splitStringIntoChunks(value: string, chunkSize: number): string[] {
  if (!value) return [];
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += chunkSize) {
    chunks.push(value.slice(i, i + chunkSize));
  }
  return chunks;
}

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return cleaned.slice(0, 128) || `trk-${Date.now()}`;
}

function normalizePreset(preset?: string): 'chill' | 'lofi' | 'ambient' | 'house' | 'jazz' | 'bossa' {
  if (preset && (VALID_PRESETS as readonly string[]).includes(preset)) {
    return preset as 'chill' | 'lofi' | 'ambient' | 'house' | 'jazz' | 'bossa';
  }
  return 'chill';
}

async function deleteAllTrackChunks(trackId: string): Promise<void> {
  const chunksPath = `uploadedTracks/${trackId}/chunks`;
  let snapshot;
  try {
    snapshot = await getDocs(
      query(collection(db, chunksPath), where('kind', 'in', ['audio', 'cover']))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, chunksPath);
  }

  if (snapshot.empty) return;

  const docs = snapshot.docs;
  const BATCH_LIMIT = 400;
  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    const slice = docs.slice(i, i + BATCH_LIMIT);
    slice.forEach((chunkDoc) => batch.delete(chunkDoc.ref));
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, chunksPath);
    }
  }
}

export async function saveTrackToCloud(
  track: Track,
  targetPlaylistIds: string[],
  ownerUid: string
): Promise<Track> {
  const safeId = sanitizeId(track.id);
  const trackPath = `uploadedTracks/${safeId}`;
  const chunksPath = `uploadedTracks/${safeId}/chunks`;

  let resolvedAudio = track.audioUrl || `synth:${normalizePreset(track.synthPreset)}`;
  if (resolvedAudio.startsWith('idb:')) {
    const cached = await getTrackMedia(safeId);
    if (cached?.audio) {
      resolvedAudio = cached.audio;
    }
  } else if (resolvedAudio.startsWith('blob:')) {
    resolvedAudio = await resolveMediaUrlToDataUrl(resolvedAudio);
  }

  let resolvedCover =
    track.coverUrl ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop';
  if (resolvedCover.startsWith('blob:')) {
    resolvedCover = await resolveMediaUrlToDataUrl(resolvedCover);
  }

  if (resolvedAudio.startsWith('data:') || resolvedCover.startsWith('data:')) {
    await saveTrackMedia(safeId, resolvedAudio, resolvedCover).catch(console.error);
  }

  const needsAudioChunking =
    resolvedAudio.startsWith('data:') || resolvedAudio.length > MAX_INLINE_AUDIO_URL;
  const audioChunks = needsAudioChunking ? splitStringIntoChunks(resolvedAudio, CHUNK_SIZE) : [];
  if (audioChunks.length > MAX_AUDIO_CHUNKS) {
    throw new Error('MP3 dosyası maksimum bulut boyut sınırını (yaklaşık 65 MB) aşıyor.');
  }

  const needsCoverChunking = resolvedCover.length > INLINE_COVER_LIMIT;
  const coverChunks = needsCoverChunking ? splitStringIntoChunks(resolvedCover, CHUNK_SIZE) : [];
  if (coverChunks.length > MAX_COVER_CHUNKS) {
    throw new Error('Kapak görseli maksimum bulut boyut sınırını aşıyor.');
  }

  const storedAudioUrl = needsAudioChunking
    ? 'chunked'
    : (resolvedAudio || 'synth:chill').slice(0, MAX_INLINE_AUDIO_URL);
  const storedCoverUrl = needsCoverChunking ? 'chunked' : resolvedCover.slice(0, INLINE_COVER_LIMIT);

  const sanitizedSectors = (track.sectors || [])
    .map((s) => String(s).trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, 30);

  const sanitizedTags = (track.tags || [])
    .map((t) => String(t).trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 30);

  const sanitizedPlaylistIds = Array.from(new Set(targetPlaylistIds || []))
    .map((pid) => String(pid).trim().slice(0, 128))
    .filter(Boolean)
    .slice(0, 50);

  const clampedDuration = Math.max(0, Math.min(86400, Math.round(Number(track.duration) || 180)));
  const clampedBpm = Math.max(30, Math.min(300, Math.round(Number(track.bpm) || 110)));
  const clampedPrice = Math.max(0, Math.min(100000, Math.round(Number(track.price) || 299)));
  const clampedPlays = Math.max(0, Math.min(100000000, Math.round(Number(track.playsCount) || 0)));

  const basePayload = {
    id: safeId,
    title: (track.title || 'Yeni Parça').trim().slice(0, 200) || 'Yeni Parça',
    artist: (track.artist || 'Staff Sanatçısı').trim().slice(0, 200) || 'Staff Sanatçısı',
    duration: clampedDuration,
    audioUrl: storedAudioUrl,
    coverUrl: storedCoverUrl,
    audioChunkCount: audioChunks.length,
    coverChunkCount: coverChunks.length,
    genre: (track.genre || 'Chill').trim().slice(0, 100) || 'Chill',
    mood: (track.mood || 'Sakin & Rahatlatıcı').trim().slice(0, 100) || 'Sakin & Rahatlatıcı',
    sectors: sanitizedSectors,
    bpm: clampedBpm,
    price: clampedPrice,
    isCommercialCleared: true,
    playsCount: clampedPlays,
    releaseDate: (track.releaseDate || new Date().toISOString().split('T')[0]).slice(0, 32),
    tags: sanitizedTags,
    synthPreset: normalizePreset(track.synthPreset),
    targetPlaylistIds: sanitizedPlaylistIds,
  };

  const trackRef = doc(db, 'uploadedTracks', safeId);
  let existingSnap;
  try {
    existingSnap = await getDoc(trackRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, trackPath);
  }

  const chunkDocs: Array<{ id: string; payload: Record<string, unknown> }> = [
    ...audioChunks.map((slice, index) => ({
      id: `audio_${index}`,
      payload: {
        kind: 'audio',
        index,
        totalChunks: audioChunks.length,
        data: slice,
        ownerUid,
        createdAt: serverTimestamp(),
      },
    })),
    ...coverChunks.map((slice, index) => ({
      id: `cover_${index}`,
      payload: {
        kind: 'cover',
        index,
        totalChunks: coverChunks.length,
        data: slice,
        ownerUid,
        createdAt: serverTimestamp(),
      },
    })),
  ];

  if (existingSnap.exists()) {
    await deleteAllTrackChunks(safeId);

    try {
      await updateDoc(trackRef, {
        title: basePayload.title,
        artist: basePayload.artist,
        duration: basePayload.duration,
        audioUrl: basePayload.audioUrl,
        coverUrl: basePayload.coverUrl,
        audioChunkCount: basePayload.audioChunkCount,
        coverChunkCount: basePayload.coverChunkCount,
        genre: basePayload.genre,
        mood: basePayload.mood,
        sectors: basePayload.sectors,
        bpm: basePayload.bpm,
        tags: basePayload.tags,
        synthPreset: basePayload.synthPreset,
        targetPlaylistIds: basePayload.targetPlaylistIds,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, trackPath);
    }

    const BATCH_LIMIT = 400;
    for (let i = 0; i < chunkDocs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      chunkDocs.slice(i, i + BATCH_LIMIT).forEach((chunk) => {
        batch.set(doc(db, chunksPath, chunk.id), chunk.payload);
      });
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, chunksPath);
      }
    }
  } else {
    const firstBatchChunks = chunkDocs.slice(0, 350);
    const remainingChunks = chunkDocs.slice(350);

    const firstBatch = writeBatch(db);
    firstBatch.set(trackRef, {
      ...basePayload,
      ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    firstBatchChunks.forEach((chunk) => {
      firstBatch.set(doc(db, chunksPath, chunk.id), chunk.payload);
    });

    try {
      await firstBatch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, trackPath);
    }

    const BATCH_LIMIT = 400;
    for (let i = 0; i < remainingChunks.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      remainingChunks.slice(i, i + BATCH_LIMIT).forEach((chunk) => {
        batch.set(doc(db, chunksPath, chunk.id), chunk.payload);
      });
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, chunksPath);
      }
    }
  }

  // Ensure any stale deletion tombstone for this ID is removed
  const tombstoneRef = doc(db, 'deletedTracks', safeId);
  try {
    const tombstoneSnap = await getDoc(tombstoneRef);
    if (tombstoneSnap.exists()) {
      await deleteDoc(tombstoneRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `deletedTracks/${safeId}`);
  }

  return {
    ...track,
    id: safeId,
    audioUrl: resolvedAudio,
    coverUrl: resolvedCover,
    duration: clampedDuration,
    bpm: clampedBpm,
  };
}

export async function deleteTrackFromCloud(trackId: string, ownerUid: string): Promise<void> {
  const safeId = sanitizeId(trackId);
  const trackPath = `uploadedTracks/${safeId}`;
  const tombstonePath = `deletedTracks/${safeId}`;

  const trackRef = doc(db, 'uploadedTracks', safeId);
  let trackSnap;
  try {
    trackSnap = await getDoc(trackRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, trackPath);
  }

  if (trackSnap.exists()) {
    // Must delete chunks before parent so Master Gate exists() succeeds
    await deleteAllTrackChunks(safeId);
    try {
      await deleteDoc(trackRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, trackPath);
    }
  }

  // Record permanent tombstone so the deleted track never returns on reload
  const tombstoneRef = doc(db, 'deletedTracks', safeId);
  try {
    const existingTombstone = await getDoc(tombstoneRef);
    if (!existingTombstone.exists()) {
      await setDoc(tombstoneRef, {
        trackId: safeId,
        isDeleted: true,
        deletedBy: ownerUid,
        deletedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, tombstonePath);
  }
}

export async function resetCloudCatalog(): Promise<void> {
  let tracksSnap;
  try {
    tracksSnap = await getDocs(
      query(collection(db, 'uploadedTracks'), where('isCommercialCleared', '==', true))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'uploadedTracks');
  }

  for (const trackDoc of tracksSnap.docs) {
    await deleteAllTrackChunks(trackDoc.id);
    await deleteTrackMedia(trackDoc.id).catch(console.error);
    try {
      await deleteDoc(trackDoc.ref);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `uploadedTracks/${trackDoc.id}`);
    }
  }

  let deletedSnap;
  try {
    deletedSnap = await getDocs(
      query(collection(db, 'deletedTracks'), where('isDeleted', '==', true))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'deletedTracks');
  }

  for (const delDoc of deletedSnap.docs) {
    try {
      await deleteDoc(delDoc.ref);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `deletedTracks/${delDoc.id}`);
    }
  }
}

export async function loadCloudCatalogState(): Promise<{
  uploadedTracks: Array<{ track: Track; targetPlaylistIds: string[] }>;
  deletedTrackIds: string[];
}> {
  let deletedSnap;
  try {
    deletedSnap = await getDocs(
      query(collection(db, 'deletedTracks'), where('isDeleted', '==', true))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'deletedTracks');
  }

  const deletedTrackIds = deletedSnap.docs.map((d) => {
    const data = d.data();
    return typeof data.trackId === 'string' ? data.trackId : d.id;
  });
  const deletedSet = new Set(deletedTrackIds);

  let tracksSnap;
  try {
    tracksSnap = await getDocs(
      query(collection(db, 'uploadedTracks'), where('isCommercialCleared', '==', true))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'uploadedTracks');
  }

  const uploadedTracks: Array<{ track: Track; targetPlaylistIds: string[] }> = [];

  for (const trackDoc of tracksSnap.docs) {
    const data = trackDoc.data();
    const id = typeof data.id === 'string' ? data.id : trackDoc.id;
    if (deletedSet.has(id)) continue;

    const audioChunkCount = typeof data.audioChunkCount === 'number' ? data.audioChunkCount : 0;
    const coverChunkCount = typeof data.coverChunkCount === 'number' ? data.coverChunkCount : 0;

    let resolvedAudio = typeof data.audioUrl === 'string' ? data.audioUrl : 'synth:chill';
    let resolvedCover =
      typeof data.coverUrl === 'string'
        ? data.coverUrl
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop';

    const cached = (audioChunkCount > 0 || coverChunkCount > 0) ? await getTrackMedia(id) : null;
    const needAudioFromCloud = audioChunkCount > 0 && !cached?.audio;
    const needCoverFromCloud = coverChunkCount > 0 && !cached?.image;

    if (audioChunkCount > 0 && cached?.audio) {
      resolvedAudio = cached.audio;
    }
    if (coverChunkCount > 0 && cached?.image) {
      resolvedCover = cached.image;
    }

    if (needAudioFromCloud || needCoverFromCloud) {
      const chunksPath = `uploadedTracks/${id}/chunks`;
      let chunksSnap;
      try {
        chunksSnap = await getDocs(
          query(collection(db, chunksPath), where('kind', 'in', ['audio', 'cover']))
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, chunksPath);
      }

      const audioSlices: Array<{ index: number; data: string }> = [];
      const coverSlices: Array<{ index: number; data: string }> = [];

      chunksSnap.docs.forEach((cDoc) => {
        const cData = cDoc.data();
        const idx = typeof cData.index === 'number' ? cData.index : 0;
        const val = typeof cData.data === 'string' ? cData.data : '';
        if (cData.kind === 'audio') {
          audioSlices.push({ index: idx, data: val });
        } else if (cData.kind === 'cover') {
          coverSlices.push({ index: idx, data: val });
        }
      });

      if (needAudioFromCloud && audioSlices.length > 0) {
        audioSlices.sort((a, b) => a.index - b.index);
        resolvedAudio = audioSlices.map((s) => s.data).join('');
      }
      if (needCoverFromCloud && coverSlices.length > 0) {
        coverSlices.sort((a, b) => a.index - b.index);
        resolvedCover = coverSlices.map((s) => s.data).join('');
      }

      if (resolvedAudio.startsWith('data:') || resolvedCover.startsWith('data:')) {
        await saveTrackMedia(id, resolvedAudio, resolvedCover).catch(console.error);
      }
    }

    const track: Track = {
      id,
      title: String(data.title || 'Parça'),
      artist: String(data.artist || 'Staff Sanatçısı'),
      duration: Number(data.duration) || 180,
      audioUrl: resolvedAudio,
      coverUrl: resolvedCover,
      genre: String(data.genre || 'Chill'),
      mood: String(data.mood || 'Sakin & Rahatlatıcı'),
      sectors: Array.isArray(data.sectors) ? data.sectors.map(String) : ['Kafe & Kahve Dükkanı'],
      bpm: Number(data.bpm) || 110,
      price: Number(data.price) || 299,
      isCommercialCleared: Boolean(data.isCommercialCleared ?? true),
      playsCount: Number(data.playsCount) || 0,
      releaseDate: String(data.releaseDate || '2026-01-01'),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      synthPreset: normalizePreset(typeof data.synthPreset === 'string' ? data.synthPreset : undefined),
    };

    const targetPlaylistIds = Array.isArray(data.targetPlaylistIds)
      ? data.targetPlaylistIds.map(String)
      : [];

    uploadedTracks.push({ track, targetPlaylistIds });
  }

  return { uploadedTracks, deletedTrackIds };
}
