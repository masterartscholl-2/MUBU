import React, { useState } from 'react';
import { 
  Filter, 
  RotateCcw, 
  Sliders, 
  ChevronDown, 
  Check, 
  Tag, 
  Sparkles, 
  Gauge, 
  Store
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const FilterBar: React.FC = () => {
  const {
    genres,
    sectors,
    moods,
    selectedGenreFilter,
    setSelectedGenreFilter,
    selectedMoodFilter,
    setSelectedMoodFilter,
    selectedSectorFilter,
    setSelectedSectorFilter,
    bpmRange,
    setBpmRange,
    resetFilters
  } = useMusic();

  const genreList = ['Tümü', ...genres.map(g => g.name)];
  const moodList = ['Tümü', ...moods];
  const sectorList = ['Tümü', ...sectors.map(s => s.name)];

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const hasActiveFilters = Boolean(
    selectedGenreFilter || 
    selectedMoodFilter || 
    selectedSectorFilter || 
    bpmRange[0] > 60 || 
    bpmRange[1] < 160
  );

  return (
    <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 mb-6 select-none">
      {/* Top Quick Filters: Genres Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
          <Filter className="w-4 h-4 text-purple-400" />
          <span>Filtrele:</span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Sıfırla</span>
            </button>
          )}

          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isAdvancedOpen
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Gelişmiş Filtreler</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Horizontal Genre Scroll Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {genreList.map((genre) => {
          const isSelected = genre === 'Tümü' 
            ? !selectedGenreFilter 
            : selectedGenreFilter === genre;

          return (
            <button
              key={genre}
              onClick={() => setSelectedGenreFilter(genre === 'Tümü' ? null : genre)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/40'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Collapsible Advanced Filters: Mood, Sector, BPM */}
      {isAdvancedOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fadeIn">
          {/* Mood / Mod Filter */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-zinc-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Mod / Atmosfer</span>
            </div>
            <select
              value={selectedMoodFilter || 'Tümü'}
              onChange={(e) => setSelectedMoodFilter(e.target.value === 'Tümü' ? null : e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-purple-500"
            >
              {moodList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Sector / Mekan Filter */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-zinc-400 mb-2">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mekan / Sektör Türü</span>
            </div>
            <select
              value={selectedSectorFilter || 'Tümü'}
              onChange={(e) => setSelectedSectorFilter(e.target.value === 'Tümü' ? null : e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-purple-500"
            >
              {sectorList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* BPM Slider */}
          <div>
            <div className="flex items-center justify-between font-bold text-zinc-400 mb-2">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-rose-400" />
                <span>Tempo / BPM Aralığı</span>
              </div>
              <span className="font-mono text-purple-300">
                {bpmRange[0]} - {bpmRange[1]} BPM
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="60"
                max="160"
                step="5"
                value={bpmRange[1]}
                onChange={(e) => setBpmRange([bpmRange[0], parseInt(e.target.value)])}
                className="w-full h-1.5 bg-zinc-800 accent-purple-500 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
