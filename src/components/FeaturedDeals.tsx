import { Flame, ShoppingCart, Instagram, Send } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/jhojha.games?igsh=ZGltczl3MHh0ZTN1';
const TELEGRAM_URL = 'https://t.me/jhojhagames';

const deals = [
  {
    id: 1,
    title: 'GTA VI Pre-Order Standard Edition',
    image: '/gta6-cover.jpeg',
    salePrice: 5999,
    originalPrice: null,
    badge: 'PRE-ORDER',
    badgeColor: 'from-yellow-500 to-amber-600',
    badgeShadow: 'rgba(245,166,35,0.7)',
  },
  {
    id: 2,
    title: "Assassin's Creed Black Flag Resynced Pre-Order",
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/242050/library_600x900.jpg',
    salePrice: 799,
    originalPrice: 4999,
    badge: 'SALE',
    badgeColor: 'from-yellow-400 to-yellow-600',
    badgeShadow: 'rgba(245,166,35,0.7)',
  },
  {
    id: 3,
    title: 'Outlast Trials',
    image: '/outlast-trials-cover.jpeg',
    salePrice: 499,
    originalPrice: 2449,
    badge: 'HOT DEAL',
    badgeColor: 'from-red-500 to-orange-600',
    badgeShadow: 'rgba(239,68,68,0.7)',
  },
  {
    id: 4,
    title: 'Resident Evil Requiem',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/library_600x900.jpg',
    salePrice: 499,
    originalPrice: 4999,
    badge: 'BEST SELLER',
    badgeColor: 'from-emerald-500 to-green-600',
    badgeShadow: 'rgba(16,185,129,0.7)',
  },
  {
    id: 5,
    title: "Assassin's Creed Black Flag Resynced",
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/242050/library_600x900.jpg',
    salePrice: 299,
    originalPrice: 1999,
    badge: 'PRE-ORDER',
    badgeColor: 'from-blue-500 to-purple-600',
    badgeShadow: 'rgba(99,102,241,0.7)',
  },
  {
    id: 6,
    title: 'Forza Horizon Series',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg',
    salePrice: 349,
    originalPrice: 1999,
    badge: 'SALE',
    badgeColor: 'from-yellow-400 to-yellow-600',
    badgeShadow: 'rgba(245,166,35,0.7)',
  },
];

export default function FeaturedDeals() {
  return (
    <section id="featured-deals" className="relative py-16 lg:py-24 overflow-hidden">
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

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {deals.map((deal, idx) => (
            <div
              key={deal.id}
              className="deal-card group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1C1C1C] to-[#0F0F0F] border border-yellow-500/15 shimmer-sweep flex flex-col"
              style={{ animation: `fadeInUp 0.6s ease ${idx * 0.1}s both` }}
            >
              {/* Glow border on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `0 0 0 1px rgba(245,166,35,0.5), 0 0 30px rgba(245,166,35,0.15)` }} />

              {/* Game Poster */}
              <div className="relative h-64 sm:h-72 overflow-hidden flex-shrink-0">
                <img
                  src={deal.image}
                  alt={deal.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-black/40 to-transparent" />

                {/* Glowing badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="relative">
                    <div
                      className="absolute inset-0 blur-md opacity-70 rounded-lg"
                      style={{ background: `radial-gradient(circle, ${deal.badgeShadow}, transparent)` }}
                    />
                    <span
                      className={`relative bg-gradient-to-r ${deal.badgeColor} text-black px-3 py-1 rounded-lg font-rajdhani text-xs font-bold uppercase tracking-wider shadow-lg`}
                    >
                      {deal.badge}
                    </span>
                  </div>
                </div>
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
                  {deal.originalPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through font-inter">
                        ₹{deal.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-rajdhani font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                        {Math.round((1 - deal.salePrice / deal.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent mb-4" />

                {/* Action buttons */}
                <div className="space-y-2 mt-auto">
                  {/* Order Now */}
                  <a
                    href={`${TELEGRAM_URL}?text=I%20want%20to%20order%20${encodeURIComponent(deal.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-btn w-full py-3 rounded-xl font-rajdhani text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Order Now
                  </a>

                  {/* Instagram + Telegram */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_18px_rgba(236,72,153,0.5)] hover:scale-[1.03] hover:-translate-y-0.5"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      Instagram
                    </a>
                    <a
                      href={`${TELEGRAM_URL}?text=I%20want%20to%20order%20${encodeURIComponent(deal.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-rajdhani text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_18px_rgba(59,130,246,0.5)] hover:scale-[1.03] hover:-translate-y-0.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Telegram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
