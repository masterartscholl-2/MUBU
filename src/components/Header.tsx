import React from 'react';
import { 
  SlidersHorizontal, 
  User, 
  LogIn, 
  Building2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const Header: React.FC = () => {
  const { 
    setIsAdminOpen, 
    setIsPricingModalOpen,
    setIsCorporateModalOpen,
    activeTab,
    setActiveTab,
    setSelectedPlaylistId,
    setSelectedSectorName
  } = useMusic();

  const handleLogoClick = () => {
    setSelectedPlaylistId(null);
    setSelectedSectorName(null);
    setActiveTab('home');
  };

  return (
    <header className="h-16 px-6 bg-black/95 border-b border-zinc-900/90 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand Logo - Positioned at top-left as requested */}
      <div 
        onClick={handleLogoClick} 
        className="cursor-pointer group flex items-center gap-2 select-none"
        title="müzikbank Ana Sayfa"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-purple-400 transition-colors font-sans lowercase">
              müzikbank
            </span>
            <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-wider text-zinc-400 uppercase font-medium">
            Telifsiz Müzik Platformu
          </span>
        </div>
      </div>

      {/* Right Header Navigation & Actions */}
      <div className="flex items-center gap-3">

        {/* Admin Paneli Quick Button */}
        <button
          onClick={() => setIsAdminOpen(true)}
          title="Admin Paneli - Şarkı, Görsel, Mod ve Fiyat Yönetimi"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-purple-500/50 hover:border-purple-400 shadow-sm shadow-purple-950 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Admin</span>
        </button>

        {/* Mekan Yönetimi Button */}
        <button
          onClick={() => setActiveTab('venue-management')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
            activeTab === 'venue-management'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-950/40'
              : 'text-purple-300 bg-purple-950/40 hover:bg-purple-950/80 border border-purple-800/50 hover:border-purple-600'
          }`}
          title="Mekan Yönetimi, Şubeler ve Abonelik Durumu"
        >
          <Building2 className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Mekan Yönetimi</span>
        </button>

        {/* Action Buttons with Purple Gradient (as requested: "buttonlar mor gradient renkte") */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCorporateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/50 transition-all"
          >
            <LogIn className="w-3.5 h-3.5 text-purple-400" />
            <span>Giriş Yap</span>
          </button>

          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-950/40 transition-all active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>Üye Ol</span>
          </button>
        </div>
      </div>
    </header>
  );
};
