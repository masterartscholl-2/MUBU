import React, { useState } from 'react';
import { 
  Flame, 
  ListMusic, 
  Radio as RadioIcon, 
  Music2, 
  Heart, 
  Play, 
  Pause, 
  MoreVertical,
  Plus,
  ShoppingBag
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Playlist, Track, RadioStation } from '../types';

export const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'playlist' | 'radio' | 'track'>('playlist');
  const { 
    playlists, 
    radios, 
    tracks, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    playPlaylist, 
    playRadio,
    togglePlay, 
    isFavoriteTrack, 
    toggleFavoriteTrack,
    isFavoritePlaylist,
    toggleFavoritePlaylist,
    addToCart,
    setSelectedPlaylistId,
    setActiveTab: setGlobalTab
  } = useMusic();

  const handlePlaylistClick = (playlist: Playlist) => {
    playPlaylist(playlist);
  };

  const handleOpenPlaylistDetails = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlaylistId(playlist.id);
    setGlobalTab('playlist-detail');
  };

  return (
    <aside className="w-80 flex-shrink-0 bg-black/95 border-l border-zinc-900/90 flex flex-col h-[calc(100vh-5rem)] select-none z-20">
      {/* Header matching screenshot */}
      <div className="p-5 border-b border-zinc-900/80">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40">
            <Flame className="w-4 h-4 text-purple-200" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Popüler Playlist
            </h2>
            <p className="text-xs text-zinc-400">
              Öne çıkan koleksiyonlar
            </p>
          </div>
        </div>

        {/* Tab pills matching screenshot */}
        <div className="flex items-center gap-1.5 mt-4 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
          <button
            onClick={() => setActiveTab('playlist')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'playlist'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlist</span>
          </button>

          <button
            onClick={() => setActiveTab('radio')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'radio'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RadioIcon className="w-3.5 h-3.5" />
            <span>Radyo</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'track'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Şarkı</span>
          </button>
        </div>
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
        {/* Playlists Tab */}
        {activeTab === 'playlist' && (
          playlists.map((pl) => {
            const isFav = isFavoritePlaylist(pl.id);
            return (
              <div
                key={pl.id}
                onClick={() => handlePlaylistClick(pl)}
                className="group relative flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-900/90 border border-zinc-900 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors truncate">
                      {pl.title}
                    </h4>
                    <span className="text-xs text-zinc-500 font-mono">
                      {pl.durationText || `${pl.trackIds.length} parça`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoritePlaylist(pl.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isFav 
                        ? 'text-rose-500' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                    title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => handleOpenPlaylistDetails(pl, e)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                    title="Detayları ve Şarkıları Gör"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Radio Tab */}
        {activeTab === 'radio' && (
          radios.map((rad) => {
            return (
              <div
                key={rad.id}
                onClick={() => playRadio(rad)}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-900/90 border border-zinc-900 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img
                      src={rad.coverUrl}
                      alt={rad.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-1 right-1">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors truncate">
                      {rad.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {rad.genre}
                    </p>
                    <span className="text-[10px] text-purple-400 font-medium">
                      {rad.listenersCount.toLocaleString()} dinleyici
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-full bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
            );
          })
        )}

        {/* Track Tab */}
        {activeTab === 'track' && (
          tracks.slice(0, 10).map((trk, i) => {
            const isCurr = currentTrack?.id === trk.id;
            const isFav = isFavoriteTrack(trk.id);
            return (
              <div
                key={trk.id}
                onClick={() => playTrack(trk, tracks)}
                className={`group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                  isCurr 
                    ? 'bg-purple-950/30 border-purple-500/40' 
                    : 'bg-zinc-950/60 hover:bg-zinc-900/90 border-zinc-900 hover:border-purple-500/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-zinc-500 w-4 text-center">
                    {i + 1}
                  </span>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img
                      src={trk.coverUrl}
                      alt={trk.title}
                      className="w-full h-full object-cover"
                    />
                    {isCurr && isPlaying && (
                      <div className="absolute inset-0 bg-purple-900/60 flex items-center justify-center">
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-1 bg-white h-2 animate-pulse" />
                          <span className="w-1 bg-white h-3 animate-pulse delay-75" />
                          <span className="w-1 bg-white h-1.5 animate-pulse delay-150" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-semibold truncate ${
                      isCurr ? 'text-purple-300' : 'text-zinc-200 group-hover:text-white'
                    }`}>
                      {trk.title}
                    </h4>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {trk.artist}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteTrack(trk.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isFav 
                        ? 'text-rose-500' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* müzikbank Public Performance Verification Notice */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-900/90 text-center">
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
          <p className="text-[11px] text-purple-300 font-semibold mb-1">
            %100 Telif Muafiyet Garantisi
          </p>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Tüm parçalar MESAM / MSG / MÜ-YAP yasal muafiyet sertifikasıyla lisanslanır.
          </p>
        </div>
      </div>
    </aside>
  );
};
