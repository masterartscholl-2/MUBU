import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { Track, Playlist, RadioStation, UserProfile, LicenseRecord, CartItem, VenueLocation, GenreCategory, VenueSector, ScheduledPlaylist, ManagedVenue } from '../types';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS, INITIAL_RADIOS, DEFAULT_USER, GENRE_CATEGORIES, VENUE_SECTORS, INITIAL_MOODS, INITIAL_MANAGED_VENUES } from '../data/initialData';
import { audioEngine } from '../utils/audioEngine';
import { findMatchingPlaylistIds, getTracksForPlaylist } from '../utils/playlistMatcher';
import { saveTrackMedia, getTrackMedia, deleteTrackMedia } from '../utils/audioStorage';
import { resolveScheduleConflicts, ScheduleConflictNotice } from '../utils/scheduleConflict';
import { auth, googleProvider, ADMIN_EMAIL } from '../firebase';
import {
  saveTrackToCloud,
  deleteTrackFromCloud,
  loadCloudCatalogState,
  resetCloudCatalog,
} from '../utils/firebaseTrackStore';

interface MusicContextType {
  tracks: Track[];
  playlists: Playlist[];
  radios: RadioStation[];
  genres: GenreCategory[];
  sectors: VenueSector[];
  moods: string[];
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  
  // Audio Player State
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: Track[];
  queueIndex: number;
  
  // Audio Player Actions
  playTrack: (track: Track, queueContext?: Track[]) => void;
  playPlaylist: (playlist: Playlist) => void;
  playRadio: (radio: RadioStation) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Favorites
  isFavoriteTrack: (trackId: string) => boolean;
  toggleFavoriteTrack: (trackId: string) => void;
  isFavoritePlaylist: (playlistId: string) => boolean;
  toggleFavoritePlaylist: (playlistId: string) => void;
  
  // Custom Playlists
  createPlaylist: (title: string, description: string, coverUrl?: string) => string;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;

  // Venue & Profile Management
  addLocation: (loc: Omit<VenueLocation, 'id' | 'licenseNo' | 'status'>) => void;
  updateLocation: (id: string, updates: Partial<VenueLocation>) => void;
  deleteLocation: (id: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  
  // Admin Operations
  addTrack: (trackData: Omit<Track, 'id' | 'playsCount' | 'releaseDate'> & { targetPlaylistIds?: string[] }) => Track;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  deleteTrack: (id: string) => void;
  resetCatalogToDefault: () => void;

  // Genres, Sectors, Radios, Moods Admin
  setGenres: React.Dispatch<React.SetStateAction<GenreCategory[]>>;
  addGenre: (genreData: Omit<GenreCategory, 'tracksCount'>) => void;
  updateGenre: (name: string, updates: Partial<GenreCategory>) => void;
  deleteGenre: (name: string) => void;
  addTrackToGenre: (trackId: string, genreName: string) => void;
  removeTrackFromGenre: (trackId: string) => void;

  setSectors: React.Dispatch<React.SetStateAction<VenueSector[]>>;
  addSector: (sectorData: Omit<VenueSector, 'tracksCount'>) => void;
  updateSector: (name: string, updates: Partial<VenueSector>) => void;
  deleteSector: (name: string) => void;
  addTrackToSector: (trackId: string, sectorName: string) => void;
  removeTrackFromSector: (trackId: string, sectorName: string) => void;

  setRadios: React.Dispatch<React.SetStateAction<RadioStation[]>>;
  addRadio: (radioData: Omit<RadioStation, 'id'>) => RadioStation;
  updateRadio: (id: string, updates: Partial<RadioStation>) => void;
  deleteRadio: (id: string) => void;
  addTrackToRadio: (radioId: string, trackId: string) => void;
  removeTrackFromRadio: (radioId: string, trackId: string) => void;

  setMoods: React.Dispatch<React.SetStateAction<string[]>>;
  addMood: (moodName: string) => void;
  deleteMood: (moodName: string) => void;
  addTrackToMood: (trackId: string, moodName: string) => void;
  removeTrackFromMood: (trackId: string) => void;

  updateTrackBpm: (trackId: string, bpm: number) => void;
  saveAndApplyAllChanges: () => { success: boolean; message: string; shareCode: string; timestamp: string };
  
  // Cart & Licensing
  cart: CartItem[];
  addToCart: (track: Track, licenseType?: 'standard' | 'commercial_venue' | 'broadcast', venueName?: string) => void;
  removeFromCart: (trackId: string) => void;
  clearCart: () => void;
  completePurchase: (venueName: string, taxNo: string) => LicenseRecord[];
  activeCertificateToView: LicenseRecord | null;
  setActiveCertificateToView: (lic: LicenseRecord | null) => void;
  
  // Navigation & Filtering
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  selectedSectorName: string | null;
  setSelectedSectorName: (name: string | null) => void;
  
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedGenreFilter: string | null;
  setSelectedGenreFilter: (genre: string | null) => void;
  selectedMoodFilter: string | null;
  setSelectedMoodFilter: (mood: string | null) => void;
  selectedSectorFilter: string | null;
  setSelectedSectorFilter: (sector: string | null) => void;
  bpmRange: [number, number];
  setBpmRange: (range: [number, number]) => void;
  maxPriceFilter: number | null;
  setMaxPriceFilter: (price: number | null) => void;
  resetFilters: () => void;
  
  // Modals
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isNewPlaylistModalOpen: boolean;
  setIsNewPlaylistModalOpen: (open: boolean) => void;
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (open: boolean) => void;
  isCorporateModalOpen: boolean;
  setIsCorporateModalOpen: (open: boolean) => void;

  // Playlist Scheduler (Ayarlar)
  scheduledPlaylists: ScheduledPlaylist[];
  addScheduledPlaylist: (item: Omit<ScheduledPlaylist, 'id'>) => ScheduledPlaylist;
  updateScheduledPlaylist: (id: string, updates: Partial<ScheduledPlaylist>) => void;
  deleteScheduledPlaylist: (id: string) => void;
  activeAutoPlayNotice: { scheduleId: string; playlistTitle: string; timeLabel: string; status: 'started' | 'ended' } | null;
  dismissAutoPlayNotice: () => void;
  activeScheduledId: string | null;
  activeScheduleDrag: { kind: 'new-playlist' | 'move-schedule'; playlistId?: string; scheduleId?: string; label: string } | null;
  setActiveScheduleDrag: React.Dispatch<React.SetStateAction<{ kind: 'new-playlist' | 'move-schedule'; playlistId?: string; scheduleId?: string; label: string } | null>>;
  quickSchedulePlaylistId: string | null;
  setQuickSchedulePlaylistId: React.Dispatch<React.SetStateAction<string | null>>;
  scheduleConflictNotice: ScheduleConflictNotice | null;
  dismissScheduleConflictNotice: () => void;

  // Theme (Dark / Light)
  theme: 'dark' | 'light';
  setTheme: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
  toggleTheme: () => void;

  // Admin Venue & Package Management
  managedVenues: ManagedVenue[];
  addManagedVenue: (venue: Omit<ManagedVenue, 'id' | 'licenseNo'> & { licenseNo?: string }) => ManagedVenue;
  updateManagedVenue: (id: string, updates: Partial<ManagedVenue>) => void;
  deleteManagedVenue: (id: string) => void;
  renewManagedVenue: (id: string, cycle: 'Aylık' | 'Yıllık') => void;

  // Firebase Cloud Persistence & Admin Auth
  firebaseUser: User | null;
  isFirebaseAdmin: boolean;
  isAuthReady: boolean;
  isCloudSyncing: boolean;
  cloudSyncStatus: string | null;
  cloudSyncError: string | null;
  signInWithGoogleAdmin: () => Promise<boolean>;
  signOutFirebaseAdmin: () => Promise<void>;
  syncTrackToCloudAsync: (track: Track, targetPlaylistIds?: string[]) => Promise<boolean>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const INITIAL_TRACK_IDS = new Set(INITIAL_TRACKS.map(t => t.id));

const readLocalDeletedIds = (): string[] => {
  try {
    const saved = localStorage.getItem('muzikbank_deleted_tracks');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deletedTrackIds, setDeletedTrackIds] = useState<string[]>(() => readLocalDeletedIds());

  // Persistent data states
  const [tracks, setTracks] = useState<Track[]>(() => {
    const deletedSet = new Set(readLocalDeletedIds());
    try {
      const saved = localStorage.getItem('muzikbank_tracks') || localStorage.getItem('muzibu_tracks');
      if (saved) {
        const parsed = JSON.parse(saved) as Track[];
        return parsed.filter(t => !deletedSet.has(t.id));
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRACKS.filter(t => !deletedSet.has(t.id));
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_playlists') || localStorage.getItem('muzibu_playlists');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PLAYLISTS;
  });

  const [radios, setRadios] = useState<RadioStation[]>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_radios');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_RADIOS;
  });

  const [genres, setGenres] = useState<GenreCategory[]>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_genres');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return GENRE_CATEGORIES;
  });

