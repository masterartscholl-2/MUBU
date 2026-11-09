import React from 'react';
import { X, Check, Sparkles, Building, Store, Zap, ShieldCheck } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const PricingModal: React.FC = () => {
  const { isPricingModalOpen, setIsPricingModalOpen, setUser, user } = useMusic();

  if (!isPricingModalOpen) return null;

  const plans = [
    {
      name: 'Kafe & Butik Mekan',
      price: '690 TL',
      period: 'aylık',
      desc: 'Tek şubeli kafe, bistro, butik veya güzellik merkezleri için sınırsız ticari müzik yayını.',
      features: [
        'Tüm müzikbank kataloğuna ve radyolarına sınırsız erişim',
        'MESAM / MSG / MÜ-YAP Yasal Muafiyet Belgesi',
        '7/24 Kesintisiz tematik mekan radyoları',
        'Özelleştirilebilir mekan çalma listeleri',
        'İnternet kesintisine karşı çevrimdışı önbellek',
        'Resmi denetim koruma garantisi'
      ],
      popular: true,
      buttonText: 'Paketi Seç & Abone Ol',
      action: () => {
        setUser(prev => ({
          ...prev,
          subscription: {
            plan: 'Kafe/Mekan Aylık',
            status: 'active',
            validUntil: '2026-12-31'
          }
        }));
        alert('Tebrikler! Kafe & Butik Mekan aboneliğiniz aktif edildi. Yasal muafiyet sertifikanız profilinize tanımlandı.');
        setIsPricingModalOpen(false);
      }
    },
    {
      name: 'Restoran & Lounge Bar',
      price: '1.190 TL',
      period: 'aylık',
      desc: 'Fine dining restoranlar, otel lounge ve kokteyl barlar için özel kürasyonlu ses yayını.',
      features: [
        'Yüksek çözünürlüklü kayıpsız ses akışı',
        'Her alana özel ayrı müzik kanalları (Teras / Salon / Bar)',
        'Resmi Kurumsal Telif Muafiyet Sertifikası',
        'Akşam ve gündüz için otomatik mod geçişleri',
        'Öncelikli teknik ve telif destek hattı'
      ],
      popular: false,
      buttonText: 'Paketi Seç & Abone Ol',
      action: () => {
        setUser(prev => ({
          ...prev,
          subscription: {
            plan: 'Kafe/Mekan Aylık',
            status: 'active',
            validUntil: '2026-12-31'
          }
        }));
        alert('Tebrikler! Restoran & Lounge Bar mekan paketiniz aktif edildi.');
        setIsPricingModalOpen(false);
      }
    },
    {
      name: 'Zincir & Kurumsal Şube',
      price: '1.850 TL',
      period: 'aylık',
      desc: 'Çok şubeli zincir mağazalar, oteller, spor salonu zincirleri ve kurumsal markalar için.',
      features: [
        'Çoklu şube merkezi kontrol paneli',
        'Her şube adına ayrı Telif Muafiyet Sertifikası',
        'Markaya özel müzik direktörlüğü & ses kimliği',
        'Şube bazlı saatlik müzik planlama (Sabah/Öğle/Akşam)',
        'Öncelikli 7/24 kurumsal destek',
        'Otomasyon API ve anons entegrasyonu'
      ],
      popular: false,
      buttonText: 'Kurumsal Abonelik Başlat',
      action: () => {
        setUser(prev => ({
          ...prev,
          subscription: {
            plan: 'Zincir Mağaza',
            status: 'active',
            validUntil: '2026-12-31'
          }
        }));
        alert('Tebrikler! Kurumsal zincir paketiniz aktif edildi.');
        setIsPricingModalOpen(false);
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl bg-[#0c0c10] border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              müzikbank Mekan Lisanslama Paketleri
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              İşletmenizde yasal güvenceyle telifsiz müzik çalın, ceza risklerini ortadan kaldırın.
            </p>
          </div>

          <button
            onClick={() => setIsPricingModalOpen(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                  p.popular 
                    ? 'bg-gradient-to-b from-purple-950/30 to-zinc-950 border-purple-500 shadow-xl shadow-purple-950/50' 
                    : 'bg-zinc-950/80 border-zinc-900 hover:border-zinc-800'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    En Çok Tercih Edilen
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-white mb-1">{p.name}</h3>
                  <p className="text-xs text-zinc-400 mb-4">{p.desc}</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-white font-mono">{p.price}</span>
                    <span className="text-xs text-zinc-500">/{p.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                    {p.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={p.action}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all ${
                    p.popular
                      ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40'
                      : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                  }`}
                >
                  {p.buttonText}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-purple-400 flex-shrink-0" />
              <div className="text-xs text-zinc-400">
                Tüm paketlerimiz 5846 Sayılı FSEK kapsamında <strong>Meslek Birlikleri Muafiyet Belgesi</strong> ile birlikte düzenlenir.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
