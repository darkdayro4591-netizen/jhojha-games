import { useState } from 'react';
import { Flame, ShoppingCart, Instagram, Send, Loader2 } from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import { useGames } from '../hooks/useGames';

const INSTAGRAM_URL = 'https://instagram.com/jhojha.games';
const TELEGRAM_URL  = 'https://t.me/JhojhaGames';

const BADGE_STYLES: Record<string, { color: string; shadow: string }> = {
  'PRE-ORDER':   { color: 'from-yellow-500 to-amber-600',  shadow: 'rgba(245,166,35,0.7)'  },
  'SALE':        { color: 'from-yellow-400 to-yellow-600', shadow: 'rgba(245,166,35,0.7)'  },
  'HOT DEAL':    { color: 'from-red-500 to-orange-600',    shadow: 'rgba(239,68,68,0.7)'   },
  'BEST SELLER': { color: 'from-emerald-500 to-green-600', shadow: 'rgba(16,185,129,0.7)'  },
  'NEW':         { color: 'from-blue-500 to-purple-600',   shadow: 'rgba(99,102,241,0.7)'  },
};
const DEFAULT_BADGE = { color: 'from-yellow-400 to-yellow-600', shadow: 'rgba(245,166,35,0.7)' };

export default function FeaturedDeals() {
  const { games, loading } = useGames();
  const [checkoutDeal, setCheckoutDeal] = useState<{ title: string; salePrice: number } | null>(null);

  // Show only featured games (up to 6), fall back to first 6 if none featured
  const featured = games.filter(g => g.isFeatured && g.inStock).slice(0, 6);
  const deals    = featured.length > 0 ? featured : games.filter(g => g.inStock).slice(0, 6);

  return (
    <section id="deals" className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/6 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/40 bg-red-500/10 mb-5">
            <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span className="text-red-400 text-xs font-rajdhani font-700 uppercase tracking-widest">
              Featured Gaming Deals
            </span>
          </div>
          <h2 className="font-orbitron text-2xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">
            <span className="text-yellow-500 gold-glow">🔥 Featured </span>
            <span className="text-white">Gaming </span>
            <span className="text-yellow-500 gold-glow">Deals 🔥</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-base sm:text-lg uppercase tracking-[0.2em]">
            Premium PC Games At Affordable Prices
          </p>
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-yellow-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-rajdhani text-sm uppercase tracking-widest">Loading deals…</span>
          </div>
        )}

        {/* Cards grid */}
        {!loading && deals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {deals.map((deal, idx) => {
              const badgeName   = (deal.badge || '').toUpperCase();
              const badgeStyle  = BADGE_STYLES[badgeName] || DEFAULT_BADGE;
              const discountPct = deal.originalPrice > 0
                ? Math.round((1 - deal.salePrice / deal.originalPrice) * 100)
                : deal.discount;

              return (
                <div
                  key={deal.id}
                  className="deal-card group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1C1C1C] to-[#0F0F0F] border border-yellow-500/15 shimmer-sweep flex flex-col"
                  style={{ animation: `fadeInUp 0.6s ease ${idx * 0.1}s both` }}
                >
                  {/* Hover border glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `0 0 0 1px rgba(245,166,35,0.5), 0 0 30px rgba(245,166,35,0.15)` }} />

                  {/* Game Poster */}
                  <div className="relative h-64 sm:h-72 overflow-hidden flex-shrink-0">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/111/FFD700?text=Game'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-black/40 to-transparent" />

                    {/* Badge */}
                    {deal.badge && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="relative">
                          <div
                            className="absolute inset-0 blur-md opacity-70 rounded-lg"
                            style={{ background: `radial-gradient(circle, ${badgeStyle.shadow}, transparent)` }}
                          />
                          <span className={`relative bg-gradient-to-r ${badgeStyle.color} text-black px-3 py-1 rounded-lg font-rajdhani text-xs font-bold uppercase tracking-wider shadow-lg`}>
                            {deal.badge}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-rajdhani text-lg font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 mb-3 line-clamp-2 leading-snug min-h-[3rem]">
                      {deal.title}
                    </h3>

                    {/* Pricing */}
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className="font-orbitron text-2xl font-black text-yellow-400"
                        style={{ textShadow: '0 0 12px rgba(245,166,35,0.6), 0 0 30px rgba(245,166,35,0.25)' }}
                      >
                        ₹{deal.salePrice.toLocaleString('en-IN')}
                      </span>
                      {deal.originalPrice > deal.salePrice && (
                        <>
                          <span className="text-sm text-gray-500 line-through font-inter">
                            ₹{deal.originalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-rajdhani font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                            {discountPct}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent mb-4" />

                    {/* Actions */}
                    <div className="space-y-2 mt-auto">
                      <button
                        onClick={() => setCheckoutDeal({ title: deal.title, salePrice: deal.salePrice })}
                        className="order-btn w-full py-3 rounded-xl font-rajdhani text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <ShoppingCart className="w-4 h-4" /> Order Now
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={INSTAGRAM_URL}
                          target="_blank" rel="noopener noreferrer"
                          className="py-2.5 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_18px_rgba(236,72,153,0.5)] hover:scale-[1.03]"
                        >
                          <Instagram className="w-3.5 h-3.5" /> Instagram
                        </a>
                        <a
                          href={`${TELEGRAM_URL}?text=I%20want%20to%20order%20${encodeURIComponent(deal.title)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="py-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-rajdhani text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_18px_rgba(59,130,246,0.5)] hover:scale-[1.03]"
                        >
                          <Send className="w-3.5 h-3.5" /> Telegram
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {checkoutDeal && (
        <CheckoutModal
          gameName={checkoutDeal.title}
          price={checkoutDeal.salePrice}
          onClose={() => setCheckoutDeal(null)}
        />
      )}
    </section>
  );
}
