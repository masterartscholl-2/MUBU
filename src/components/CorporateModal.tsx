import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Scale, 
  FileCheck2, 
  Building2, 
  CheckCircle, 
  AlertTriangle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const CorporateModal: React.FC = () => {
  const { 
    isCorporateModalOpen, 
    setIsCorporateModalOpen, 
    user, 
    setActiveCertificateToView 
  } = useMusic();

  if (!isCorporateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl bg-[#0c0c10] border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Kurumsal Müzik Yayını & Yasal Telif Muafiyeti
              </h3>
              <p className="text-xs text-zinc-400">
                5846 Sayılı Fikir ve Sanat Eserleri Kanunu Uyarınca Mekan Hakları
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCorporateModalOpen(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-zinc-300">
          
          {/* Active Certificates of User */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <FileCheck2 className="w-4 h-4 text-purple-400" />
                <span>Tanımlı Telif Muafiyet Belgeleriniz ({user.licenses.length})</span>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">
                {user.companyName}
              </span>
            </div>

            {user.licenses.length === 0 ? (
              <p className="text-zinc-400 text-xs">Henüz düzenlenmiş belgeniz bulunmuyor.</p>
            ) : (
              <div className="space-y-2">
                {user.licenses.map(lic => (
                  <div key={lic.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-900">
                    <div>
                      <div className="font-bold text-white">{lic.trackTitle}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">No: {lic.licenseNo} • {lic.venueName}</div>
                    </div>
                    <button
                      onClick={() => {
                        setIsCorporateModalOpen(false);
                        setActiveCertificateToView(lic);
                      }}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600"
                    >
                      Sertifikayı Aç
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legal FAQ Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Staff ile İşletmeniz Neden Yasal Olarak Güvendedir?
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Doğrudan Eser Sahibi Lisansı
                </h5>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Staff platformundaki tüm şarkıların umuma iletim, mekan çalma ve çoğaltma hakları yapımcı ve bestecilerden doğrudan sözleşmeyle devralınmıştır.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  MESAM / MSG Muafiyeti
                </h5>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  5846 sayılı FSEK Madde 41 uyarınca, meslek birliklerine kayıtlı olmayan bağımsız eserlerin ticari mekanlarda çalınması durumunda birliklere telif ödenmesi gerekmez.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Barkodlu Denetim Belgesi
                </h5>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Kültür Bakanlığı veya meslek birliklerinin denetimlerinde ibraz edilmek üzere işletmeniz adına barkodlu ve doğrulanabilir Muafiyet Sertifikası verilir.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Müşteri Memnuniyeti ve Akustik Kalite
                </h5>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Rastgele radyo yerine konukların sohbetini engellemeyen, masa devir hızını optimize eden küratörlü fon müzikleri çalarsınız.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
