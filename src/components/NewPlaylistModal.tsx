import React, { useState } from 'react';
import { X, PlusCircle, Image as ImageIcon, Music2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
];

export const NewPlaylistModal: React.FC = () => {
  const { 
    isNewPlaylistModalOpen, 
    setIsNewPlaylistModalOpen, 
    createPlaylist, 
    setSelectedPlaylistId, 
    setActiveTab 
  } = useMusic();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]);

  if (!isNewPlaylistModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newId = createPlaylist(title, description, coverUrl);
    setIsNewPlaylistModalOpen(false);
    setSelectedPlaylistId(newId);
    setActiveTab('playlist-detail');
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-[#0c0c10] border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Yeni Çalma Listesi Oluştur</h3>
              <p className="text-xs text-zinc-400">Mekanınıza özel telifsiz müzik akışı hazırlayın.</p>
            </div>
          </div>

          <button
            onClick={() => setIsNewPlaylistModalOpen(false)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Liste Başlığı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Cuma Akşamı Terasa Özel Caz & Bossa"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mekan konuklarına sakin ve sıcak bir atmosfer sunar..."
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              Kapak Görseli Seçin veya Özel URL Girin
            </label>
            <div className="flex gap-2 mb-3">
              {PRESET_COVERS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCoverUrl(preset)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                    coverUrl === preset ? 'border-purple-500 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt={`Kapak ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://... özel görsel linki"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-zinc-900">
            <button
              type="button"
              onClick={() => setIsNewPlaylistModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transition-all"
            >
              Listeyi Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
