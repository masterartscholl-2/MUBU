import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  ShieldCheck, 
  Building, 
  CreditCard, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMusic } from '../context/MusicContext';
import { CartItem } from '../types';

export const CheckoutModal: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    clearCart, 
    completePurchase, 
    setActiveCertificateToView,
    user 
  } = useMusic();

  const [venueName, setVenueName] = useState(user.companyName || 'Crystal Cafe Nişantaşı');
  const [taxNo, setTaxNo] = useState('TR-349821901');
  const [paymentStep, setPaymentStep] = useState<'cart' | 'processing' | 'success'>('cart');
  const [generatedLicenses, setGeneratedLicenses] = useState<any[]>([]);

  if (!isCartOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('processing');

    setTimeout(() => {
      const createdLicenses = completePurchase(venueName, taxNo);
      setGeneratedLicenses(createdLicenses);
      setPaymentStep('success');

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err);
      }
    }, 1200);
  };

  const handleViewCertificate = (lic: any) => {
    setIsCartOpen(false);
    setActiveCertificateToView(lic);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-[#0c0c10] border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {paymentStep === 'success' ? 'Lisans Satın Alma Başarılı' : 'Sepetim & Lisans Satın Alma'}
              </h3>
              <p className="text-xs text-zinc-400">
                {paymentStep === 'success' 
                  ? 'Telif Muafiyet Belgeleriniz üretildi ve hesabınıza tanımlandı.' 
                  : '%100 Ticari Kullanım ve Mekan Yayın İzni'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCartOpen(false);
              setPaymentStep('cart');
            }}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {paymentStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
                  <p className="text-sm font-medium">Sepetinizde henüz parça bulunmuyor.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    Kataloğa Göz At
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Cart items list */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Seçilen Parçalar ({cart.length})
                    </div>
                    {cart.map((item, idx) => (
                      <div
                        key={`${item.track.id}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-900"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.track.coverUrl}
                            alt={item.track.title}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">
                              {item.track.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {item.track.artist}
                            </p>
                            <span className="text-[10px] text-purple-400 font-semibold bg-purple-950/60 border border-purple-800/40 px-1.5 py-0.5 rounded">
                              Ticari Mekan Yayını (Ömür Boyu)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold font-mono text-white">
                            {item.price} TL
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.track.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Business & Venue Info for Certificate */}
                  <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-900 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                      <Building className="w-4 h-4 text-purple-400" />
                      <span>İşletme / Mekan Bilgileri (Sertifikaya Basılacak)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 mb-1">Mekan / Şirket Unvanı *</label>
                        <input
                          type="text"
                          required
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                          placeholder="Örn: Nişantaşı Cafe Bar A.Ş."
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Vergi No / T.C. No *</label>
                        <input
                          type="text"
                          required
                          value={taxNo}
                          onChange={(e) => setTaxNo(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-purple-500"
                          placeholder="Örn: TR-1234567890"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1 text-[11px] text-zinc-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>
                        Bu bilgiler resmi <strong>Telif Muafiyet Belgesi</strong> üzerine dijital barkod ve mühür ile işlenir. Denetimlerde geçerlidir.
                      </span>
                    </div>
                  </div>

                  {/* Summary & Checkout Button */}
                  <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-500">Toplam Tutar:</span>
                      <div className="text-xl font-extrabold text-white font-mono">
                        {totalAmount} TL
                      </div>
                    </div>

                    {/* Purple gradient button */}
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-xl shadow-purple-900/50 transition-all active:scale-95"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Lisansları Onayla ve Satın Al</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {paymentStep === 'processing' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-white">Lisans ve Sertifika Üretiliyor...</p>
              <p className="text-xs text-zinc-400">MESAM/MSG muafiyet kodu oluşturuluyor.</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    İşlem Başarıyla Tamamlandı!
                  </h4>
                  <p className="text-xs text-emerald-400/80">
                    Lisans belgeleriniz işletmeniz adına oluşturuldu. Aşağıdan belgenizi görüntüleyebilir veya indirebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400">Üretilen Telif Belgeleri:</div>
                {generatedLicenses.map((lic, i) => (
                  <div
                    key={lic.id || i}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{lic.trackTitle}</h4>
                      <p className="text-[11px] text-zinc-400">Lisans No: {lic.licenseNo}</p>
                    </div>

                    <button
                      onClick={() => handleViewCertificate(lic)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Belgeyi Aç / Yazdır</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setPaymentStep('cart');
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900 hover:text-white"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
