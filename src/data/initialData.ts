import { Track, Playlist, RadioStation, UserProfile, GenreCategory, VenueSector } from '../types';

export const INITIAL_MOODS: string[] = [
  'Sakin & Rahatlatıcı',
  'Enerjik & Canlı',
  'Odaklanma & Çalışma',
  'Lüks & Şık',
  'Vintage & Nostaljik',
  'Neşeli & Pozitif',
  'Huzurlu Doğa',
  'Romantik'
];

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'trk-1',
    title: 'Cappadocia Sunset Groove',
    artist: 'Anatolian Lounge Project',
    album: 'Cappadocia Dreams',
    duration: 214,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=600&auto=format&fit=crop',
    genre: 'House',
    mood: 'Lüks & Şık',
    sectors: ['Kafe & Kahve Dükkanı', 'Otel & Lounge', 'Butik & Moda Mağazası'],
    bpm: 122,
    price: 349,
    isCommercialCleared: true,
    playsCount: 28420,
    releaseDate: '2025-01-12',
    tags: ['cappadocia', 'deep house', 'sunset', 'hotel lounge'],
    synthPreset: 'house'
  },
  {
    id: 'trk-2',
    title: 'Warm Espresso & Lo-Fi Chill',
    artist: 'Barista Beats',
    album: 'Morning Brew Sessions',
    duration: 178,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
    genre: 'Lo-Fi',
    mood: 'Sakin & Rahatlatıcı',
    sectors: ['Kafe & Kahve Dükkanı', 'Ofis & Co-working', 'Butik & Moda Mağazası'],
    bpm: 85,
    price: 249,
    isCommercialCleared: true,
    playsCount: 45190,
    releaseDate: '2025-02-01',
    tags: ['coffee', 'lofi beats', 'study', 'focus'],
    synthPreset: 'lofi'
  },
  {
    id: 'trk-3',
    title: 'Fine Dining Velvet Bossa',
    artist: 'Rio Serenades Ensemble',
    album: 'Gastronomy Nights',
    duration: 196,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600&auto=format&fit=crop',
    genre: 'Bossa Nova',
    mood: 'Lüks & Şık',
    sectors: ['Restoran & Fine Dining', 'Otel & Lounge'],
    bpm: 98,
    price: 499,
    isCommercialCleared: true,
    playsCount: 31200,
    releaseDate: '2024-11-20',
    tags: ['bossa', 'restaurant', 'acoustic guitar', 'fine dining'],
    synthPreset: 'bossa'
  },
  {
    id: 'trk-4',
    title: 'Afro Beats & Golden Hour',
    artist: 'Tribal Horizon',
    album: 'Safari Echoes',
    duration: 232,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
    genre: 'Afro House',
    mood: 'Enerjik & Canlı',
    sectors: ['Butik & Moda Mağazası', 'Otel & Lounge', 'Spor Salonu & Fitness'],
    bpm: 124,
    price: 399,
    isCommercialCleared: true,
    playsCount: 19850,
    releaseDate: '2025-01-28',
    tags: ['afro house', 'tribal', 'dance', 'cocktail lounge'],
    synthPreset: 'house'
  },
  {
    id: 'trk-5',
    title: '1950s Midnight Jazz Cafe',
    artist: 'The Blue Note Trio',
    album: 'Vintage Manhattan',
    duration: 205,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop',
    genre: 'Jazz',
    mood: 'Vintage & Nostaljik',
    sectors: ['Kafe & Kahve Dükkanı', 'Restoran & Fine Dining', 'Otel & Lounge'],
    bpm: 92,
    price: 349,
    isCommercialCleared: true,
    playsCount: 38700,
    releaseDate: '2024-12-15',
    tags: ['jazz', 'vintage', 'cafe', 'cocktail', 'retro'],
    synthPreset: 'jazz'
  },
  {
    id: 'trk-6',
    title: 'Nordic Spa & Zen Solitude',
    artist: 'Soma Soundworks',
    album: 'Pure Harmony',
    duration: 245,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
    genre: 'Ambient',
    mood: 'Huzurlu Doğa',
    sectors: ['Spa & Güzellik Merkezi', 'Otel & Lounge', 'Ofis & Co-working'],
    bpm: 70,
    price: 299,
    isCommercialCleared: true,
    playsCount: 22100,
    releaseDate: '2025-02-10',
    tags: ['spa', 'meditation', 'ambient', 'relaxation'],
    synthPreset: 'ambient'
  },
  {
    id: 'trk-7',
    title: 'Arkada Çalsın Akustik Gitar',
    artist: 'Ege Kıyı Melodileri',
    album: 'Ege Esintisi',
    duration: 188,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=600&auto=format&fit=crop',
    genre: 'Acoustic',
    mood: 'Neşeli & Pozitif',
    sectors: ['Kafe & Kahve Dükkanı', 'Restoran & Fine Dining', 'Süpermarket & AVM'],
    bpm: 104,
    price: 249,
    isCommercialCleared: true,
    playsCount: 52400,
    releaseDate: '2025-01-05',
    tags: ['acoustic', 'background', 'soft', 'coffee'],
    synthPreset: 'chill'
  },
  {
    id: 'trk-8',
    title: 'Groovy Boutique House Rhythm',
    artist: 'Milan Fashion Beats',
    album: 'Runway Spring',
    duration: 218,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
    genre: 'Deep House',
    mood: 'Enerjik & Canlı',
    sectors: ['Butik & Moda Mağazası', 'Spor Salonu & Fitness', 'Süpermarket & AVM'],
    bpm: 126,
    price: 399,
    isCommercialCleared: true,
    playsCount: 27900,
    releaseDate: '2025-02-14',
    tags: ['boutique', 'fashion', 'deep house', 'retail'],
    synthPreset: 'house'
  },
  {
    id: 'trk-9',
    title: 'Christmas Fireplace & Nostalgia',
    artist: 'Holiday Brass Collective',
    album: 'Warm Winter Evenings',
    duration: 190,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=600&auto=format&fit=crop',
    genre: 'Classical',
    mood: 'Vintage & Nostaljik',
    sectors: ['Kafe & Kahve Dükkanı', 'Süpermarket & AVM', 'Restoran & Fine Dining'],
    bpm: 88,
    price: 299,
    isCommercialCleared: true,
    playsCount: 41200,
    releaseDate: '2024-12-01',
    tags: ['christmas', 'holiday', 'warm', 'winter'],
    synthPreset: 'jazz'
  },
  {
    id: 'trk-10',
    title: 'Mississippi River Delta Blues',
    artist: 'Memphis Stumble',
    album: 'Old Porch Chords',
    duration: 220,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    genre: 'Blues',
    mood: 'Vintage & Nostaljik',
    sectors: ['Kafe & Kahve Dükkanı', 'Restoran & Fine Dining'],
    bpm: 80,
    price: 349,
    isCommercialCleared: true,
    playsCount: 16500,
    releaseDate: '2025-01-18',
    tags: ['blues', 'slide guitar', 'bar', 'smokehouse'],
    synthPreset: 'bossa'
  },
  {
    id: 'trk-11',
    title: 'Latin Fiesta Sunset Mojito',
    artist: 'Havana Nights Collective',
    album: 'Cuban Breeze',
    duration: 210,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
    genre: 'Chill',
    mood: 'Neşeli & Pozitif',
    sectors: ['Restoran & Fine Dining', 'Kafe & Kahve Dükkanı', 'Otel & Lounge'],
    bpm: 112,
    price: 329,
    isCommercialCleared: true,
    playsCount: 33400,
    releaseDate: '2025-01-22',
    tags: ['latin', 'cuba', 'summer', 'cocktail', 'cheerful'],
    synthPreset: 'bossa'
  },
  {
    id: 'trk-12',
    title: 'Bookstore Quiet Page Turn',
    artist: 'Silent Study Labs',
    album: 'Quiet Room',
    duration: 195,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507842229450-79887b411d51?q=80&w=600&auto=format&fit=crop',
    genre: 'Ambient',
    mood: 'Odaklanma & Çalışma',
    sectors: ['Ofis & Co-working', 'Kafe & Kahve Dükkanı'],
    bpm: 72,
    price: 249,
    isCommercialCleared: true,
    playsCount: 26800,
    releaseDate: '2025-02-05',
    tags: ['reading', 'library', 'piano', 'study', 'relax'],
    synthPreset: 'ambient'
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-1',
    title: 'Cappadocia House',
    description: 'Büyüleyici gün batımı ve otel lounge atmosferine uygun melodik house koleksiyonu.',
    coverUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=600&auto=format&fit=crop',
    durationText: '11s 41dk',
    trackIds: ['trk-1', 'trk-4', 'trk-8'],
    curator: 'müzikbank Müzik Direktörlüğü',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-2',
    title: 'Afro House Playlist',
    description: 'Canlı perküsyonlar, ritmik baslar ve modern mekanlara yüksek enerji katan seçki.',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
    durationText: '15s 44dk',
    trackIds: ['trk-4', 'trk-1', 'trk-8'],
    curator: 'DJ Kaan Kaya',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-3',
    title: 'Arkada Çalsın',
    description: 'Sohbeti bastırmayan, müşterileri rahatlatan akustik ve lo-fi mekan fon müzikleri.',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=600&auto=format&fit=crop',
    durationText: '17s 40dk',
    trackIds: ['trk-7', 'trk-2', 'trk-3', 'trk-12'],
    curator: 'müzikbank Editör Seçimi',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-4',
    title: 'Chill House',
    description: 'Lounge barlar ve üçüncü nesil kahveciler için yumuşak ritimli elektronik müzikler.',
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
    durationText: '20s 04dk',
    trackIds: ['trk-1', 'trk-8', 'trk-2'],
    curator: 'müzikbank Chill Club',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-5',
    title: 'Groovy House',
    description: 'Mağaza ve dinamik perakende satış noktaları için hareketli modern groove parçaları.',
    coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
    durationText: '1gün 3s 48dk',
    trackIds: ['trk-8', 'trk-4', 'trk-1'],
    curator: 'Retail Dynamics',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-6',
    title: 'Lo Fi House',
    description: 'Sıcak analog dokunuşlar, nostaljik synthler ve hipnotik ritimler.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
    durationText: '18s 58dk',
    trackIds: ['trk-2', 'trk-1', 'trk-12'],
    curator: 'Lo-Fi Records',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-7',
    title: 'Fine Dining Playlist',
    description: 'Şık restoranlar, özel akşam yemekleri ve gurme mekanlar için sofistike caz ve bossa.',
    coverUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600&auto=format&fit=crop',
    durationText: '14s 44dk',
    trackIds: ['trk-3', 'trk-5', 'trk-10'],
    curator: 'Chef & Sound',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-8',
    title: "1950's Jazz Vintage Cafe",
    description: 'Piyano, kontrbas ve fırça davullarla klasik Amerikan caz kulübü atmosferi.',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop',
    durationText: '17s 13dk',
    trackIds: ['trk-5', 'trk-3', 'trk-10'],
    curator: 'Vintage Audio Vault',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-9',
    title: 'Coffee and Friends Playlist',
    description: 'Arkadaş buluşmaları, sıcak sohbetler ve samimi kafe ortamları için ideal.',
    coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
    durationText: '11s 40dk',
    trackIds: ['trk-2', 'trk-7', 'trk-11'],
    curator: 'Barista Choice',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-10',
    title: 'Latin Playlist',
    description: 'Rumba, salsa ve bossa ritimleriyle enerji ve sıcaklık katan seçkiler.',
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
    durationText: '10s 26dk',
    trackIds: ['trk-11', 'trk-3', 'trk-4'],
    curator: 'Latino Grooves',
    isEditorial: true,
    type: 'playlist'
  },
  {
    id: 'pl-11',
    title: 'Bookstore & Focus',
    description: 'Kitapçılar, çalışma alanları ve kütüphaneler için sakinleştirici ortam sesleri.',
    coverUrl: 'https://images.unsplash.com/photo-1507842229450-79887b411d51?q=80&w=600&auto=format&fit=crop',
    durationText: '16s 30dk',
    trackIds: ['trk-12', 'trk-6', 'trk-2'],
    curator: 'Silent Library',
    isEditorial: true,
    type: 'playlist'
  }
];

