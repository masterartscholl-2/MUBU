import { Track, Playlist } from '../types';

/**
 * Flexible sector matcher handling slight variations like 'Otel & Lounge' vs 'Otel & Lounge Bar'.
 */
export const isTrackInSector = (track: Track, sectorName: string): boolean => {
  if (!track || !track.sectors || !Array.isArray(track.sectors)) return false;
  const sNorm = sectorName.toLowerCase().trim();
  return track.sectors.some(s => {
    const secNorm = s.toLowerCase().trim();
    if (secNorm === sNorm) return true;
    if (secNorm.includes(sNorm) || sNorm.includes(secNorm)) return true;
    // Check main root word (e.g. restoran, kafe, otel, butik, spa, fitness, ofis, market)
    const root1 = secNorm.split('&')[0].trim();
    const root2 = sNorm.split('&')[0].trim();
    if (root1.length >= 3 && root2.length >= 3) {
      if (root1.includes(root2) || root2.includes(root1)) return true;
    }
    return false;
  });
};

/**
 * Exact normalized genre matcher so each track belongs strictly to its assigned genre.
 */
export const isTrackInGenre = (track: Track, genreName: string): boolean => {
  if (!track || !track.genre || !genreName) return false;
  const gNorm = genreName.trim().toLowerCase();
  const trackGNorm = track.genre.trim().toLowerCase();
  return trackGNorm === gNorm;
};

/**
 * Automatically determine which playlists should contain a track given its genre and sectors.
 */
export const findMatchingPlaylistIds = (
  genre: string,
  sectors: string[],
  allPlaylists: Playlist[]
): string[] => {
  const matchedIds = new Set<string>();
  const gLow = (genre || '').toLowerCase().trim();
  const secLows = (sectors || []).map(s => s.toLowerCase().trim());

  allPlaylists.forEach(pl => {
    const titleLow = pl.title.toLowerCase();
    const descLow = pl.description.toLowerCase();

    // 1. Direct Sector-to-Playlist heuristics
    secLows.forEach(s => {
      if (s.includes('restoran') || s.includes('fine dining')) {
        if (titleLow.includes('fine dining') || titleLow.includes('restoran') || descLow.includes('restoran') || descLow.includes('fine dining') || pl.id === 'pl-7') {
          matchedIds.add(pl.id);
        }
      }
      if (s.includes('kafe') || s.includes('kahve')) {
        if (titleLow.includes('coffee') || titleLow.includes('kafe') || titleLow.includes('arkada') || descLow.includes('kafe') || descLow.includes('kahve') || pl.id === 'pl-9' || pl.id === 'pl-3') {
          matchedIds.add(pl.id);
        }
      }
      if (s.includes('otel') || s.includes('lounge')) {
        if (titleLow.includes('cappadocia') || titleLow.includes('chill house') || titleLow.includes('lounge') || descLow.includes('lounge') || descLow.includes('otel') || pl.id === 'pl-1' || pl.id === 'pl-4') {
          matchedIds.add(pl.id);
        }
      }
      if (s.includes('butik') || s.includes('moda') || s.includes('mağaza')) {
        if (titleLow.includes('groovy') || titleLow.includes('moda') || descLow.includes('mağaza') || descLow.includes('perakende') || pl.id === 'pl-5') {
          matchedIds.add(pl.id);
        }
      }
      if (s.includes('ofis') || s.includes('co-working')) {
        if (titleLow.includes('bookstore') || titleLow.includes('focus') || descLow.includes('ofis') || descLow.includes('çalışma') || pl.id === 'pl-11') {
          matchedIds.add(pl.id);
        }
      }
      if (s.includes('spor') || s.includes('fitness')) {
        if (titleLow.includes('afro') || titleLow.includes('groovy') || pl.id === 'pl-2' || pl.id === 'pl-5') {
          matchedIds.add(pl.id);
        }
      }
      if (s.includes('spa') || s.includes('wellness')) {
        if (titleLow.includes('bookstore') || titleLow.includes('zen') || pl.id === 'pl-11') {
          matchedIds.add(pl.id);
        }
      }
    });

    // 2. Direct Genre-to-Playlist heuristics
    if (gLow) {
      if (gLow === 'acoustic' || gLow.includes('acoustic') || gLow.includes('akustik')) {
        if (titleLow.includes('arkada') || titleLow.includes('coffee') || descLow.includes('akustik') || pl.id === 'pl-3' || pl.id === 'pl-9') {
          matchedIds.add(pl.id);
        }
      }
      if (gLow === 'house' || gLow.includes('house')) {
        if (titleLow.includes('house') || pl.id === 'pl-1' || pl.id === 'pl-2' || pl.id === 'pl-4' || pl.id === 'pl-5') {
          matchedIds.add(pl.id);
        }
      }
      if (gLow === 'lo-fi' || gLow.includes('lofi') || gLow.includes('lo-fi')) {
        if (titleLow.includes('lo fi') || titleLow.includes('lo-fi') || titleLow.includes('arkada') || pl.id === 'pl-6' || pl.id === 'pl-3') {
          matchedIds.add(pl.id);
        }
      }
      if (gLow === 'jazz' || gLow.includes('caz') || gLow.includes('jazz')) {
        if (titleLow.includes('jazz') || titleLow.includes('fine dining') || pl.id === 'pl-8' || pl.id === 'pl-7') {
          matchedIds.add(pl.id);
        }
      }
      if (gLow === 'bossa' || gLow.includes('bossa') || gLow === 'latin') {
        if (titleLow.includes('latin') || titleLow.includes('fine dining') || pl.id === 'pl-10' || pl.id === 'pl-7') {
          matchedIds.add(pl.id);
        }
      }
      if (gLow === 'ambient') {
        if (titleLow.includes('bookstore') || pl.id === 'pl-11') {
          matchedIds.add(pl.id);
        }
      }
      if (gLow === 'chill') {
        if (titleLow.includes('chill') || titleLow.includes('arkada') || pl.id === 'pl-4' || pl.id === 'pl-3') {
          matchedIds.add(pl.id);
        }
      }

      // Exact word inclusion
      if (titleLow.includes(gLow) || descLow.includes(gLow)) {
        matchedIds.add(pl.id);
      }
    }
  });

  return Array.from(matchedIds);
};