  const [sectors, setSectors] = useState<VenueSector[]>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_sectors');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return VENUE_SECTORS;
  });

  const [moods, setMoods] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_moods');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MOODS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_user') || localStorage.getItem('muzibu_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_USER,
          ...parsed,
          locations: parsed.locations && parsed.locations.length > 0 ? parsed.locations : DEFAULT_USER.locations
        };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_USER;
  });

  // Theme state (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    }
    try {
      localStorage.setItem('muzikbank_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Admin Managed Venues & Package Records
  const [managedVenues, setManagedVenues] = useState<ManagedVenue[]>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_managed_venues');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MANAGED_VENUES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('muzikbank_managed_venues', JSON.stringify(managedVenues));
    } catch (e) {
      console.error(e);
    }
  }, [managedVenues]);

  // Audio Playback states
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  // Cart & License states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCertificateToView, setActiveCertificateToView] = useState<LicenseRecord | null>(null);

  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedSectorName, setSelectedSectorName] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string | null>(null);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string | null>(null);
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 160]);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState<boolean>(false);

  // Scheduled Playlists state
  const [scheduledPlaylists, setScheduledPlaylists] = useState<ScheduledPlaylist[]>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_schedule');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [activeAutoPlayNotice, setActiveAutoPlayNotice] = useState<{
    scheduleId: string;
    playlistTitle: string;
    timeLabel: string;
    status: 'started' | 'ended';
  } | null>(null);
  const [activeScheduledId, setActiveScheduledId] = useState<string | null>(null);

  const [activeScheduleDrag, setActiveScheduleDrag] = useState<{
    kind: 'new-playlist' | 'move-schedule';
    playlistId?: string;
    scheduleId?: string;
    label: string;
  } | null>(null);

  const [quickSchedulePlaylistId, setQuickSchedulePlaylistId] = useState<string | null>(null);
  const [scheduleConflictNotice, setScheduleConflictNotice] = useState<ScheduleConflictNotice | null>(null);

  // Firebase Auth & Cloud Persistence states
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  const isFirebaseAdmin = Boolean(
    firebaseUser && firebaseUser.emailVerified && firebaseUser.email === ADMIN_EMAIL
  );

  // Persist deletedTrackIds locally as well
  useEffect(() => {
    try {
      localStorage.setItem('muzikbank_deleted_tracks', JSON.stringify(deletedTrackIds));
    } catch (e) {
      console.error(e);
    }
  }, [deletedTrackIds]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      setIsAuthReady(true);
      if (currentUser && (!currentUser.emailVerified || currentUser.email !== ADMIN_EMAIL)) {
        setCloudSyncError(`Bu Google hesabı (${currentUser.email || 'bilinmiyor'}) yönetici yetkisine sahip değil. Kalıcı bulut kaydı için ${ADMIN_EMAIL} ile giriş yapın.`);
      } else {
        setCloudSyncError(null);
      }
    });
    return () => unsub();
  }, []);

  const signInWithGoogleAdmin = useCallback(async (): Promise<boolean> => {
    setCloudSyncError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const u = cred.user;
      if (u && u.emailVerified && u.email === ADMIN_EMAIL) {
        setCloudSyncStatus('Bulut yönetici oturumu doğrulandı.');
        return true;
      }
      setCloudSyncError(`Yönetici yetkisi yalnızca ${ADMIN_EMAIL} hesabı içindir.`);
      return false;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google girişi başarısız oldu.';
      setCloudSyncError(msg);
      return false;
    }
  }, []);

  const signOutFirebaseAdmin = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
      setCloudSyncStatus(null);
      setCloudSyncError(null);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  }, []);

  // Restore any persistent media from IndexedDB and hydrate cloud MP3 tracks + deletions on startup
  useEffect(() => {
    let isCancelled = false;

    const hydrateCatalog = async () => {
      // Step 1: Restore local IndexedDB media
      try {
        let hasLocalChanges = false;
        const restoredLocal = await Promise.all(
          tracks.map(async (t) => {
            if (t.audioUrl?.startsWith('idb:')) {
              const media = await getTrackMedia(t.id);
              if (media?.audio) {
                hasLocalChanges = true;
                return { ...t, audioUrl: media.audio, coverUrl: media.image || t.coverUrl };
              }
            }
            return t;
          })
        );
        if (hasLocalChanges && !isCancelled) {
          setTracks(restoredLocal);
        }
      } catch (err) {
        console.error('Failed to restore media from IndexedDB:', err);
      }

      // Step 2: Hydrate persistent tracks and permanent deletions from Firestore
      try {
        setIsCloudSyncing(true);
        const { uploadedTracks: cloudItems, deletedTrackIds: cloudDeletedIds } =
          await loadCloudCatalogState();
        if (isCancelled) return;

        const mergedDeletedSet = new Set([...readLocalDeletedIds(), ...cloudDeletedIds]);
        const mergedDeletedList = Array.from(mergedDeletedSet);
        setDeletedTrackIds(mergedDeletedList);

        // Clean local IndexedDB entries for permanently deleted tracks
        cloudDeletedIds.forEach((delId) => {
          deleteTrackMedia(delId).catch(console.error);
        });

        // Merge cloud tracks with existing tracks while excluding any deleted track IDs
        setTracks((prevTracks) => {
          const withoutDeleted = prevTracks.filter((t) => !mergedDeletedSet.has(t.id));
          const map = new Map<string, Track>();
          withoutDeleted.forEach((t) => map.set(t.id, t));

          const newCloudTracks: Track[] = [];
          cloudItems.forEach(({ track }) => {
            if (mergedDeletedSet.has(track.id)) return;
            if (map.has(track.id)) {
              const existing = map.get(track.id)!;
              map.set(track.id, {
                ...existing,
                ...track,
                audioUrl:
                  track.audioUrl && track.audioUrl !== 'chunked'
                    ? track.audioUrl
                    : existing.audioUrl,
                coverUrl:
                  track.coverUrl && track.coverUrl !== 'chunked'
                    ? track.coverUrl
                    : existing.coverUrl,
              });
            } else {
              newCloudTracks.push(track);
            }
          });

          const merged = [
            ...newCloudTracks,
            ...withoutDeleted.map((t) => map.get(t.id)!),
          ];
          return merged;
        });

        // Apply playlist memberships and remove deleted tracks from playlists
        setPlaylists((prevPlaylists) =>
          prevPlaylists.map((pl) => {
            const filteredIds = pl.trackIds.filter((tid) => !mergedDeletedSet.has(tid));
            const additions: string[] = [];

            cloudItems.forEach(({ track, targetPlaylistIds }) => {
              if (mergedDeletedSet.has(track.id)) return;
              const autoIds = findMatchingPlaylistIds(track.genre, track.sectors, [pl]);
              const shouldInclude =
                targetPlaylistIds.includes(pl.id) || autoIds.includes(pl.id);
              if (
                shouldInclude &&
                !filteredIds.includes(track.id) &&
                !additions.includes(track.id)
              ) {
                additions.push(track.id);
              }
            });

            return {
              ...pl,
              trackIds: [...additions, ...filteredIds],
            };
          })
        );
      } catch (err) {
        console.error('Failed to hydrate catalog from Firebase:', err);
      } finally {
        if (!isCancelled) {
          setIsCloudSyncing(false);
        }
      }
    };

    void hydrateCatalog();
    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save changes to localStorage with quota protection
  useEffect(() => {
    try {
      const sanitized = tracks.map(t => {
        if (t.audioUrl && t.audioUrl.startsWith('data:audio') && t.audioUrl.length > 200000) {
          return { ...t, audioUrl: `idb:${t.id}` };
        }
        return t;
      });
      localStorage.setItem('muzikbank_tracks', JSON.stringify(sanitized));
    } catch (e) {
      console.error('Failed to save tracks to localStorage:', e);
    }
  }, [tracks]);

  useEffect(() => {
    try {
      localStorage.setItem('muzikbank_playlists', JSON.stringify(playlists));
    } catch (e) {
      console.error(e);
    }
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem('muzikbank_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('muzikbank_radios', JSON.stringify(radios));
    } catch (e) {
      console.error(e);
    }
  }, [radios]);

  useEffect(() => {
    try {
      localStorage.setItem('muzikbank_genres', JSON.stringify(genres));
    } catch (e) {
      console.error(e);
    }
  }, [genres]);

  useEffect(() => {
    try {
      localStorage.setItem('muzikbank_sectors', JSON.stringify(sectors));
    } catch (e) {
      console.error(e);
    }
  }, [sectors]);

  useEffect(() => {
    try {
      localStorage.setItem('muzikbank_moods', JSON.stringify(moods));
    } catch (e) {
      console.error(e);
    }
  }, [moods]);

  useEffect(() => {
    try {
      localStorage.setItem('muzikbank_schedule', JSON.stringify(scheduledPlaylists));
    } catch (e) {
      console.error(e);
    }
  }, [scheduledPlaylists]);

  const activeScheduledSessionRef = useRef<{
    scheduleId: string;
    occurrenceDate: string;
    playlistId: string;
    playlistTitle: string;
    startLabel: string;
    endLabel: string;
    endMs: number;
  } | null>(null);

  // Unlock browser audio context on any user interaction so scheduled playback starts with sound
  useEffect(() => {
    const handleUnlock = () => {
      audioEngine.unlock();
    };
    window.addEventListener('pointerdown', handleUnlock, { passive: true });
    window.addEventListener('keydown', handleUnlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, []);

  // Audio Playback logic
  const startTrackInternal = useCallback((track: Track, queueContext?: Track[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(track.duration || 180);

    if (queueContext && queueContext.length > 0) {
      setQueue(queueContext);
      const idx = queueContext.findIndex(t => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else if (queue.length === 0) {
      setQueue(tracks);
      const idx = tracks.findIndex(t => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }

    audioEngine.play(
      track.audioUrl,
      track.synthPreset || 'chill',
      track.bpm || 110,
      (curr, dur) => {
        setCurrentTime(curr);
        if (dur) setDuration(dur);
      },
      () => {
        // Track ended
        handleTrackEnded();
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, queue]);

  const playTrack = useCallback((track: Track, queueContext?: Track[]) => {
    activeScheduledSessionRef.current = null;
    setActiveScheduledId(null);
    startTrackInternal(track, queueContext);
  }, [startTrackInternal]);

  const handleTrackEnded = useCallback(() => {
    if (isRepeat) {
      if (currentTrack) {
        audioEngine.seek(0);
        setCurrentTime(0);
        audioEngine.play(
          currentTrack.audioUrl,
          currentTrack.synthPreset || 'chill',
          currentTrack.bpm || 110,
          (curr, dur) => {
            setCurrentTime(curr);
            if (dur) setDuration(dur);
          },
          handleTrackEnded
        );
      }
      return;
    }

    nextTrack();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRepeat, currentTrack, queue, queueIndex, isShuffle]);

  const nextTrack = useCallback(() => {
    if (!queue.length) return;
    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = 0;
    }
    setQueueIndex(nextIdx);
    const nextTrk = queue[nextIdx];
    if (nextTrk) {
      startTrackInternal(nextTrk, queue);
    }
  }, [queue, queueIndex, isShuffle, startTrackInternal]);

  const prevTrack = useCallback(() => {
    if (!queue.length) return;
    if (currentTime > 4) {
      audioEngine.seek(0);
      setCurrentTime(0);
      return;
    }
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setQueueIndex(prevIdx);
    const prevTrk = queue[prevIdx];
    if (prevTrk) {
      startTrackInternal(prevTrk, queue);
    }
  }, [queue, queueIndex, currentTime, startTrackInternal]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        playTrack(tracks[0], tracks);
      }
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.resume(
        currentTrack.audioUrl,
        currentTrack.synthPreset || 'chill',
        currentTrack.bpm || 110,
        (curr, dur) => {
          setCurrentTime(curr);
          if (dur) setDuration(dur);
        },
        handleTrackEnded
      );
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying, tracks, playTrack, handleTrackEnded]);

  const pause = useCallback(() => {
    audioEngine.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (currentTrack) {
      audioEngine.resume(
        currentTrack.audioUrl,
        currentTrack.synthPreset || 'chill',
        currentTrack.bpm || 110,
        (curr, dur) => {
          setCurrentTime(curr);
          if (dur) setDuration(dur);
        },
        handleTrackEnded
      );
      setIsPlaying(true);
    }
  }, [currentTrack, handleTrackEnded]);

  const seek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  }, []);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    audioEngine.setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      audioEngine.setVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat(prev => !prev);
  }, []);

  const startPlaylistInternal = useCallback((playlist: Playlist) => {
    const playlistTracks = getTracksForPlaylist(playlist, tracks);
    const effectiveQueue = playlistTracks.length > 0 ? playlistTracks : tracks;
    if (effectiveQueue.length > 0) {
      startTrackInternal(effectiveQueue[0], effectiveQueue);
    }
  }, [tracks, startTrackInternal]);

  const playPlaylist = useCallback((playlist: Playlist) => {
    activeScheduledSessionRef.current = null;
    setActiveScheduledId(null);
    startPlaylistInternal(playlist);
  }, [startPlaylistInternal]);

  const playRadio = useCallback((radio: RadioStation) => {
    activeScheduledSessionRef.current = null;
    setActiveScheduledId(null);
    // Find matching track for this radio
    const match = tracks.find(t => t.id === radio.currentTrackId) || tracks[0];
    if (match) {
      startTrackInternal(match, tracks);
    }
  }, [tracks, startTrackInternal]);

  // Favorites management
  const isFavoriteTrack = useCallback((trackId: string) => {
    return user.favorites.includes(trackId);
  }, [user.favorites]);

  const toggleFavoriteTrack = useCallback((trackId: string) => {
    setUser(prev => {
      const exists = prev.favorites.includes(trackId);
      const newFavs = exists 
        ? prev.favorites.filter(id => id !== trackId)
        : [...prev.favorites, trackId];
      return { ...prev, favorites: newFavs };
    });
  }, []);

  const isFavoritePlaylist = useCallback((playlistId: string) => {
    return user.favoritePlaylists.includes(playlistId);
  }, [user.favoritePlaylists]);

  const toggleFavoritePlaylist = useCallback((playlistId: string) => {
    setUser(prev => {
      const exists = prev.favoritePlaylists.includes(playlistId);
      const newFavs = exists 
        ? prev.favoritePlaylists.filter(id => id !== playlistId)
        : [...prev.favoritePlaylists, playlistId];
      return { ...prev, favoritePlaylists: newFavs };
    });
  }, []);

  // Custom Playlists
  const createPlaylist = useCallback((title: string, description: string, coverUrl?: string) => {
    const newId = `usr-pl-${Date.now()}`;
    const newPl: Playlist = {
      id: newId,
      title: title || 'Yeni Çalma Listesi',
      description: description || 'Özel derlenen telifsiz müzik listesi.',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
      trackIds: [],
      curator: user.name,
      type: 'playlist'
    };

    setPlaylists(prev => [newPl, ...prev]);
    setUser(prev => ({
      ...prev,
      customPlaylists: [newPl, ...prev.customPlaylists]
    }));
    return newId;
  }, [user.name]);

  const updatePlaylist = useCallback((id: string, updates: Partial<Playlist>) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setUser(prev => ({
      ...prev,
      customPlaylists: prev.customPlaylists.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    setScheduledPlaylists(prev => prev.filter(s => s.playlistId !== id));
    setUser(prev => ({
      ...prev,
      customPlaylists: prev.customPlaylists.filter(p => p.id !== id),
      favoritePlaylists: prev.favoritePlaylists.filter(pid => pid !== id)
    }));
    if (selectedPlaylistId === id) {
      setSelectedPlaylistId(null);
      setActiveTab('playlists');
    }
  }, [selectedPlaylistId]);

  const addTrackToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId && !p.trackIds.includes(trackId)) {
        return { ...p, trackIds: [...p.trackIds, trackId] };
      }
      return p;
    }));
    setUser(prev => ({
      ...prev,
      customPlaylists: prev.customPlaylists.map(p => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      })
    }));
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
      }
      return p;
    }));
    setUser(prev => ({
      ...prev,
      customPlaylists: prev.customPlaylists.map(p => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
        }
        return p;
      })
    }));
  }, []);

  // Venue Locations & Profile Management
  const addLocation = useCallback((locData: Omit<VenueLocation, 'id' | 'licenseNo' | 'status'>) => {
    const newLocation: VenueLocation = {
      ...locData,
      id: `loc-${Date.now()}`,
      licenseNo: `MZB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-TR`,
      status: 'active'
    };
    setUser(prev => ({
      ...prev,
      locations: [newLocation, ...(prev.locations || [])]
    }));
  }, []);

  const updateLocation = useCallback((id: string, updates: Partial<VenueLocation>) => {
    setUser(prev => ({
      ...prev,
      locations: (prev.locations || []).map(loc => loc.id === id ? { ...loc, ...updates } : loc)
    }));
  }, []);

  const deleteLocation = useCallback((id: string) => {
    setUser(prev => ({
      ...prev,
      locations: (prev.locations || []).filter(loc => loc.id !== id)
    }));
  }, []);

  const updateProfile = useCallback((profileUpdates: Partial<UserProfile>) => {
    setUser(prev => ({
      ...prev,
      ...profileUpdates
    }));
  }, []);

  const addManagedVenue = useCallback((venueData: Omit<ManagedVenue, 'id' | 'licenseNo'> & { licenseNo?: string }): ManagedVenue => {
    const newVenue: ManagedVenue = {
      ...venueData,
      id: `mv-${Date.now()}`,
      licenseNo: venueData.licenseNo?.trim() || `MZB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-TR`
    };
    setManagedVenues(prev => [newVenue, ...prev]);
    return newVenue;
  }, []);

  const updateManagedVenue = useCallback((id: string, updates: Partial<ManagedVenue>) => {
    setManagedVenues(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  }, []);

  const deleteManagedVenue = useCallback((id: string) => {
    setManagedVenues(prev => prev.filter(v => v.id !== id));
  }, []);

  const renewManagedVenue = useCallback((id: string, cycle: 'Aylık' | 'Yıllık') => {
    setManagedVenues(prev =>
      prev.map(v => {
        if (v.id !== id) return v;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const currentExp = new Date(`${v.expiresAt}T00:00:00`);
        const base = !isNaN(currentExp.getTime()) && currentExp > now ? currentExp : now;
        const nextExp = new Date(base);
        if (cycle === 'Yıllık') {
          nextExp.setFullYear(nextExp.getFullYear() + 1);
        } else {
          nextExp.setMonth(nextExp.getMonth() + 1);
        }
        const y = nextExp.getFullYear();
        const m = String(nextExp.getMonth() + 1).padStart(2, '0');
        const d = String(nextExp.getDate()).padStart(2, '0');
        return {
          ...v,
          billingCycle: cycle,
          expiresAt: `${y}-${m}-${d}`,
          paymentStatus: 'Ödendi'
        };
      })
    );
  }, []);

  const syncTrackToCloudAsync = useCallback(
    async (track: Track, targetPlaylistIds?: string[]): Promise<boolean> => {
      const activeUser = auth.currentUser;
      if (!activeUser || !activeUser.emailVerified || activeUser.email !== ADMIN_EMAIL) {
        return false;
      }
      setIsCloudSyncing(true);
      setCloudSyncError(null);
      try {
        const autoMatchingIds = findMatchingPlaylistIds(track.genre, track.sectors, playlists);
        const combinedIds = Array.from(
          new Set([...(targetPlaylistIds || []), ...autoMatchingIds])
        );
        const savedTrack = await saveTrackToCloud(track, combinedIds, activeUser.uid);
        setTracks((prev) =>
          prev.map((t) => (t.id === savedTrack.id ? { ...t, ...savedTrack } : t))
        );
        setCloudSyncStatus(`"${track.title}" buluta kalıcı olarak kaydedildi.`);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Bulut kaydı başarısız oldu.';
        setCloudSyncError(msg);
        return false;
      } finally {
        setIsCloudSyncing(false);
      }
    },
    [playlists]
  );

  // Admin Catalog actions
  const addTrack = useCallback((trackData: Omit<Track, 'id' | 'playsCount' | 'releaseDate'> & { targetPlaylistIds?: string[] }) => {
    const trackId = `trk-${Date.now()}`;
    const { targetPlaylistIds, ...pureTrackData } = trackData;

    const newTrack: Track = {
      ...pureTrackData,
      genre: (pureTrackData.genre || '').trim(),
      id: trackId,
      playsCount: Math.floor(Math.random() * 500) + 50,
      releaseDate: new Date().toISOString().split('T')[0]
    };

    // Save to IndexedDB for persistent storage
    if (newTrack.audioUrl?.startsWith('data:') || newTrack.audioUrl?.startsWith('blob:') || newTrack.coverUrl?.startsWith('data:')) {
      saveTrackMedia(newTrack.id, newTrack.audioUrl, newTrack.coverUrl).catch(console.error);
    }

    // Remove from deleted list if ever present
    setDeletedTrackIds(prev => prev.filter(id => id !== newTrack.id));

    // Determine matching playlist IDs (automatic from genre/sectors + target playlists)
    const autoMatchingIds = findMatchingPlaylistIds(newTrack.genre, newTrack.sectors, playlists);
    const combinedPlaylistIds = Array.from(new Set([...(targetPlaylistIds || []), ...autoMatchingIds]));

    // Put at beginning of tracks
    setTracks(prev => [newTrack, ...prev]);

    // Update playlists with this new track ID
    if (combinedPlaylistIds.length > 0) {
      setPlaylists(prev => prev.map(p => {
        if (combinedPlaylistIds.includes(p.id)) {
          if (!p.trackIds.includes(newTrack.id)) {
            return { ...p, trackIds: [newTrack.id, ...p.trackIds] };
          }
        }
        return p;
      }));

      setUser(prev => ({
        ...prev,
        customPlaylists: prev.customPlaylists.map(p => {
          if (combinedPlaylistIds.includes(p.id)) {
            if (!p.trackIds.includes(newTrack.id)) {
              return { ...p, trackIds: [newTrack.id, ...p.trackIds] };
            }
          }
          return p;
        })
      }));
    }

    // Persist permanently to Firebase Firestore if authenticated as verified admin
    if (auth.currentUser?.emailVerified && auth.currentUser?.email === ADMIN_EMAIL) {
      void syncTrackToCloudAsync(newTrack, combinedPlaylistIds);
    }

    return newTrack;
  }, [playlists, syncTrackToCloudAsync]);

  const updateTrack = useCallback((id: string, updates: Partial<Track>) => {
    const normalizedUpdates: Partial<Track> = updates.genre !== undefined
      ? { ...updates, genre: updates.genre.trim() }
      : updates;
    let updatedTrackSnapshot: Track | null = null;
    setTracks(prev => prev.map(t => {
      if (t.id === id) {
        updatedTrackSnapshot = { ...t, ...normalizedUpdates };
        return updatedTrackSnapshot;
      }
      return t;
    }));
    if (currentTrack?.id === id) {
      setCurrentTrack(prev => prev ? { ...prev, ...normalizedUpdates } : null);
    }
    if (updatedTrackSnapshot && (updatedTrackSnapshot as Track).audioUrl) {
      const trk = updatedTrackSnapshot as Track;
      if (trk.audioUrl.startsWith('data:') || trk.audioUrl.startsWith('blob:') || trk.coverUrl?.startsWith('data:')) {
        saveTrackMedia(trk.id, trk.audioUrl, trk.coverUrl).catch(console.error);
      }
      if (auth.currentUser?.emailVerified && auth.currentUser?.email === ADMIN_EMAIL) {
        const assignedPlaylistIds = playlists.filter(p => p.trackIds.includes(trk.id)).map(p => p.id);
        void syncTrackToCloudAsync(trk, assignedPlaylistIds);
      }
    }
  }, [currentTrack, playlists, syncTrackToCloudAsync]);

  const deleteTrack = useCallback((id: string) => {
    deleteTrackMedia(id).catch(console.error);
    setDeletedTrackIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    setTracks(prev => prev.filter(t => t.id !== id));
    setPlaylists(prev => prev.map(p => ({
      ...p,
      trackIds: p.trackIds.filter(tid => tid !== id)
    })));
    setUser(prev => ({
      ...prev,
      favorites: prev.favorites.filter(fid => fid !== id),
      customPlaylists: prev.customPlaylists.map(cp => ({
        ...cp,
        trackIds: cp.trackIds.filter(tid => tid !== id)
      }))
    }));
    if (currentTrack?.id === id) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentTrack(null);
    }

    // Permanently remove from Firebase Firestore & write deletion tombstone if admin
    const activeUser = auth.currentUser;
    if (activeUser?.emailVerified && activeUser?.email === ADMIN_EMAIL) {
      setIsCloudSyncing(true);
      setCloudSyncError(null);
      void deleteTrackFromCloud(id, activeUser.uid)
        .then(() => {
          setCloudSyncStatus('Parça buluttan kalıcı olarak silindi.');
        })
        .catch((err) => {
          setCloudSyncError(err instanceof Error ? err.message : 'Bulut silme hatası.');
        })
        .finally(() => {
          setIsCloudSyncing(false);
        });
    } else if (!INITIAL_TRACK_IDS.has(id)) {
      setCloudSyncStatus('Parça yerel olarak silindi; bulut silme için Google Yönetici Girişi yapın.');
    }
  }, [currentTrack]);

  const resetCatalogToDefault = useCallback(() => {
    setDeletedTrackIds([]);
    setTracks(INITIAL_TRACKS);
    setPlaylists(INITIAL_PLAYLISTS);
    setRadios(INITIAL_RADIOS);
    setGenres(GENRE_CATEGORIES);
    setSectors(VENUE_SECTORS);
    setMoods(INITIAL_MOODS);
    localStorage.removeItem('muzikbank_deleted_tracks');
    localStorage.removeItem('muzikbank_tracks');
    localStorage.removeItem('muzikbank_playlists');
    localStorage.removeItem('muzikbank_radios');
    localStorage.removeItem('muzikbank_genres');
    localStorage.removeItem('muzikbank_sectors');
    localStorage.removeItem('muzikbank_moods');
    localStorage.removeItem('muzibu_tracks');
    localStorage.removeItem('muzibu_playlists');

    if (auth.currentUser?.emailVerified && auth.currentUser?.email === ADMIN_EMAIL) {
      setIsCloudSyncing(true);
      void resetCloudCatalog()
        .then(() => {
          setCloudSyncStatus('Bulut kataloğu varsayılana sıfırlandı.');
        })
        .catch((err) => {
          setCloudSyncError(err instanceof Error ? err.message : 'Bulut sıfırlama hatası.');
        })
        .finally(() => {
          setIsCloudSyncing(false);
        });
    }
  }, []);

  // Genres Admin Actions
  const addGenre = useCallback((genreData: Omit<GenreCategory, 'tracksCount'>) => {
    const newGenre: GenreCategory = {
      ...genreData,
      tracksCount: 0
    };
    setGenres(prev => [...prev, newGenre]);
  }, []);

  const updateGenre = useCallback((name: string, updates: Partial<GenreCategory>) => {
    setGenres(prev => prev.map(g => g.name === name ? { ...g, ...updates } : g));
  }, []);

  const deleteGenre = useCallback((name: string) => {
    setGenres(prev => prev.filter(g => g.name !== name));
  }, []);

  const addTrackToGenre = useCallback((trackId: string, genreName: string) => {
    const normalizedGenre = genreName.trim();
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, genre: normalizedGenre } : t));
  }, []);

  const removeTrackFromGenre = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, genre: 'Chill' } : t));
  }, []);

  // Sectors Admin Actions
  const addSector = useCallback((sectorData: Omit<VenueSector, 'tracksCount'>) => {
    const newSector: VenueSector = {
      ...sectorData,
      tracksCount: 0
    };
    setSectors(prev => [...prev, newSector]);
  }, []);

  const updateSector = useCallback((name: string, updates: Partial<VenueSector>) => {
    setSectors(prev => prev.map(s => s.name === name ? { ...s, ...updates } : s));
  }, []);

  const deleteSector = useCallback((name: string) => {
    setSectors(prev => prev.filter(s => s.name !== name));
  }, []);

  const addTrackToSector = useCallback((trackId: string, sectorName: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id === trackId && !t.sectors.includes(sectorName)) {
        return { ...t, sectors: [...t.sectors, sectorName] };
      }
      return t;
    }));
  }, []);

  const removeTrackFromSector = useCallback((trackId: string, sectorName: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return { ...t, sectors: t.sectors.filter(s => s !== sectorName) };
      }
      return t;
    }));
  }, []);

  // Radios Admin Actions
  const addRadio = useCallback((radioData: Omit<RadioStation, 'id'>) => {
    const newRadio: RadioStation = {
      ...radioData,
      id: `rad-${Date.now()}`
    };
    setRadios(prev => [...prev, newRadio]);
    return newRadio;
  }, []);

  const updateRadio = useCallback((id: string, updates: Partial<RadioStation>) => {
    setRadios(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRadio = useCallback((id: string) => {
    setRadios(prev => prev.filter(r => r.id !== id));
  }, []);

  const addTrackToRadio = useCallback((radioId: string, trackId: string) => {
    setRadios(prev => prev.map(r => {
      if (r.id === radioId) {
        const currentIds = r.trackIds || [];
        if (!currentIds.includes(trackId)) {
          return { ...r, trackIds: [...currentIds, trackId] };
        }
      }
      return r;
    }));
  }, []);

  const removeTrackFromRadio = useCallback((radioId: string, trackId: string) => {
    setRadios(prev => prev.map(r => {
      if (r.id === radioId) {
        return { ...r, trackIds: (r.trackIds || []).filter(id => id !== trackId) };
      }
      return r;
    }));
  }, []);

  // Moods Admin Actions
  const addMood = useCallback((moodName: string) => {
    const trimmed = moodName.trim();
    if (!trimmed) return;
    setMoods(prev => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
  }, []);

  const deleteMood = useCallback((moodName: string) => {
    setMoods(prev => prev.filter(m => m !== moodName));
  }, []);

  const addTrackToMood = useCallback((trackId: string, moodName: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, mood: moodName } : t));
  }, []);

  const removeTrackFromMood = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, mood: 'Sakin & Rahatlatıcı' } : t));
  }, []);

  // BPM Admin Actions
  const updateTrackBpm = useCallback((trackId: string, bpm: number) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, bpm: Number(bpm) } : t));
  }, []);

  // Save & Apply All Changes across application
  const saveAndApplyAllChanges = useCallback(() => {
    try {
      const sanitizedTracks = tracks.map(t => {
        if (t.audioUrl && t.audioUrl.startsWith('data:audio') && t.audioUrl.length > 200000) {
          return { ...t, audioUrl: `idb:${t.id}` };
        }
        return t;
      });
      localStorage.setItem('muzikbank_tracks', JSON.stringify(sanitizedTracks));
      localStorage.setItem('muzikbank_genres', JSON.stringify(genres));
      localStorage.setItem('muzikbank_sectors', JSON.stringify(sectors));
      localStorage.setItem('muzikbank_radios', JSON.stringify(radios));
      localStorage.setItem('muzikbank_moods', JSON.stringify(moods));
      localStorage.setItem('muzikbank_playlists', JSON.stringify(playlists));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    const sharePackage = {
      app: 'Staff Telifsiz Müzik Platformu',
      timestamp: new Date().toISOString(),
      stats: {
        totalTracks: tracks.length,
        totalGenres: genres.length,
        totalSectors: sectors.length,
        totalRadios: radios.length,
        totalMoods: moods.length
      }
    };

    const shareCode = btoa(unescape(encodeURIComponent(JSON.stringify(sharePackage))));

    return {
      success: true,
      message: 'Tüm değişiklikler başarıyla kaydedildi ve uygulama güncellendi!',
      shareCode,
      timestamp: new Date().toLocaleTimeString('tr-TR')
    };
  }, [tracks, genres, sectors, radios, moods, playlists]);

  // Cart & License actions
  const addToCart = useCallback((track: Track, licenseType: 'standard' | 'commercial_venue' | 'broadcast' = 'commercial_venue', venueName: string = 'Crystal Cafe') => {
    let multiplier = 1;
    if (licenseType === 'commercial_venue') multiplier = 1.4;
    if (licenseType === 'broadcast') multiplier = 3.0;

    const calculatedPrice = Math.round(track.price * multiplier);

    setCart(prev => {
      const existing = prev.find(item => item.track.id === track.id && item.licenseType === licenseType);
      if (existing) return prev;
      return [...prev, { track, licenseType, venueName, price: calculatedPrice }];
    });
  }, []);

  const removeFromCart = useCallback((trackId: string) => {
    setCart(prev => prev.filter(item => item.track.id !== trackId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const completePurchase = useCallback((venueName: string, taxNo: string) => {
    const newLicenses: LicenseRecord[] = cart.map(item => ({
      id: `lic-${Date.now()}-${Math.floor(Math.random() * 9000)}`,
      licenseNo: `MZB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-TR`,
      trackId: item.track.id,
      trackTitle: item.track.title,
      artist: item.track.artist,
      type: item.licenseType,
      venueName: venueName || user.companyName || user.name,
      venueTaxOrId: taxNo || 'TR-MEMBER-99182',
      issuedDate: new Date().toISOString().split('T')[0],
      validUntil: '2028-12-31 (Ömür Boyu Telifsiz Kullanım)',
      price: item.price,
      certificateHash: `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
    }));

    setUser(prev => ({
      ...prev,
      licenses: [...newLicenses, ...prev.licenses]
    }));
    setCart([]);
    return newLicenses;
  }, [cart, user]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedGenreFilter(null);
    setSelectedMoodFilter(null);
    setSelectedSectorFilter(null);
    setBpmRange([60, 160]);
    setMaxPriceFilter(null);
  }, []);

  // Scheduled Playlists CRUD with automatic conflict detection & resolution
  const addScheduledPlaylist = useCallback((item: Omit<ScheduledPlaylist, 'id'>) => {
    const newItem: ScheduledPlaylist = {
      ...item,
      id: `sch-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    const { nextSchedules, notice } = resolveScheduleConflicts(scheduledPlaylists, newItem, playlists);
    setScheduledPlaylists(nextSchedules);
    if (notice) {
      setScheduleConflictNotice(notice);
    }
    return nextSchedules.find(s => s.id === newItem.id) || newItem;
  }, [scheduledPlaylists, playlists]);

  const updateScheduledPlaylist = useCallback((id: string, updates: Partial<ScheduledPlaylist>) => {
    const existing = scheduledPlaylists.find(item => item.id === id);
    if (!existing) return;

    const timingChanged =
      updates.date !== undefined ||
      updates.startHour !== undefined ||
      updates.startMinute !== undefined ||
      updates.durationHours !== undefined ||
      updates.repeatWeekly !== undefined ||
      updates.dayOfWeek !== undefined;

    const updatedItem: ScheduledPlaylist = {
      ...existing,
      ...updates,
      lastTriggeredDate: timingChanged ? undefined : (updates.lastTriggeredDate ?? existing.lastTriggeredDate)
    };

    const { nextSchedules, notice } = resolveScheduleConflicts(scheduledPlaylists, updatedItem, playlists);
    setScheduledPlaylists(nextSchedules);
    if (notice) {
      setScheduleConflictNotice(notice);
    }
  }, [scheduledPlaylists, playlists]);

  const deleteScheduledPlaylist = useCallback((id: string) => {
    setScheduledPlaylists(prev => prev.filter(item => item.id !== id));
  }, []);

  const dismissAutoPlayNotice = useCallback(() => {
    setActiveAutoPlayNotice(null);
  }, []);

  const dismissScheduleConflictNotice = useCallback(() => {
    setScheduleConflictNotice(null);
  }, []);

  // Auto-dismiss notice after 8 seconds
  useEffect(() => {
    if (!activeAutoPlayNotice) return;
    const timer = window.setTimeout(() => {
      setActiveAutoPlayNotice(null);
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [activeAutoPlayNotice]);

  // Automatic date/time playback scheduler (exact auto-start AND auto-stop)
  const stopScheduledPlayback = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const schedulerStateRef = useRef({
    scheduledPlaylists,
    playlists,
    startPlaylistInternal,
    stopScheduledPlayback,
  });

  useEffect(() => {
    schedulerStateRef.current = {
      scheduledPlaylists,
      playlists,
      startPlaylistInternal,
      stopScheduledPlayback,
    };
  }, [scheduledPlaylists, playlists, startPlaylistInternal, stopScheduledPlayback]);

  useEffect(() => {
    const formatDateStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const formatClock = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const getOccurrenceForBaseDate = (item: ScheduledPlaylist, baseDate: Date) => {
      const dateStr = formatDateStr(baseDate);
      const dow = baseDate.getDay();
      const matchesDate = item.date === dateStr || (Boolean(item.repeatWeekly) && item.dayOfWeek === dow);
      if (!matchesDate) return null;

      const startDate = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        item.startHour,
        item.startMinute,
        0,
        0
      );
      const startMs = startDate.getTime();
      const durationMs = Math.max(60_000, Math.round(item.durationHours * 60 * 60 * 1000));
      const endMs = startMs + durationMs;
      const endDate = new Date(endMs);

      return {
        occurrenceDate: dateStr,
        startMs,
        endMs,
        startLabel: formatClock(startDate),
        endLabel: formatClock(endDate),
      };
    };

    const parseLocalDateStr = (dateStr: string): Date => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, (m || 1) - 1, d || 1);
    };

    const checkSchedule = () => {
      const {
        scheduledPlaylists: currentSchedules,
        playlists: currentPlaylists,
        startPlaylistInternal: triggerScheduledPlay,
        stopScheduledPlayback: triggerScheduledStop,
      } = schedulerStateRef.current;

      const now = new Date();
      const nowMs = now.getTime();
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

      // 1. Check if an active scheduled broadcast has reached its end time or been removed/moved
      let endedSession: {
        scheduleId: string;
        playlistTitle: string;
        endLabel: string;
      } | null = null;

      const activeSession = activeScheduledSessionRef.current;
      if (activeSession) {
        const liveItem = currentSchedules.find(s => s.id === activeSession.scheduleId);
        const liveWin = liveItem
          ? getOccurrenceForBaseDate(liveItem, parseLocalDateStr(activeSession.occurrenceDate))
          : null;

        if (liveItem && liveWin && nowMs >= liveWin.startMs && nowMs < liveWin.endMs) {
          // Keep endMs & endLabel dynamically synced in case duration was shortened/edited
          activeSession.endMs = liveWin.endMs;
          activeSession.endLabel = liveWin.endLabel;
        } else {
          endedSession = {
            scheduleId: activeSession.scheduleId,
            playlistTitle: activeSession.playlistTitle,
            endLabel: activeSession.endLabel,
          };
          activeScheduledSessionRef.current = null;
          setActiveScheduledId(null);
        }
      }

      // 2. Check for any scheduled playlist whose start time has arrived (including overnight)
      const candidates: Array<{
        item: ScheduledPlaylist;
        win: NonNullable<ReturnType<typeof getOccurrenceForBaseDate>>;
      }> = [];

      for (const item of currentSchedules) {
        for (const baseDate of [yesterday, now]) {
          const win = getOccurrenceForBaseDate(item, baseDate);
          if (!win) continue;
          if (nowMs >= win.startMs && nowMs < win.endMs && item.lastTriggeredDate !== win.occurrenceDate) {
            candidates.push({ item, win });
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => b.win.startMs - a.win.startMs);
        const { item: target, win } = candidates[0];
        const pl = currentPlaylists.find(p => p.id === target.playlistId);

        setScheduledPlaylists(prev =>
          prev.map(item =>
            item.id === target.id ? { ...item, lastTriggeredDate: win.occurrenceDate } : item
          )
        );

        if (pl) {
          activeScheduledSessionRef.current = {
            scheduleId: target.id,
            occurrenceDate: win.occurrenceDate,
            playlistId: pl.id,
            playlistTitle: pl.title,
            startLabel: win.startLabel,
            endLabel: win.endLabel,
            endMs: win.endMs,
          };
          setActiveScheduledId(target.id);
          triggerScheduledPlay(pl);
          setActiveAutoPlayNotice({
            scheduleId: target.id,
            playlistTitle: pl.title,
            timeLabel: `${win.startLabel} - ${win.endLabel}`,
            status: 'started',
          });
        }
        return;
      }

      // 3. If the previous scheduled broadcast ended and nothing new replaced it, stop playback
      if (endedSession) {
        triggerScheduledStop();
        setActiveAutoPlayNotice({
          scheduleId: endedSession.scheduleId,
          playlistTitle: endedSession.playlistTitle,
          timeLabel: endedSession.endLabel,
          status: 'ended',
        });
      }
    };

    checkSchedule();
    const interval = window.setInterval(checkSchedule, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        tracks,
        playlists,
        radios,
        genres,
        sectors,
        moods,
        user,
        setUser,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        queue,
        queueIndex,
        playTrack,
        playPlaylist,
        playRadio,
        togglePlay,
        pause,
        resume,
        seek,
        nextTrack,
        prevTrack,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        isFavoriteTrack,
        toggleFavoriteTrack,
        isFavoritePlaylist,
        toggleFavoritePlaylist,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        addLocation,
        updateLocation,
        deleteLocation,
        updateProfile,
        addTrack,
        updateTrack,
        deleteTrack,
        resetCatalogToDefault,
        setGenres,
        addGenre,
        updateGenre,
        deleteGenre,
        addTrackToGenre,
        removeTrackFromGenre,
        setSectors,
        addSector,
        updateSector,
        deleteSector,
        addTrackToSector,
        removeTrackFromSector,
        setRadios,
        addRadio,
        updateRadio,
        deleteRadio,
        addTrackToRadio,
        removeTrackFromRadio,
        setMoods,
        addMood,
        deleteMood,
        addTrackToMood,
        removeTrackFromMood,
        updateTrackBpm,
        saveAndApplyAllChanges,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        completePurchase,
        activeCertificateToView,
        setActiveCertificateToView,
        activeTab,
        setActiveTab,
        selectedPlaylistId,
        setSelectedPlaylistId,
        selectedSectorName,
        setSelectedSectorName,
        searchQuery,
        setSearchQuery,
        selectedGenreFilter,
        setSelectedGenreFilter,
        selectedMoodFilter,
        setSelectedMoodFilter,
        selectedSectorFilter,
        setSelectedSectorFilter,
        bpmRange,
        setBpmRange,
        maxPriceFilter,
        setMaxPriceFilter,
        resetFilters,
        isAdminOpen,
        setIsAdminOpen,
        isCartOpen,
        setIsCartOpen,
        isNewPlaylistModalOpen,
        setIsNewPlaylistModalOpen,
        isPricingModalOpen,
        setIsPricingModalOpen,
        isCorporateModalOpen,
        setIsCorporateModalOpen,
        scheduledPlaylists,
        addScheduledPlaylist,
        updateScheduledPlaylist,
        deleteScheduledPlaylist,
        activeAutoPlayNotice,
        dismissAutoPlayNotice,
        activeScheduledId,
        activeScheduleDrag,
        setActiveScheduleDrag,
        quickSchedulePlaylistId,
        setQuickSchedulePlaylistId,
        scheduleConflictNotice,
        dismissScheduleConflictNotice,
        theme,
        setTheme,
        toggleTheme,
        managedVenues,
        addManagedVenue,
        updateManagedVenue,
        deleteManagedVenue,
        renewManagedVenue,
        firebaseUser,
        isFirebaseAdmin,
        isAuthReady,
        isCloudSyncing,
        cloudSyncStatus,
        cloudSyncError,
        signInWithGoogleAdmin,
        signOutFirebaseAdmin,
        syncTrackToCloudAsync,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
