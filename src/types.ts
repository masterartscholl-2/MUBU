export type Genre = 
  | 'Ambient' 
  | 'House' 
  | 'Lo-Fi' 
  | 'Jazz' 
  | 'Chill' 
  | 'Bossa Nova' 
  | 'Blues' 
  | 'Classical' 
  | 'Afro House' 
  | 'Acoustic' 
  | 'Deep House' 
  | 'Lounge';

export type Mood = 
  | 'Sakin & Rahatlatıcı' 
  | 'Enerjik & Canlı' 
  | 'Odaklanma & Çalışma' 
  | 'Romantik' 
  | 'Neşeli & Pozitif' 
  | 'Lüks & Şık' 
  | 'Vintage & Nostaljik' 
  | 'Huzurlu Doğa';

export type Sector = 
  | 'Kafe & Kahve Dükkanı' 
  | 'Restoran & Fine Dining' 
  | 'Butik & Moda Mağazası' 
  | 'Otel & Lounge' 
  | 'Spa & Güzellik Merkezi' 
  | 'Spor Salonu & Fitness' 
  | 'Ofis & Co-working' 
  | 'Süpermarket & AVM';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  genre: string;
  mood: string;
  sectors: string[];
  bpm: number;
  price: number; // TL
  isCommercialCleared: boolean;
  playsCount: number;
  releaseDate: string;
  tags: string[];
  synthPreset?: 'chill' | 'lofi' | 'ambient' | 'house' | 'jazz' | 'bossa';
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  durationText?: string;
  trackIds: string[];
  curator: string;
  isEditorial?: boolean;
  type: 'playlist' | 'radio' | 'sector';
  sector?: string;
}

export interface RadioStation {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  genre: string;
  listenersCount: number;
  currentTrackId?: string;
  badgeTitle?: string;
  trackIds?: string[];
}

export interface GenreCategory {
  id?: string;
  name: string;
  badgeTitle: string;
  tracksCount: number;
  coverUrl: string;
  desc: string;
}

export interface VenueSector {
  id?: string;
  name: string;
  badgeTitle: string;
  icon?: string;
  tracksCount: number;
  coverUrl: string;
  desc: string;
  genres: string[];
}

export interface LicenseRecord {
  id: string;
  licenseNo: string;
  trackId: string;
  trackTitle: string;
  artist: string;
  type: 'standard' | 'commercial_venue' | 'broadcast';
  venueName: string;
  venueTaxOrId?: string;
  issuedDate: string;
  validUntil: string;
  price: number;
  certificateHash: string;
}

export interface CartItem {
  track: Track;
  licenseType: 'standard' | 'commercial_venue' | 'broadcast';
  venueName?: string;
  price: number;
}

export interface VenueLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  sector: string;
  taxNumber?: string;
  taxOffice?: string;
  sqMeters?: number;
  licenseNo: string;
  status: 'active' | 'pending';
  assignedPlaylistId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  taxNumber?: string;
  taxOffice?: string;
  role: 'admin' | 'corporate' | 'member';
  avatarUrl: string;
  favorites: string[]; // track IDs
  favoritePlaylists: string[]; // playlist IDs
  customPlaylists: Playlist[];
  licenses: LicenseRecord[];
  locations?: VenueLocation[];
  subscription?: {
    plan: 'None' | 'Kafe/Mekan Aylık' | 'Yıllık Kurumsal' | 'Zincir Mağaza';
    status: 'active' | 'inactive';
    validUntil: string;
  };
}
