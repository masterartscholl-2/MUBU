/**
 * IndexedDB storage utility for large device-uploaded audio files (MP3/WAV) and cover images.
 * Bypasses localStorage 5MB quota restrictions and ensures persistent offline playback.
 */

const DB_NAME = 'muzikbank_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

interface MediaRecord {
  trackId: string;
  audioBlobOrData?: string | Blob;
  imageBlobOrData?: string | Blob;
  mimeType?: string;
  updatedAt: number;
}

let dbInstance: IDBDatabase | null = null;

export const initMediaDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'trackId' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.warn('Failed to open IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const saveTrackMedia = async (
  trackId: string,
  audioData?: string | Blob,
  imageData?: string | Blob
): Promise<void> => {
  try {
    const db = await initMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record: MediaRecord = {
        trackId,
        audioBlobOrData: audioData,
        imageBlobOrData: imageData,
        updatedAt: Date.now()
      };

      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('saveTrackMedia error:', err);
  }
};

export const getTrackMedia = async (
  trackId: string
): Promise<{ audio?: string; image?: string } | null> => {
  try {
    const db = await initMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(trackId);

      req.onsuccess = () => {
        const result = req.result as MediaRecord | undefined;
        if (!result) return resolve(null);

        let audioUrl: string | undefined = undefined;
        let imageUrl: string | undefined = undefined;

        if (result.audioBlobOrData) {
          if (typeof result.audioBlobOrData === 'string') {
            audioUrl = result.audioBlobOrData;
          } else if (result.audioBlobOrData instanceof Blob) {
            audioUrl = URL.createObjectURL(result.audioBlobOrData);
          }
        }

        if (result.imageBlobOrData) {
          if (typeof result.imageBlobOrData === 'string') {
            imageUrl = result.imageBlobOrData;
          } else if (result.imageBlobOrData instanceof Blob) {
            imageUrl = URL.createObjectURL(result.imageBlobOrData);
          }
        }

        resolve({ audio: audioUrl, image: imageUrl });
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('getTrackMedia error:', err);
    return null;
  }
};

export const deleteTrackMedia = async (trackId: string): Promise<void> => {
  try {
    const db = await initMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(trackId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('deleteTrackMedia error:', err);
  }
};
