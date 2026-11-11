import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Music, 
  Image as ImageIcon, 
  Tag, 
  Layers, 
  Play, 
  Pause, 
  Sparkles, 
  Check, 
  RotateCcw,
  Sliders,
  Store,
  Upload,
  Radio as RadioIcon,
  ShieldCheck,
  Share2,
  Copy,
  CheckCircle2,
  Headphones,
  Gauge,
  Clock,
  FolderPlus,
  ListMusic
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Track, GenreCategory, VenueSector, RadioStation } from '../types';
import { findMatchingPlaylistIds } from '../utils/playlistMatcher';

export const AdminModal: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    tracks, 
    playlists,
    addTrack, 
    updateTrack, 
    deleteTrack, 
    resetCatalogToDefault,
    genres,
    addGenre,
    updateGenre,
    deleteGenre,
    addTrackToGenre,
    removeTrackFromGenre,
    sectors,
    addSector,
    updateSector,
    deleteSector,
    addTrackToSector,
    removeTrackFromSector,
    radios,
    addRadio,
    updateRadio,
    deleteRadio,
    addTrackToRadio,
    removeTrackFromRadio,
    moods,
    addMood,
    deleteMood,
    addTrackToMood,
    removeTrackFromMood,
    updateTrackBpm,
    saveAndApplyAllChanges,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay
  } = useMusic();

  type AdminTab = 'tracks' | 'track-list' | 'genres' | 'sectors' | 'radios' | 'mood-bpm';
  const [activeTab, setActiveTab] = useState<AdminTab>('tracks');
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);

  // Form states for Track
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFileData, setAudioFileData] = useState<string>('');
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number>(180);
  const [coverImageData, setCoverImageData] = useState<string>('');
  const [coverImageName, setCoverImageName] = useState<string>('');
  const [genre, setGenre] = useState('Chill');
  const [mood, setMood] = useState('Sakin & Rahatlatıcı');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['Kafe & Kahve Dükkanı']);
  const [bpm, setBpm] = useState(110);
  const [synthPreset, setSynthPreset] = useState<'chill' | 'lofi' | 'ambient' | 'house' | 'jazz' | 'bossa'>('chill');
  const [selectedTargetPlaylists, setSelectedTargetPlaylists] = useState<string[]>([]);
  const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-sync matching playlists when genre or sectors change
  React.useEffect(() => {
    if (activeTab === 'tracks' && !editingTrackId) {
      const autoIds = findMatchingPlaylistIds(genre, selectedSectors, playlists);
      setSelectedTargetPlaylists(autoIds);
    }
  }, [genre, selectedSectors, playlists, activeTab, editingTrackId]);

  // File Input Refs
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const genreImageInputRef = useRef<HTMLInputElement>(null);
  const sectorImageInputRef = useRef<HTMLInputElement>(null);
  const radioImageInputRef = useRef<HTMLInputElement>(null);

  // Form states for New Genre
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreBadge, setNewGenreBadge] = useState('');
  const [newGenreDesc, setNewGenreDesc] = useState('');
  const [newGenreCover, setNewGenreCover] = useState('');
  const [selectedGenreForSongManage, setSelectedGenreForSongManage] = useState<string | null>(null);

  // Form states for New Sector
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorBadge, setNewSectorBadge] = useState('');
  const [newSectorDesc, setNewSectorDesc] = useState('');
  const [newSectorCover, setNewSectorCover] = useState('');
  const [selectedSectorForSongManage, setSelectedSectorForSongManage] = useState<string | null>(null);

  // Form states for New Radio
  const [newRadioName, setNewRadioName] = useState('');
  const [newRadioBadge, setNewRadioBadge] = useState('');
  const [newRadioGenre, setNewRadioGenre] = useState('Lo-Fi / Akustik');
  const [newRadioDesc, setNewRadioDesc] = useState('');
  const [newRadioCover, setNewRadioCover] = useState('');
  const [newRadioListeners, setNewRadioListeners] = useState<number>(1250);
  const [newRadioCurrentTrackId, setNewRadioCurrentTrackId] = useState<string>('');
  const [selectedRadioForSongManage, setSelectedRadioForSongManage] = useState<string | null>(null);

  // Form states for Mood & BPM
  const [newMoodInput, setNewMoodInput] = useState('');
  const [selectedMoodForSongManage, setSelectedMoodForSongManage] = useState<string | null>(null);
  const [bpmFilterCategory, setBpmFilterCategory] = useState<'all' | 'slow' | 'mid' | 'fast'>('all');

  // Search & Toast & Share Modal
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shareResultModal, setShareResultModal] = useState<{
    open: boolean;
    shareCode: string;
    timestamp: string;
    stats: { tracks: number; genres: number; sectors: number; radios: number; moods: number };
  } | null>(null);

  if (!isAdminOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // MP3 Device File Upload Handler
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFileName(file.name);
    // Auto-prefill title if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const objectUrl = URL.createObjectURL(file);
    setAudioFileData(objectUrl);

    // Read audio duration from metadata
    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && isFinite(tempAudio.duration)) {
        setAudioDuration(Math.round(tempAudio.duration));
      }
    };

    // Read as Base64 Data URL for persistent storage in localStorage
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // If file is within reasonable size, store as data URL for persistent offline playback
        setAudioFileData(reader.result);
      }
    };
    reader.readAsDataURL(file);

    showToast(`"${file.name}" ses dosyası başarıyla yüklendi.`);
  };

  // Image Device File Upload Handler
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: (val: string) => void, 
    nameSetter?: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (nameSetter) nameSetter(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
        showToast(`"${file.name}" görseli cihazdan yüklendi.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioPreviewToggle = () => {
    if (!audioFileData) return;
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(audioFileData);
      previewAudioRef.current.onended = () => setIsAudioPreviewPlaying(false);
    }

    if (isAudioPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsAudioPreviewPlaying(false);
    } else {
      previewAudioRef.current.src = audioFileData;
      previewAudioRef.current.play().catch(console.error);
      setIsAudioPreviewPlaying(true);
    }
  };

  const handleSectorToggle = (sectorName: string) => {
    if (selectedSectors.includes(sectorName)) {
      if (selectedSectors.length > 1) {
        setSelectedSectors(selectedSectors.filter(s => s !== sectorName));
      }
    } else {
      setSelectedSectors([...selectedSectors, sectorName]);
    }
  };

  const handleEditClick = (track: Track) => {
    setEditingTrackId(track.id);
    setTitle(track.title);
    setArtist(track.artist);
    setAudioFileData(track.audioUrl);
    setAudioFileName('Mevcut Ses Akışı');
    setAudioDuration(track.duration || 180);
    setCoverImageData(track.coverUrl);
    setCoverImageName('Mevcut Kapak Görseli');
    setGenre(track.genre);
    setMood(track.mood);
    setSelectedSectors(track.sectors);
    setBpm(track.bpm);
    setSynthPreset(track.synthPreset || 'chill');
    setActiveTab('tracks');
  };

  const resetTrackForm = () => {
    setEditingTrackId(null);
    setTitle('');
    setArtist('');
    setAudioFileData('');
    setAudioFileName('');
    setAudioDuration(180);
    setCoverImageData('');
    setCoverImageName('');
    setGenre('Chill');
    setMood('Sakin & Rahatlatıcı');
    setSelectedSectors(['Kafe & Kahve Dükkanı']);
    setBpm(110);
    setSynthPreset('chill');
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsAudioPreviewPlaying(false);
    }
  };

  const handleTrackSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() && !audioFileName) {
      showToast('Lütfen şarkı adı alanını doldurunuz veya ses dosyası seçiniz!');
      return;
    }

    const effectiveTitle = title.trim() || (audioFileName ? audioFileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : 'Yeni Parça');
    const effectiveArtist = artist.trim() || 'müzikbank Sanatçısı';
    // Default aesthetic fallback if no device image uploaded
    const effectiveCover = coverImageData || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop';
    const effectiveAudio = audioFileData || `synth:${synthPreset}`;

    if (editingTrackId) {
      updateTrack(editingTrackId, {
        title: effectiveTitle,
        artist: effectiveArtist,
        audioUrl: effectiveAudio,
        coverUrl: effectiveCover,
        duration: audioDuration,
        genre,
        mood,
        sectors: selectedSectors,
        bpm: Number(bpm),
        synthPreset
      });
      showToast(`"${effectiveTitle}" parçası güncellendi ve listelere uygulandı!`);
      resetTrackForm();
      setActiveTab('track-list');
      saveAndApplyAllChanges();
    } else {
      addTrack({
        title: effectiveTitle,
        artist: effectiveArtist,
        audioUrl: effectiveAudio,
        coverUrl: effectiveCover,
        duration: audioDuration,
        genre,
        mood,
        sectors: selectedSectors,
        bpm: Number(bpm),
        price: 299,
        isCommercialCleared: true,
        tags: [genre.toLowerCase(), mood.toLowerCase()],
        synthPreset,
        targetPlaylistIds: selectedTargetPlaylists
      });
      showToast(`"${effectiveTitle}" parçası "${genre}" türüne, "${selectedSectors.join(', ')}" sektörüne ve playlistlere eklendi!`);
      resetTrackForm();
      setActiveTab('track-list');
      saveAndApplyAllChanges();
    }
  };

  // Add New Genre
  const handleCreateGenre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName.trim()) {
      showToast('Lütfen tür adını giriniz!');
      return;
    }

    addGenre({
      name: newGenreName.trim(),
      badgeTitle: (newGenreBadge.trim() || newGenreName.trim()).toUpperCase(),
      desc: newGenreDesc.trim() || 'Mekana özel seçilmiş telifsiz parçalar.',
      coverUrl: newGenreCover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop'
    });

    setNewGenreName('');
    setNewGenreBadge('');
    setNewGenreDesc('');
    setNewGenreCover('');
    showToast(`"${newGenreName}" müzik türü başarıyla eklendi!`);
  };

  // Add New Sector
  const handleCreateSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorName.trim()) {
      showToast('Lütfen sektör adını giriniz!');
      return;
    }

    addSector({
      name: newSectorName.trim(),
      badgeTitle: (newSectorBadge.trim() || newSectorName.trim()).toUpperCase(),
      desc: newSectorDesc.trim() || 'İşletmenizin atmosferini zenginleştiren telifsiz yayın paketi.',
      coverUrl: newSectorCover || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
      genres: [genre, 'Chill']
    });

    setNewSectorName('');
    setNewSectorBadge('');
    setNewSectorDesc('');
    setNewSectorCover('');
    showToast(`"${newSectorName}" sektörü başarıyla eklendi!`);
  };

  // Add New Radio
  const handleCreateRadio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRadioName.trim()) {
      showToast('Lütfen radyo istasyonu adını giriniz!');
      return;
    }

    const firstTrack = tracks[0]?.id || '';
    addRadio({
      name: newRadioName.trim(),
      badgeTitle: (newRadioBadge.trim() || 'CANLI').toUpperCase(),
      genre: newRadioGenre.trim() || 'Lo-Fi / Akustik',
      description: newRadioDesc.trim() || '7/24 Kesintisiz canlı mekan radyo frekansı.',
      coverUrl: newRadioCover || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
      listenersCount: Number(newRadioListeners) || 1200,
      currentTrackId: newRadioCurrentTrackId || firstTrack,
      trackIds: newRadioCurrentTrackId ? [newRadioCurrentTrackId] : []
    });

    setNewRadioName('');
    setNewRadioBadge('');
    setNewRadioGenre('Lo-Fi / Akustik');
    setNewRadioDesc('');
    setNewRadioCover('');
    showToast(`"${newRadioName}" canlı radyo istasyonu oluşturuldu!`);
  };

  // Save & Apply All Changes handler
  const handleSaveAndApply = () => {
    let newlyCommittedTitle: string | null = null;
    if (activeTab === 'tracks' && (title.trim() || artist.trim() || audioFileData || coverImageData)) {
      const effectiveTitle = title.trim() || (audioFileName ? audioFileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : 'Yeni Parça');
      const effectiveArtist = artist.trim() || 'müzikbank Sanatçısı';
      const effectiveCover = coverImageData || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop';
      const effectiveAudio = audioFileData || `synth:${synthPreset}`;

      if (editingTrackId) {
        updateTrack(editingTrackId, {
          title: effectiveTitle,
          artist: effectiveArtist,
          audioUrl: effectiveAudio,
          coverUrl: effectiveCover,
          duration: audioDuration,
          genre,
          mood,
          sectors: selectedSectors,
          bpm: Number(bpm),
          synthPreset
        });
      } else {
        addTrack({
          title: effectiveTitle,
          artist: effectiveArtist,
          audioUrl: effectiveAudio,
          coverUrl: effectiveCover,
          duration: audioDuration,
          genre,
          mood,
          sectors: selectedSectors,
          bpm: Number(bpm),
          price: 299,
          isCommercialCleared: true,
          tags: [genre.toLowerCase(), mood.toLowerCase()],
          synthPreset,
          targetPlaylistIds: selectedTargetPlaylists
        });
        newlyCommittedTitle = effectiveTitle;
      }
      resetTrackForm();
    }

    const result = saveAndApplyAllChanges();
    setShareResultModal({
      open: true,
      shareCode: result.shareCode,
      timestamp: result.timestamp,
      stats: {
        tracks: tracks.length + (newlyCommittedTitle ? 1 : 0),
        genres: genres.length,
        sectors: sectors.length,
        radios: radios.length,
        moods: moods.length
      }
    });

    // Copy to clipboard
    try {
      navigator.clipboard.writeText(window.location.href);
    } catch {}

    if (newlyCommittedTitle) {
      showToast(`"${newlyCommittedTitle}" şarkısı "${genre}" türüne, "${selectedSectors.join(', ')}" sektörüne ve ilgili playlistlere kaydedildi!`);
    } else {
      showToast('Tüm değişiklikler kaydedildi ve uygulama anında güncellendi!');
    }
  };

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-[#0c0c11] border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/80 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-zinc-950/90 border-b border-zinc-900 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  müzikbank Admin Gelişmiş Yönetim Paneli
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-950 border border-purple-700/60 text-purple-300 px-2 py-0.5 rounded-full">
                  Canlı Yayın & İçerik
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                MP3 ve görselleri cihazdan yükleyin, türleri, sektörleri, radyoları ve BPM'leri yönetin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Prominent "Kaydet ve Paylaş" Button */}
            <button
              onClick={handleSaveAndApply}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
              title="Tüm değişiklikleri uygulamaya kaydet ve canlı yayına al"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kaydet ve Paylaş</span>
            </button>

            <button
              onClick={() => {
                setIsAdminOpen(false);
                resetTrackForm();
              }}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="bg-purple-950/90 border-b border-purple-500/50 text-white text-xs py-2 px-6 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="px-6 bg-zinc-950 flex items-center justify-between border-b border-zinc-900 overflow-x-auto custom-scrollbar flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                resetTrackForm();
                setActiveTab('tracks');
              }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'tracks'
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>{editingTrackId ? 'Parçayı Düzenle' : 'MP3 / Görsel Upload & Şarkı Ekle'}</span>
            </button>

            <button
              onClick={() => setActiveTab('track-list')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'track-list'
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Katalog ({tracks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('genres')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'genres'
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Türler ({genres.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sectors')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'sectors'
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sektörler ({sectors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('radios')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'radios'
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <RadioIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Radyolar ({radios.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('mood-bpm')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'mood-bpm'
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>Mod & BPM</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Tüm kataloğu ve ayarları varsayılan müzikbank durumuna sıfırlamak istiyor musunuz?')) {
                resetCatalogToDefault();
                showToast('Katalog varsayılana sıfırlandı.');
              }
            }}
            className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-rose-400 transition-colors ml-4 whitespace-nowrap"
            title="Varsayılan kataloğu geri yükle"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Sıfırla</span>
          </button>
        </div>

        {/* Body Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar bg-black/40">
          
          {/* TAB 1: ADD / EDIT TRACK (DEVICE MP3 & IMAGE UPLOAD) */}
          {activeTab === 'tracks' && (
            <form onSubmit={handleTrackSubmit} className="space-y-6 max-w-4xl mx-auto">
              
              {/* Device Upload Section: MP3 & Cover Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. MP3 Audio File Device Upload (NO LINKS) */}
                <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-900 hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-400" />
                      <span>Cihazdan MP3 / Ses Dosyası Yükle *</span>
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">Link Olmadan Yükleme</span>
                  </div>

                  <input
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                  />

                  {audioFileData ? (
                    <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center flex-shrink-0">
                            <Headphones className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{audioFileName || 'Yüklenen MP3 Dosyası'}</p>
                            <p className="text-[11px] text-purple-300/80 font-mono">{audioDuration} saniye (Tahmini Süre)</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => audioFileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                        >
                          Değiştir
                        </button>
                      </div>

                      {/* Mini Preview Player */}
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAudioPreviewToggle}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow shadow-purple-950 hover:brightness-110"
                        >
                          {isAudioPreviewPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                          <span>{isAudioPreviewPlaying ? 'Durdur' : 'Yüklenen Sesi Dinle'}</span>
                        </button>
                        <span className="text-[11px] text-zinc-500">Önizleme hazır</span>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => audioFileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-purple-500/60 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-purple-950/10 group"
                    >
                      <Upload className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform mx-auto mb-2" />
                      <p className="text-xs font-bold text-white">Cihazınızdan MP3 Dosyası Seçin</p>
                      <p className="text-[11px] text-zinc-500 mt-1">Bilgisayarınızdan veya telefonunuzdan doğrudan ses yükleyin</p>
                      <button
                        type="button"
                        className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 group-hover:bg-purple-600 text-white border border-zinc-800 group-hover:border-purple-500 transition-colors"
                      >
                        Dosya Seç
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Cover Image Device Upload (NO LINKS) */}
                <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-900 hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      <span>Cihazdan Kapak Görseli Yükle *</span>
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">PNG / JPG / WebP</span>
                  </div>

                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, setCoverImageData, setCoverImageName)}
                    className="hidden"
                  />

                  {coverImageData ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/40">
                      <img
                        src={coverImageData}
                        alt="Kapak Önizleme"
                        className="w-16 h-16 rounded-xl object-cover border border-indigo-500/40 shadow-md shadow-indigo-950 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{coverImageName || 'Cihazdan Yüklenen Kapak'}</p>
                        <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Görsel Yüklendi</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => coverImageInputRef.current?.click()}
                          className="mt-1 text-[11px] font-semibold text-purple-400 hover:underline"
                        >
                          Farklı Görsel Seç
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverImageInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/60 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-indigo-950/10 group"
                    >
                      <ImageIcon className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform mx-auto mb-2" />
                      <p className="text-xs font-bold text-white">Cihazınızdan Kapak Görseli Seçin</p>
                      <p className="text-[11px] text-zinc-500 mt-1">Albüm kapağı için cihazınızdaki fotoğrafı yükleyin</p>
                      <button
                        type="button"
                        className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 group-hover:bg-indigo-600 text-white border border-zinc-800 group-hover:border-indigo-500 transition-colors"
                      >
                        Görsel Seç
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Artist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Şarkı Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: Istanbul Sunset Lounge"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Sanatçı / Küratör *
                  </label>
                  <input
                    type="text"
                    required
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Örn: Anatolian Sound Lab"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Genre, Mood & BPM Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Müzik Türü
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                  >
                    {genres.map(g => (
                      <option key={g.name} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Mod / Atmosfer
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                  >
                    {moods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-300">
                      BPM (Tempo)
                    </label>
                    <span className="font-mono text-xs text-purple-400 font-bold">{bpm} BPM</span>
                  </div>
                  <input
                    type="number"
                    min="50"
                    max="180"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Sektör Seçimi (Multiple Select) */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Dahil Edilecek Sektörler (Birden çok seçilebilir)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {sectors.map(sec => {
                    const isChecked = selectedSectors.includes(sec.name);
                    return (
                      <button
                        type="button"
                        key={sec.name}
                        onClick={() => handleSectorToggle(sec.name)}
                        className={`text-left p-2.5 rounded-xl text-xs font-medium border transition-all ${
                          isChecked
                            ? 'bg-purple-950/40 border-purple-500 text-purple-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-700'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="truncate">{sec.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Playlist Selection for this Track */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <ListMusic className="w-4 h-4 text-purple-400" />
                    <span>Dahil Edilecek Çalma Listeleri (Playlistler)</span>
                  </label>
                  <span className="text-[10px] text-purple-300/80 font-mono">
                    Tür ({genre}) ve Sektörlere göre otomatik seçilir
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {playlists.map(pl => {
                    const isChecked = selectedTargetPlaylists.includes(pl.id);
                    const isAutoMatched = findMatchingPlaylistIds(genre, selectedSectors, [pl]).includes(pl.id);
                    return (
                      <button
                        type="button"
                        key={pl.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedTargetPlaylists(prev => prev.filter(id => id !== pl.id));
                          } else {
                            setSelectedTargetPlaylists(prev => [...prev, pl.id]);
                          }
                        }}
                        className={`text-left p-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-between gap-2 ${
                          isChecked
                            ? 'bg-purple-950/40 border-purple-500 text-purple-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-700'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="truncate">{pl.title}</span>
                        </div>
                        {isAutoMatched && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50 flex-shrink-0">
                            Eşleşti ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-zinc-900">
                <button
                  type="button"
                  onClick={handleSaveAndApply}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-950/80 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Kaydet ve Paylaş</span>
                </button>

                <div className="flex items-center gap-3">
                  {editingTrackId && (
                    <button
                      type="button"
                      onClick={resetTrackForm}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900"
                    >
                      İptal
                    </button>
                  )}

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingTrackId ? 'Şarkıyı Güncelle ve Kaydet' : 'Şarkıyı Kataloğa & Playlistlere Kaydet'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: TRACK CATALOG LIST */}
          {activeTab === 'track-list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Katalog içinde ara (şarkı, sanatçı, tür, sektör)..."
                  className="w-full max-w-sm px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-500"
                />
                <span className="text-xs text-zinc-400 font-mono">
                  Toplam {filteredTracks.length} parça
                </span>
              </div>

              <div className="space-y-2">
                {filteredTracks.map(trk => {
                  const isCur = currentTrack?.id === trk.id;
                  return (
                    <div
                      key={trk.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => {
                            if (isCur && isPlaying) {
                              togglePlay();
                            } else {
                              playTrack(trk, tracks);
                            }
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCur && isPlaying
                              ? 'bg-purple-600 text-white'
                              : 'bg-zinc-900 text-zinc-300 hover:bg-purple-600 hover:text-white'
                          }`}
                        >
                          {isCur && isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        <img
                          src={trk.coverUrl}
                          alt={trk.title}
                          className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-zinc-800"
                        />

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {trk.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {trk.artist} • <span className="text-purple-400 font-medium">{trk.genre}</span> • {trk.mood}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {trk.bpm} BPM
                            </span>
                            <span className="text-[10px] text-zinc-400 truncate max-w-xs">
                              {trk.sectors.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(trk)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-zinc-900 transition-colors"
                          title="Düzenle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`"${trk.title}" parçasını silmek istediğinize emin misiniz?`)) {
                              deleteTrack(trk.id);
                              showToast('Parça silindi.');
                            }
                          }}
                          className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GENRES MANAGEMENT (Türler Başlıkları & Şarkı Ekle/Çıkar) */}
          {activeTab === 'genres' && (
            <div className="space-y-6">
              
              {/* Form: Add New Genre */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-purple-400" />
                  <span>Yeni Müzik Türü Başlığı Ekle</span>
                </h3>

                <form onSubmit={handleCreateGenre} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Tür Başlığı *</label>
                    <input
                      type="text"
                      required
                      value={newGenreName}
                      onChange={(e) => setNewGenreName(e.target.value)}
                      placeholder="Örn: Synthwave"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Rozet Metni</label>
                    <input
                      type="text"
                      value={newGenreBadge}
                      onChange={(e) => setNewGenreBadge(e.target.value)}
                      placeholder="Örn: SYNTHWAVE"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Kapak Görseli (Cihazdan Yükle)</label>
                    <input
                      ref={genreImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setNewGenreCover)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => genreImageInputRef.current?.click()}
                      className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500 rounded-xl text-xs text-zinc-300 flex items-center justify-center gap-1.5 truncate"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{newGenreCover ? 'Görsel Seçildi ✓' : 'Cihazdan Görsel Seç'}</span>
                    </button>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-md transition-all"
                    >
                      Türü Ekle
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Genres List & Song Assignment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Mevcut Türler ({genres.length})
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    Bir türe tıklayarak şarkı ekleyip çıkarabilirsiniz
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {genres.map(g => {
                    const assignedTracks = tracks.filter(t => t.genre.toLowerCase() === g.name.toLowerCase());
                    const isManaging = selectedGenreForSongManage === g.name;

                    return (
                      <div
                        key={g.name}
                        className={`rounded-2xl border transition-all p-3.5 bg-zinc-950/80 ${
                          isManaging ? 'border-purple-500 shadow-xl shadow-purple-950/40' : 'border-zinc-900 hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={g.coverUrl}
                              alt={g.name}
                              className="w-12 h-12 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{g.name}</h4>
                              <p className="text-[11px] text-purple-400 font-mono">{assignedTracks.length} Şarkı Atandı</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedGenreForSongManage(isManaging ? null : g.name)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isManaging
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                              }`}
                            >
                              {isManaging ? 'Kapat' : 'Şarkı Ekle/Çıkar'}
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`"${g.name}" türünü silmek istediğinize emin misiniz?`)) {
                                  deleteGenre(g.name);
                                  showToast(`"${g.name}" türü silindi.`);
                                }
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                              title="Türü Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Song Assignment Panel for this Genre */}
                        {isManaging && (
                          <div className="mt-4 pt-4 border-t border-zinc-900 space-y-2 animate-fadeIn">
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                              <span>Bu türe atanacak şarkıları seçin veya çıkarın:</span>
                              <span className="font-mono text-purple-300">{assignedTracks.length} / {tracks.length}</span>
                            </div>

                            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                              {tracks.map(t => {
                                const isAssigned = t.genre.toLowerCase() === g.name.toLowerCase();
                                return (
                                  <div
                                    key={t.id}
                                    onClick={() => {
                                      if (isAssigned) {
                                        removeTrackFromGenre(t.id);
                                        showToast(`"${t.title}" bu türden çıkarıldı.`);
                                      } else {
                                        addTrackToGenre(t.id, g.name);
                                        showToast(`"${t.title}" bu türe eklendi.`);
                                      }
                                    }}
                                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                                      isAssigned
                                        ? 'bg-purple-950/40 border-purple-500/60 text-white font-semibold'
                                        : 'bg-zinc-900/60 border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                                        isAssigned ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-700'
                                      }`}>
                                        {isAssigned && <Check className="w-2.5 h-2.5" />}
                                      </div>
                                      <span className="truncate">{t.title}</span>
                                      <span className="text-[10px] text-zinc-500">({t.artist})</span>
                                    </div>

                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isAssigned ? 'text-purple-300 bg-purple-900/60' : 'text-zinc-600'}`}>
                                      {isAssigned ? 'Dahil' : '+ Ekle'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECTORS MANAGEMENT (Sektörler Başlıkları & Şarkı Ekle/Çıkar) */}
          {activeTab === 'sectors' && (
            <div className="space-y-6">
              
              {/* Form: Add New Sector */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Yeni Sektör Başlığı Ekle</span>
                </h3>

                <form onSubmit={handleCreateSector} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Sektör Başlığı *</label>
                    <input
                      type="text"
                      required
                      value={newSectorName}
                      onChange={(e) => setNewSectorName(e.target.value)}
                      placeholder="Örn: Plaj & Beach Club"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Rozet Başlığı</label>
                    <input
                      type="text"
                      value={newSectorBadge}
                      onChange={(e) => setNewSectorBadge(e.target.value)}
                      placeholder="Örn: BEACH CLUB"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Kapak Görseli (Cihazdan Yükle)</label>
                    <input
                      ref={sectorImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setNewSectorCover)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => sectorImageInputRef.current?.click()}
                      className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500 rounded-xl text-xs text-zinc-300 flex items-center justify-center gap-1.5 truncate"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{newSectorCover ? 'Görsel Seçildi ✓' : 'Cihazdan Görsel Seç'}</span>
                    </button>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 shadow-md transition-all"
                    >
                      Sektörü Ekle
                    </button>
                  </div>
                </form>
              </div>

              {/* Sectors List with Song Assignment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Mevcut Sektörler ({sectors.length})
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    Sektöre şarkı ekleyip çıkarabilirsiniz
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {sectors.map(sec => {
                    const assignedTracks = tracks.filter(t => t.sectors.includes(sec.name));
                    const isManaging = selectedSectorForSongManage === sec.name;

                    return (
                      <div
                        key={sec.name}
                        className={`rounded-2xl border transition-all p-3.5 bg-zinc-950/80 ${
                          isManaging ? 'border-emerald-500 shadow-xl shadow-emerald-950/30' : 'border-zinc-900 hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={sec.coverUrl}
                              alt={sec.name}
                              className="w-12 h-12 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{sec.name}</h4>
                              <p className="text-[11px] text-emerald-400 font-mono">{assignedTracks.length} Şarkı Dahil</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedSectorForSongManage(isManaging ? null : sec.name)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isManaging
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                              }`}
                            >
                              {isManaging ? 'Kapat' : 'Şarkı Ekle/Çıkar'}
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`"${sec.name}" sektörünü silmek istediğinize emin misiniz?`)) {
                                  deleteSector(sec.name);
                                  showToast(`"${sec.name}" sektörü silindi.`);
                                }
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                              title="Sektörü Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Song Assignment Panel for this Sector */}
                        {isManaging && (
                          <div className="mt-4 pt-4 border-t border-zinc-900 space-y-2 animate-fadeIn">
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                              <span>Bu sektörde çalacak şarkıları seçin veya çıkarın:</span>
                              <span className="font-mono text-emerald-300">{assignedTracks.length} / {tracks.length}</span>
                            </div>

                            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                              {tracks.map(t => {
                                const isAssigned = t.sectors.includes(sec.name);
                                return (
                                  <div
                                    key={t.id}
                                    onClick={() => {
                                      if (isAssigned) {
                                        removeTrackFromSector(t.id, sec.name);
                                        showToast(`"${t.title}" bu sektörden çıkarıldı.`);
                                      } else {
                                        addTrackToSector(t.id, sec.name);
                                        showToast(`"${t.title}" bu sektöre eklendi.`);
                                      }
                                    }}
                                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                                      isAssigned
                                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white font-semibold'
                                        : 'bg-zinc-900/60 border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                                        isAssigned ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-zinc-700'
                                      }`}>
                                        {isAssigned && <Check className="w-2.5 h-2.5" />}
                                      </div>
                                      <span className="truncate">{t.title}</span>
                                      <span className="text-[10px] text-zinc-500">({t.artist})</span>
                                    </div>

                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isAssigned ? 'text-emerald-300 bg-emerald-900/60' : 'text-zinc-600'}`}>
                                      {isAssigned ? 'Dahil' : '+ Ekle'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RADIOS MANAGEMENT (Radyolar Başlıkları & Şarkı Ekle/Çıkar & Canlı Yayın) */}
          {activeTab === 'radios' && (
            <div className="space-y-6">
              
              {/* Form: Add New Radio Station */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <RadioIcon className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span>Yeni Canlı Radyo İstasyonu Ekle</span>
                </h3>

                <form onSubmit={handleCreateRadio} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Radyo Adı *</label>
                    <input
                      type="text"
                      required
                      value={newRadioName}
                      onChange={(e) => setNewRadioName(e.target.value)}
                      placeholder="Örn: müzikbank Sunset FM"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Yayın Rozeti</label>
                    <input
                      type="text"
                      value={newRadioBadge}
                      onChange={(e) => setNewRadioBadge(e.target.value)}
                      placeholder="Örn: SUNSET FM"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Müzik Formatı</label>
                    <input
                      type="text"
                      value={newRadioGenre}
                      onChange={(e) => setNewRadioGenre(e.target.value)}
                      placeholder="Örn: Deep & Afro House"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 font-bold mb-1">Kapak (Cihazdan Yükle)</label>
                    <input
                      ref={radioImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setNewRadioCover)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => radioImageInputRef.current?.click()}
                      className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500 rounded-xl text-xs text-zinc-300 flex items-center justify-center gap-1.5 truncate"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{newRadioCover ? 'Görsel Seçildi ✓' : 'Cihazdan Seç'}</span>
                    </button>
                  </div>

                  <div className="md:col-span-4 flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-md transition-all"
                    >
                      Radyo İstasyonunu Oluştur
                    </button>
                  </div>
                </form>
              </div>

              {/* Radios List with Song & Live Stream Assignment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Aktif Canlı Mekan Radyoları ({radios.length})
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    Rotasyona şarkı ekleyip çıkarabilir, çalan şarkıyı değiştirebilirsiniz
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {radios.map(rad => {
                    const isManaging = selectedRadioForSongManage === rad.id;
                    const playingTrack = tracks.find(t => t.id === rad.currentTrackId);

                    return (
                      <div
                        key={rad.id}
                        className={`rounded-2xl border transition-all p-3.5 bg-zinc-950/80 ${
                          isManaging ? 'border-purple-500 shadow-xl shadow-purple-950/40' : 'border-zinc-900 hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900">
                              <img src={rad.coverUrl} alt={rad.name} className="w-full h-full object-cover" />
                              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{rad.name}</h4>
                              <p className="text-[11px] text-zinc-400 truncate">{rad.genre}</p>
                              <p className="text-[10px] text-purple-400 font-mono mt-0.5">
                                Canlıda: {playingTrack ? playingTrack.title : 'Otomatik Akış'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedRadioForSongManage(isManaging ? null : rad.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isManaging
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                              }`}
                            >
                              {isManaging ? 'Kapat' : 'Şarkı Ekle/Çıkar'}
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`"${rad.name}" radyosunu silmek istediğinize emin misiniz?`)) {
                                  deleteRadio(rad.id);
                                  showToast(`"${rad.name}" radyosu silindi.`);
                                }
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                              title="Radyoyu Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Song & Broadcast Stream Assignment Panel */}
                        {isManaging && (
                          <div className="mt-4 pt-4 border-t border-zinc-900 space-y-3 animate-fadeIn">
                            {/* Live Stream Main Track Selector */}
                            <div>
                              <label className="block text-[11px] font-bold text-purple-300 mb-1">
                                Şu Anda Canlı Yayında Çalacak Parçayı Seçin:
                              </label>
                              <select
                                value={rad.currentTrackId || ''}
                                onChange={(e) => {
                                  updateRadio(rad.id, { currentTrackId: e.target.value });
                                  showToast(`"${rad.name}" canlı yayın parçası güncellendi.`);
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                              >
                                {tracks.map(t => (
                                  <option key={t.id} value={t.id}>{t.title} - {t.artist} ({t.genre})</option>
                                ))}
                              </select>
                            </div>

                            {/* Rotation Song List */}
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                                <span>Radyo rotasyonuna şarkı ekleyin / çıkarın:</span>
                                <span className="font-mono text-purple-300">{(rad.trackIds || []).length} Parça</span>
                              </div>

                              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                                {tracks.map(t => {
                                  const isAssigned = (rad.trackIds || []).includes(t.id);
                                  return (
                                    <div
                                      key={t.id}
                                      onClick={() => {
                                        if (isAssigned) {
                                          removeTrackFromRadio(rad.id, t.id);
                                          showToast(`"${t.title}" radyo rotasyonundan çıkarıldı.`);
                                        } else {
                                          addTrackToRadio(rad.id, t.id);
                                          showToast(`"${t.title}" radyo rotasyonuna eklendi.`);
                                        }
                                      }}
                                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                                        isAssigned
                                          ? 'bg-purple-950/40 border-purple-500/60 text-white font-semibold'
                                          : 'bg-zinc-900/60 border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                                          isAssigned ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-700'
                                        }`}>
                                          {isAssigned && <Check className="w-2.5 h-2.5" />}
                                        </div>
                                        <span className="truncate">{t.title}</span>
                                      </div>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isAssigned ? 'text-purple-300 bg-purple-900/60' : 'text-zinc-600'}`}>
                                        {isAssigned ? 'Rotasyonda' : '+ Ekle'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MOOD & BPM MANAGEMENT (Mod ve BPM Ekle/Çıkar/Düzenle) */}
          {activeTab === 'mood-bpm' && (
            <div className="space-y-6">
              
              {/* Section 1: Moods (Modlar) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Mod & Atmosfer Yönetimi</span>
                  </h3>
                  <span className="text-[11px] text-zinc-500">Mekan ambiyansı etiketleri</span>
                </div>

                {/* Add New Mood */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMoodInput}
                    onChange={(e) => setNewMoodInput(e.target.value)}
                    placeholder="Yeni mod adı yazın (Örn: Pazar Kahvaltısı, Afterwork, Romantik Akşam)..."
                    className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMoodInput.trim()) return;
                      addMood(newMoodInput.trim());
                      showToast(`"${newMoodInput}" modu eklendi.`);
                      setNewMoodInput('');
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-md"
                  >
                    Modu Ekle
                  </button>
                </div>

                {/* Mood Pills with Delete & Song Management */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {moods.map(m => {
                    const count = tracks.filter(t => t.mood === m).length;
                    const isSelected = selectedMoodForSongManage === m;
                    return (
                      <div
                        key={m}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'bg-purple-950/50 border-purple-500 text-purple-200 shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <span 
                          onClick={() => setSelectedMoodForSongManage(isSelected ? null : m)}
                          className="cursor-pointer font-medium"
                        >
                          {m} <span className="text-[10px] text-purple-400 font-mono">({count})</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`"${m}" modunu silmek istediğinize emin misiniz?`)) {
                              deleteMood(m);
                              showToast(`"${m}" modu silindi.`);
                            }
                          }}
                          className="text-zinc-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                          title="Modu Sil"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Song Assignment Panel for Selected Mood */}
                {selectedMoodForSongManage && (
                  <div className="mt-4 pt-4 border-t border-zinc-900 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>"{selectedMoodForSongManage}" moduna atanacak şarkıları seçin veya çıkarın:</span>
                      <button
                        onClick={() => setSelectedMoodForSongManage(null)}
                        className="text-purple-400 hover:underline"
                      >
                        Paneli Kapat
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                      {tracks.map(t => {
                        const isAssigned = t.mood === selectedMoodForSongManage;
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              if (isAssigned) {
                                addTrackToMood(t.id, 'Sakin & Rahatlatıcı');
                                showToast(`"${t.title}" bu moddan çıkarıldı.`);
                              } else {
                                addTrackToMood(t.id, selectedMoodForSongManage);
                                showToast(`"${t.title}" "${selectedMoodForSongManage}" moduna atandı.`);
                              }
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                              isAssigned
                                ? 'bg-purple-950/40 border-purple-500/60 text-white font-semibold'
                                : 'bg-zinc-900/60 border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                                isAssigned ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-700'
                              }`}>
                                {isAssigned && <Check className="w-2.5 h-2.5" />}
                              </div>
                              <span className="truncate">{t.title}</span>
                              <span className="text-[10px] text-zinc-500">({t.artist})</span>
                            </div>

                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${isAssigned ? 'text-purple-300 bg-purple-900/60' : 'text-zinc-600'}`}>
                              {isAssigned ? 'Atandı' : '+ Ata'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: BPM (Tempo) Quick Management */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-rose-400" />
                    <span>Şarkı BPM (Tempo) Yönetimi & Ayarları</span>
                  </h3>
                  <span className="text-[11px] text-zinc-500">Parçaların çalma hızını doğrudan düzenleyin</span>
                </div>

                <div className="flex items-center gap-2 pb-1">
                  {(['all', 'slow', 'mid', 'fast'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBpmFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                        bpmFilterCategory === cat
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {cat === 'all' && 'Tüm BPM\'ler'}
                      {cat === 'slow' && 'Yavaş (<90 BPM)'}
                      {cat === 'mid' && 'Orta (90-120 BPM)'}
                      {cat === 'fast' && 'Hızlı (>120 BPM)'}
                    </button>
                  ))}
                </div>

                {/* Track BPM inline Editor */}
                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {tracks
                    .filter(t => {
                      if (bpmFilterCategory === 'slow') return t.bpm < 90;
                      if (bpmFilterCategory === 'mid') return t.bpm >= 90 && t.bpm <= 120;
                      if (bpmFilterCategory === 'fast') return t.bpm > 120;
                      return true;
                    })
                    .map(trk => (
                      <div
                        key={trk.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={trk.coverUrl} alt={trk.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{trk.title}</p>
                            <p className="text-[10px] text-zinc-400 truncate">{trk.artist} • {trk.genre}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] text-zinc-400 font-mono">BPM:</span>
                          <input
                            type="number"
                            min="50"
                            max="180"
                            value={trk.bpm}
                            onChange={(e) => updateTrackBpm(trk.id, parseInt(e.target.value) || 100)}
                            className="w-16 px-2 py-1 bg-zinc-950 border border-zinc-700 focus:border-purple-500 rounded-lg text-xs font-mono text-center text-purple-300 font-bold outline-none"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Bar with "Kaydet ve Paylaş" */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tüm değişiklikler anında yerel veritabanına işlenir</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsAdminOpen(false);
                resetTrackForm();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              Kapat
            </button>

            <button
              onClick={handleSaveAndApply}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-xl shadow-purple-950/60 active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Kaydet ve Paylaş</span>
            </button>
          </div>
        </div>

      </div>

      {/* Save & Share Confirmation Modal */}
      {shareResultModal?.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-zinc-950 border border-purple-500/50 rounded-3xl p-6 shadow-2xl shadow-purple-950 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-white">
                Değişiklikler Kaydedildi ve Uygulandı!
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tüm yeni parçalar, türler, sektörler ve radyo akışları başarıyla güncellendi ve tüm sayfalara yansıtıldı.
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center font-mono">
              <div className="p-1.5">
                <span className="block text-base font-extrabold text-white">{shareResultModal.stats.tracks}</span>
                <span className="text-[10px] text-zinc-400">Şarkı</span>
              </div>
              <div className="p-1.5 border-x border-zinc-800">
                <span className="block text-base font-extrabold text-purple-400">{shareResultModal.stats.genres}</span>
                <span className="text-[10px] text-zinc-400">Tür</span>
              </div>
              <div className="p-1.5">
                <span className="block text-base font-extrabold text-emerald-400">{shareResultModal.stats.radios}</span>
                <span className="text-[10px] text-zinc-400">Radyo</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-700/40 text-xs text-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate pr-2">
                <Copy className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="truncate text-[11px]">Uygulama canlı bağlantısı panoya kopyalandı</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 flex-shrink-0">HAZIR ✓</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShareResultModal(null);
                  setIsAdminOpen(false);
                }}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-purple-950 transition-all"
              >
                Tamam ve Uygulamaya Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
