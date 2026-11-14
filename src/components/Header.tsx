import React from 'react';
import { 
  SlidersHorizontal, 
  User, 
  LogIn,
  Sun,
  Moon
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const Header: React.FC = () => {
  const { 
    setIsAdminOpen, 
    setIsPricingModalOpen,
    setIsCorporateModalOpen,
    setActiveTab,
    setSelectedPlaylistId,
    setSelectedSectorName,
    theme,
    toggleTheme
  } = useMusic();

  const handleLogoClick = () => {
    setSelectedPlaylistId(null);
    setSelectedSectorName(null);
    setActiveTab('home');
  };

  return (
    <header className="h-16 px-6 bg-black/95 border-b border-zinc-900/90 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Top-Left Platform Subtitle */}
      <span
        onClick={handleLogoClick}
        className="hidden sm:inline-block cursor-pointer font-sans text-[11px] leading-none tracking-tight text-white font-medium hover:opacity-85 transition-opacity"
        title="Staff Ana Sayfa"
      >
        Telifsiz Müzik Platformu
      </span>

      {/* Brand Logo - Positioned at top-center as requested */}
      <div
        onClick={handleLogoClick}
        className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 cursor-pointer group flex items-center justify-center select-none"
        title="Staff Ana Sayfa"
      >
        <img
          src="/assets/aistudio/image_879df5e1.png"
          alt="Staff"
          className={`h-12 w-auto object-contain transition-opacity group-hover:opacity-85 ${
            theme === 'dark'
              ? 'invert hue-rotate-180 mix-blend-screen'
              : 'mix-blend-multiply'
          }`}
        />
      </div>

      {/* Right Header Navigation & Actions */}
      <div className="flex items-center gap-3">
        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
          aria-label={theme === 'dark' ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/50 transition-all"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Aydınlık</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden md:inline">Karanlık</span>
            </>
          )}
        </button>

        {/* Admin Paneli Quick Button */}
        <button
          onClick={() => setIsAdminOpen(true)}
          title="Admin Paneli - Şarkı, Görsel, Mod ve Mekan Yönetimi"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-purple-500/50 hover:border-purple-400 shadow-sm shadow-purple-950 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Admin</span>
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
