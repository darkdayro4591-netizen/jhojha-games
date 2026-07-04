import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, ShoppingCart, Star, Instagram, Send, SlidersHorizontal } from 'lucide-react';
import games from '../data/games';
import CheckoutModal from './CheckoutModal';

const INSTAGRAM_URL = 'https://instagram.com/jhojha.games';
const TELEGRAM_URL = 'https://t.me/JhojhaGames';

const GENRE_FILTERS = ['All', 'Action', 'Horror', 'Racing', 'Open World', 'RPG', 'Multiplayer'];

interface UnifiedGame {
  uid: string;
  title: string;
  category: string;
  image: string;
  salePrice: number;
  originalPrice: number;
  discount: number;
  badge?: string;
  description: string;
}

interface Props {
  onClose: () => void;
}

export default function SearchModal({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkout, setCheckout] = useState<{ title: string; price: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allGames: UnifiedGame[] = useMemo(() => games.map(g => ({
    uid: String(g.id),
    title: g.title,
    category: g.category,
    image: g.image,
    salePrice: g.salePrice,
    originalPrice: g.originalPrice,
    discount: g.discount,
    badge: g.badge,
    description: g.description,
  })), []);

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return allGames
      .filter(g => g.title.toLowerCase().includes(q))
      .slice(0, 5)
      .map(g => g.title);
  }, [query, allGames]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allGames.filter(g => {
      const matchesQuery =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q);
      const matchesFilter =
        activeFilter === 'All' ||
        g.category.toLowerCase() === activeFilter.toLowerCase();
      return matchesQuery && matchesFilter;
    });
  }, [query, activeFilter, allGames]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const applySuggestion = (title: string) => {
    setQuery(title);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const hasResults = results.length > 0;
  const isSearching = query.trim().length > 0 || activeFilter !== 'All';

  return (
    <>
      <div
        className="fixed inset-0 z-[180] flex flex-col"
        style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(16px)' }}
      >
        {/* ── Top bar ── */}
        <div className="flex-shrink-0 border-b border-yellow-500/15 bg-[#0A0A0A]/80">
          <div className="max-w-4xl mx-auto px-4 py-4">
            {/* Search input row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500/60" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search games — GTA, Outlast, Last of Us..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-yellow-500/25 focus:border-yellow-500/60 text-white font-inter text-base placeholder:text-gray-600 focus:outline-none focus:bg-white/8 transition-all duration-200"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-[#141414] border border-yellow-500/20 overflow-hidden z-10 shadow-2xl">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onMouseDown={() => applySuggestion(s)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-yellow-500/8 transition-colors duration-150 border-b border-white/5 last:border-0"
                      >
                        <Search className="w-3.5 h-3.5 text-yellow-500/50 flex-shrink-0" />
                        <span className="font-inter text-sm text-gray-300">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="flex-shrink-0 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Genre filter chips */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
              <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-500/60 flex-shrink-0" />
              {GENRE_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg font-rajdhani text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    activeFilter === f
                      ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:border-yellow-500/40 hover:text-yellow-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results area ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">

            {/* Result count */}
            {isSearching && (
              <div className="flex items-center gap-2 mb-5">
                <span className="font-rajdhani text-sm font-bold uppercase tracking-widest text-gray-500">
                  {hasResults ? `${results.length} result${results.length !== 1 ? 's' : ''} found` : 'No results'}
                </span>
                {query && (
                  <>
                    <span className="text-gray-700">for</span>
                    <span className="font-rajdhani text-sm font-bold text-yellow-500">"{query}"</span>
                  </>
                )}
              </div>
            )}

            {/* ── NO RESULTS ── */}
            {isSearching && !hasResults && (
              <div className="flex flex-col items-center text-center py-16 px-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.1), rgba(245,166,35,0.03))', border: '1px solid rgba(245,166,35,0.2)' }}
                >
                  <Search className="w-9 h-9 text-yellow-500/50" />
                </div>
                <h3 className="font-orbitron text-xl font-black text-white mb-2">
                  Game Not Found
                </h3>
                <p className="font-inter text-sm text-gray-400 leading-relaxed max-w-sm mb-2">
                  <span className="text-yellow-400 font-semibold">"{query}"</span> is not currently available in our catalog.
                </p>
                <p className="font-inter text-sm text-gray-500 leading-relaxed max-w-sm mb-8">
                  Contact Jhojha Games to request this game — we add new titles regularly!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-[1.02] transition-all duration-300"
                  >
                    <Instagram className="w-4 h-4" /> Contact on Instagram
                  </a>
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] transition-all duration-300"
                  >
                    <Send className="w-4 h-4" /> Join Telegram
                  </a>
                </div>
              </div>
            )}

            {/* ── DEFAULT / BROWSE STATE ── */}
            {!isSearching && (
              <div className="mb-6">
                <p className="font-rajdhani text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">
                  All Games ({allGames.length})
                </p>
              </div>
            )}

            {/* ── GAME CARDS GRID ── */}
            {(hasResults || !isSearching) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(isSearching ? results : allGames).map((game, idx) => (
                  <div
                    key={game.uid}
                    className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1C1C1C] to-[#0F0F0F] border border-yellow-500/15 hover:border-yellow-500/40 transition-all duration-300 flex flex-col"
                    style={{
                      animation: `fadeInUp 0.4s ease ${Math.min(idx, 8) * 0.05}s both`,
                      boxShadow: '0 0 0 0 rgba(245,166,35,0)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 25px rgba(245,166,35,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(245,166,35,0)')}
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden flex-shrink-0">
                      <img
                        src={game.image}
                        alt={game.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-black/30 to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                        {game.badge && (
                          <span className="badge-new px-2.5 py-0.5 rounded-md font-rajdhani text-xs font-bold uppercase tracking-wider">
                            {game.badge}
                          </span>
                        )}
                        {game.discount > 0 && (
                          <span className="badge-sale px-2.5 py-0.5 rounded-md font-rajdhani text-xs font-bold uppercase tracking-wider">
                            -{game.discount}%
                          </span>
                        )}
                      </div>

                      {/* Category */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 border border-yellow-500/20 text-yellow-500/70 font-rajdhani text-[10px] font-bold uppercase tracking-wider">
                          {game.category}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 border border-yellow-500/20">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-rajdhani font-bold text-yellow-500">5.0</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-rajdhani text-base font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2 leading-snug min-h-[2.75rem] mb-3">
                        {game.title}
                      </h3>

                      {/* Pricing */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="font-orbitron text-xl font-black text-yellow-400"
                          style={{ textShadow: '0 0 10px rgba(245,166,35,0.5)' }}
                        >
                          ₹{game.salePrice.toLocaleString('en-IN')}
                        </span>
                        {game.originalPrice > game.salePrice && (
                          <>
                            <span className="text-xs text-gray-600 line-through font-inter">
                              ₹{game.originalPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                              {game.discount}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/15 to-transparent mb-3" />

                      {/* Order Now */}
                      <button
                        onClick={() => setCheckout({ title: game.title, price: game.salePrice })}
                        className="order-btn mt-auto w-full py-2.5 rounded-xl font-rajdhani text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Order Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout modal on top */}
      {checkout && (
        <CheckoutModal
          gameName={checkout.title}
          price={checkout.price}
          onClose={() => setCheckout(null)}
        />
      )}
    </>
  );
}
