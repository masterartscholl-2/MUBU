import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Track, Playlist, RadioStation, UserProfile, LicenseRecord, CartItem, VenueLocation, GenreCategory, VenueSector } from '../types';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS, INITIAL_RADIOS, DEFAULT_USER, GENRE_CATEGORIES, VENUE_SECTORS, INITIAL_MOODS } from '../data/initialData';
import { audioEngine } from '../utils/audioEngine';
import { findMatchingPlaylistIds, getTracksForPlaylist } from '../utils/playlistMatcher';
import { saveTrackMedia, getTrackMedia, deleteTrackMedia } from '../utils/audioStorage';

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
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persistent data states
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('muzikbank_tracks') || localStorage.getItem('muzibu_tracks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRACKS;
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

  // Restore any persistent media from IndexedDB on startup
  useEffect(() => {
    let isCancelled = false;
    const restoreMedia = async () => {
      try {
        let hasChanges = false;
        const restored = await Promise.all(
          tracks.map(async (t) => {
            if (t.audioUrl?.startsWith('idb:')) {
              const media = await getTrackMedia(t.id);
              if (media?.audio) {
                hasChanges = true;
                return { ...t, audioUrl: media.audio, coverUrl: media.image || t.coverUrl };
              }
            }
            return t;
          })
        );
        if (hasChanges && !isCancelled) {
          setTracks(restored);
        }
      } catch (err) {
        console.error('Failed to restore media from IndexedDB:', err);
      }
    };
    restoreMedia();
    return () => { isCancelled = true; };
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

  // Audio Playback logic
  const playTrack = useCallback((track: Track, queueContext?: Track[]) => {
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
      playTrack(nextTrk, queue);
    }
  }, [queue, queueIndex, isShuffle, playTrack]);

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
      playTrack(prevTrk, queue);
    }
  }, [queue, queueIndex, currentTime, playTrack]);

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

  const playPlaylist = useCallback((playlist: Playlist) => {
    const playlistTracks = getTracksForPlaylist(playlist, tracks);
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks);
    }
  }, [tracks, playTrack]);

  const playRadio = useCallback((radio: RadioStation) => {
    // Find matching track for this radio
    const match = tracks.find(t => t.id === radio.currentTrackId) || tracks[0];
    if (match) {
      playTrack(match, tracks);
    }
  }, [tracks, playTrack]);

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

  // Admin Catalog actions
  const addTrack = useCallback((trackData: Omit<Track, 'id' | 'playsCount' | 'releaseDate'> & { targetPlaylistIds?: string[] }) => {
    const trackId = `trk-${Date.now()}`;
    const { targetPlaylistIds, ...pureTrackData } = trackData;

    const newTrack: Track = {
      ...pureTrackData,
      id: trackId,
      playsCount: Math.floor(Math.random() * 500) + 50,
      releaseDate: new Date().toISOString().split('T')[0]
    };

    // Save to IndexedDB for persistent storage
    if (newTrack.audioUrl?.startsWith('data:') || newTrack.audioUrl?.startsWith('blob:') || newTrack.coverUrl?.startsWith('data:')) {
      saveTrackMedia(newTrack.id, newTrack.audioUrl, newTrack.coverUrl).catch(console.error);
    }

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

    return newTrack;
  }, [playlists]);

  const updateTrack = useCallback((id: string, updates: Partial<Track>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (currentTrack?.id === id) {
      setCurrentTrack(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentTrack]);

  const deleteTrack = useCallback((id: string) => {
    deleteTrackMedia(id).catch(console.error);
    setTracks(prev => prev.filter(t => t.id !== id));
    setPlaylists(prev => prev.map(p => ({
      ...p,
      trackIds: p.trackIds.filter(tid => tid !== id)
    })));
    if (currentTrack?.id === id) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  }, [currentTrack]);

  const resetCatalogToDefault = useCallback(() => {
    setTracks(INITIAL_TRACKS);
    setPlaylists(INITIAL_PLAYLISTS);
    setRadios(INITIAL_RADIOS);
    setGenres(GENRE_CATEGORIES);
    setSectors(VENUE_SECTORS);
    setMoods(INITIAL_MOODS);
    localStorage.removeItem('muzikbank_tracks');
    localStorage.removeItem('muzikbank_playlists');
    localStorage.removeItem('muzikbank_radios');
    localStorage.removeItem('muzikbank_genres');
    localStorage.removeItem('muzikbank_sectors');
    localStorage.removeItem('muzikbank_moods');
    localStorage.removeItem('muzibu_tracks');
    localStorage.removeItem('muzibu_playlists');
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
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, genre: genreName } : t));
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
      app: 'müzikbank Telifsiz Müzik Platformu',
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
