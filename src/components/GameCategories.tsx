import { Swords, Globe, Ghost, Car, Skull, Users, ArrowRight } from 'lucide-react';

const categories = [
  {
    name: 'Action',
    icon: Swords,
    count: '12+ Games',
    description: 'Explosive combat and adrenaline-pumping adventures',
    image: '/gta6-cover.jpeg',
  },
  {
    name: 'Open World',
    icon: Globe,
    count: '8+ Games',
    description: 'Vast open worlds waiting to be explored',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/242050/library_600x900.jpg',
  },
  {
    name: 'Horror',
    icon: Ghost,
    count: '6+ Games',
    description: 'Survival horror that will keep you on edge',
    image: '/outlast-trials-cover.jpeg',
  },
  {
    name: 'Racing',
    icon: Car,
    count: '5+ Games',
    description: 'High-speed racing and open-world driving',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg',
  },
  {
    name: 'RPG',
    icon: Skull,
    count: '10+ Games',
    description: 'Epic stories and immersive character journeys',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/library_600x900.jpg',
  },
  {
    name: 'Multiplayer',
    icon: Users,
    count: '7+ Games',
    description: 'Compete and cooperate with players worldwide',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1271590/library_600x900.jpg',
  },
];

interface GameCategoriesProps {
  onSelectCategory: (category: string) => void;
}

export default function GameCategories({ onSelectCategory }: GameCategoriesProps) {
  const handleCategoryClick = (name: string) => {
    onSelectCategory(name);
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="categories" className="relative py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">Browse By Genre</span>
          </div>
          <h2 className="font-orbitron text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
            <span className="text-white">GAME </span><span className="text-yellow-500 gold-glow">CATEGORIES</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-base sm:text-lg uppercase tracking-wider">Find your next adventure</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button key={cat.name} onClick={() => handleCategoryClick(cat.name)} className="category-card group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/15 text-left" style={{ animation: `fadeInUp 0.6s ease ${idx * 0.08}s both` }}>
                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
                <div className="relative p-4 sm:p-5 flex flex-col items-center text-center min-h-[160px] sm:min-h-[200px] justify-center">
                  <div className="category-icon w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-3 group-hover:bg-yellow-500 group-hover:border-yellow-500 transition-all duration-500">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 group-hover:text-black transition-colors duration-500" />
                  </div>
                  <h3 className="font-rajdhani text-base sm:text-lg font-700 text-white group-hover:text-yellow-500 transition-colors duration-300 mb-1">{cat.name}</h3>
                  <span className="text-xs text-yellow-500/60 font-rajdhani font-600 uppercase tracking-wider mb-2">{cat.count}</span>
                  <p className="text-gray-400 font-inter text-xs leading-relaxed mb-2 hidden sm:block">{cat.description}</p>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs font-rajdhani font-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