export const QUICK_CATEGORIES = [
  { name: 'Ambient', count: '142 Parça', coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=400&auto=format&fit=crop', desc: 'Sakinleştirici mekan ambiyansı' },
  { name: 'Bossa Nova', count: '89 Parça', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop', desc: 'Brezilya esintili şık melodiler' },
  { name: 'Christmas', count: '64 Parça', coverUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=400&auto=format&fit=crop', desc: 'Yılbaşı & Kış dönemi müzikleri' },
  { name: 'Blues', count: '75 Parça', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop', desc: 'Vintage & otantik bar ritimleri' },
  { name: 'Chill', count: '210 Parça', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop', desc: 'Modern kafe ve lounge havası' },
  { name: 'Classical', count: '118 Parça', coverUrl: 'https://images.unsplash.com/photo-1520523839898-507127053e1a?q=80&w=400&auto=format&fit=crop', desc: 'Piyano & yaylı orkestra zarafeti' },
];

export const GENRE_CATEGORIES: GenreCategory[] = [
  {
    name: 'Acoustic',
    badgeTitle: 'ACOUSTIC',
    tracksCount: 68,
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=600&auto=format&fit=crop',
    desc: 'Sıcak akustik gitarlar, ahşap tınılar ve samimi melodiler.'
  },
  {
    name: 'Ambient',
    badgeTitle: 'AMBIENT',
    tracksCount: 142,
    coverUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop',
    desc: 'Zihni dinlendiren uzaysal ses alanları ve atmosferik tınılar.'
  },
  {
    name: 'Balkan Music',
    badgeTitle: 'BALKAN MUSIC',
    tracksCount: 45,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    desc: 'Akordeon, nefesli çalgılar ve enerjik ritmik balkan melodileri.'
  },
  {
    name: 'Blues',
    badgeTitle: 'BLUES',
    tracksCount: 75,
    coverUrl: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=600&auto=format&fit=crop',
    desc: 'Vintage elektro gitar soloları ve duygusal ritimler.'
  },
  {
    name: 'Bossa Nova',
    badgeTitle: 'BOSSA NOVA',
    tracksCount: 89,
    coverUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600&auto=format&fit=crop',
    desc: 'Brezilya esintili kontrbas, yumuşak vokal ve caz armonileri.'
  },
  {
    name: 'Chill',
    badgeTitle: 'CHILL',
    tracksCount: 210,
    coverUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
    desc: 'Günün her saatine eşlik eden hafif ve pozitif ritimler.'
  },
  {
    name: 'Christmas',
    badgeTitle: 'CHRISTMAS',
    tracksCount: 64,
    coverUrl: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?q=80&w=600&auto=format&fit=crop',
    desc: 'Yılbaşı neşesi, sıcak şömine başı ve kış dönemi festival koleksiyonu.'
  },
  {
    name: 'Classical',
    badgeTitle: 'CLASSICAL',
    tracksCount: 118,
    coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=600&auto=format&fit=crop',
    desc: 'Kuyruklu piyano, keman konçertoları ve seçkin orkestra eserleri.'
  },
  {
    name: 'House',
    badgeTitle: 'HOUSE',
    tracksCount: 165,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    desc: 'Modern dans ritimleri, club ve mekanlar için dinamik baslar.'
  },
  {
    name: 'Lo-Fi',
    badgeTitle: 'LO-FI',
    tracksCount: 135,
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
    desc: 'Kahve eşliğinde çalışma ve odaklanma için analog vuruşlar.'
  },
  {
    name: 'Jazz',
    badgeTitle: 'JAZZ',
    tracksCount: 124,
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop',
    desc: 'Gece bistroları ve şarap evleri için nostaljik caz standartları.'
  },
  {
    name: 'Afro House',
    badgeTitle: 'AFRO HOUSE',
    tracksCount: 92,
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
    desc: 'Etnik perküsyonlar, derin baslar ve günbatımı melodileri.'
  },
  {
    name: 'Deep House',
    badgeTitle: 'DEEP HOUSE',
    tracksCount: 108,
    coverUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=600&auto=format&fit=crop',
    desc: 'Rooftop ve lounge barlar için sofistike elektronik akış.'
  },
  {
    name: 'Lounge',
    badgeTitle: 'LOUNGE',
    tracksCount: 154,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    desc: 'Oteller, fine-dining ve kokteyl alanları için lüks ambiyans.'
  }
];

export const VENUE_SECTORS = [
  {
    name: 'Kafe & Kahve Dükkanı',
    badgeTitle: 'KAFE & KAHVE',
    icon: 'Coffee',
    tracksCount: 140,
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
    desc: 'Müşterilerin keyifle sohbet etmesini ve uzun süre vakit geçirmesini sağlayan akustik ve lo-fi ritimler.',
    genres: ['Lo-Fi', 'Acoustic', 'Jazz', 'Bossa Nova']
  },
  {
    name: 'Restoran & Fine Dining',
    badgeTitle: 'FINE DINING',
    icon: 'UtensilsCrossed',
    tracksCount: 110,
    coverUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600&auto=format&fit=crop',
    desc: 'Lezzet deneyimini tamamlayan, konuşmayı bastırmayan sofistike caz ve akustik kompozisyonlar.',
    genres: ['Jazz', 'Bossa Nova', 'Classical']
  },
  {
    name: 'Butik & Moda Mağazası',
    badgeTitle: 'BUTİK & MODA',
    icon: 'ShoppingBag',
    tracksCount: 185,
    coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
    desc: 'Alışveriş temposunu artıran, marka imajını güçlendiren trend deep house ve nu-disco parçaları.',
    genres: ['Deep House', 'Afro House', 'House']
  },
  {
    name: 'Otel & Lounge Bar',
    badgeTitle: 'OTEL & LOUNGE',
    icon: 'Hotel',
    tracksCount: 160,
    coverUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop',
    desc: 'Lobi, resepsiyon ve havuz başı için günün saatlerine göre dinamik olarak değişen lüks melodiler.',
    genres: ['Ambient', 'Chill', 'House', 'Jazz']
  },
  {
    name: 'Spa & Güzellik Merkezi',
    badgeTitle: 'SPA & WELLNESS',
    icon: 'Sparkles',
    tracksCount: 88,
    coverUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
    desc: 'Derin rahatlama, masaj ve bakım seansları için meditatif ambient frekanslar ve doğa tınıları.',
    genres: ['Ambient', 'Classical']
  },
  {
    name: 'Spor Salonu & Fitness',
    badgeTitle: 'FITNESS & GYM',
    icon: 'Dumbbell',
    tracksCount: 130,
    coverUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    desc: 'Yüksek BPM motivasyon, cardio ve ağırlık antrenmanlarını tetikleyen enerjik baslar.',
    genres: ['House', 'Afro House', 'Deep House']
  },
  {
    name: 'Ofis & Co-working',
    badgeTitle: 'OFİS & WORK',
    icon: 'Briefcase',
    tracksCount: 95,
    coverUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop',
    desc: 'Çalışanların odaklanmasını artıran ve stresi azaltan kesintisiz lo-fi ve ambient enstrümantal fonlar.',
    genres: ['Lo-Fi', 'Ambient', 'Chill']
  },
  {
    name: 'Süpermarket & AVM',
    badgeTitle: 'AVM & MARKET',
    icon: 'Store',
    tracksCount: 145,
    coverUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600&auto=format&fit=crop',
    desc: 'Alışveriş ortamına keyif katan, pozitif ve tüketici dostu hafif pop & akustik derlemeler.',
    genres: ['Acoustic', 'Chill', 'Bossa Nova']
  }
];

export const INITIAL_RADIOS: RadioStation[] = [
  {
    id: 'rad-1',
    name: 'müzikbank Cafe FM',
    badgeTitle: 'CAFE FM',
    description: '7/24 Kesintisiz üçüncü nesil kafe ve barista fon yayını.',
    coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
    genre: 'Lo-Fi / Akustik',
    listenersCount: 1420,
    currentTrackId: 'trk-2'
  },
  {
    id: 'rad-2',
    name: 'müzikbank Lounge & Sunset Radio',
    badgeTitle: 'LOUNGE & SUNSET',
    description: 'Kokteyl barlar, rooftop ve butik oteller için canlı akış.',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
    genre: 'Deep & Afro House',
    listenersCount: 2890,
    currentTrackId: 'trk-1'
  },
  {
    id: 'rad-3',
    name: 'müzikbank Jazz & Wine Radio',
    badgeTitle: 'JAZZ & WINE',
    description: 'Şarap evleri, şık bistrolar ve akşam yemekleri için caz akışı.',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop',
    genre: 'Classic Jazz & Bossa',
    listenersCount: 940,
    currentTrackId: 'trk-5'
  },
  {
    id: 'rad-4',
    name: 'müzikbank Zen & Spa Radio',
    badgeTitle: 'ZEN & SPA',
    description: 'Zihinsel dinginlik, yoga ve spa merkezleri için kesintisiz frekans.',
    coverUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
    genre: 'Ambient & Meditative',
    listenersCount: 630,
    currentTrackId: 'trk-6'
  },
  {
    id: 'rad-5',
    name: 'müzikbank Electro Club FM',
    badgeTitle: 'ELECTRO CLUB',
    description: 'Enerjik kulüp ve modern butik mekanlar için canlı nu-disco & house yayını.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    genre: 'Nu-Disco & House',
    listenersCount: 3150,
    currentTrackId: 'trk-4'
  },
  {
    id: 'rad-6',
    name: 'müzikbank Bossa Dinner FM',
    badgeTitle: 'BOSSA DINNER',
    description: 'Romantik akşam yemekleri ve şık restoranlar için Brezilya esintili caz.',
    coverUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600&auto=format&fit=crop',
    genre: 'Bossa Nova & Acoustic',
    listenersCount: 880,
    currentTrackId: 'trk-3'
  },
  {
    id: 'rad-7',
    name: 'müzikbank Vintage Blues Radio',
    badgeTitle: 'VINTAGE BLUES',
    description: '1950lerden günümüze nostaljik blues, retro soul ve akustik tınılar.',
    coverUrl: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=600&auto=format&fit=crop',
    genre: 'Retro Blues & Soul',
    listenersCount: 1120,
    currentTrackId: 'trk-5'
  },
  {
    id: 'rad-8',
    name: 'müzikbank Focus & Work Station',
    badgeTitle: 'FOCUS & WORK',
    description: 'Ofisler ve ortak çalışma alanları için zihin açıcı enstrümantal fon akışı.',
    coverUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop',
    genre: 'Chillhop & Focus',
    listenersCount: 1790,
    currentTrackId: 'trk-2'
  }
];

export const DEFAULT_USER: UserProfile = {
  id: 'usr-1',
  name: 'Crystal Studio Cafe & Bar',
  email: 'crystalproduksiyon@gmail.com',
  phone: '+90 (212) 234 56 78',
  companyName: 'Crystal Mekan İşletmeciliği A.Ş.',
  taxNumber: '3498219012',
  taxOffice: 'Mecidiyeköy V.D.',
  role: 'admin', // Start with admin enabled so user can immediately manage catalog & MP3s!
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
  favorites: ['trk-1', 'trk-2', 'trk-5'],
  favoritePlaylists: ['pl-1', 'pl-3'],
  customPlaylists: [
    {
      id: 'usr-pl-1',
      title: 'Hafta Sonu Akşam Kahvesi',
      description: 'Cuma ve Cumartesi akşamları kafe terası için hazırladığım özel liste.',
      coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
      trackIds: ['trk-1', 'trk-2', 'trk-7'],
      curator: 'Crystal Studio',
      type: 'playlist'
    }
  ],
  locations: [
    {
      id: 'loc-1',
      name: 'Crystal Cafe & Bistro - Nişantaşı (Merkez)',
      address: 'Valikonağı Cad. No: 42/B',
      city: 'İstanbul',
      district: 'Şişli',
      sector: 'Kafe & Kahve Dükkanı',
      taxNumber: '3498219012',
      taxOffice: 'Mecidiyeköy V.D.',
      sqMeters: 140,
      licenseNo: 'MZB-2025-8821-TR',
      status: 'active',
      assignedPlaylistId: 'pl-3'
    },
    {
      id: 'loc-2',
      name: 'Crystal Lounge & Terrace - Kadıköy',
      address: 'Moda Cad. No: 18 Kat: 4',
      city: 'İstanbul',
      district: 'Kadıköy',
      sector: 'Otel & Lounge Bar',
      taxNumber: '3498219012',
      taxOffice: 'Mecidiyeköy V.D.',
      sqMeters: 220,
      licenseNo: 'MZB-2025-9104-TR',
      status: 'active',
      assignedPlaylistId: 'pl-1'
    },
    {
      id: 'loc-3',
      name: 'Crystal Coffee Lab - Bebek',
      address: 'Cevdetpaşa Cad. No: 76',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'Kafe & Kahve Dükkanı',
      taxNumber: '3498219012',
      taxOffice: 'Mecidiyeköy V.D.',
      sqMeters: 85,
      licenseNo: 'MZB-2025-9442-TR',
      status: 'active',
      assignedPlaylistId: 'pl-4'
    }
  ],
  licenses: [
    {
      id: 'lic-8821',
      licenseNo: 'MZB-2025-8821-TR',
      trackId: 'trk-1',
      trackTitle: 'Cappadocia Sunset Groove',
      artist: 'Anatolian Lounge Project',
      type: 'commercial_venue',
      venueName: 'Crystal Cafe Nişantaşı',
      venueTaxOrId: 'TR-349821901',
      issuedDate: '2025-01-15',
      validUntil: '2027-01-15',
      price: 349,
      certificateHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    }
  ],
  subscription: {
    plan: 'Kafe/Mekan Aylık',
    status: 'active',
    validUntil: '2026-12-31'
  }
};
