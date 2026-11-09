import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Heart, 
  ListMusic, 
  ShieldCheck, 
  FileCheck,
  Maximize2,
  X
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const PersistentPlayer: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    isMuted, 
    isShuffle, 
    isRepeat, 
    queue,
    togglePlay, 
    seek, 
    nextTrack, 
    prevTrack, 
    setVolume, 
    toggleMute, 
    toggleShuffle, 
    toggleRepeat,
    isFavoriteTrack,
    toggleFavoriteTrack,
    setActiveCertificateToView,
    user
  } = useMusic();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const effectiveDuration = (duration > 0 && isFinite(duration)) 
    ? duration 
    : (currentTrack?.duration || 180);

  const calculatePos = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleSeekAtPosition = (clientX: number) => {
    const pos = calculatePos(clientX);
    const targetSeconds = pos * effectiveDuration;
    seek(targetSeconds);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const pos = calculatePos(e.clientX);
    setDragProgress(pos * 100);
    const targetSeconds = pos * effectiveDuration;
    seek(targetSeconds);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pos = calculatePos(e.clientX);
      setDragProgress(pos * 100);
      const targetSeconds = pos * effectiveDuration;
      seek(targetSeconds);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const pos = calculatePos(e.clientX);
      const targetSeconds = pos * effectiveDuration;
      seek(targetSeconds);
      setIsDragging(false);
      setDragProgress(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, effectiveDuration, seek]);

  const currentSecs = (isDragging && dragProgress !== null)
    ? (dragProgress / 100) * effectiveDuration
    : currentTime;

  const progressPercent = (isDragging && dragProgress !== null)
    ? dragProgress
    : effectiveDuration > 0
      ? Math.max(0, Math.min(100, (currentTime / effectiveDuration) * 100))
      : 0;
  const isFav = currentTrack ? isFavoriteTrack(currentTrack.id) : false;

  // Find if user has a certificate for this track
  const matchingLicense = user.licenses.find(l => l.trackId === currentTrack?.id);

  return (
    <div className="fixed bottom-3 left-4 right-4 z-40 select-none">
      {/* Queue Drawer Popover */}
      {isQueueOpen && (
        <div className="absolute bottom-24 right-6 w-80 max-h-96 bg-zinc-950/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl shadow-purple-950/40 flex flex-col z-50">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-white">Çalma Sırası</span>
              <span className="text-xs text-zinc-500">({queue.length})</span>
            </div>
            <button 
              onClick={() => setIsQueueOpen(false)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 custom-scrollbar pr-1">
            {queue.map((t, idx) => {
              const isCurrent = t.id === currentTrack?.id;
              return (
                <div 
                  key={`${t.id}-${idx}`}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                    isCurrent 
                      ? 'bg-purple-900/40 text-purple-300 font-bold border border-purple-500/30' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 text-zinc-500 font-mono text-[10px]">{idx + 1}</span>
                    <img src={t.coverUrl} alt={t.title} className="w-7 h-7 rounded object-cover flex-shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono ml-2">
                    {formatTime(t.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Persistent Rounded Audio Player Bar */}
      <div className="relative rounded-full bg-black/95 backdrop-blur-2xl border border-purple-600/40 shadow-2xl shadow-purple-950/50 px-5 py-3 flex items-center justify-between transition-all hover:border-purple-500/70">
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 via-pink-600/10 to-indigo-600/20 blur-md pointer-events-none -z-10" />

        {/* LEFT: Track Info */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
          {/* Cover Art / Disc */}
          <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-md shadow-purple-950/60">
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover rounded-full ${isPlaying ? 'animate-spin-slow' : ''}`}
                style={{ animationDuration: '14s' }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-purple-400">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            )}
            
            {isPlaying && (
              <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 border border-black shadow" />
              </div>
            )}
          </div>

          {/* Favorite heart */}
          {currentTrack && (
            <button
              onClick={() => toggleFavoriteTrack(currentTrack.id)}
              className={`p-1.5 rounded-full transition-colors ${
                isFav ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Title & Artist & License badge */}
          <div className="min-w-0 pr-2">
            <h4 className="text-xs md:text-sm font-bold text-white truncate hover:text-purple-300 transition-colors cursor-pointer">
              {currentTrack ? currentTrack.title : 'müzikbank Çalma Listesinden Bir Parça Seç'}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
              <span>{currentTrack ? currentTrack.artist : 'Telifsiz Müzik Platformu'}</span>
              {currentTrack && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[10px] text-purple-400 font-medium bg-purple-950/60 border border-purple-800/40 px-1 rounded">
                    {currentTrack.genre}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: Playback Controls & Scrubber */}
        <div className="flex-1 max-w-2xl px-4 flex flex-col items-center">
          {/* Buttons Row */}
          <div className="flex items-center gap-5 mb-1.5">
            <button
              onClick={prevTrack}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors active:scale-95"
              title="Önceki Parça"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Main Play/Pause Button with Purple Gradient */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-900/60 active:scale-95 transition-all"
              title={isPlaying ? 'Durdur' : 'Oynat'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors active:scale-95"
              title="Sonraki Parça"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Scrubber & Time */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] text-zinc-400 font-mono w-9 text-right">
              {formatTime(currentSecs)}
            </span>

            {/* Clickable & Draggable Seek Bar Container with generous hit-zone */}
            <div
              ref={progressBarRef}
              onClick={(e) => {
                e.stopPropagation();
                handleSeekAtPosition(e.clientX);
              }}
              onMouseDown={handleMouseDown}
              onMouseEnter={() => setIsHoveringSeek(true)}
              onMouseLeave={() => setIsHoveringSeek(false)}
              className="relative flex-1 py-3 -my-3 flex items-center cursor-pointer group"
            >
              {/* Background Track */}
              <div className="relative w-full h-1.5 group-hover:h-2 bg-zinc-800 rounded-full overflow-hidden transition-all">
                {/* Played fill with purple gradient */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-500 rounded-full transition-none"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Thumb glow */}
              {(isHoveringSeek || isDragging) && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border border-purple-400 pointer-events-none transition-none"
                  style={{ left: `calc(${progressPercent}% - 7px)` }}
                />
              )}
            </div>

            <span className="text-[11px] text-zinc-500 font-mono w-9">
              {formatTime(effectiveDuration)}
            </span>
          </div>
        </div>

        {/* RIGHT: Volume & Utilities */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
          {/* Volume */}
          <div className="flex items-center gap-2 group">
            <button
              onClick={toggleMute}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 md:w-20 h-1 bg-zinc-800 accent-purple-500 rounded-lg cursor-pointer"
            />
          </div>

          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-lg transition-colors ${
              isShuffle ? 'text-purple-400 bg-purple-950/40' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={isShuffle ? 'Karışık Çalma Açık' : 'Karışık Çalma Kapalı'}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-lg transition-colors ${
              isRepeat ? 'text-purple-400 bg-purple-950/40' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={isRepeat ? 'Tekrar Açık' : 'Tekrar Kapalı'}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          {/* Queue toggle */}
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-1.5 rounded-lg transition-colors ${
              isQueueOpen ? 'text-purple-300 bg-purple-950/60' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Çalma Sırası"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Certificate / License quick view */}
          {matchingLicense ? (
            <button
              onClick={() => setActiveCertificateToView(matchingLicense)}
              title="Bu parçanın Mekan Telif Muafiyet Belgesini Aç"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow shadow-purple-950 hover:brightness-110"
            >
              <FileCheck className="w-3 h-3" />
              <span>Sertifika</span>
            </button>
          ) : (
            <div 
              title="%100 Telifsiz Ticari Kullanım Lisansı Mevcuttur"
              className="hidden lg:flex items-center gap-1 text-[10px] text-zinc-500 border border-zinc-800 rounded-full px-2 py-0.5"
            >
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>Telifsiz</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
