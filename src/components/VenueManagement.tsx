import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  Store, 
  Phone, 
  Mail, 
  Clock, 
  ArrowUpRight, 
  Check, 
  X,
  Play,
  Music2,
  Calendar
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { VenueLocation } from '../types';

export const VenueManagement: React.FC = () => {
  const { 
    user, 
    updateProfile, 
    addLocation, 
    updateLocation, 
    deleteLocation, 
    playlists, 
    playPlaylist,
    setIsPricingModalOpen,
    setActiveCertificateToView 
  } = useMusic();

  const [activeSubTab, setActiveSubTab] = useState<'locations' | 'subscription' | 'profile'>('locations');
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New location form state
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locCity, setLocCity] = useState('İstanbul');
  const [locDistrict, setLocDistrict] = useState('');
  const [locSector, setLocSector] = useState('Kafe & Kahve Dükkanı');
  const [locTaxNo, setLocTaxNo] = useState(user.taxNumber || '3498219012');
  const [locTaxOffice, setLocTaxOffice] = useState(user.taxOffice || 'Mecidiyeköy V.D.');
  const [locSqMeters, setLocSqMeters] = useState(120);
  const [locAssignedPlaylistId, setLocAssignedPlaylistId] = useState(playlists[0]?.id || 'pl-1');

  // Profile form state
  const [profileName, setProfileName] = useState(user.name);
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '+90 (212) 234 56 78');
  const [taxNumber, setTaxNumber] = useState(user.taxNumber || '');
  const [taxOffice, setTaxOffice] = useState(user.taxOffice || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetLocForm = () => {
    setEditingLocationId(null);
    setLocName('');
    setLocAddress('');
    setLocCity('İstanbul');
    setLocDistrict('');
    setLocSector('Kafe & Kahve Dükkanı');
    setLocSqMeters(120);
  };

  const handleOpenEdit = (loc: VenueLocation) => {
    setEditingLocationId(loc.id);
    setLocName(loc.name);
    setLocAddress(loc.address);
    setLocCity(loc.city);
    setLocDistrict(loc.district);
    setLocSector(loc.sector);
    setLocTaxNo(loc.taxNumber || user.taxNumber || '');
    setLocTaxOffice(loc.taxOffice || user.taxOffice || '');
    setLocSqMeters(loc.sqMeters || 120);
    setLocAssignedPlaylistId(loc.assignedPlaylistId || playlists[0]?.id || '');
    setIsAddLocationModalOpen(true);
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locAddress.trim()) {
      showToast('Lütfen şube adı ve adres alanlarını doldurunuz.');
      return;
    }

    if (editingLocationId) {
      updateLocation(editingLocationId, {
        name: locName,
        address: locAddress,
        city: locCity,
        district: locDistrict,
        sector: locSector,
        taxNumber: locTaxNo,
        taxOffice: locTaxOffice,
        sqMeters: Number(locSqMeters),
        assignedPlaylistId: locAssignedPlaylistId
      });
      showToast('Şube bilgileri başarıyla güncellendi.');
    } else {
      addLocation({
        name: locName,
        address: locAddress,
        city: locCity,
        district: locDistrict,
        sector: locSector,
        taxNumber: locTaxNo,
        taxOffice: locTaxOffice,
        sqMeters: Number(locSqMeters),
        assignedPlaylistId: locAssignedPlaylistId
      });
      showToast('Yeni mekan şubesi ve resmi telif muafiyet kodu oluşturuldu.');
    }

    setIsAddLocationModalOpen(false);
    resetLocForm();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      companyName,
      email,
      phone,
      taxNumber,
      taxOffice,
      avatarUrl
    });
    showToast('İşletme profil bilgileri başarıyla kaydedildi.');
  };

  const locations = user.locations || [];

  return (
    <div className="p-6 md:p-8 space-y-6 select-none animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs py-2.5 px-5 rounded-2xl shadow-xl flex items-center gap-2 border border-purple-400/40 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 rounded-3xl border border-purple-500/30 shadow-xl shadow-purple-950/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-900/40 flex-shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {user.companyName || user.name}
              </h1>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-bold">
                KURUMSAL MEKAN
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
              <span>{user.email}</span>
              <span>•</span>
              <span className="text-purple-400 font-semibold">{locations.length} Kayıtlı Lokasyon / Şube</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetLocForm();
            setIsAddLocationModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Şube Ekle</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
        <button
          onClick={() => setActiveSubTab('locations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'locations'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Şubeler & Lokasyonlar ({locations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subscription')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'subscription'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Aktif Abonelik Durumu</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'profile'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>İşletme Profili</span>
        </button>
      </div>

      {/* 1. LOCATIONS TAB */}
      {activeSubTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tüm şubelerinizin telif koruma sertifikalarını ve atanan yayın akışlarını buradan yönetin.</span>
            <span className="font-mono text-zinc-500">Kayıtlı: {locations.length} Lokasyon</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => {
              const assignedPl = playlists.find(p => p.id === loc.assignedPlaylistId);
              return (
                <div
                  key={loc.id}
                  className="rounded-2xl p-5 bg-zinc-950/90 border border-zinc-900 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Header: Name and Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {loc.name}
                        </h3>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {loc.sector}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>KORUMA AKTİF</span>
                      </span>
                    </div>

                    {/* Address details */}
                    <div className="text-xs text-zinc-400 space-y-1 my-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-900">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <span className="truncate">{loc.address}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 pl-5">
                        {loc.district} / {loc.city} • {loc.sqMeters || 120} m²
                      </div>
                    </div>

                    {/* Assigned Playlist & Music preview */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Music2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] text-zinc-400">Yayın Akışı:</div>
                          <div className="font-bold text-white truncate text-xs">
                            {assignedPl?.title || 'Arkada Çalsın'}
                          </div>
                        </div>
                      </div>

                      {assignedPl && (
                        <button
                          onClick={() => playPlaylist(assignedPl)}
                          className="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow transition-all"
                          title="Bu şubenin müziğini çal"
                        >
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Footer: Certificate & Actions */}
                  <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between">
                    <button
                      onClick={() => {
                        // Open certificate for this venue
                        setActiveCertificateToView({
                          id: loc.id,
                          licenseNo: loc.licenseNo,
                          trackId: 'all',
                          trackTitle: `${loc.name} Tüm Yayın Hakları`,
                          artist: 'müzikbank Lisanslı Repertuar',
                          type: 'commercial_venue',
                          venueName: loc.name,
                          venueTaxOrId: loc.taxNumber || user.taxNumber || 'TR-349821901',
                          issuedDate: '2025-01-01',
                          validUntil: '2027-01-01 (Yasal Telif Muafiyeti)',
                          price: 0,
                          certificateHash: `sha256:loc_${loc.id}_${Math.random().toString(36).substring(7)}`
                        });
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                      title="Resmi Şube Telif Muafiyet Belgesini Görüntüle"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Sertifika ({loc.licenseNo})</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Şubeyi Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`"${loc.name}" şubesini silmek istediğinize emin misiniz?`)) {
                            deleteLocation(loc.id);
                            showToast('Şube silindi.');
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Şubeyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SUBSCRIPTION STATUS TAB */}
      {activeSubTab === 'subscription' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-950/40 via-zinc-950 to-zinc-950 border border-purple-500/40 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Mevcut Aktif Abonelik
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {user.subscription?.plan || 'Kafe & Butik Mekan Paketi'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  5846 Sayılı Fikir ve Sanat Eserleri Kanunu Uyarınca MESAM/MSG/MÜ-YAP/MÜYOBİR Telif Muafiyeti Aktif.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPricingModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-purple-900/40 transition-all"
                >
                  Paketi Yükselt / Değiştir
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Abonelik Durumu</span>
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  AKTİF & ONAYLI
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Denetimlerde %100 Yasal Koruma
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold mb-1">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Geçerlilik Bitiş Tarihi</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {user.subscription?.validUntil || '2026-12-31'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Otomatik Yenileme Açık
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold mb-1">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Kapsanan Şubeler</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {locations.length} Şube Aktif
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Sınırsız Şube Lisanslaması
                </div>
              </div>
            </div>

            {/* Included Features List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Paket Kapsamındaki Haklarınız
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Tüm müzikbank repertuarına ve tematik canlı radyolara sınırsız erişim</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Her şube için barkodlu, doğrulanabilir resmi Telif Muafiyet Sertifikası</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>İnternet kesintilerine karşı otomatik çevrimdışı önbellek koruması</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>7/24 Kurumsal mekan destek ve teftiş danışmanlığı</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BUSINESS PROFILE TAB */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5 max-w-3xl bg-zinc-950/80 p-6 rounded-3xl border border-zinc-900">
          <div className="border-b border-zinc-900 pb-4 mb-4">
            <h3 className="text-base font-bold text-white">İşletme ve Fatura Bilgileri</h3>
            <p className="text-xs text-zinc-400">Bu bilgiler mekan telif muafiyet belgelerinizde ve faturalarınızda yasal olarak yer alır.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Şirket / İşletme Ticari Unvanı *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Yetkili Adı Soyadı *</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">E-posta Adresi *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">İletişim Telefonu *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Vergi Kimlik No / T.C. No *</label>
              <input
                type="text"
                required
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Bağlı Olunan Vergi Dairesi *</label>
              <input
                type="text"
                required
                value={taxOffice}
                onChange={(e) => setTaxOffice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-300 font-bold mb-1.5">İşletme Logo / Avatar Görsel URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transition-all"
            >
              Profili Güncelle
            </button>
          </div>
        </form>
      )}

      {/* ADD / EDIT LOCATION MODAL */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#0c0c10] border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingLocationId ? 'Şubeyi Düzenle' : 'Yeni Mekan / Şube Ekle'}
                  </h3>
                  <p className="text-xs text-zinc-400">Şube bazlı yasal telif muafiyeti tanımlanır.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAddLocationModalOpen(false);
                  resetLocForm();
                }}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="p-6 overflow-y-auto custom-scrollbar space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Şube / Mekan Adı *</label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="Örn: Crystal Cafe & Bistro - Nişantaşı"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Sektör / Mekan Türü *</label>
                  <select
                    value={locSector}
                    onChange={(e) => setLocSector(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                  >
                    {[
                      'Kafe & Kahve Dükkanı',
                      'Restoran & Fine Dining',
                      'Butik & Moda Mağazası',
                      'Otel & Lounge Bar',
                      'Spa & Güzellik Merkezi',
                      'Spor Salonu & Fitness',
                      'Ofis & Co-working'
                    ].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Alan (m²) *</label>
                  <input
                    type="number"
                    value={locSqMeters}
                    onChange={(e) => setLocSqMeters(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Açık Adres *</label>
                <textarea
                  rows={2}
                  required
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  placeholder="Cadde, sokak, bina ve kapı no..."
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">İl *</label>
                  <input
                    type="text"
                    required
                    value={locCity}
                    onChange={(e) => setLocCity(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">İlçe *</label>
                  <input
                    type="text"
                    required
                    value={locDistrict}
                    onChange={(e) => setLocDistrict(e.target.value)}
                    placeholder="Örn: Şişli"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Bu Şubeye Atanacak Müzik Akışı</label>
                <select
                  value={locAssignedPlaylistId}
                  onChange={(e) => setLocAssignedPlaylistId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                >
                  {playlists.map(pl => (
                    <option key={pl.id} value={pl.id}>{pl.title} ({pl.curator})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddLocationModalOpen(false);
                    resetLocForm();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transition-all"
                >
                  {editingLocationId ? 'Değişiklikleri Kaydet' : 'Şubeyi Kaydet & Belge Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
