import { Playlist, ScheduledPlaylist } from '../types';

export interface ScheduleAdjustmentDetail {
  playlistTitle: string;
  oldRange: string;
  newRange: string;
  action: 'shortened' | 'shifted' | 'trimmed_start';
  minutesDelta: number;
}

export interface ScheduleConflictNotice {
  title: string;
  message: string;
  adjustments: ScheduleAdjustmentDetail[];
}

function formatRange(startMins: number, endMins: number): string {
  const s = Math.max(0, Math.min(24 * 60, startMins));
  const e = Math.max(0, Math.min(24 * 60, endMins));
  const sh = String(Math.floor(s / 60) % 24).padStart(2, '0');
  const sm = String(s % 60).padStart(2, '0');
  const eh = e === 24 * 60 ? '24' : String(Math.floor(e / 60) % 24).padStart(2, '0');
  const em = e === 24 * 60 ? '00' : String(e % 60).padStart(2, '0');
  return `${sh}:${sm} - ${eh}:${em}`;
}

function sameScheduleDay(a: ScheduledPlaylist, b: ScheduledPlaylist): boolean {
  if (a.date === b.date) return true;
  if (a.repeatWeekly && b.dayOfWeek !== undefined && a.dayOfWeek === b.dayOfWeek) return true;
  if (b.repeatWeekly && a.dayOfWeek !== undefined && b.dayOfWeek === a.dayOfWeek) return true;
  return false;
}

