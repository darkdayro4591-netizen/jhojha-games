import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Star, Eye, X, ArrowRight } from 'lucide-react';

export interface Game {
  id: number;
  title: string;
  category: string;
  image: string;
  salePrice: number;
  originalPrice: number;
  discount: number;
  rating: number;
  badge?: string;
  description: string;
}

export const games: Game[] = [
  {
    id: 1,
    title: 'GTA VI Pre-Order Standard Edition',
    category: 'Action',
    image: '/gta6-cover.jpeg',
    salePrice: 5999,
    originalPrice: 7999,
    discount: 25,
    rating: 5,
    badge: 'PRE-ORDER',
    description: 'Pre-order Grand Theft Auto VI Standard Edition and get exclusive bonus content including in-game currency and special vehicles.',
  },
  {
    id: 2,
    title: 'The Last of Us Part I',
    category: 'RPG',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/library_600x900.jpg',
    salePrice: 279,
    originalPrice: 999,
    discount: 72,
    rating: 5,
    description: 'Experience the emotional journey of Joel and Ellie in this stunning remake of the critically acclaimed survival game.',
  },
  {
    id: 3,
    title: 'The Last of Us Part II',
    category: 'RPG',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2531310/library_600x900.jpg',
    salePrice: 329,
    originalPrice: 1299,
    discount: 75,
    rating: 5,
    description: 'Continue the gripping story with Ellie in this intense, emotional sequel set in a post-apocalyptic world.',
  },
  {
    id: 4,
    title: 'Resident Evil Requiem',
    category: 'Horror',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/library_600x900.jpg',
    salePrice: 499,
    originalPrice: 1999,
    discount: 75,
    rating: 5,
    description: 'Face your fears in the latest Resident Evil installment. Survival horror at its finest with stunning visuals.',
  },
  {
    id: 5,
    title: "Assassin's Creed Black Flag Resynced Pre-Order",
    category: 'Open World',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/242050/library_600x900.jpg',
    salePrice: 799,
    originalPrice: 1499,
    discount: 47,
    rating: 4,
    badge: 'PRE-ORDER',
    description: 'Pre-order the Resynced edition of the beloved pirate adventure. Sail the Caribbean as Edward Kenway with enhanced graphics.',
  },
  {
    id: 6,
    title: 'Forza Horizon Series',
    category: 'Racing',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg',
    salePrice: 349,
    originalPrice: 1599,
    discount: 78,
    rating: 5,
    description: 'The latest Forza Horizon installment with hundreds of cars, open-world racing, and stunning next-gen graphics.',
  },
  {
    id: 7,
    title: 'Outlast Trials',
    category: 'Horror',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1271590/library_600x900.jpg',
    salePrice: 499,
    originalPrice: 1799,
    discount: 72,
    rating: 4,
    description: 'Survive the Murkoff Corporation\'s twisted experiments in this terrifying co-op horror experience.',
  },
];

const categories = ['All', 'Action', 'Open World', 'Horror', 'Racing', 'RPG', 'Multiplayer'];

interface FeaturedGamesProps {
  searchQuery: string;
  externalCategory?: string;
}

export default function FeaturedGames({ searchQuery, externalCategory }: FeaturedGamesProps) {
  const [activeCategory, setActiveCategory] = useState(externalCategory || 'All');

  useEffect(() => {
    if (externalCategory) setActiveCategory(externalCategory);
  }, [externalCategory]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchesCategory = activeCategory === 'All' || g.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="games" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 hex-bg" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">
              Featured Titles
            </span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
            <span className="text-white">FEATURED </span>
            <span className="text-yellow-500 gold-glow">GAMES</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-lg uppercase tracking-wider">
            Premium titles at unbeatable prices
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-lg font-rajdhani text-sm font-600 uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat
                  ? 'btn-gold'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:border-yellow-500/40 hover:text-yellow-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-rajdhani text-lg uppercase tracking-wider">
              No games found matching your search
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredGames.map((game, idx) => (
              <div
                key={game.id}
                className="game-card gold-hover-card group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/10 shimmer-sweep"
                style={{ animation: `fadeInUp 0.6s ease ${idx * 0.1}s both` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {game.badge && (
                      <span className="badge-new px-3 py-1 rounded-md font-rajdhani uppercase tracking-wider">
                        {game.badge}
                      </span>
                    )}
                    <span className="badge-sale px-3 py-1 rounded-md font-rajdhani uppercase tracking-wider">
                      -{game.discount}%
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm border border-yellow-500/20">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-rajdhani font-700 text-yellow-500">{game.rating}.0</span>
                  </div>

                  {/* Quick view */}
                  <button
                    onClick={() => setSelectedGame(game)}
                    className="absolute bottom-3 right-3 p-2.5 rounded-lg bg-black/70 backdrop-blur-sm border border-yellow-500/30 text-yellow-500 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-yellow-500 hover:text-black"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className="text-xs font-rajdhani font-600 uppercase tracking-widest text-yellow-500/70">
                    {game.category}
                  </span>
                  <h3 className="mt-1 font-rajdhani text-xl font-700 text-white group-hover:text-yellow-500 transition-colors duration-300">
                    {game.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-3 mt-4">
                    <span className="font-orbitron text-2xl font-black text-yellow-500">
                      ₹{game.salePrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through font-inter">
                      ₹{game.originalPrice}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`https://t.me/jhojhagames?text=I%20want%20to%20order%20${encodeURIComponent(game.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="order-btn flex-1 py-3 rounded-lg font-rajdhani text-sm font-700 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order Now
                    </a>
                    <button
                      onClick={() => setSelectedGame(game)}
                      className="px-4 py-3 rounded-lg bg-white/5 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all duration-300"
                      aria-label="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game Detail Modal */}
      {selectedGame && (
        <div
          className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4"
          onClick={() => setSelectedGame(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-yellow-500/30 rounded-2xl overflow-hidden gold-glow-box"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'fadeInUp 0.3s ease' }}
          >
            <button
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 border border-yellow-500/30 text-gray-400 hover:text-yellow-500 hover:border-yellow-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 overflow-hidden">
              <img src={selectedGame.image} alt={selectedGame.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5">
                <span className="text-xs font-rajdhani font-600 uppercase tracking-widest text-yellow-500">
                  {selectedGame.category}
                </span>
                <h3 className="font-rajdhani text-2xl font-700 text-white">{selectedGame.title}</h3>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < selectedGame.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                  />
                ))}
                <span className="text-sm text-gray-400 ml-2">{selectedGame.rating}.0 / 5.0</span>
              </div>

              <p className="text-gray-300 font-inter leading-relaxed mb-6">{selectedGame.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <span className="font-orbitron text-3xl font-black text-yellow-500">
                  ₹{selectedGame.salePrice}
                </span>
                <span className="text-base text-gray-500 line-through">₹{selectedGame.originalPrice}</span>
                <span className="badge-sale px-3 py-1 rounded-md font-rajdhani uppercase tracking-wider text-sm">
                  Save {selectedGame.discount}%
                </span>
              </div>

              <a
                href={`https://t.me/jhojhagames?text=I%20want%20to%20order%20${encodeURIComponent(selectedGame.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="order-btn w-full py-4 rounded-lg font-rajdhani text-base font-700 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Order Now on Telegram
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
