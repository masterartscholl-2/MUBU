import React from 'react';
import { MusicProvider } from './context/MusicContext';
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
