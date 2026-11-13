import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Pencil,
  X,
  Check
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { ScheduledPlaylist } from '../types';

const HOUR_HEIGHT = 64; // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const BLOCK_COLORS = [
  { name: 'Mor', hex: '#A571FF' },
  { name: 'Pembe', hex: '#FDA4B4' },
  { name: 'Sarı', hex: '#FBE08C' },
  { name: 'Yeşil', hex: '#9EE8AE' },
  { name: 'Mavi', hex: '#A3C4FF' },
  { name: 'Şeftali', hex: '#FDBA8C' },
];

const TURKISH_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const TURKISH_WEEKDAYS_MON_FIRST = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const TURKISH_MONTHS_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const TURKISH_MONTHS_FULL = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

type CalendarViewMode = 'day' | 'week' | 'month';

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMondayOfWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay(); // 0 = Sun, 1 = Mon...
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function formatTimeRange(startHour: number, startMinute: number, durationHours: number): string {
  const startTotal = startHour * 60 + startMinute;
  const endTotal = (startTotal + Math.round(durationHours * 60)) % (24 * 60);
  const sh = String(Math.floor(startTotal / 60)).padStart(2, '0');
  const sm = String(startTotal % 60).padStart(2, '0');
  const eh = String(Math.floor(endTotal / 60)).padStart(2, '0');
  const em = String(endTotal % 60).padStart(2, '0');
  return `${sh}:${sm} - ${eh}:${em}`;
}

