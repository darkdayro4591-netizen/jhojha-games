import { useState } from 'react';
import {
  X, Search, Loader2, CheckCircle2, AlertCircle, Plus,
  Star, Calendar, Tag, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react';
import { extractAppId, fetchSteamGame, type SteamGameData } from '../lib/steamApi';
import type { CatalogEntry } from '../hooks/useSteamCatalog';

const BADGES = ['NEW', 'HOT DEAL', 'SALE', 'PRE-ORDER', 'BEST SELLER', 'LIMITED'];

interface Props {
  onAdd: (data: SteamGameData, price: number, origPrice: number, badge: string) => CatalogEntry;
  onClose: () => void;
}

export default function SteamImport({ onAdd, onClose }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<SteamGameData | null>(null);
  const [jhojhaPrice, setJhojhaPrice] = useState('');
  const [jhojhaOriginalPrice, setJhojhaOriginalPrice] = useState('');
  const [badge, setBadge] = useState('SALE');
  const [added, setAdded] = useState(false);
  const [showScreenshots, setShowScreenshots] = useState(false);

  const handleFetch = async () => {
    const appId = extractAppId(input);
    if (!appId) {
      setError('Enter a valid Steam App ID (e.g. 252490) or store URL.');
      return;
    }
    setLoading(true);
    setError('');
    setPreview(null);
    setAdded(false);
    try {
      const data = await fetchSteamGame(appId);
      setPreview(data);
      const numericPrice = parseFloat(
        data.steamPrice.replace(/[^0-9.]/g, '')
      );
      if (!isNaN(numericPrice) && numericPrice > 0) {
        setJhojhaOriginalPrice(Math.round(numericPrice).toString());
        setJhojhaPrice(Math.round(numericPrice * 0.6).toString());
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch game data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!preview) return;
    const price = parseFloat(jhojhaPrice);
    const origPrice = parseFloat(jhojhaOriginalPrice);
    if (isNaN(price) || price <= 0) {
      setError('Enter a valid Jhojha sale price.');
      return;
    }
    onAdd(preview, price, origPrice || price, badge);
    setAdded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFetch();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-yellow-500/30"
        style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.2), 0 40px 80px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#1A1A1A]/95 backdrop-blur border-b border-yellow-500/15">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Plus className="w-4 h-4 text-black" />
            </div>
            <h2 className="font-orbitron text-base font-black text-white uppercase tracking-wider">
              Import from Steam
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Input */}
          <div>
            <label className="font-rajdhani text-xs font-bold text-yellow-500 uppercase tracking-widest block mb-2">
              Steam App ID or Store URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 252490  or  store.steampowered.com/app/252490/..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 font-inter text-sm focus:outline-none focus:border-yellow-500/60 focus:bg-white/8 transition-all"
              />
              <button
                onClick={handleFetch}
                disabled={loading || !input.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-rajdhani font-bold uppercase tracking-wider text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-400 hover:to-amber-400 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? 'Fetching…' : 'Fetch'}
              </button>
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-400 text-xs font-inter">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div className="space-y-5 animate-[fadeInUp_0.3s_ease]">
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

              {/* Game preview card */}
              <div className="rounded-xl overflow-hidden border border-yellow-500/20 bg-white/3">
                <div className="relative h-40 overflow-hidden">
                  <img src={preview.image} alt={preview.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-rajdhani text-xl font-bold text-white leading-tight">{preview.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-inter">
                        <Calendar className="w-3 h-3" /> {preview.releaseDate}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-yellow-400 font-inter">
                        <Tag className="w-3 h-3" /> Steam: {preview.steamPrice}
                        {preview.steamOriginalPrice && preview.steamDiscountPct > 0 && (
                          <span className="text-gray-500 line-through ml-1">{preview.steamOriginalPrice}</span>
                        )}
                      </span>
                      <a
                        href={`https://store.steampowered.com/app/${preview.appId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-inter"
                      >
                        <ExternalLink className="w-3 h-3" /> Steam Page
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-400 font-inter text-xs leading-relaxed line-clamp-3">{preview.description}</p>

                  {/* Screenshots toggle */}
                  {preview.screenshots.length > 0 && (
                    <button
                      onClick={() => setShowScreenshots(v => !v)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-yellow-500/70 hover:text-yellow-500 font-rajdhani font-bold uppercase tracking-wider transition-colors"
                    >
                      <Star className="w-3 h-3" />
                      {preview.screenshots.length} Screenshots
                      {showScreenshots ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                  {showScreenshots && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {preview.screenshots.map((s, i) => (
                        <img key={i} src={s} alt="" className="rounded-lg w-full aspect-video object-cover border border-white/10" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & badge config */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-rajdhani text-xs font-bold text-yellow-500 uppercase tracking-widest block mb-2">
                    Jhojha Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    value={jhojhaPrice}
                    onChange={e => setJhojhaPrice(e.target.value)}
                    placeholder="e.g. 499"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-inter text-sm focus:outline-none focus:border-yellow-500/60 transition-all"
                  />
                </div>
                <div>
                  <label className="font-rajdhani text-xs font-bold text-yellow-500 uppercase tracking-widest block mb-2">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={jhojhaOriginalPrice}
                    onChange={e => setJhojhaOriginalPrice(e.target.value)}
                    placeholder="e.g. 1999"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-inter text-sm focus:outline-none focus:border-yellow-500/60 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="font-rajdhani text-xs font-bold text-yellow-500 uppercase tracking-widest block mb-2">
                  Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {BADGES.map(b => (
                    <button
                      key={b}
                      onClick={() => setBadge(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider transition-all ${badge === b ? 'bg-yellow-500 text-black' : 'bg-white/5 border border-white/15 text-gray-400 hover:border-yellow-500/40 hover:text-yellow-500'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add button */}
              {added ? (
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 font-rajdhani font-bold uppercase tracking-wider text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Added to Catalog!
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-orbitron font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:from-yellow-400 hover:to-amber-400 transition-all hover:shadow-[0_0_25px_rgba(245,166,35,0.4)]"
                >
                  <Plus className="w-4 h-4" />
                  Add to Store Catalog
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
