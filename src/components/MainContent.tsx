import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreVertical, 
  Sparkles, 
  Store, 
  ChevronRight, 
  ShoppingBag, 
  Radio as RadioIcon, 
  Check, 
  Flame, 
  Layers, 
  Music,
  Share2,
  Plus,
  ShieldCheck,
  Trash2,
  ListMusic,
  Search,
  X,
  Disc3,
  Sliders
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { FilterBar } from './FilterBar';
import { VenueManagement } from './VenueManagement';
import { VENUE_SECTORS, GENRE_CATEGORIES } from '../data/initialData';
import { Track, Playlist } from '../types';

export const MainContent: React.FC = () => {
  const { 
    tracks, 
    playlists, 
    radios,
    playRadio,
    currentTrack, 
    isPlaying, 
    playTrack, 
    playPlaylist, 
    togglePlay, 
    isFavoriteTrack, 
    toggleFavoriteTrack,
    isFavoritePlaylist,
    toggleFavoritePlaylist,
    addToCart,
    activeTab,
    setActiveTab,
    selectedGenreFilter,
    setSelectedGenreFilter,
    selectedMoodFilter,
    selectedSectorFilter,
    setSelectedSectorFilter,
    bpmRange,
    searchQuery,
    setSearchQuery,
    selectedPlaylistId,
    setSelectedPlaylistId,
    selectedSectorName,
    setSelectedSectorName,
    setIsNewPlaylistModalOpen,
    deletePlaylist,
    removeTrackFromPlaylist,
    user
  } = useMusic();

  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [selectedGenreDetail, setSelectedGenreDetail] = useState<string | null>(null);
  const [selectedSectorDetail, setSelectedSectorDetail] = useState<string | null>(null);

  // Delete Confirmation Modal Component
  const renderDeleteModal = () => {
    if (!playlistToDelete) return null;
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
        onClick={() => setPlaylistToDelete(null)}
      >
        <div 
          className="relative w-full max-w-md bg-[#0f0f14] border border-purple-500/40 rounded-3xl p-6 shadow-2xl shadow-purple-950/80 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-950/60 text-rose-400 border border-rose-800/50">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Çalma Listesini Sil</h3>
              <p className="text-xs text-zinc-400">Bu işlem geri alınamaz.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <img
              src={playlistToDelete.coverUrl}
              alt={playlistToDelete.title}
              className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{playlistToDelete.title}</h4>
              <p className="text-xs text-zinc-400 truncate">{playlistToDelete.trackIds.length} Parça • {playlistToDelete.curator}</p>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong className="text-white">"{playlistToDelete.title}"</strong> isimli çalma listesini silmek istediğinize emin misiniz? Liste kitaplığınızdan kalıcı olarak kaldırılacaktır.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPlaylistToDelete(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => {
                deletePlaylist(playlistToDelete.id);
                setPlaylistToDelete(null);
                if (activeTab === 'playlist-detail') {
                  setActiveTab('playlists');
                }
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-950/50 transition-all active:scale-95"
            >
              Evet, Listeyi Sil
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Filter tracks according to current search, genre, mood, sector, bpm
  const filteredTracks = tracks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q) ||
        t.mood.toLowerCase().includes(q) ||
        t.sectors.some(s => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedGenreFilter && t.genre !== selectedGenreFilter) return false;
    if (selectedMoodFilter && t.mood !== selectedMoodFilter) return false;
    if (selectedSectorFilter && !t.sectors.includes(selectedSectorFilter)) return false;
    if (t.bpm && (t.bpm < bpmRange[0] || t.bpm > bpmRange[1])) return false;
    return true;
  });

  // Top 4 featured playlists matching screenshot:
  const featuredPlaylists = playlists.slice(0, 4);

  // Detail view for selected playlist
  if (activeTab === 'playlist-detail' && selectedPlaylistId) {
    const pl = playlists.find(p => p.id === selectedPlaylistId);
    if (pl) {
      const plTracks = tracks.filter(t => pl.trackIds.includes(t.id));
      const isFav = isFavoritePlaylist(pl.id);
      return (
        <>
          <div className="p-8 space-y-6">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            ← Ana Sayfaya Dön
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 bg-gradient-to-b from-purple-950/40 via-zinc-900/60 to-black p-6 rounded-3xl border border-purple-500/20">
            <img
              src={pl.coverUrl}
              alt={pl.title}
              className="w-48 h-48 rounded-2xl object-cover shadow-2xl shadow-purple-950/60 border border-purple-500/30"
            />
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400">
                {pl.type === 'radio' ? 'Canlı Radyo Akışı' : 'Özel Derleme Playlist'}
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {pl.title}
              </h1>
              <p className="text-sm text-zinc-300 max-w-xl">
                {pl.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span className="text-white font-semibold">Küratör: {pl.curator}</span>
                <span>•</span>
                <span>{plTracks.length} Parça</span>
                <span>•</span>
                <span>{pl.durationText || 'Sürekli Çalma'}</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => playPlaylist(pl)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-xl shadow-purple-900/50 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Listeyi Çal</span>
                </button>

                <button
                  onClick={() => toggleFavoritePlaylist(pl.id)}
                  className={`p-3 rounded-full border transition-colors ${
                    isFav 
                      ? 'border-rose-500/60 bg-rose-950/40 text-rose-500' 
                      : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white'
                  }`}
                  title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => setPlaylistToDelete(pl)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-full text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 hover:border-rose-750 transition-colors"
                  title="Bu Çalma Listesini Sil"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Listeyi Sil</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tracks inside playlist */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-300 px-2">Şarkı Listesi</h3>
            {plTracks.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-500 text-xs">
                Bu çalma listesinde henüz şarkı yok. Aşağıdaki katalogdan şarkı ekleyebilirsiniz.
              </div>
            ) : (
              plTracks.map((trk, i) => {
                const isCurr = currentTrack?.id === trk.id;
                const isFavTrk = isFavoriteTrack(trk.id);
                return (
                  <div
                    key={trk.id}
                    onClick={() => playTrack(trk, plTracks)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${
                      isCurr 
                        ? 'bg-purple-950/30 border-purple-500/40' 
                        : 'bg-zinc-950/60 hover:bg-zinc-900/80 border-zinc-900/90 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-mono text-zinc-500 w-4">{i + 1}</span>
                      <img src={trk.coverUrl} alt={trk.title} className="w-11 h-11 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold truncate ${isCurr ? 'text-purple-300' : 'text-white'}`}>
                          {trk.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {trk.artist} • <span className="text-purple-400">{trk.genre}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-zinc-500 font-mono">
                        {Math.floor(trk.duration / 60)}:{(trk.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteTrack(trk.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFavTrk ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title={isFavTrk ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                      >
                        <Heart className={`w-4 h-4 ${isFavTrk ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrackFromPlaylist(pl.id, trk.id);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Bu Parçayı Listeden Çıkar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {renderDeleteModal()}
      </>
    );
    }
  }

  // VENUE MANAGEMENT TAB
  if (activeTab === 'venue-management') {
    return <VenueManagement />;
  }

  // FAVORITES TAB
  if (activeTab === 'favorites') {
    const favTracks = tracks.filter(t => user.favorites.includes(t.id));
    const favPlaylists = playlists.filter(p => user.favoritePlaylists.includes(p.id));

    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-current" />
              Favorilerim
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Beğendiğiniz tüm telifsiz parçalar ve öne çıkan koleksiyonlar.
            </p>
          </div>
        </div>

        {/* Favorite Playlists */}
        {favPlaylists.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-zinc-300 mb-3">Beğenilen Çalma Listeleri</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favPlaylists.map(pl => (
                <div
                  key={pl.id}
                  onClick={() => playPlaylist(pl)}
                  className="group p-3 rounded-2xl bg-zinc-950/80 border border-zinc-900 hover:border-purple-500/40 cursor-pointer transition-all"
                >
                  <img src={pl.coverUrl} alt={pl.title} className="w-full aspect-square rounded-xl object-cover mb-2" />
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">{pl.title}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">{pl.durationText || `${pl.trackIds.length} parça`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorite Tracks */}
        <div>
          <h2 className="text-sm font-bold text-zinc-300 mb-3">Beğenilen Şarkılar ({favTracks.length})</h2>
          {favTracks.length === 0 ? (
            <div className="p-12 text-center bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-500 text-xs">
              Henüz favorilerinize eklediğiniz bir şarkı bulunmuyor. Kalp simgesine tıklayarak şarkıları buraya kaydedebilirsiniz.
            </div>
          ) : (
            <div className="space-y-2">
              {favTracks.map(trk => (
                <div
                  key={trk.id}
                  onClick={() => playTrack(trk, favTracks)}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-900 hover:border-purple-500/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img src={trk.coverUrl} alt={trk.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{trk.title}</h4>
                      <p className="text-[11px] text-zinc-400">{trk.artist} • <span className="text-purple-400">{trk.genre}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteTrack(trk.id);
                      }}
                      className="text-rose-500 p-1.5"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // PLAYLISTS TAB (Customizable user playlists)
  if (activeTab === 'playlists') {
    return (
      <>
        <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Özelleştirilebilir Çalma Listelerim
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Kafeniz, restoranınız veya mağazanız için kendi müzik listelerinizi oluşturun ve yönetin.
            </p>
          </div>

          <button
            onClick={() => setIsNewPlaylistModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Liste Oluştur</span>
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="p-16 text-center bg-zinc-950/80 rounded-3xl border border-zinc-900 space-y-3">
            <ListMusic className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">Henüz bir çalma listesi bulunmuyor</h3>
            <p className="text-xs text-zinc-400">Yeni bir liste oluşturarak mekanınıza özel parçalar ekleyebilirsiniz.</p>
            <button
              onClick={() => setIsNewPlaylistModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-purple-900/40"
            >
              Yeni Liste Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {playlists.map(pl => (
            <div
              key={pl.id}
              onClick={() => {
                setSelectedPlaylistId(pl.id);
                setActiveTab('playlist-detail');
              }}
              className="group p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-900 hover:border-purple-500/40 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-900">
                  <img src={pl.coverUrl} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPlaylist(pl);
                      }}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Top-right quick delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaylistToDelete(pl);
                    }}
                    title="Listeyi Sil"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-950/90 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-700/60 shadow transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 truncate">{pl.title}</h4>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{pl.description}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-3 pt-2 border-t border-zinc-900 font-mono">
                <span>{pl.trackIds.length} parça</span>
                <div className="flex items-center gap-2">
                  <span>{pl.durationText || 'Özel Liste'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaylistToDelete(pl);
                    }}
                    title="Listeyi Sil"
                    className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
      {renderDeleteModal()}
    </>
  );
  }

  // SECTORS TAB (Matching image_3722839a.png design style)
  if (activeTab === 'sectors') {
    // Detail view when a sector is selected
    if (selectedSectorDetail) {
      const sectorData = VENUE_SECTORS.find(s => s.name.toLowerCase() === selectedSectorDetail.toLowerCase());
      const sectorTracks = tracks.filter(t => t.sectors.some(s => s.toLowerCase().includes(selectedSectorDetail.toLowerCase().split(' ')[0])));
      const displayTracks = sectorTracks.length > 0 ? sectorTracks : tracks.slice(0, 8);

      return (
        <div className="p-6 md:p-8 space-y-6 select-none">
          <button
            onClick={() => setSelectedSectorDetail(null)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            ← Tüm Sektörlere Dön
          </button>

          {/* Hero Sector Header Banner - Smooth top-to-bottom purple to black gradient with seamless bottom */}
          <div className="relative overflow-hidden flex flex-col md:flex-row items-start md:items-end gap-6 bg-gradient-to-b from-purple-700 via-purple-950/80 to-black p-6 sm:p-8 rounded-3xl border-t border-x border-purple-500/30 border-b-0 shadow-2xl shadow-purple-950/60">
            <div className="absolute -top-16 left-12 w-80 h-32 bg-purple-400/25 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />
            <img
              src={sectorData?.coverUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop'}
              alt={selectedSectorDetail}
              className="relative z-10 w-44 h-44 rounded-2xl object-cover shadow-2xl shadow-purple-950/80 border border-purple-500/40"
            />
            <div className="relative z-10 space-y-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400 bg-purple-950/80 border border-purple-800/60 px-3 py-1 rounded-full">
                Sektörel Müzik Paketi
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {selectedSectorDetail}
              </h1>
              <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
                {sectorData?.desc || 'İşletmeniz için resmi telif muafiyetli, ortamın ambiyansını yükselten sektöre özel müzik paketleri.'}
              </p>
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span className="text-white font-semibold">{displayTracks.length} Parça & Akış</span>
                <span>•</span>
                <span>%100 Ticari Muafiyet</span>
                <span>•</span>
                <span>Sürekli Güncellenen Katalog</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (displayTracks.length > 0) {
                      playTrack(displayTracks[0], displayTracks);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-xl shadow-purple-900/50 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Tümünü Çal</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedSectorFilter(selectedSectorDetail);
                    setActiveTab('home');
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-full text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/50 transition-all"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Ana Sayfada Filtrele</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tracks Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-300 px-2">Bu Sektöre Özel Parçalar ({displayTracks.length})</h3>
            <div className="space-y-2">
              {displayTracks.map((trk) => {
                const isCurr = currentTrack?.id === trk.id;
                const isFavTrk = isFavoriteTrack(trk.id);
                return (
                  <div
                    key={trk.id}
                    onClick={() => playTrack(trk, displayTracks)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                      isCurr 
                        ? 'bg-purple-950/30 border-purple-500/40 shadow-md shadow-purple-950/30' 
                        : 'bg-zinc-950/70 hover:bg-zinc-900/90 border-zinc-900/90 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 w-5/12">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurr && isPlaying) {
                            togglePlay();
                          } else {
                            playTrack(trk, displayTracks);
                          }
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCurr && isPlaying
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-purple-600'
                        }`}
                      >
                        {isCurr && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>

                      <img src={trk.coverUrl} alt={trk.title} className="w-11 h-11 rounded-xl object-cover border border-zinc-800" />
                      <div className="min-w-0">
                        <h4 className={`text-xs md:text-sm font-bold truncate ${isCurr ? 'text-purple-300' : 'text-white'}`}>
                          {trk.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {trk.artist}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-full">
                        {trk.genre}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {trk.bpm} BPM
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500 font-mono">
                        {Math.floor(trk.duration / 60)}:{(trk.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteTrack(trk.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          isFavTrk ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFavTrk ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-20" />
          {renderDeleteModal()}
        </div>
      );
    }

    // Default Sektörler Overview Page matching image_3722839a.png style
    return (
      <div className="p-6 md:p-8 space-y-8 select-none">
        {/* Top Hero Banner - Smooth top-to-bottom purple to black gradient with seamless bottom */}
        <div className="relative overflow-hidden p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-purple-700 via-purple-950/80 to-black border-t border-x border-purple-500/30 border-b-0 shadow-2xl shadow-purple-950/60 flex items-center gap-5">
          {/* Subtle luminous ambient glow and top specular highlight */}
          <div className="absolute -top-16 left-12 w-80 h-32 bg-purple-400/25 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />

          <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl shadow-purple-950/50 flex-shrink-0">
            <Store className="w-7 h-7 text-white" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Sektörler
            </h1>
            <p className="text-sm text-purple-200/90 font-medium mt-1">
              Mekanınıza ve işletmenize özel telifsiz müzik paketleri
            </p>
          </div>
        </div>

        {/* Grid of Sector Cards matching image_3722839a.png */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {VENUE_SECTORS.map((sec) => {
            const sectorTracks = tracks.filter(t => t.sectors.some(s => s.toLowerCase().includes(sec.name.toLowerCase().split(' ')[0])));
            const playList = sectorTracks.length > 0 ? sectorTracks : tracks;
            return (
              <div
                key={sec.name}
                onClick={() => setSelectedSectorDetail(sec.name)}
                className="group rounded-2xl bg-zinc-950/80 border border-zinc-900 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/30 transition-all p-3 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-900">
                    <img
                      src={sec.coverUrl}
                      alt={sec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for subtle text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Stylized Badge matching the screenshot */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-black tracking-widest text-white uppercase drop-shadow-md">
                      {sec.badgeTitle || sec.name.toUpperCase()}
                    </div>

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(playList[0], playList);
                        }}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-950 hover:scale-110 active:scale-95 transition-all"
                        title={`${sec.name} Müziklerini Çal`}
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {sec.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>{sec.tracksCount} Parça</span>
                  <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform font-sans font-semibold">Keşfet →</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-20" />
        {renderDeleteModal()}
      </div>
    );
  }

  // GENRES TAB (Matching image_7e002529.png in site colors)
  if (activeTab === 'genres') {
    // Detail view when a genre is selected
    if (selectedGenreDetail) {
      const genreData = GENRE_CATEGORIES.find(g => g.name.toLowerCase() === selectedGenreDetail.toLowerCase());
      const genreTracks = tracks.filter(t => t.genre.toLowerCase() === selectedGenreDetail.toLowerCase());
      const displayTracks = genreTracks.length > 0 ? genreTracks : tracks.slice(0, 8);

      return (
        <div className="p-6 md:p-8 space-y-6">
          <button
            onClick={() => setSelectedGenreDetail(null)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            ← Tüm Türlere Dön
          </button>

          {/* Hero Genre Header Banner - Smooth top-to-bottom purple to black gradient with seamless bottom */}
          <div className="relative overflow-hidden flex flex-col md:flex-row items-start md:items-end gap-6 bg-gradient-to-b from-purple-700 via-purple-950/80 to-black p-6 sm:p-8 rounded-3xl border-t border-x border-purple-500/30 border-b-0 shadow-2xl shadow-purple-950/60">
            <div className="absolute -top-16 left-12 w-80 h-32 bg-purple-400/25 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />
            <img
              src={genreData?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop'}
              alt={selectedGenreDetail}
              className="relative z-10 w-44 h-44 rounded-2xl object-cover shadow-2xl shadow-purple-950/80 border border-purple-500/40"
            />
            <div className="relative z-10 space-y-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400 bg-purple-950/80 border border-purple-800/60 px-3 py-1 rounded-full">
                Müzik Türü Kataloğu
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {selectedGenreDetail}
              </h1>
              <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
                {genreData?.desc || 'Mekanınız ve projeleriniz için telifsiz ticari müzikler.'}
              </p>
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span className="text-white font-semibold">{displayTracks.length} Parça</span>
                <span>•</span>
                <span>%100 Telifsiz Ticari Lisans</span>
                <span>•</span>
                <span>Yüksek Kalite FLAC/MP3</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (displayTracks.length > 0) {
                      playTrack(displayTracks[0], displayTracks);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-xl shadow-purple-900/50 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Tümünü Çal</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedGenreFilter(selectedGenreDetail);
                    setActiveTab('home');
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-full text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/50 transition-all"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Ana Sayfada Filtrele</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tracks Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-300 px-2">Bu Türdeki Parçalar ({displayTracks.length})</h3>
            <div className="space-y-2">
              {displayTracks.map((trk) => {
                const isCurr = currentTrack?.id === trk.id;
                const isFavTrk = isFavoriteTrack(trk.id);
                return (
                  <div
                    key={trk.id}
                    onClick={() => playTrack(trk, displayTracks)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                      isCurr 
                        ? 'bg-purple-950/30 border-purple-500/40 shadow-md shadow-purple-950/30' 
                        : 'bg-zinc-950/70 hover:bg-zinc-900/90 border-zinc-900/90 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 w-5/12">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurr && isPlaying) {
                            togglePlay();
                          } else {
                            playTrack(trk, displayTracks);
                          }
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCurr && isPlaying
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-purple-600'
                        }`}
                      >
                        {isCurr && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>

                      <img src={trk.coverUrl} alt={trk.title} className="w-11 h-11 rounded-xl object-cover border border-zinc-800" />
                      <div className="min-w-0">
                        <h4 className={`text-xs md:text-sm font-bold truncate ${isCurr ? 'text-purple-300' : 'text-white'}`}>
                          {trk.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {trk.artist}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-full">
                        {trk.genre}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {trk.bpm} BPM
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500 font-mono">
                        {Math.floor(trk.duration / 60)}:{(trk.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteTrack(trk.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          isFavTrk ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFavTrk ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-20" />
          {renderDeleteModal()}
        </div>
      );
    }

    // Default Türler Overview Page matching image_7e002529.png
    return (
      <div className="p-6 md:p-8 space-y-8 select-none">
        {/* Top Hero Banner - Smooth top-to-bottom purple to black gradient with seamless bottom */}
        <div className="relative overflow-hidden p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-purple-700 via-purple-950/80 to-black border-t border-x border-purple-500/30 border-b-0 shadow-2xl shadow-purple-950/60 flex items-center gap-5">
          {/* Subtle luminous ambient glow and top specular highlight */}
          <div className="absolute -top-16 left-12 w-80 h-32 bg-purple-400/25 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />

          <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl shadow-purple-950/50 flex-shrink-0">
            <Disc3 className="w-7 h-7 text-white" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Türler
            </h1>
            <p className="text-sm text-purple-200/90 font-medium mt-1">
              Müzik türlerini keşfet
            </p>
          </div>
        </div>

        {/* Grid of Genre Cards matching image_7e002529.png */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {GENRE_CATEGORIES.map((g) => {
            const matchingTracks = tracks.filter(t => t.genre.toLowerCase() === g.name.toLowerCase());
            return (
              <div
                key={g.name}
                onClick={() => setSelectedGenreDetail(g.name)}
                className="group rounded-2xl bg-zinc-950/80 border border-zinc-900 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/30 transition-all p-3 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-900">
                    <img
                      src={g.coverUrl}
                      alt={g.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for subtle text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Stylized Badge matching the screenshot (ACOUSTIC, AMBIENT, BALKAN MUSIC, BLUES, etc.) */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-black tracking-widest text-white uppercase drop-shadow-md">
                      {g.badgeTitle}
                    </div>

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (matchingTracks.length > 0) {
                            playTrack(matchingTracks[0], matchingTracks);
                          } else {
                            playTrack(tracks[0], tracks);
                          }
                        }}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-950 hover:scale-110 active:scale-95 transition-all"
                        title={`${g.name} Türünü Çal`}
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {g.name}
                  </h3>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>{g.tracksCount} Parça</span>
                  <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform font-sans font-semibold">Keşfet →</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-20" />
        {renderDeleteModal()}
      </div>
    );
  }

  // RADIOS TAB (Matching 2. görsel: image_132536f1.png and 1. görsel: image_a8f1f9d0.png)
  if (activeTab === 'radios') {
    return (
      <div className="p-6 md:p-8 space-y-8 select-none">
        {/* 1. Hero Radyolar Header Banner - Smooth top-to-bottom purple to black gradient with seamless bottom */}
        <div className="relative overflow-hidden flex items-center gap-5 bg-gradient-to-b from-purple-700 via-purple-950/80 to-black p-7 sm:p-9 rounded-3xl border-t border-x border-purple-500/30 border-b-0 shadow-2xl shadow-purple-950/60">
          <div className="absolute -top-16 left-12 w-80 h-32 bg-purple-400/25 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />
          
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl shadow-purple-950/50 flex-shrink-0">
            <RadioIcon className="w-7 h-7 text-white animate-pulse" />
          </div>

          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Radyolar
            </h1>
            <p className="text-sm text-purple-200/90 font-medium mt-1">
              7/24 Kesintisiz Canlı Mekan Radyo Akışları
            </p>
          </div>
        </div>

        {/* 2. 4-Column Radio Cards Grid (Matching 2. görsel: image_132536f1.png) */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {radios.map((rad) => {
              const isCurr = currentTrack?.id === rad.currentTrackId && isPlaying;
              return (
                <div
                  key={rad.id}
                  onClick={() => playRadio(rad)}
                  className={`group rounded-2xl bg-zinc-950/80 border transition-all p-3 cursor-pointer flex flex-col justify-between ${
                    isCurr
                      ? 'border-purple-500/60 shadow-xl shadow-purple-950/40'
                      : 'border-zinc-900 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/30'
                  }`}
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-900">
                      <img
                        src={rad.coverUrl}
                        alt={rad.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      
                      {/* Stylized Top-Left Badge */}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 text-[11px] font-black tracking-widest text-white uppercase drop-shadow-md">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                        <span>{rad.badgeTitle || 'CANLI'}</span>
                      </div>

                      {/* Hover / Active Play Button */}
                      <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${
                        isCurr ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurr) {
                              togglePlay();
                            } else {
                              playRadio(rad);
                            }
                          }}
                          className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-950 hover:scale-110 active:scale-95 transition-all"
                          title={`${rad.name} Dinle`}
                        >
                          {isCurr ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {rad.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-1">
                      {rad.genre}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span className="text-purple-400 font-semibold">{rad.listenersCount.toLocaleString('tr-TR')} Dinleyici</span>
                    <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform font-sans font-semibold">
                      {isCurr ? 'Çalıyor ♪' : 'Dinle →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Canlı Yayın Akışı Bölümü (Matching 1. görsel: image_a8f1f9d0.png) */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                Canlı Radyo Frekansları & Yayın Akışı
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Mekanlarınız için anonsuz, reklamsız ve kesintisiz 7/24 canlı radyo akışları.
              </p>
            </div>
            <span className="text-[10px] font-bold tracking-wider text-purple-400 bg-purple-950/80 border border-purple-800/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              CANLI YAYIN AKTİF
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {radios.map((rad) => {
              const isCurr = currentTrack?.id === rad.currentTrackId && isPlaying;
              return (
                <div
                  key={`stream-${rad.id}`}
                  onClick={() => playRadio(rad)}
                  className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurr 
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-950/30' 
                      : 'bg-zinc-950/80 hover:bg-zinc-900/90 border-zinc-900 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900 border border-zinc-800">
                      <img
                        src={rad.coverUrl}
                        alt={rad.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1.5 right-1.5">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {rad.name}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">
                        {rad.genre}
                      </p>
                      <span className="text-xs text-purple-400 font-mono font-medium">
                        {rad.listenersCount.toLocaleString('tr-TR')} dinleyici
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurr) {
                        togglePlay();
                      } else {
                        playRadio(rad);
                      }
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isCurr
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/60'
                        : 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-950 group-hover:scale-105'
                    }`}
                    title={isCurr ? 'Durdur' : 'Radyoyu Başlat'}
                  >
                    {isCurr ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-20" />
        {renderDeleteModal()}
      </div>
    );
  }

  // DEFAULT / HOME VIEW
  return (
    <div className="p-6 md:p-8 space-y-6 select-none">
      
      {/* Search Bar - Positioned right above FilterBar as indicated in user screenshot */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-purple-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Şarkı, sanatçı, tür (Ambient, Bossa, House...), mekan ara..."
          className="w-full pl-11 pr-24 py-3 bg-zinc-950/90 hover:bg-zinc-900/90 focus:bg-zinc-900 text-sm text-zinc-100 placeholder-zinc-500 rounded-2xl border border-zinc-800/90 hover:border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-lg shadow-black/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Bar Component */}
      <FilterBar />

      {/* 2. ÖNE ÇIKAN LİSTELER (Featured Playlists matching screenshot: Cappadocia House, Afro House, Arkada Çalsın, Chill House) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Öne Çıkan Listeler
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Editörün seçtiği ve en çok tercih edilen özel müzik listeleri.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('playlists')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>Tümünü gör</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards in Row matching screenshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredPlaylists.map((pl) => {
            const isFav = isFavoritePlaylist(pl.id);
            return (
              <div
                key={pl.id}
                onClick={() => playPlaylist(pl)}
                className="group p-3 rounded-2xl bg-zinc-950/80 border border-zinc-900 hover:border-purple-500/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-900">
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Dark gradient overlay for text readability on card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Centered big white text overlay matching screenshot (CAPPADOCIA HOUSE, AFRO HOUSE, etc.) */}
                    <div className="absolute inset-0 flex items-center justify-center p-3 text-center pointer-events-none">
                      <span className="text-sm md:text-base font-black tracking-wider text-white uppercase drop-shadow-md">
                        {pl.title}
                      </span>
                    </div>

                    {/* Play button hover */}
                    <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-950">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                    {pl.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 mt-2 font-mono">
                  <span>{pl.durationText || '14s 20dk'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoritePlaylist(pl.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      isFav ? 'text-rose-500' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MEKAN ATMOSFERİ (Venue Atmosphere matching screenshot) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Mekan Atmosferi
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Mekanınıza uygun atmosferi oluşturacak müzik tarzlarını keşfedin.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('sectors')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>Tümünü gör</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Venue horizontal cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {VENUE_SECTORS.map((sec) => (
            <div
              key={sec.name}
              onClick={() => {
                setSelectedSectorFilter(sec.name);
              }}
              className={`group p-3 rounded-2xl bg-zinc-950/80 border transition-all cursor-pointer ${
                selectedSectorFilter === sec.name
                  ? 'border-purple-500 bg-purple-950/30'
                  : 'border-zinc-900 hover:border-purple-500/30 hover:bg-zinc-900'
              }`}
            >
              <img
                src={sec.coverUrl}
                alt={sec.name}
                className="w-full h-24 rounded-xl object-cover mb-2.5 group-hover:scale-105 transition-transform"
              />
              <h4 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                {sec.name}
              </h4>
              <span className="text-[10px] text-zinc-500">
                {sec.tracksCount} Telifsiz Parça
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TELİFSİZ ŞARKI KATALOĞU & LİSANSLAMA (Royalty-free tracks catalog with filters) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Telifsiz Parça Kataloğu
              <span className="text-xs font-mono font-normal bg-zinc-900 text-zinc-400 px-2.5 py-0.5 rounded-full border border-zinc-800">
                {filteredTracks.length} Parça
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Anında önizleme, kesintisiz çalma ve mekan paketi aboneliği ile sınırsız ticari yayın.
            </p>
          </div>
        </div>

        {/* Tracks Table / List */}
        <div className="space-y-2">
          {filteredTracks.length === 0 ? (
            <div className="p-12 text-center bg-zinc-950/60 rounded-2xl border border-zinc-900 text-zinc-500 text-xs">
              Seçilen filtrelere uygun parça bulunamadı. Filtreleri sıfırlayabilirsiniz.
            </div>
          ) : (
            filteredTracks.map((trk, i) => {
              const isCurrent = currentTrack?.id === trk.id;
              const isFav = isFavoriteTrack(trk.id);
              return (
                <div
                  key={trk.id}
                  onClick={() => playTrack(trk, filteredTracks)}
                  className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-purple-950/30 border-purple-500/40 shadow-md shadow-purple-950/30'
                      : 'bg-zinc-950/70 hover:bg-zinc-900/90 border-zinc-900/90 hover:border-purple-500/30'
                  }`}
                >
                  {/* Left: Play button, Cover, Title, Artist */}
                  <div className="flex items-center gap-3.5 min-w-0 w-5/12">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent && isPlaying) {
                          togglePlay();
                        } else {
                          playTrack(trk, filteredTracks);
                        }
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isCurrent && isPlaying
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-zinc-900 text-zinc-300 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 group-hover:text-white'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
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
                      <h4 className={`text-xs md:text-sm font-bold truncate ${
                        isCurrent ? 'text-purple-300' : 'text-white group-hover:text-purple-300'
                      }`}>
                        {trk.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {trk.artist}
                      </p>
                    </div>
                  </div>

                  {/* Center: Genre & Mood tags */}
                  <div className="hidden md:flex items-center gap-2 w-3/12">
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-full">
                      {trk.genre}
                    </span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                      {trk.mood}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {trk.bpm} BPM
                    </span>
                  </div>

                  {/* Right: Duration, Favorite, License Buy button */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                      {Math.floor(trk.duration / 60)}:{(trk.duration % 60).toString().padStart(2, '0')}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteTrack(trk.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isFav ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    {/* Mekan Paketine Dahil badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 border border-purple-800/40 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Mekan Paketine Dahil</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Extra space for sticky player */}
      <div className="h-24" />

      {renderDeleteModal()}
    </div>
  );
};
