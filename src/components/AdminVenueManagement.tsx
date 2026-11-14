import React, { useMemo, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Calendar,
  CreditCard,
  ShieldCheck,
  Edit3,
  Trash2,
  FileText,
  Phone,
  Mail,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Play,
  X
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { ManagedVenue } from '../types';

const PACKAGE_OPTIONS = [
  { name: 'Kafe & Butik Mekan', price: 690, cycle: 'Aylık' as const },
  { name: 'Restoran & Lounge Bar', price: 1190, cycle: 'Aylık' as const },
  { name: 'Zincir & Kurumsal Şube', price: 1850, cycle: 'Aylık' as const },
  { name: 'Yıllık Kurumsal Paket', price: 18500, cycle: 'Yıllık' as const }
];

const SECTOR_OPTIONS = [
  'Kafe & Kahve Dükkanı',
  'Restoran & Fine Dining',
  'Butik & Moda Mağazası',
  'Otel & Lounge Bar',
  'Spa & Güzellik Merkezi',
  'Spor Salonu & Fitness',
  'Ofis & Co-working',
  'Süpermarket & AVM'
];

function formatDateTR(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function getDaysRemaining(expiresAt: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(`${expiresAt}T00:00:00`);
  if (isNaN(exp.getTime())) return 0;
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addMonthsStr(baseDateStr: string, months: number): string {
  const d = new Date(`${baseDateStr}T00:00:00`);
  if (isNaN(d.getTime())) return baseDateStr;
  d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface AdminVenueManagementProps {
  onShowToast: (msg: string) => void;
}

export const AdminVenueManagement: React.FC<AdminVenueManagementProps> = ({ onShowToast }) => {
  const {
    managedVenues,
    addManagedVenue,
    updateManagedVenue,
    deleteManagedVenue,
    renewManagedVenue,
    playlists,
    playPlaylist,
    setActiveCertificateToView
  } = useMusic();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [venueName, setVenueName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [authorizedPerson, setAuthorizedPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [sector, setSector] = useState(SECTOR_OPTIONS[0]);
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [sqMeters, setSqMeters] = useState<number>(120);
  const [packageName, setPackageName] = useState(PACKAGE_OPTIONS[0].name);
  const [packagePrice, setPackagePrice] = useState<number>(PACKAGE_OPTIONS[0].price);
  const [billingCycle, setBillingCycle] = useState<'Aylık' | 'Yıllık'>('Aylık');
  const [purchasedAt, setPurchasedAt] = useState<string>(getTodayStr());
  const [expiresAt, setExpiresAt] = useState<string>(addMonthsStr(getTodayStr(), 1));
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [paymentStatus, setPaymentStatus] = useState<'Ödendi' | 'Beklemede' | 'İptal'>('Ödendi');
  const [licenseNo, setLicenseNo] = useState('');
  const [assignedPlaylistId, setAssignedPlaylistId] = useState(playlists[0]?.id || 'pl-1');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    const today = getTodayStr();
    setEditingVenueId(null);
    setVenueName('');
    setCompanyName('');
    setAuthorizedPerson('');
    setEmail('');
    setPhone('+90 ');
    setTaxNumber('');
    setTaxOffice('');
    setSector(SECTOR_OPTIONS[0]);
    setCity('İstanbul');
    setDistrict('');
    setAddress('');
    setSqMeters(120);
    setPackageName(PACKAGE_OPTIONS[0].name);
    setPackagePrice(PACKAGE_OPTIONS[0].price);
    setBillingCycle(PACKAGE_OPTIONS[0].cycle);
    setPurchasedAt(today);
    setExpiresAt(addMonthsStr(today, 1));
    setAutoRenew(true);
    setPaymentStatus('Ödendi');
    setLicenseNo('');
    setAssignedPlaylistId(playlists[0]?.id || '');
    setNotes('');
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (v: ManagedVenue) => {
    setEditingVenueId(v.id);
    setVenueName(v.venueName);
    setCompanyName(v.companyName);
    setAuthorizedPerson(v.authorizedPerson);
    setEmail(v.email);
    setPhone(v.phone);
    setTaxNumber(v.taxNumber);
    setTaxOffice(v.taxOffice);
    setSector(v.sector);
    setCity(v.city);
    setDistrict(v.district);
    setAddress(v.address);
    setSqMeters(v.sqMeters);
    setPackageName(v.packageName);
    setPackagePrice(v.packagePrice);
    setBillingCycle(v.billingCycle);
    setPurchasedAt(v.purchasedAt);
    setExpiresAt(v.expiresAt);
    setAutoRenew(v.autoRenew);
    setPaymentStatus(v.paymentStatus);
    setLicenseNo(v.licenseNo);
    setAssignedPlaylistId(v.assignedPlaylistId || playlists[0]?.id || '');
    setNotes(v.notes || '');
    setIsFormOpen(true);
  };

  const handlePackagePresetChange = (pkgName: string) => {
    setPackageName(pkgName);
    const preset = PACKAGE_OPTIONS.find(p => p.name === pkgName);
    if (preset) {
      setPackagePrice(preset.price);
      setBillingCycle(preset.cycle);
      setExpiresAt(addMonthsStr(purchasedAt || getTodayStr(), preset.cycle === 'Yıllık' ? 12 : 1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueName.trim() || !companyName.trim()) {
      onShowToast('Lütfen mekan adı ve ticari unvan alanlarını doldurun.');
      return;
    }

    const payload = {
      venueName: venueName.trim(),
      companyName: companyName.trim(),
      authorizedPerson: authorizedPerson.trim() || 'Yetkili Belirtilmedi',
      email: email.trim(),
      phone: phone.trim(),
      taxNumber: taxNumber.trim(),
      taxOffice: taxOffice.trim(),
      sector,
      city: city.trim() || 'İstanbul',
      district: district.trim(),
      address: address.trim(),
      sqMeters: Number(sqMeters) || 100,
      packageName,
      packagePrice: Number(packagePrice) || 0,
      billingCycle,
      purchasedAt,
      expiresAt,
      autoRenew,
      paymentStatus,
      licenseNo: licenseNo.trim(),
      assignedPlaylistId,
      notes: notes.trim()
    };

    if (editingVenueId) {
      updateManagedVenue(editingVenueId, payload);
      onShowToast(`"${payload.venueName}" mekan ve paket bilgileri güncellendi.`);
    } else {
      addManagedVenue(payload);
      onShowToast(`"${payload.venueName}" yeni mekan ve abonelik kaydı oluşturuldu.`);
    }

    setIsFormOpen(false);
    resetForm();
  };

  const stats = useMemo(() => {
    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let monthlyEquivalentRevenue = 0;

    managedVenues.forEach(v => {
      const daysLeft = getDaysRemaining(v.expiresAt);
      if (daysLeft < 0 || v.paymentStatus === 'İptal') {
        expiredCount += 1;
      } else if (daysLeft <= 15) {
        expiringSoonCount += 1;
        activeCount += 1;
      } else {
        activeCount += 1;
      }

      if (v.paymentStatus === 'Ödendi' && daysLeft >= 0) {
        monthlyEquivalentRevenue += v.billingCycle === 'Yıllık' ? Math.round(v.packagePrice / 12) : v.packagePrice;
      }
    });

    return {
      total: managedVenues.length,
      activeCount,
      expiringSoonCount,
      expiredCount,
      monthlyEquivalentRevenue
    };
  }, [managedVenues]);

  const filteredVenues = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return managedVenues.filter(v => {
      const daysLeft = getDaysRemaining(v.expiresAt);
      const isExpired = daysLeft < 0 || v.paymentStatus === 'İptal';
      const isExpiring = !isExpired && daysLeft <= 15;

      if (statusFilter === 'active' && isExpired) return false;
      if (statusFilter === 'expiring' && !isExpiring) return false;
      if (statusFilter === 'expired' && !isExpired) return false;

      if (!q) return true;
      return (
        v.venueName.toLowerCase().includes(q) ||
        v.companyName.toLowerCase().includes(q) ||
        v.authorizedPerson.toLowerCase().includes(q) ||
        v.packageName.toLowerCase().includes(q) ||
        v.taxNumber.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q) ||
        v.licenseNo.toLowerCase().includes(q)
      );
    });
  }, [managedVenues, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/40 flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              Mekan, Paket & İşletme Yönetimi
            </h3>
            <p className="text-xs text-zinc-400">
              Hangi mekanın hangi paketi ne zaman satın aldığını, bitiş tarihlerini ve tüm işletme/vergi bilgilerini buradan yönetin.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-purple-950/50 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Mekan & Paket Ekle</span>
        </button>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-900">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Toplam Mekan</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{stats.total}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{stats.activeCount} aktif abonelik</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-emerald-900/40">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aktif Paketler</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats.activeCount}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Telif muafiyeti geçerli</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-amber-900/40">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Süresi Yaklaşan / Dolan</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {stats.expiringSoonCount} <span className="text-sm text-rose-400">/ {stats.expiredCount}</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">≤15 gün kalan / süresi dolmuş</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-purple-900/40">
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Aylık Paket Geliri</span>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {stats.monthlyEquivalentRevenue.toLocaleString('tr-TR')} TL
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Aktif abonelik ortalaması</div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Mekan, ticari unvan, yetkili, vergi no, paket veya şehir ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: `Tümü (${managedVenues.length})` },
              { id: 'active', label: `Aktif (${stats.activeCount})` },
              { id: 'expiring', label: `Süresi Yaklaşan (${stats.expiringSoonCount})` },
              { id: 'expired', label: `Süresi Dolan (${stats.expiredCount})` }
            ] as const
          ).map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === f.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Venue & Package Cards List */}
      {filteredVenues.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-zinc-950/70 border border-zinc-900 text-xs text-zinc-500">
          Arama veya filtre kriterine uyan mekan kaydı bulunamadı.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVenues.map((venue) => {
            const daysLeft = getDaysRemaining(venue.expiresAt);
            const isExpired = daysLeft < 0 || venue.paymentStatus === 'İptal';
            const isExpiringSoon = !isExpired && daysLeft <= 15;
            const assignedPl = playlists.find(p => p.id === venue.assignedPlaylistId);

            return (
              <div
                key={venue.id}
                className={`rounded-2xl p-5 bg-zinc-950/90 border transition-all space-y-4 ${
                  isExpired
                    ? 'border-rose-500/40'
                    : isExpiringSoon
                      ? 'border-amber-500/40'
                      : 'border-zinc-800/90 hover:border-purple-500/40'
                }`}
              >
                {/* Top Row: Venue Name + Status Badge + Quick Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-extrabold text-white truncate">
                        {venue.venueName}
                      </h4>
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/50">
                          <XCircle className="w-3 h-3" />
                          <span>SÜRESİ DOLDU ({Math.abs(daysLeft)} gün önce)</span>
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50">
                          <AlertTriangle className="w-3 h-3" />
                          <span>YAKINDA BİTİYOR ({daysLeft} gün kaldı)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>AKTİF ({daysLeft} gün kaldı)</span>
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40">
                        {venue.licenseNo}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      <strong className="text-zinc-200">{venue.companyName}</strong> • {venue.sector} • {venue.sqMeters} m²
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        renewManagedVenue(venue.id, 'Aylık');
                        onShowToast(`"${venue.venueName}" paketi +1 Ay uzatıldı.`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-950/60 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-700/40 transition-colors"
                      title="Paket süresini 1 ay uzat"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>+1 Ay Uzat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        renewManagedVenue(venue.id, 'Yıllık');
                        onShowToast(`"${venue.venueName}" paketi +1 Yıl uzatıldı.`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-purple-950/60 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-700/40 transition-colors"
                      title="Paket süresini 1 yıl uzat"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>+1 Yıl Uzat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveCertificateToView({
                          id: venue.id,
                          licenseNo: venue.licenseNo,
                          trackId: 'all',
                          trackTitle: `${venue.venueName} — ${venue.packageName} Lisansı`,
                          artist: 'Staff Lisanslı Repertuar',
                          type: 'commercial_venue',
                          venueName: `${venue.companyName} (${venue.venueName})`,
                          venueTaxOrId: venue.taxNumber || 'Belirtilmedi',
                          issuedDate: venue.purchasedAt,
                          validUntil: venue.expiresAt,
                          price: venue.packagePrice,
                          certificateHash: `sha256:venue_${venue.id}_${venue.licenseNo}`
                        });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-zinc-800 transition-colors"
                      title="Resmi Telif Muafiyet Belgesini Görüntüle"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Sertifika</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditForm(venue)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                      title="Mekan ve Paket Bilgilerini Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {deleteConfirmId === venue.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            deleteManagedVenue(venue.id);
                            setDeleteConfirmId(null);
                            onShowToast(`"${venue.venueName}" kaydı silindi.`);
                          }}
                          className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                        >
                          Sil
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-[10px]"
                        >
                          Vazgeç
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(venue.id)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600/20 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
                        title="Mekan Kaydını Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid: 3 Structured Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Satın Alınan Paket & Tarih Bilgileri */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Paket & Abonelik Süresi</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Paket:</span>
                      <span className="font-bold text-white">{venue.packageName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Tutar / Dönem:</span>
                      <span className="font-bold font-mono text-purple-300">
                        {venue.packagePrice.toLocaleString('tr-TR')} TL / {venue.billingCycle}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        Satın Alma Tarihi:
                      </span>
                      <span className="font-mono font-semibold text-zinc-200">
                        {formatDateTR(venue.purchasedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        Sona Erme Tarihi:
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isExpired
                            ? 'text-rose-400'
                            : isExpiringSoon
                              ? 'text-amber-300'
                              : 'text-emerald-400'
                        }`}
                      >
                        {formatDateTR(venue.expiresAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/70">
                      <span className="text-zinc-400">Ödeme & Oto-Yenileme:</span>
                      <span className="text-[11px] font-semibold text-zinc-200">
                        {venue.paymentStatus} • {venue.autoRenew ? 'Oto-Yenileme Açık' : 'Manuel'}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: İşletme, Yetkili & Vergi Bilgileri */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>İşletme & Vergi Bilgileri</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-200">
                      <User className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span className="truncate">Yetkili: <strong>{venue.authorizedPerson}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span className="font-mono">{venue.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span className="truncate">{venue.email || '-'}</span>
                    </div>
                    <div className="pt-1 border-t border-zinc-800/70 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Vergi Dairesi / No:</span>
                      <span className="font-mono font-semibold text-zinc-200">
                        {venue.taxOffice || '-'} / {venue.taxNumber || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Lokasyon, Atanan Yayın Akışı & Not */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Adres & Yayın Akışı</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        {venue.address ? `${venue.address}, ` : ''}
                        <strong>{venue.district ? `${venue.district} / ` : ''}{venue.city}</strong>
                      </p>

                      {assignedPl && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/30 border border-purple-800/30">
                          <div className="min-w-0 pr-2">
                            <div className="text-[10px] text-zinc-400">Atanan Playlist:</div>
                            <div className="text-[11px] font-bold text-white truncate">{assignedPl.title}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => playPlaylist(assignedPl)}
                            className="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center flex-shrink-0"
                            title="Bu mekanın yayınını çal"
                          >
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {venue.notes && (
                      <div className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-800/70">
                        Not: {venue.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT VENUE & PACKAGE MODAL */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#0c0c10] border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {editingVenueId ? 'Mekan & Paket Kaydını Düzenle' : 'Yeni Mekan & Paket Kaydı Ekle'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    İşletme bilgileri, satın alınan paket, başlangıç ve bitiş tarihleri
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs">
              {/* Section 1: Mekan & İşletme Bilgileri */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  1. İşletme & Mekan Bilgileri
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Mekan / Şube Adı *</label>
                    <input
                      type="text"
                      required
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="Örn: Crystal Cafe & Bistro - Nişantaşı"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Ticari Unvan (Şirket) *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Örn: Crystal Mekan İşletmeciliği A.Ş."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Yetkili Adı Soyadı *</label>
                    <input
                      type="text"
                      required
                      value={authorizedPerson}
                      onChange={(e) => setAuthorizedPerson(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Telefon *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+90 (212) ..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">E-posta *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@isletme.com"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Vergi No / T.C.</label>
                      <input
                        type="text"
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        placeholder="3498219012"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Vergi Dairesi</label>
                      <input
                        type="text"
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        placeholder="Mecidiyeköy V.D."
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Sektör</label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    >
                      {SECTOR_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">İl</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">İlçe</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">m²</label>
                      <input
                        type="number"
                        min={1}
                        value={sqMeters}
                        onChange={(e) => setSqMeters(Number(e.target.value) || 100)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-300 font-bold mb-1">Açık Adres</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Cadde, sokak, bina no..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Paket, Satın Alma & Bitiş Tarihi */}
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  2. Satın Alınan Paket & Geçerlilik Tarihleri
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Satın Alınan Paket *</label>
                    <select
                      value={packageName}
                      onChange={(e) => handlePackagePresetChange(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    >
                      {PACKAGE_OPTIONS.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Paket Tutarı (TL)</label>
                    <input
                      type="number"
                      min={0}
                      value={packagePrice}
                      onChange={(e) => setPackagePrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Faturalama Periyodu</label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value as 'Aylık' | 'Yıllık')}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    >
                      <option value="Aylık">Aylık</option>
                      <option value="Yıllık">Yıllık</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Satın Alma Tarihi *</label>
                    <input
                      type="date"
                      required
                      value={purchasedAt}
                      onChange={(e) => setPurchasedAt(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Sona Erme Tarihi *</label>
                    <input
                      type="date"
                      required
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Ödeme Durumu</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as 'Ödendi' | 'Beklemede' | 'İptal')}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    >
                      <option value="Ödendi">Ödendi</option>
                      <option value="Beklemede">Beklemede</option>
                      <option value="İptal">İptal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Sertifika / Lisans No</label>
                    <input
                      type="text"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      placeholder="Boş bırakılırsa otomatik üretilir"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Atanan Yayın Akışı</label>
                    <select
                      value={assignedPlaylistId}
                      onChange={(e) => setAssignedPlaylistId(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    >
                      {playlists.map(pl => (
                        <option key={pl.id} value={pl.id}>{pl.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-200 font-semibold">
                      <input
                        type="checkbox"
                        checked={autoRenew}
                        onChange={(e) => setAutoRenew(e.target.checked)}
                        className="w-4 h-4 accent-purple-500 rounded"
                      />
                      <span>Otomatik Yenileme Açık</span>
                    </label>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-zinc-300 font-bold mb-1">Yönetici Notu</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Sözleşme, şube veya fatura notları..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-purple-950/50"
                >
                  {editingVenueId ? 'Değişiklikleri Kaydet' : 'Mekan & Paketi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
