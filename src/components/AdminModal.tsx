import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Music, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Layers, 
  Play, 
  Pause, 
  Sparkles, 
  Check, 
  RotateCcw,
  Sliders,
  Store,
  Upload,
  Link as LinkIcon,
  ShieldCheck
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Track } from '../types';

export const AdminModal: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    tracks, 
    addTrack, 
    updateTrack, 
    deleteTrack, 
    resetCatalogToDefault,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [genre, setGenre] = useState('Chill');
  const [mood, setMood] = useState('Sakin & Rahatlatıcı');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['Kafe & Kahve Dükkanı']);
  const [bpm, setBpm] = useState(110);
  const [price, setPrice] = useState(299);
  const [synthPreset, setSynthPreset] = useState<'chill' | 'lofi' | 'ambient' | 'house' | 'jazz' | 'bossa'>('chill');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isAdminOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
    setAudioUrl(track.audioUrl);
    setCoverUrl(track.coverUrl);
    setGenre(track.genre);
    setMood(track.mood);
    setSelectedSectors(track.sectors);
    setBpm(track.bpm);
    setPrice(track.price);
    setSynthPreset(track.synthPreset || 'chill');
    setActiveTab('add');
  };

  const resetForm = () => {
    setEditingTrackId(null);
    setTitle('');
    setArtist('');
    setAudioUrl('');
    setCoverUrl('');
    setGenre('Chill');
    setMood('Sakin & Rahatlatıcı');
    setSelectedSectors(['Kafe & Kahve Dükkanı']);
    setBpm(110);
    setPrice(299);
    setSynthPreset('chill');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      showToast('Lütfen başlık ve sanatçı alanlarını doldurunuz!');
      return;
    }

    const effectiveCover = coverUrl.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop';
    const effectiveAudio = audioUrl.trim() || `synth:${synthPreset}`;

    if (editingTrackId) {
      updateTrack(editingTrackId, {
        title,
        artist,
        audioUrl: effectiveAudio,
        coverUrl: effectiveCover,
        genre,
        mood,
        sectors: selectedSectors,
        bpm: Number(bpm),
        price: Number(price),
        synthPreset
      });
      showToast('Parça başarıyla güncellendi!');
      resetForm();
      setActiveTab('list');
    } else {
      addTrack({
        title,
        artist,
        audioUrl: effectiveAudio,
        coverUrl: effectiveCover,
        genre,
        mood,
        sectors: selectedSectors,
        bpm: Number(bpm),
        price: Number(price),
        isCommercialCleared: true,
        duration: 210,
        tags: [genre.toLowerCase(), mood.toLowerCase()],
        synthPreset
      });
      showToast('Yeni telifsiz parça başarıyla kataloğa eklendi!');
      resetForm();
      setActiveTab('list');
    }
  };

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0c10] border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-950/60 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                müzikbank Admin Yönetim Paneli
                <span className="text-[10px] font-mono bg-purple-950 border border-purple-800 text-purple-300 px-2 py-0.5 rounded-full">
                  Katalog & MP3 Yönetimi
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Tüm MP3 ses dosyalarını, albüm kapaklarını, tür, mod ve sektörleri yönetin.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAdminOpen(false);
              resetForm();
            }}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="bg-purple-900/80 border-b border-purple-500 text-white text-xs py-2 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-zinc-950 flex items-center justify-between border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetForm();
                setActiveTab('add');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'add'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{editingTrackId ? 'Parçayı Düzenle' : 'Yeni MP3 & Parça Ekle'}</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'list'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Katalog Listesi ({tracks.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Tüm kataloğu varsayılan müzikbank şarkılarına sıfırlamak istiyor musunuz?')) {
                resetCatalogToDefault();
                showToast('Katalog varsayılana sıfırlandı.');
              }
            }}
            className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-rose-400 transition-colors pb-1"
            title="Varsayılan kataloğu geri yükle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılana Sıfırla</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/40">
          {activeTab === 'add' ? (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl mx-auto">
              {/* Row 1: Title & Artist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Parça Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: Bosphorus Breeze Lounge"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Sanatçı / Prodüktör *
                  </label>
                  <input
                    type="text"
                    required
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Örn: Istanbul Soundscape Ensemble"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Audio URL & Preset */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-purple-400" />
                    <span>MP3 Ses Dosyası URL</span>
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    Doğrudan .mp3 linki veya hazır sentetik ambient motoru
                  </span>
                </div>

                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://.../music.mp3 (Boş bırakırsanız yüksek kaliteli sentetik mod çalar)"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                />

                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Sentetik Ses / Melodi Profili (MP3 linki yoksa veya yedek çalıcı için):
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(['chill', 'lofi', 'ambient', 'house', 'jazz', 'bossa'] as const).map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setSynthPreset(p)}
                        className={`py-1.5 text-xs font-semibold rounded-lg uppercase transition-all ${
                          synthPreset === p
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Cover Image URL */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>Kapak Görseli URL</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... (Boş bırakılırsa estetik kapak atanır)"
                    className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                  />
                  {coverUrl && (
                    <img
                      src={coverUrl}
                      alt="Önizleme"
                      className="w-10 h-10 rounded-lg object-cover border border-zinc-700 flex-shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Row 4: Genre & Mood & BPM & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Kategori / Tür
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                  >
                    {['Ambient', 'House', 'Lo-Fi', 'Jazz', 'Bossa Nova', 'Blues', 'Classical', 'Afro House', 'Deep House', 'Acoustic', 'Lounge'].map(g => (
                      <option key={g} value={g}>{g}</option>
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
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                  >
                    {['Sakin & Rahatlatıcı', 'Enerjik & Canlı', 'Odaklanma & Çalışma', 'Lüks & Şık', 'Vintage & Nostaljik', 'Neşeli & Pozitif', 'Huzurlu Doğa'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    BPM (Tempo)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="180"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Erişim Modeli
                  </label>
                  <div className="w-full px-3 py-2 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-300 font-semibold flex items-center gap-1.5 h-[38px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Mekan Paketine Dahil</span>
                  </div>
                </div>
              </div>

              {/* Row 5: Sektörler (Multiple Checkbox / Tags) */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Uygun Mekan & Sektörler (Birden çok seçilebilir)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Kafe & Kahve Dükkanı',
                    'Restoran & Fine Dining',
                    'Butik & Moda Mağazası',
                    'Otel & Lounge',
                    'Spa & Güzellik Merkezi',
                    'Spor Salonu & Fitness',
                    'Ofis & Co-working',
                    'Süpermarket & AVM'
                  ].map(sec => {
                    const isChecked = selectedSectors.includes(sec);
                    return (
                      <button
                        type="button"
                        key={sec}
                        onClick={() => handleSectorToggle(sec)}
                        className={`text-left p-2 rounded-xl text-xs font-medium border transition-all ${
                          isChecked
                            ? 'bg-purple-950/40 border-purple-500 text-purple-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-700'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <span className="truncate">{sec}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-900">
                {editingTrackId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900"
                  >
                    Vazgeç
                  </button>
                )}

                {/* Purple gradient primary button */}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transition-all active:scale-95"
                >
                  {editingTrackId ? 'Değişiklikleri Kaydet' : 'Parçayı Kataloğa Ekle'}
                </button>
              </div>
            </form>
          ) : (
            /* Tracks List / Management */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Katalog içinde ara (şarkı, sanatçı, tür)..."
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
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Play preview */}
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
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-zinc-800"
                        />

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {trk.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {trk.artist} • <span className="text-purple-400">{trk.genre}</span> • {trk.mood}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {trk.bpm} BPM
                            </span>
                            <span className="text-[10px] text-purple-300 font-medium bg-purple-950/60 border border-purple-800/40 px-1.5 py-0.5 rounded">
                              Mekan Paketi
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
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
                            if (window.confirm(`"${trk.title}" parçasını katalogdan silmek istediğinize emin misiniz?`)) {
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
        </div>
      </div>
    </div>
  );
};
