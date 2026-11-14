import React from 'react';
import { Calendar, X, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { PersistentPlayer } from './components/PersistentPlayer';
import { AdminModal } from './components/AdminModal';
import { CheckoutModal } from './components/CheckoutModal';
import { LicenseCertificateModal } from './components/LicenseCertificateModal';
import { NewPlaylistModal } from './components/NewPlaylistModal';
import { PricingModal } from './components/PricingModal';
import { CorporateModal } from './components/CorporateModal';

function AutoPlayToast() {
  const { activeAutoPlayNotice, dismissAutoPlayNotice } = useMusic();
  if (!activeAutoPlayNotice) return null;

  const isEnded = activeAutoPlayNotice.status === 'ended';

  return (
    <div
      className={`fixed top-20 right-6 z-50 max-w-sm bg-zinc-950/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-fadeIn border ${
        isEnded
          ? 'border-emerald-500/50 shadow-emerald-950/50'
          : 'border-purple-500/50 shadow-purple-950/60'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl text-white flex items-center justify-center flex-shrink-0 ${
          isEnded
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600'
        }`}
      >
        <Calendar className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={`text-[11px] font-bold uppercase tracking-wider ${
            isEnded ? 'text-emerald-300' : 'text-purple-300'
          }`}
        >
          {isEnded
            ? `Otomatik Yayın Tamamlandı • ${activeAutoPlayNotice.timeLabel}`
            : `Otomatik Yayın Başladı • ${activeAutoPlayNotice.timeLabel}`}
        </div>
        <div className="text-xs font-bold text-white truncate">
          {activeAutoPlayNotice.playlistTitle}
        </div>
      </div>
      <button
        onClick={dismissAutoPlayNotice}
        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Kapat"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ScheduleConflictModal() {
  const { scheduleConflictNotice, dismissScheduleConflictNotice } = useMusic();
  if (!scheduleConflictNotice) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={dismissScheduleConflictNotice}
    >
      <div
        className="relative w-full max-w-md bg-[#0f0f14] border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-purple-950/70 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                {scheduleConflictNotice.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Saat çakışmasını önlemek için otomatik düzenleme yapıldı.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissScheduleConflictNotice}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-200 leading-relaxed bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3.5">
          {scheduleConflictNotice.message}
        </p>

        <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {scheduleConflictNotice.adjustments.map((adj, idx) => (
            <div
              key={`${adj.playlistTitle}-${idx}`}
              className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/90 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {adj.playlistTitle}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mt-1">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span className="line-through text-zinc-500">{adj.oldRange}</span>
                  <ArrowRight className="w-3 h-3 text-purple-400" />
                  <span className="text-emerald-400 font-bold">{adj.newRange}</span>
                </div>
              </div>

              <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {adj.action === 'shifted'
                  ? 'Kaydırıldı'
                  : `${adj.minutesDelta} dk kısaltıldı`}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={dismissScheduleConflictNotice}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-purple-950/60 transition-all active:scale-95"
          >
            Tamam, Anladım
          </button>
        </div>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Header */}
      <Header />

      {/* Main Container: Left Sidebar + Center Scrollable Content + Right Popular Playlist Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Center Main View */}
        <main className="flex-1 overflow-y-auto custom-scrollbar h-[calc(100vh-4rem)] pb-24">
          <MainContent />
        </main>

        {/* Right Popular Playlist Sidebar matching screenshot */}
        <RightSidebar />
      </div>

      {/* Auto-Play Schedule Toast */}
      <AutoPlayToast />

      {/* Schedule Conflict Pop-up */}
      <ScheduleConflictModal />

      {/* Persistent Bottom Audio Player with Purple Neon Glow */}
      <PersistentPlayer />

      {/* Modals & Dialogs */}
      <AdminModal />
      <CheckoutModal />
      <LicenseCertificateModal />
      <NewPlaylistModal />
      <PricingModal />
      <CorporateModal />
    </div>
  );
}

export default function App() {
  return (
    <MusicProvider>
      <AppLayout />
    </MusicProvider>
  );
}
