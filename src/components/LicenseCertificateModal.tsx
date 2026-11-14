import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  QrCode, 
  CheckCircle, 
  Award,
  Building,
  Calendar,
  Hash
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const LicenseCertificateModal: React.FC = () => {
  const { activeCertificateToView, setActiveCertificateToView } = useMusic();

  if (!activeCertificateToView) return null;

  const lic = activeCertificateToView;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-purple-500/50 rounded-3xl shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col max-h-[92vh] print:border-none print:shadow-none print:max-h-full print:bg-white print:text-black">
        
        {/* Modal Top Bar (hidden on print) */}
        <div className="p-4 bg-black/90 border-b border-zinc-900 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Resmi Telif Muafiyet Sertifikası
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Kaydet</span>
            </button>

            <button
              onClick={() => setActiveCertificateToView(null)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Clean & Official for Venue Inspections) */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#0e0e13] to-black text-white print:text-black print:bg-white print:p-6">
          <div className="border-2 border-purple-500/30 rounded-2xl p-8 relative print:border-black">
            
            {/* Watermark seal in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <Award className="w-96 h-96 text-purple-400" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black text-white tracking-tight font-sans print:text-black">
                    Staff
                  </span>
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold print:text-zinc-600">
                  Telifsiz Müzik Platformu & Lisanslama Kuruluşu
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/60 px-2.5 py-1 rounded-full uppercase font-bold print:border-black print:text-black print:bg-transparent">
                  TİCARİ MEKAN MUAFİYET BELGESİ
                </span>
                <div className="text-xs text-zinc-400 font-mono mt-1 print:text-zinc-600">
                  Sertifika No: <strong className="text-white print:text-black">{lic.licenseNo}</strong>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-xl font-extrabold text-purple-300 tracking-wide uppercase print:text-black">
                Mekan Fon Müziği Telif Muafiyet Belgesi
              </h2>
              <p className="text-xs text-zinc-400 mt-1 print:text-zinc-600">
                5846 Sayılı Fikir ve Sanat Eserleri Kanunu Uyarınca Umuma Açık Mahallerde Yayın İzni
              </p>
            </div>

            {/* License details table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 print:bg-zinc-50 print:border-zinc-300">
              <div className="space-y-2 text-xs">
                <div className="text-zinc-400 print:text-zinc-600">Lisanslanan İşletme / Mekan:</div>
                <div className="font-bold text-white text-sm print:text-black flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-400 print:text-black" />
                  <span>{lic.venueName}</span>
                </div>
                <div className="text-zinc-400 text-[11px] font-mono print:text-zinc-600">
                  Vergi / T.C. No: {lic.venueTaxOrId || 'TR-349821901'}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-zinc-400 print:text-zinc-600">Lisans Kapsamındaki Eser:</div>
                <div className="font-bold text-white text-sm print:text-black">
                  "{lic.trackTitle}"
                </div>
                <div className="text-zinc-400 text-[11px] print:text-zinc-600">
                  Sanatçı: {lic.artist}
                </div>
              </div>
            </div>

            {/* Legal text */}
            <div className="text-[11px] text-zinc-400 leading-relaxed space-y-2.5 my-6 text-justify border-y border-zinc-900 py-4 print:text-zinc-800 print:border-zinc-300">
              <p>
                İşbu belge, yukarıda unvanı belirtilen ticari mekanın, söz konusu müzik eserini işletme içerisinde (kafe, restoran, otel, mağaza vb.) ticari fon müziği olarak yayınlama hakkına sahip olduğunu ve ilgili eserin <strong>tüm umuma iletim haklarının doğrudan Staff Platformu tarafından devralındığını</strong> tevsik eder.
              </p>
              <p>
                Eser sahipleri ve yapımcılar, MESAM, MSG, MÜ-YAP, MÜYOBİR gibi meslek birliklerine üye olmaksızın veya haklarını bağımsız olarak yöneterek doğrudan lisanslamıştır. Bu sebeple <strong>işletmeden meslek birliklerince ilave mekan telif ücreti talep edilemez</strong>.
              </p>
            </div>

            {/* Footer with verification hash & stamp */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white p-1 rounded-lg border border-purple-500/40 print:border-black flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-black" />
                </div>
                <div className="text-[10px] text-zinc-400 font-mono print:text-zinc-600">
                  <div>Dijital Doğrulama Kodu:</div>
                  <div className="text-purple-300 print:text-black font-bold truncate max-w-xs">
                    {lic.certificateHash}
                  </div>
                  <div>Düzenleme Tarihi: {lic.issuedDate}</div>
                </div>
              </div>

              {/* Official Stamp */}
              <div className="text-right">
                <div className="inline-block p-2 rounded-xl border border-purple-500/50 bg-purple-950/20 text-center print:border-black print:bg-transparent">
                  <div className="text-[10px] font-bold text-purple-300 print:text-black uppercase">
                    Staff Lisanslama Kuruluşu
                  </div>
                  <div className="text-[9px] text-zinc-500 print:text-zinc-600">
                    Elektronik Güvenli İmzalı & Onaylı
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