function formatStartTime(startHour: number, startMinute: number): string {
  return `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
}

interface DragPayload {
  kind: 'new-playlist' | 'move-schedule';
  playlistId?: string;
  scheduleId?: string;
}

export const ScheduleSettings: React.FC = () => {
  const {
    playlists,
    user,
    scheduledPlaylists,
    addScheduledPlaylist,
    updateScheduledPlaylist,
    deleteScheduledPlaylist,
    playPlaylist,
    activeScheduleDrag,
    setActiveScheduleDrag,
    quickSchedulePlaylistId,
    setQuickSchedulePlaylistId
  } = useMusic();

  const [now, setNow] = useState<Date>(() => new Date());
  const [selectedAnchorDate, setSelectedAnchorDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');

  // Drag & drop hover state
  const [hoverSlot, setHoverSlot] = useState<{ date: string; hour: number; minute: number } | null>(null);
  const [hoverMonthDate, setHoverMonthDate] = useState<string | null>(null);

  const activeDragLabel = activeScheduleDrag?.label ?? null;

  // Modal state for manual creation or editing a scheduled block
  const [modalState, setModalState] = useState<{
    mode: 'create' | 'edit';
    scheduleId?: string;
    playlistId: string;
    date: string;
    timeStr: string;
    durationHours: number;
    color: string;
    repeatWeekly: boolean;
  } | null>(null);

  const gridScrollRef = useRef<HTMLDivElement>(null);

  // Update live clock every second for accurate red line & time display
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Scroll timeline cleanly to 08:00 when entering day/week view
  useEffect(() => {
    if ((viewMode === 'week' || viewMode === 'day') && gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 8 * HOUR_HEIGHT - 16;
    }
  }, [viewMode]);

  // Open modal when user clicks '+' on a playlist in the right sidebar
  useEffect(() => {
    if (!quickSchedulePlaylistId) return;
    const h = now.getHours();
    const m = Math.min(59, now.getMinutes() + 1);
    setModalState({
      mode: 'create',
      playlistId: quickSchedulePlaylistId,
      date: formatLocalDate(now),
      timeStr: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      durationHours: 2,
      color: BLOCK_COLORS[scheduledPlaylists.length % BLOCK_COLORS.length].hex,
      repeatWeekly: false
    });
    setQuickSchedulePlaylistId(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickSchedulePlaylistId]);

  const todayStr = formatLocalDate(now);

  // Compute days for Day / Week view
  const displayedColumns = useMemo(() => {
    if (viewMode === 'day') {
      const d = new Date(selectedAnchorDate);
      d.setHours(0, 0, 0, 0);
      return [{
        dateObj: d,
        dateStr: formatLocalDate(d),
        dayName: TURKISH_DAYS[d.getDay()],
        dayOfWeek: d.getDay(),
        shortLabel: `${d.getDate()} ${TURKISH_MONTHS_SHORT[d.getMonth()]}`
      }];
    }
    const monday = getMondayOfWeek(selectedAnchorDate);
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return {
        dateObj: d,
        dateStr: formatLocalDate(d),
        dayName: TURKISH_DAYS[d.getDay()],
        dayOfWeek: d.getDay(),
        shortLabel: `${d.getDate()} ${TURKISH_MONTHS_SHORT[d.getMonth()]}`
      };
    });
  }, [selectedAnchorDate, viewMode]);

  // Compute full month grid (Mon..Sun cells covering entire selected month)
  const monthGridDays = useMemo(() => {
    const year = selectedAnchorDate.getFullYear();
    const month = selectedAnchorDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const gridStart = getMondayOfWeek(firstOfMonth);
    const lastDayWeekday = lastOfMonth.getDay(); // 0=Sun..6=Sat
    const trailingDays = lastDayWeekday === 0 ? 0 : 7 - lastDayWeekday;
    const gridEnd = new Date(lastOfMonth);
    gridEnd.setDate(lastOfMonth.getDate() + trailingDays);

    const cells: {
      dateObj: Date;
      dateStr: string;
      dayNumber: number;
      dayOfWeek: number;
      isCurrentMonth: boolean;
    }[] = [];

    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
      cells.push({
        dateObj: new Date(cursor),
        dateStr: formatLocalDate(cursor),
        dayNumber: cursor.getDate(),
        dayOfWeek: cursor.getDay(),
        isCurrentMonth: cursor.getMonth() === month
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return cells;
  }, [selectedAnchorDate]);

  // Period title label based on viewMode
  const periodLabel = useMemo(() => {
    if (viewMode === 'month') {
      return `${TURKISH_MONTHS_FULL[selectedAnchorDate.getMonth()]} ${selectedAnchorDate.getFullYear()}`;
    }
    if (viewMode === 'day') {
      return `${selectedAnchorDate.getDate()} ${TURKISH_MONTHS_FULL[selectedAnchorDate.getMonth()]} ${selectedAnchorDate.getFullYear()} • ${TURKISH_DAYS[selectedAnchorDate.getDay()]}`;
    }
    const first = displayedColumns[0];
    const last = displayedColumns[displayedColumns.length - 1];
    if (!first || !last) return '';
    return `${first.shortLabel} - ${last.shortLabel} ${last.dateObj.getFullYear()}`;
  }, [viewMode, selectedAnchorDate, displayedColumns]);

  // Count how many scheduled entries fall inside the currently viewed month
  const currentMonthScheduleCount = useMemo(() => {
    const monthDaysInMonth = monthGridDays.filter(c => c.isCurrentMonth);
    let count = 0;
    monthDaysInMonth.forEach(cell => {
      scheduledPlaylists.forEach(item => {
        if (item.date === cell.dateStr || (item.repeatWeekly && item.dayOfWeek === cell.dayOfWeek)) {
          count += 1;
        }
      });
    });
    return count;
  }, [monthGridDays, scheduledPlaylists]);

  const isCurrentPeriodVisible = displayedColumns.some(d => d.dateStr === todayStr);

  const navigatePeriod = (direction: -1 | 1) => {
    setSelectedAnchorDate(prev => {
      const next = new Date(prev);
      if (viewMode === 'month') {
        next.setDate(1);
        next.setMonth(prev.getMonth() + direction);
      } else if (viewMode === 'day') {
        next.setDate(prev.getDate() + direction);
      } else {
        next.setDate(prev.getDate() + direction * 7);
      }
      return next;
    });
  };

  const handleDatePickerChange = (val: string) => {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    if (!y || !m || !d) return;
    setSelectedAnchorDate(new Date(y, m - 1, d));
  };

  // Drag handlers for moving existing scheduled blocks
  const handleScheduleDragStart = (e: React.DragEvent, item: ScheduledPlaylist, title: string) => {
    const payload: DragPayload = { kind: 'move-schedule', scheduleId: item.id };
    setActiveScheduleDrag({ ...payload, label: title });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', title);
  };

  const handleDragEnd = () => {
    setActiveScheduleDrag(null);
    setHoverSlot(null);
    setHoverMonthDate(null);
  };

  const handleSlotDragOver = (e: React.DragEvent, dateStr: string, hour: number, minute: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = activeScheduleDrag?.kind === 'move-schedule' ? 'move' : 'copy';
    if (
      !hoverSlot ||
      hoverSlot.date !== dateStr ||
      hoverSlot.hour !== hour ||
      hoverSlot.minute !== minute
    ) {
      setHoverSlot({ date: dateStr, hour, minute });
    }
  };

  const handleSlotDrop = (e: React.DragEvent, dateStr: string, dayOfWeek: number, hour: number, minute: number) => {
    e.preventDefault();
    let payload: DragPayload | null = activeScheduleDrag
      ? {
          kind: activeScheduleDrag.kind,
          playlistId: activeScheduleDrag.playlistId,
          scheduleId: activeScheduleDrag.scheduleId
        }
      : null;

    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    }

    setHoverSlot(null);
    setActiveScheduleDrag(null);

    if (!payload) return;

    if (payload.kind === 'new-playlist' && payload.playlistId) {
      const nextColor = BLOCK_COLORS[scheduledPlaylists.length % BLOCK_COLORS.length].hex;
      addScheduledPlaylist({
        playlistId: payload.playlistId,
        date: dateStr,
        startHour: hour,
        startMinute: minute,
        durationHours: 2,
        color: nextColor,
        repeatWeekly: false,
        dayOfWeek
      });
    } else if (payload.kind === 'move-schedule' && payload.scheduleId) {
      updateScheduledPlaylist(payload.scheduleId, {
        date: dateStr,
        dayOfWeek,
        startHour: hour,
        startMinute: minute
      });
    }
  };

  const handleMonthCellDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = activeScheduleDrag?.kind === 'move-schedule' ? 'move' : 'copy';
    if (hoverMonthDate !== dateStr) {
      setHoverMonthDate(dateStr);
    }
  };

  const handleMonthCellDrop = (e: React.DragEvent, dateStr: string, dayOfWeek: number) => {
    e.preventDefault();
    let payload: DragPayload | null = activeScheduleDrag
      ? {
          kind: activeScheduleDrag.kind,
          playlistId: activeScheduleDrag.playlistId,
          scheduleId: activeScheduleDrag.scheduleId
        }
      : null;

    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    }

    setHoverMonthDate(null);
    setActiveScheduleDrag(null);

    if (!payload) return;

    if (payload.kind === 'new-playlist' && payload.playlistId) {
      const nextColor = BLOCK_COLORS[scheduledPlaylists.length % BLOCK_COLORS.length].hex;
      addScheduledPlaylist({
        playlistId: payload.playlistId,
        date: dateStr,
        startHour: 9,
        startMinute: 0,
        durationHours: 2,
        color: nextColor,
        repeatWeekly: false,
        dayOfWeek
      });
    } else if (payload.kind === 'move-schedule' && payload.scheduleId) {
      updateScheduledPlaylist(payload.scheduleId, {
        date: dateStr,
        dayOfWeek
      });
    }
  };

  const openCreateModal = (dateStr?: string, hour?: number, minute?: number, defaultPlaylistId?: string) => {
    const fallbackPlId = defaultPlaylistId || playlists[0]?.id || '';
    const targetDate = dateStr || todayStr;
    const h = hour !== undefined ? hour : now.getHours();
    const m = minute !== undefined ? minute : Math.min(59, now.getMinutes() + 1);
    setModalState({
      mode: 'create',
      playlistId: fallbackPlId,
      date: targetDate,
      timeStr: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      durationHours: 2,
      color: BLOCK_COLORS[scheduledPlaylists.length % BLOCK_COLORS.length].hex,
      repeatWeekly: false
    });
  };

  const openEditModal = (item: ScheduledPlaylist) => {
    setModalState({
      mode: 'edit',
      scheduleId: item.id,
      playlistId: item.playlistId,
      date: item.date,
      timeStr: `${String(item.startHour).padStart(2, '0')}:${String(item.startMinute).padStart(2, '0')}`,
      durationHours: item.durationHours,
      color: item.color,
      repeatWeekly: Boolean(item.repeatWeekly)
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalState || !modalState.playlistId) return;

    const [hStr, mStr] = modalState.timeStr.split(':');
    const startHour = Math.max(0, Math.min(23, Number(hStr) || 0));
    const startMinute = Math.max(0, Math.min(59, Number(mStr) || 0));

    const [y, m, d] = modalState.date.split('-').map(Number);
    const parsedDate = new Date(y, (m || 1) - 1, d || 1);
    const dayOfWeek = parsedDate.getDay();

    if (modalState.mode === 'create') {
      addScheduledPlaylist({
        playlistId: modalState.playlistId,
        date: modalState.date,
        startHour,
        startMinute,
        durationHours: modalState.durationHours,
        color: modalState.color,
        repeatWeekly: modalState.repeatWeekly,
        dayOfWeek
      });
    } else if (modalState.mode === 'edit' && modalState.scheduleId) {
      updateScheduledPlaylist(modalState.scheduleId, {
        playlistId: modalState.playlistId,
        date: modalState.date,
        startHour,
        startMinute,
        durationHours: modalState.durationHours,
        color: modalState.color,
        repeatWeekly: modalState.repeatWeekly,
        dayOfWeek
      });
    }

    setModalState(null);
  };

  // Current time vertical position in pixels
  const currentTimeTopPx = (now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600) * HOUR_HEIGHT;
  const currentTimeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentClockWithSeconds = `${currentTimeFormatted}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (
    <div className="p-6 md:p-8 space-y-6 select-none">
      {/* Header matching Image 2 style ("SCHEDULE / Diner Restaurant") */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-2">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1 flex flex-wrap items-center gap-2">
            <span>OTOMATİK YAYIN PROGRAMI</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-700/40 tracking-normal normal-case font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Canlı Saat: {currentClockWithSeconds}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {user.companyName || 'Mekan Yayın Programı'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Playlistleri sürükleyip istediğiniz tarih ve saat dilimine bırakın — eklenen saatte otomatik çalmaya başlar.
          </p>
        </div>

        {/* View Mode Switcher + Period Navigation + Manual Add */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Selector (Günlük / Haftalık / Aylık) */}
          <div className="flex items-center bg-[#111115] border border-zinc-800/90 rounded-xl p-1">
            {(
              [
                { id: 'day', label: 'Günlük' },
                { id: 'week', label: 'Haftalık' },
                { id: 'month', label: 'Aylık' }
              ] as const
            ).map(mode => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === mode.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#111115] border border-zinc-800/90 rounded-xl p-1">
            <button
              type="button"
              onClick={() => navigatePeriod(-1)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title={viewMode === 'month' ? 'Önceki Ay' : viewMode === 'day' ? 'Önceki Gün' : 'Önceki Hafta'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedAnchorDate(new Date())}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {viewMode === 'month' ? 'Bu Ay' : 'Bugün'}
            </button>
            <button
              type="button"
              onClick={() => navigatePeriod(1)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title={viewMode === 'month' ? 'Sonraki Ay' : viewMode === 'day' ? 'Sonraki Gün' : 'Sonraki Hafta'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex items-center bg-[#111115] border border-zinc-800/90 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400 mr-2 flex-shrink-0" />
            <input
              type="date"
              value={formatLocalDate(selectedAnchorDate)}
              onChange={(e) => handleDatePickerChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-zinc-200 outline-none cursor-pointer [color-scheme:dark]"
              title="Tarihe Git"
            />
          </div>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tarih & Saat Ekle</span>
          </button>
        </div>
      </div>

      {/* MONTH VIEW (1 AY GÖRÜNÜMÜ) */}
      {viewMode === 'month' ? (
        <div className="rounded-3xl bg-[#060608] border border-zinc-900 overflow-hidden shadow-2xl">
          {/* Month Banner Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-zinc-900 bg-[#08080b]">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                {periodLabel}
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-700/40">
                Bu ayda {currentMonthScheduleCount} planlı yayın
              </span>
            </div>
            <span className="text-[11px] text-zinc-500">
              Playlisti doğrudan istediğiniz güne sürükleyip bırakabilirsiniz • Saat detayı için güne tıklayın
            </span>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-px bg-zinc-900/70 border-b border-zinc-900">
            {TURKISH_WEEKDAYS_MON_FIRST.map(dayTitle => (
              <div
                key={dayTitle}
                className="bg-[#09090d] py-2.5 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider"
              >
                {dayTitle}
              </div>
            ))}
          </div>

          {/* 35/42 Day Cells */}
          <div className="grid grid-cols-7 gap-px bg-zinc-900/60">
            {monthGridDays.map((cell) => {
              const isToday = cell.dateStr === todayStr;
              const isDragTarget = hoverMonthDate === cell.dateStr;

              const cellSchedules = scheduledPlaylists
                .filter(item => item.date === cell.dateStr || (Boolean(item.repeatWeekly) && item.dayOfWeek === cell.dayOfWeek))
                .slice()
                .sort((a, b) => (a.startHour * 60 + a.startMinute) - (b.startHour * 60 + b.startMinute));

              return (
                <div
                  key={cell.dateStr}
                  onDragOver={(e) => handleMonthCellDragOver(e, cell.dateStr)}
                  onDragLeave={() => {
                    if (hoverMonthDate === cell.dateStr) {
                      setHoverMonthDate(null);
                    }
                  }}
                  onDrop={(e) => handleMonthCellDrop(e, cell.dateStr, cell.dayOfWeek)}
                  onDoubleClick={() => openCreateModal(cell.dateStr, 9, 0)}
                  className={`group/cell min-h-[128px] p-2 flex flex-col gap-1.5 transition-all relative ${
                    isDragTarget
                      ? 'bg-purple-950/50 ring-2 ring-inset ring-purple-400 z-10'
                      : isToday
                        ? 'bg-[#13121c]'
                        : cell.isCurrentMonth
                          ? 'bg-[#0a0a0e] hover:bg-[#0f0f15]'
                          : 'bg-[#060608] opacity-55 hover:opacity-85'
                  }`}
                >
                  {/* Top row: Day number + Quick Add & Day View */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAnchorDate(cell.dateObj);
                        setViewMode('day');
                      }}
                      title={`${cell.dayNumber} ${TURKISH_MONTHS_SHORT[cell.dateObj.getMonth()]} gününün saatlik görünümünü aç`}
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                        isToday
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950'
                          : cell.isCurrentMonth
                            ? 'text-zinc-200 hover:bg-zinc-800'
                            : 'text-zinc-500 hover:bg-zinc-800'
                      }`}
                    >
                      {cell.dayNumber}
                    </button>

                    <button
                      type="button"
                      onClick={() => openCreateModal(cell.dateStr, 9, 0)}
                      title="Bu Güne Yayın Ekle"
                      className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Drop Hint Overlay */}
                  {isDragTarget && (
                    <div className="px-2 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-bold shadow truncate">
                      {activeDragLabel || 'Buraya Bırak'} (09:00)
                    </div>
                  )}

                  {/* Scheduled Playlist Chips inside Month Cell */}
                  <div className="space-y-1 overflow-y-auto max-h-[112px] custom-scrollbar pr-0.5">
                    {cellSchedules.map((item) => {
                      const pl = playlists.find(p => p.id === item.playlistId);
                      if (!pl) return null;

                      return (
                        <div
                          key={`${item.id}-${cell.dateStr}`}
                          draggable
                          onDragStart={(e) => handleScheduleDragStart(e, item, pl.title)}
                          onDragEnd={handleDragEnd}
                          onClick={() => openEditModal(item)}
                          style={{ backgroundColor: item.color }}
                          className="group/chip flex items-center justify-between gap-1 px-1.5 py-1 rounded-lg text-zinc-950 cursor-grab active:cursor-grabbing shadow-sm hover:brightness-95 transition-all"
                          title={`${pl.title} • ${formatTimeRange(item.startHour, item.startMinute, item.durationHours)}`}
                        >
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <img
                              src={pl.coverUrl}
                              alt={pl.title}
                              draggable={false}
                              className="w-4 h-4 rounded object-cover flex-shrink-0 border border-black/15"
                            />
                            <span className="text-[10px] font-extrabold font-mono flex-shrink-0">
                              {formatStartTime(item.startHour, item.startMinute)}
                            </span>
                            <span className="text-[10px] font-bold truncate">
                              {pl.title}
                            </span>
                            {item.repeatWeekly && (
                              <Repeat className="w-2.5 h-2.5 flex-shrink-0 opacity-75" />
                            )}
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover/chip:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playPlaylist(pl);
                              }}
                              className="p-0.5 rounded bg-black/15 hover:bg-zinc-950 text-zinc-950 hover:text-white transition-colors"
                              title="Şimdi Çal"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteScheduledPlaylist(item.id);
                              }}
                              className="p-0.5 rounded bg-black/15 hover:bg-rose-600 text-zinc-950 hover:text-white transition-colors"
                              title="Programdan Sil"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DAY OR WEEK TIMELINE VIEW (Image 2 Style) */
        <div className="rounded-3xl bg-[#060608] border border-zinc-900 overflow-hidden shadow-2xl">
          {/* Active Period Banner */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-900/90 bg-[#08080b]">
            <span className="text-xs font-bold text-zinc-200">{periodLabel}</span>
            <span className="text-[11px] text-zinc-500">
              {viewMode === 'day' ? 'Günlük 24 Saat Detaylı Görünüm' : 'Haftalık Yayın Çizelgesi'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className={viewMode === 'day' ? 'min-w-[420px]' : 'min-w-[800px]'}>
              {/* Day Column Headers */}
              <div
                className={`grid gap-2 px-4 pt-3 pb-3 border-b border-zinc-900/90 bg-[#08080b] ${
                  viewMode === 'day'
                    ? 'grid-cols-[64px_minmax(0,1fr)]'
                    : 'grid-cols-[64px_repeat(7,minmax(0,1fr))]'
                }`}
              >
                <div className="flex items-end justify-center pb-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Saat</span>
                </div>

                {displayedColumns.map((day) => {
                  const isToday = day.dateStr === todayStr;
                  return (
                    <div
                      key={day.dateStr}
                      className={`text-center py-2 px-2 rounded-xl transition-colors ${
                        isToday
                          ? 'bg-purple-950/40 border border-purple-500/40'
                          : 'bg-transparent'
                      }`}
                    >
                      <div className={`text-xs font-bold ${isToday ? 'text-white' : 'text-zinc-200'}`}>
                        {day.dayName}
                      </div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isToday ? 'text-purple-300' : 'text-zinc-500'}`}>
                        {day.shortLabel}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vertical Scrollable 24-Hour Grid */}
              <div
                ref={gridScrollRef}
                className="relative max-h-[640px] overflow-y-auto custom-scrollbar px-4 py-3"
              >
                <div
                  className={`relative grid gap-2 ${
                    viewMode === 'day'
                      ? 'grid-cols-[64px_minmax(0,1fr)]'
                      : 'grid-cols-[64px_repeat(7,minmax(0,1fr))]'
                  }`}
                  style={{ height: `${24 * HOUR_HEIGHT}px` }}
                >
                  {/* Live Red Horizontal Time Line across columns (Image 2 signature element) */}
                  <div
                    className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                    style={{ top: `${currentTimeTopPx}px`, transform: 'translateY(-50%)' }}
                  >
                    <div className="w-[64px] pr-2 text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-[#ff3b30]/15 text-[#ff3b30] text-[10px] font-extrabold font-mono">
                        {currentTimeFormatted}
                      </span>
                    </div>
                    <div className="flex-1 h-[2px] bg-[#ff3b30] shadow-[0_0_8px_rgba(255,59,48,0.85)] relative">
                      {isCurrentPeriodVisible && (
                        <span className="absolute -left-1 -top-[4px] w-2.5 h-2.5 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30]" />
                      )}
                    </div>
                  </div>

                  {/* Left Time Axis Gutter */}
                  <div className="relative select-none">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="text-right pr-3 text-[11px] font-medium text-zinc-500 font-mono"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                      >
                        <span className="-mt-2 inline-block">
                          {String(hour).padStart(2, '0')}:00
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  {displayedColumns.map((day) => {
                    const isToday = day.dateStr === todayStr;

                    const daySchedules = scheduledPlaylists.filter(item => {
                      if (item.date === day.dateStr) return true;
                      if (item.repeatWeekly && item.dayOfWeek === day.dayOfWeek) return true;
                      return false;
                    });

                    return (
                      <div
                        key={day.dateStr}
                        className={`relative rounded-2xl overflow-hidden border transition-colors ${
                          isToday
                            ? 'bg-[#121218] border-purple-500/25'
                            : 'bg-[#0e0e12] border-zinc-900/90'
                        }`}
                        style={{ height: `${24 * HOUR_HEIGHT}px` }}
                      >
                        {/* 24 Hour Slots, each split into two 30-min drop targets */}
                        {HOURS.map((hour) => (
                          <div
                            key={hour}
                            className="border-b border-zinc-800/40 flex flex-col"
                            style={{ height: `${HOUR_HEIGHT}px` }}
                          >
                            {[0, 30].map((minute) => {
                              const isHovered =
                                hoverSlot?.date === day.dateStr &&
                                hoverSlot?.hour === hour &&
                                hoverSlot?.minute === minute;

                              return (
                                <div
                                  key={minute}
                                  onDragOver={(e) => handleSlotDragOver(e, day.dateStr, hour, minute)}
                                  onDragLeave={() => {
                                    if (
                                      hoverSlot?.date === day.dateStr &&
                                      hoverSlot?.hour === hour &&
                                      hoverSlot?.minute === minute
                                    ) {
                                      setHoverSlot(null);
                                    }
                                  }}
                                  onDrop={(e) => handleSlotDrop(e, day.dateStr, day.dayOfWeek, hour, minute)}
                                  onDoubleClick={() => openCreateModal(day.dateStr, hour, minute)}
                                  title={`Çift tıkla veya sürükleyip bırak (${day.dayName} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')})`}
                                  className={`flex-1 relative transition-all ${
                                    minute === 0 ? 'border-b border-zinc-800/20 border-dashed' : ''
                                  } ${
                                    isHovered
                                      ? 'bg-purple-500/25 ring-2 ring-inset ring-purple-400 z-20'
                                      : 'hover:bg-white/[0.02]'
                                  }`}
                                >
                                  {isHovered && (
                                    <div className="absolute inset-x-1 top-0.5 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold shadow-lg truncate pointer-events-none z-30">
                                      {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')} • {activeDragLabel || 'Bırak'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}

                        {/* Rendered Scheduled Playlist Cards (Image 2 vibrant rounded cards) */}
                        {daySchedules.map((item) => {
                          const pl = playlists.find(p => p.id === item.playlistId);
                          if (!pl) return null;

                          const topPx = (item.startHour + item.startMinute / 60) * HOUR_HEIGHT + 3;
                          const maxDurationToEndOfDay = Math.max(0.5, 24 - (item.startHour + item.startMinute / 60));
                          const clampedDuration = Math.min(item.durationHours, maxDurationToEndOfDay);
                          const heightPx = Math.max(54, clampedDuration * HOUR_HEIGHT - 6);
                          const isCompact = heightPx < 86;
                          const hasTriggeredToday = item.lastTriggeredDate === todayStr && isToday;

                          return (
                            <div
                              key={`${item.id}-${day.dateStr}`}
                              draggable
                              onDragStart={(e) => handleScheduleDragStart(e, item, pl.title)}
                              onDragEnd={handleDragEnd}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                backgroundColor: item.color
                              }}
                              className="group absolute left-1 right-1 z-20 rounded-2xl p-2 shadow-lg shadow-black/50 border border-black/10 cursor-grab active:cursor-grabbing flex flex-col justify-between overflow-hidden transition-transform hover:scale-[1.01] hover:z-30"
                            >
                              {/* Top Row: Title & Time on Left, Cover Image on Right */}
                              <div className="flex items-start justify-between gap-1.5 min-w-0">
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-extrabold text-zinc-950 leading-tight line-clamp-2">
                                    {pl.title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                    <span className="text-[10px] font-bold text-zinc-900/85 font-mono whitespace-nowrap">
                                      {formatTimeRange(item.startHour, item.startMinute, item.durationHours)}
                                    </span>
                                    {item.repeatWeekly && (
                                      <span
                                        className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/15 text-zinc-950"
                                        title="Her hafta bu gün ve saatte tekrarlanır"
                                      >
                                        <Repeat className="w-2.5 h-2.5" />
                                        Haftalık
                                      </span>
                                    )}
                                    {hasTriggeredToday && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-950/85 text-emerald-300">
                                        <Check className="w-2.5 h-2.5" />
                                        Çalındı
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <img
                                  src={pl.coverUrl}
                                  alt={pl.title}
                                  draggable={false}
                                  className={`${
                                    isCompact || viewMode === 'week' ? 'w-8 h-8' : 'w-11 h-11'
                                  } rounded-xl object-cover flex-shrink-0 shadow-sm border border-black/15`}
                                />
                              </div>

                              {/* Bottom Row: Play, Edit, Delete Actions */}
                              <div className="flex items-center justify-between gap-1 pt-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playPlaylist(pl);
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg bg-black/15 hover:bg-zinc-950 text-zinc-950 hover:text-white text-[10px] font-bold transition-colors opacity-90 group-hover:opacity-100"
                                  title="Şimdi Çal"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  {!isCompact && viewMode === 'day' && <span>Çal</span>}
                                </button>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(item);
                                    }}
                                    className="p-1 rounded-lg bg-black/15 hover:bg-zinc-950 text-zinc-950 hover:text-white transition-colors"
                                    title="Tarih, Saat ve Süreyi Düzenle"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteScheduledPlaylist(item.id);
                                    }}
                                    className="p-1 rounded-lg bg-black/15 hover:bg-rose-600 text-zinc-950 hover:text-white transition-colors"
                                    title="Programdan Sil"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled List Summary Footer (Easy overview & delete even across different dates) */}
      <div className="rounded-2xl bg-[#0b0b0f] border border-zinc-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Planlanmış Tüm Yayınlar ({scheduledPlaylists.length})
            </h3>
          </div>
          {scheduledPlaylists.length > 0 && (
            <span className="text-[11px] text-zinc-500">
              Tarih ve saati geldiğinde çalma listesi otomatik başlatılır.
            </span>
          )}
        </div>

        {scheduledPlaylists.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            Henüz takvime eklenmiş bir playlist yok. Yukarıdaki playlist havuzundan bir listeyi sürükleyip takvimdeki tarih ve saate bırakabilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {scheduledPlaylists
              .slice()
              .sort((a, b) => `${a.date}-${String(a.startHour).padStart(2, '0')}:${String(a.startMinute).padStart(2, '0')}`.localeCompare(`${b.date}-${String(b.startHour).padStart(2, '0')}:${String(b.startMinute).padStart(2, '0')}`))
              .map(item => {
                const pl = playlists.find(p => p.id === item.playlistId);
                if (!pl) return null;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <img
                        src={pl.coverUrl}
                        alt={pl.title}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{pl.title}</div>
                        <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{formatTimeRange(item.startHour, item.startMinute, item.durationHours)}</span>
                          {item.repeatWeekly && (
                            <span className="text-purple-400 font-sans font-semibold">• Haftalık</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Düzenle"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteScheduledPlaylist(item.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Create / Edit Schedule Modal */}
      {modalState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setModalState(null)}
        >
          <form
            onSubmit={handleSaveModal}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0f0f14] border border-purple-500/40 rounded-3xl p-6 shadow-2xl shadow-purple-950/70 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalState.mode === 'create' ? 'Yayın Zamanla' : 'Yayın Programını Düzenle'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Belirtilen tarih ve saatte playlist otomatik çalar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Playlist Select */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Playlist
                </label>
                <select
                  value={modalState.playlistId}
                  onChange={(e) => setModalState({ ...modalState, playlistId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-white outline-none focus:border-purple-500"
                >
                  {playlists.map(pl => (
                    <option key={pl.id} value={pl.id}>
                      {pl.title} ({pl.trackIds.length} parça)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Exact Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    required
                    value={modalState.date}
                    onChange={(e) => setModalState({ ...modalState, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-white outline-none focus:border-purple-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Başlangıç Saati
                  </label>
                  <input
                    type="time"
                    required
                    value={modalState.timeStr}
                    onChange={(e) => setModalState({ ...modalState, timeStr: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-white outline-none focus:border-purple-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Yayın Süresi
                </label>
                <select
                  value={modalState.durationHours}
                  onChange={(e) => setModalState({ ...modalState, durationHours: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-white outline-none focus:border-purple-500"
                >
                  {![0.5, 1, 1.5, 2, 3, 4, 6, 8].includes(modalState.durationHours) && (
                    <option value={modalState.durationHours}>
                      {Math.round(modalState.durationHours * 60)} Dakika (Otomatik Ayarlandı)
                    </option>
                  )}
                  <option value={0.5}>30 Dakika</option>
                  <option value={1}>1 Saat</option>
                  <option value={1.5}>1.5 Saat</option>
                  <option value={2}>2 Saat</option>
                  <option value={3}>3 Saat</option>
                  <option value={4}>4 Saat</option>
                  <option value={6}>6 Saat</option>
                  <option value={8}>8 Saat</option>
                </select>
              </div>

              {/* Color Swatches */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Blok Rengi
                </label>
                <div className="flex items-center gap-2">
                  {BLOCK_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setModalState({ ...modalState, color: c.hex })}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        modalState.color === c.hex
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f14] scale-110'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Weekly Repeat Toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modalState.repeatWeekly}
                  onChange={(e) => setModalState({ ...modalState, repeatWeekly: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <span className="text-xs font-medium text-zinc-200">
                  Her hafta aynı gün ve saatte tekrarla
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              {modalState.mode === 'edit' && modalState.scheduleId ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteScheduledPlaylist(modalState.scheduleId!);
                    setModalState(null);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sil</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalState(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-purple-950/50"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="h-20" />
    </div>
  );
};