export function resolveScheduleConflicts(
  existingList: ScheduledPlaylist[],
  target: ScheduledPlaylist,
  playlists: Playlist[]
): { nextSchedules: ScheduledPlaylist[]; notice: ScheduleConflictNotice | null } {
  const getTitle = (playlistId: string) =>
    playlists.find(p => p.id === playlistId)?.title || 'Playlist';

  const others = existingList
    .filter(item => item.id !== target.id)
    .map(item => ({ ...item }));

  const candidate: ScheduledPlaylist = { ...target };
  let cStart = candidate.startHour * 60 + candidate.startMinute;
  const origCStart = cStart;
  let cDurMins = Math.max(5, Math.round(candidate.durationHours * 60));
  let cEnd = Math.min(24 * 60, cStart + cDurMins);
  const origCEnd = cEnd;

  const adjustments: ScheduleAdjustmentDetail[] = [];
  let candidateWasShortened = false;
  let candidateWasShifted = false;

  // Sort others chronologically by start time so resolution is deterministic
  const sameDayIndices = others
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => sameScheduleDay(item, candidate))
    .sort((a, b) => (a.item.startHour * 60 + a.item.startMinute) - (b.item.startHour * 60 + b.item.startMinute));

  for (const { idx } of sameDayIndices) {
    const other = others[idx];
    const oStart = other.startHour * 60 + other.startMinute;
    const oDurMins = Math.max(5, Math.round(other.durationHours * 60));
    const oEnd = Math.min(24 * 60, oStart + oDurMins);

    // Check interval overlap: [oStart, oEnd) vs [cStart, cEnd)
    if (!(oStart < cEnd && oEnd > cStart)) {
      continue;
    }

    if (oStart < cStart && oEnd > cStart) {
      // Existing earlier playlist extends into the new playlist's start time -> shorten existing earlier playlist
      const shortenedMins = oEnd - cStart;
      const newODurMins = Math.max(5, cStart - oStart);
      others[idx] = {
        ...other,
        durationHours: Number((newODurMins / 60).toFixed(4))
      };
      adjustments.push({
        playlistTitle: getTitle(other.playlistId),
        oldRange: formatRange(oStart, oEnd),
        newRange: formatRange(oStart, oStart + newODurMins),
        action: 'shortened',
        minutesDelta: shortenedMins
      });
    } else if (cStart < oStart && cEnd > oStart) {
      // Candidate starts earlier and extends into an existing later playlist -> shorten candidate
      cEnd = oStart;
      cDurMins = Math.max(5, cEnd - cStart);
      candidate.durationHours = Number((cDurMins / 60).toFixed(4));
      candidateWasShortened = true;
    } else if (oStart === cStart) {
      if (cEnd < oEnd) {
        // Candidate is shorter and starts at same time -> shift existing start to cEnd
        const trimmedMins = cEnd - oStart;
        const newODurMins = Math.max(5, oEnd - cEnd);
        others[idx] = {
          ...other,
          startHour: Math.floor(cEnd / 60) % 24,
          startMinute: cEnd % 60,
          durationHours: Number((newODurMins / 60).toFixed(4)),
          lastTriggeredDate: undefined
        };
        adjustments.push({
          playlistTitle: getTitle(other.playlistId),
          oldRange: formatRange(oStart, oEnd),
          newRange: formatRange(cEnd, cEnd + newODurMins),
          action: 'trimmed_start',
          minutesDelta: trimmedMins
        });
      } else {
        // Same start time and candidate >= existing -> shift candidate right after oEnd
        const durationToPreserve = cEnd - cStart;
        let nextStart = oEnd;

        // Advance past any subsequent contiguous/overlapping blocks on the same day
        for (const nextCheck of sameDayIndices) {
          const nxt = others[nextCheck.idx];
          const nStart = nxt.startHour * 60 + nxt.startMinute;
          const nEnd = Math.min(24 * 60, nStart + Math.max(5, Math.round(nxt.durationHours * 60)));
          if (nStart < nextStart + durationToPreserve && nEnd > nextStart) {
            nextStart = nEnd;
          }
        }

        if (nextStart < 24 * 60 - 5) {
          cStart = nextStart;
          cEnd = Math.min(24 * 60, cStart + durationToPreserve);
          cDurMins = Math.max(5, cEnd - cStart);
          candidate.startHour = Math.floor(cStart / 60);
          candidate.startMinute = cStart % 60;
          candidate.durationHours = Number((cDurMins / 60).toFixed(4));
          candidateWasShifted = true;
        }
      }
    }
  }

  if (candidateWasShortened && !candidateWasShifted) {
    adjustments.push({
      playlistTitle: getTitle(candidate.playlistId),
      oldRange: formatRange(origCStart, origCEnd),
      newRange: formatRange(cStart, cEnd),
      action: 'shortened',
      minutesDelta: origCEnd - cEnd
    });
  } else if (candidateWasShifted) {
    adjustments.push({
      playlistTitle: getTitle(candidate.playlistId),
      oldRange: formatRange(origCStart, origCEnd),
      newRange: formatRange(cStart, cEnd),
      action: 'shifted',
      minutesDelta: Math.abs(cStart - origCStart)
    });
  }

  const nextSchedules = [...others, candidate];

  if (adjustments.length === 0) {
    return { nextSchedules, notice: null };
  }

  const first = adjustments[0];
  let summaryMessage = 'Takvimdeki saat çakışması otomatik olarak giderildi.';
  if (adjustments.length === 1) {
    if (first.action === 'shortened') {
      summaryMessage = `"${first.playlistTitle}" çakışma nedeniyle otomatik olarak ${first.minutesDelta} dk kısaltıldı (${first.oldRange} → ${first.newRange}).`;
    } else if (first.action === 'trimmed_start') {
      summaryMessage = `"${first.playlistTitle}" çakışma nedeniyle ${first.minutesDelta} dk ileri alınarak kısaltıldı (${first.oldRange} → ${first.newRange}).`;
    } else {
      summaryMessage = `"${first.playlistTitle}" aynı saat dolu olduğu için ${first.newRange} saatine kaydırıldı.`;
    }
  } else {
    summaryMessage = `Saat çakışması nedeniyle ${adjustments.length} çalma listesinin süresi/saati otomatik olarak düzenlendi.`;
  }

  return {
    nextSchedules,
    notice: {
      title: 'Saat Çakışması Tespit Edildi ve Düzeltildi',
      message: summaryMessage,
      adjustments
    }
  };
}
