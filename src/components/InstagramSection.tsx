import { Instagram, Heart, MessageCircle, ArrowRight } from 'lucide-react';

const INSTAGRAM_URL = 'https://instagram.com/jhojha.games';

const posts = [
  {
    image: '/gta6-cover.jpeg',
    likes: '1.2K',
    comments: '89',
    label: 'GTA VI',
  },
  {
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/library_600x900.jpg',
    likes: '956',
    comments: '64',
    label: 'The Last of Us Part I',
  },
  {
    image: '/outlast-trials-cover.jpeg',
    likes: '2.1K',
    comments: '142',
    label: 'Outlast Trials',
  },
  {
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg',
    likes: '1.5K',
    comments: '97',
    label: 'Forza Horizon 5',
  },
  {
    image: '/ac-black-flag-cover.jpeg',
    likes: '834',
    comments: '52',
    label: "AC Black Flag",
  },
  {
    image: '/re-requiem-cover.jpeg',
    likes: '1.8K',
    comments: '118',
    label: 'Resident Evil',
  },
];

export default function InstagramSection() {
  return (
    <section id="instagram" className="relative py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 hex-bg" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <Instagram className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">
              Follow Us
            </span>
          </div>
          <h2 className="font-orbitron text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
            <span className="text-white">JOIN OUR </span>
            <span className="text-yellow-500 gold-glow">COMMUNITY</span>
          </h2>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-500 font-rajdhani text-base sm:text-lg uppercase tracking-wider transition-colors duration-300"
          >
            @jhojha.games
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Instagram grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {posts.map((post, idx) => (
            <a
              key={idx}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="insta-card group relative aspect-square rounded-xl overflow-hidden border border-yellow-500/10 hover:border-yellow-500/40"
              style={{ animation: `fadeInUp 0.5s ease ${idx * 0.08}s both` }}
            >
              <img
                src={post.image}
                alt="Instagram post"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Instagram icon overlay */}
              <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-4 h-4 text-yellow-500" />
              </div>

              {/* Stats overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-rajdhani font-700 text-white">{post.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-rajdhani font-700 text-white">{post.comments}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Follow CTA */}
        <div className="text-center mt-8">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani text-sm font-700 uppercase tracking-widest hover:shadow-[0_0_30px_rgba(245,166,35,0.4)] transition-all duration-300 hover:-translate-y-1"
          >
            <Instagram className="w-5 h-5" />
            Follow @jhojha.games
          </a>
        </div>
      </div>
    </section>
  );
}
