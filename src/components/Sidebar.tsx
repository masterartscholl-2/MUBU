import React from 'react';
import { 
  Library, 
  Heart, 
  Disc3, 
  Store, 
  Radio, 
  Building2, 
  Tag, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    setIsAdminOpen, 
    setIsNewPlaylistModalOpen,
    setIsPricingModalOpen,
    setIsCorporateModalOpen,
    setSelectedPlaylistId,
    setSelectedSectorName
  } = useMusic();

  const handleNav = (tab: string) => {
    setSelectedPlaylistId(null);
    setSelectedSectorName(null);
    setActiveTab(tab);
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-black/95 border-r border-zinc-900/90 flex flex-col justify-between h-[calc(100vh-5rem)] select-none z-20">
      <div className="p-5 overflow-y-auto custom-scrollbar">
        {/* Section: KİTAPLIĞIM */}
        <div className="mb-7">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5 px-3">
            Kitaplığım
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleNav('playlists')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'playlists'
                  ? 'bg-gradient-to-r from-purple-900/40 to-indigo-950/40 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Library className="w-4 h-4 text-white" />
                <span>Playlistlerim</span>
              </div>
              <span className="text-xs bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                {user.customPlaylists.length}
              </span>
            </button>

            <button
              onClick={() => handleNav('favorites')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-purple-900/40 to-indigo-950/40 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-white" />
                <span>Favorilerim</span>
              </div>
              <span className="text-xs bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                {user.favorites.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Section: KEŞFET */}
        <div className="mb-7">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5 px-3">
            Keşfet
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleNav('genres')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'genres'
                  ? 'bg-gradient-to-r from-purple-900/40 to-indigo-950/40 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Disc3 className="w-4 h-4 text-white" />
              <span>Türler</span>
            </button>

            <button
              onClick={() => handleNav('sectors')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'sectors'
                  ? 'bg-gradient-to-r from-purple-900/40 to-indigo-950/40 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Store className="w-4 h-4 text-white" />
              <span>Sektörler</span>
            </button>

            <button
              onClick={() => handleNav('radios')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'radios'
                  ? 'bg-gradient-to-r from-purple-900/40 to-indigo-950/40 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-white animate-pulse" />
                <span>Radyolar</span>
              </div>
              <span className="text-[10px] font-bold tracking-wider text-purple-400 bg-purple-950/80 border border-purple-800/50 px-1.5 py-0.5 rounded">
                CANLI
              </span>
            </button>
          </nav>
        </div>

        {/* Section: KURUMSAL */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5 px-3">
            Kurumsal & Paketler
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-all text-left"
            >
              <Tag className="w-4 h-4 text-white" />
              <span>Mekan Paketleri</span>
            </button>

            <button
              onClick={() => setIsCorporateModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-all text-left"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>Kurumsal & Telif</span>
            </button>
          </nav>
        </div>

        {/* Admin Paneli Access Button */}
        <div className="pt-2 border-t border-zinc-900/80">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="w-full group relative overflow-hidden flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-zinc-900/90 hover:bg-zinc-800 border border-purple-500/40 transition-all shadow-md shadow-purple-950/20"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                  Yönetim Paneli
                </div>
                <div className="text-[10px] text-zinc-400">
                  MP3, Görsel ve Modlar
                </div>
              </div>
            </div>
            <span className="text-[9px] bg-purple-600/30 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
              ADMIN
            </span>
          </button>
        </div>
      </div>

      {/* Bottom User / Quick Action Area */}
      <div className="p-4 bg-zinc-950/80 border-t border-zinc-900">
        <div 
          onClick={() => handleNav('venue-management')}
          className="p-3 rounded-2xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 hover:from-purple-950/30 hover:to-zinc-900 border border-zinc-800/80 hover:border-purple-500/40 flex items-center justify-between mb-3 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-purple-500/40 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                {user.companyName || user.name}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span>{user.subscription?.plan || 'Aktif Lisans'}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNav('venue-management');
            }}
            title="Mekan Yönetimi ve Şubeleri Aç"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-zinc-800 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Purple Gradient Action Button */}
        <button
          onClick={() => setIsNewPlaylistModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Playlist Oluştur</span>
        </button>
      </div>
    </aside>
  );
};
