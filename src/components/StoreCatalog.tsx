import { useState } from 'react';
import { ShoppingCart, Instagram, Send, Star, Trash2, X, Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CatalogEntry } from '../hooks/useSteamCatalog';
import CheckoutModal from './CheckoutModal';

const TELEGRAM_URL = 'https://t.me/JhojhaGames';
const INSTAGRAM_URL = 'https://instagram.com/jhojha.games';

interface Props {
  catalog: CatalogEntry[];
  onRemove: (uid: string) => void;
  isAdmin: boolean;
}

function GameModal({ game, onClose, onOrder }: { game: CatalogEntry; onClose: () => void; onOrder: () => void }) {
  const [imgIndex, setImgIndex] = useState(0);
  const allImages = [game.image, ...game.screenshots];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-yellow-500/25"
        style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.15), 0 40px 80px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:text-white transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Image carousel */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          <img src={allImages[imgIndex] ?? game.image} alt={game.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

          {allImages.length > 1 && (
            <>
              <button onClick={() => setImgIndex(i => (i - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setImgIndex(i => (i + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setImgIndex(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-yellow-500 w-3' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-4 left-5">
            <h3 className="font-rajdhani text-2xl font-bold text-white leading-tight">{game.title}</h3>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
            </div>
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-inter">
              <Calendar className="w-3.5 h-3.5" /> {game.releaseDate}
            </span>
            <a href={`https://store.steampowered.com/app/${game.appId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-inter">
              <ExternalLink className="w-3.5 h-3.5" /> Steam Page
            </a>
          </div>

          <p className="text-gray-300 font-inter text-sm leading-relaxed">{game.description}</p>

          <div className="flex items-center gap-4">
            <span className="font-orbitron text-3xl font-black text-yellow-500" style={{ textShadow: '0 0 12px rgba(245,166,35,0.5)' }}>
              ₹{game.jhojhaPrice.toLocaleString('en-IN')}
            </span>
            {game.jhojhaOriginalPrice > game.jhojhaPrice && (
              <>
                <span className="text-gray-500 line-through font-inter text-sm">₹{game.jhojhaOriginalPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                  {Math.round((1 - game.jhojhaPrice / game.jhojhaOriginalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <div className="text-xs text-gray-600 font-inter">Steam Price: {game.steamPrice}</div>

          <button
            onClick={() => { onClose(); onOrder(); }}
            className="order-btn w-full py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoreCatalog({ catalog, onRemove, isAdmin }: Props) {
  const [selectedGame, setSelectedGame] = useState<CatalogEntry | null>(null);
  const [checkoutGame, setCheckoutGame] = useState<{ title: string; price: number } | null>(null);

  if (catalog.length === 0) return null;

  return (
    <section id="store-catalog" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/4 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">Steam Catalog</span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
            <span className="text-white">STORE </span>
            <span className="text-yellow-500 gold-glow">CATALOG</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-base sm:text-lg uppercase tracking-wider">
            {catalog.length} Game{catalog.length !== 1 ? 's' : ''} Available
          </p>
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {catalog.map((game, idx) => (
            <div
              key={game.uid}
              className="deal-card group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1C1C1C] to-[#0F0F0F] border border-yellow-500/15 shimmer-sweep flex flex-col"
              style={{ animation: `fadeInUp 0.5s ease ${idx * 0.07}s both` }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.4), 0 0 30px rgba(245,166,35,0.1)' }} />

              {/* Admin delete */}
              {isAdmin && (
                <button
                  onClick={() => onRemove(game.uid)}
                  className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-black/70 text-gray-500 hover:text-red-400 hover:bg-red-500/15 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Poster */}
              <div className="relative h-44 overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setSelectedGame(game)}>
                <img src={game.image} alt={game.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-black/30 to-transparent" />

                {/* Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-2.5 py-1 rounded-lg font-rajdhani text-xs font-bold uppercase tracking-wider shadow-lg">
                    {game.badge}
                  </span>
                </div>

                {/* Steam logo indicator */}
                <div className="absolute top-2.5 right-8 z-10">
                  <div className="px-2 py-0.5 rounded bg-black/60 border border-white/15 text-gray-400 font-inter text-[10px]">STEAM</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <button onClick={() => setSelectedGame(game)} className="text-left group/title mb-2">
                  <h3 className="font-rajdhani text-base font-bold text-white group-hover/title:text-yellow-400 transition-colors duration-300 line-clamp-2 leading-snug min-h-[2.75rem]">
                    {game.title}
                  </h3>
                </button>

                <p className="text-gray-600 font-inter text-xs line-clamp-2 mb-3 leading-relaxed flex-1">{game.description}</p>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-orbitron text-xl font-black text-yellow-400" style={{ textShadow: '0 0 10px rgba(245,166,35,0.5)' }}>
                    ₹{game.jhojhaPrice.toLocaleString('en-IN')}
                  </span>
                  {game.jhojhaOriginalPrice > game.jhojhaPrice && (
                    <>
                      <span className="text-xs text-gray-600 line-through font-inter">₹{game.jhojhaOriginalPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                        -{Math.round((1 - game.jhojhaPrice / game.jhojhaOriginalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/15 to-transparent mb-3" />

                {/* Buttons */}
                <div className="space-y-2 mt-auto">
                  <button
                    onClick={() => setCheckoutGame({ title: game.title, price: game.jhojhaPrice })}
                    className="order-btn w-full py-2.5 rounded-xl font-rajdhani text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Order Now
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="py-2 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:-translate-y-0.5 transition-all duration-300">
                      <Instagram className="w-3 h-3" /> Instagram
                    </a>
                    <a href={`${TELEGRAM_URL}?text=I%20want%20to%20order%20${encodeURIComponent(game.title)}`} target="_blank" rel="noopener noreferrer" className="py-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-rajdhani text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all duration-300">
                      <Send className="w-3 h-3" /> Telegram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedGame && (
        <GameModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onOrder={() => {
            setCheckoutGame({ title: selectedGame.title, price: selectedGame.jhojhaPrice });
            setSelectedGame(null);
          }}
        />
      )}

      {checkoutGame && (
        <CheckoutModal
          gameName={checkoutGame.title}
          price={checkoutGame.price}
          onClose={() => setCheckoutGame(null)}
        />
      )}
    </section>
  );
}