/**
 * Retrieve all tracks for a sector, prioritizing direct assignments.
 */
export const getTracksForSector = (allTracks: Track[], sectorName: string): Track[] => {
  return allTracks.filter(t => isTrackInSector(t, sectorName));
};

/**
 * Retrieve all tracks for a genre, prioritizing direct assignments.
 */
export const getTracksForGenre = (allTracks: Track[], genreName: string): Track[] => {
  return allTracks.filter(t => isTrackInGenre(t, genreName));
};

/**
 * Retrieve all tracks for a playlist:
 * - Checks explicit trackIds
 * - Also checks genre/sector alignment so newly uploaded tracks with matching category/sector automatically show up
 */
export const getTracksForPlaylist = (playlist: Playlist, allTracks: Track[]): Track[] => {
  const directTracks = allTracks.filter(t => playlist.trackIds?.includes(t.id));
  
  // Also check if any track explicitly has this playlist in its tags or matches its category/sector
  const titleLow = playlist.title.toLowerCase();
  const descLow = playlist.description.toLowerCase();

  const additionalTracks = allTracks.filter(t => {
    if (playlist.trackIds?.includes(t.id)) return false;

    // Match if track's genre is part of playlist
    if (t.genre && (titleLow.includes(t.genre.toLowerCase()) || descLow.includes(t.genre.toLowerCase()))) {
      return true;
    }

    // Match if track's sector aligns with playlist
    if (t.sectors && Array.isArray(t.sectors)) {
      for (const sec of t.sectors) {
        const secLow = sec.toLowerCase();
        if (
          (secLow.includes('fine dining') && (titleLow.includes('fine dining') || titleLow.includes('restoran'))) ||
          (secLow.includes('kafe') && (titleLow.includes('coffee') || titleLow.includes('kafe'))) ||
          (secLow.includes('otel') && (titleLow.includes('cappadocia') || titleLow.includes('lounge'))) ||
          (secLow.includes('butik') && titleLow.includes('groovy')) ||
          (secLow.includes('ofis') && titleLow.includes('bookstore'))
        ) {
          return true;
        }
      }
    }

    return false;
  });

  return [...directTracks, ...additionalTracks];
};
