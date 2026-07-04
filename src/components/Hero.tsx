import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Gamepad2, Zap, Shield, Star, ShoppingCart } from 'lucide-react';

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 10,
  duration: 8 + Math.random() * 12,
  size: 2 + Math.random() * 4,
}));

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const handleMouse = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const scrollToGames = () => {
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0A0800] to-black" />

        {/* Animated grid */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Radial gold glow at center */}
        <div
          className="absolute inset-0 transition-transform duration-100 ease-out"
          style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-yellow-500/5 blur-3xl" />
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-br-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-tl-full blur-3xl" />

        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              bottom: '-10px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* Scanlines */}
        <div className="absolute inset-0 scanlines" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">

        {/* Sale Banner */}
        <div
          className={`inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">
            Summer Sale — Up to 70% Off
          </span>
          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
        </div>

        {/* Logo */}
        <div
          className={`flex justify-center mb-8 transition-all duration-1000 delay-200 ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div
            className="relative animate-float"
            style={{ transform: `perspective(1000px) rotateX(${mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg)` }}
          >
            <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-2xl scale-150 animate-pulse-gold" />
            <img
              src="/WhatsApp_Image_2026-07-03_at_9.09.26_PM.jpeg"
              alt="Jhojha Games Logo"
              className="relative w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full object-cover border-2 border-yellow-500/60 shadow-[0_0_60px_rgba(245,166,35,0.4)]"
            />
          </div>
        </div>

        {/* Headline */}
        <h1
          className={`font-orbitron text-4xl sm:text-5xl lg:text-7xl font-black mb-4 leading-tight transition-all duration-1000 delay-300 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="block text-white">PREMIUM PC GAMES</span>
          <span className="block text-yellow-500 gold-glow mt-1">AT AFFORDABLE PRICES</span>
        </h1>

        {/* Subheadline */}
        <div
          className={`flex flex-wrap justify-center items-center gap-3 sm:gap-6 mb-10 transition-all duration-1000 delay-500 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {['Trusted Seller', 'Instant Delivery', 'Best Prices'].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="hidden sm:block w-1 h-1 rounded-full bg-yellow-500/60" />}
              <span className="font-rajdhani text-base sm:text-lg font-600 text-gray-300 uppercase tracking-wider">
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div
          className={`flex flex-wrap justify-center gap-4 mb-10 transition-all duration-1000 delay-600 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { icon: Shield, text: '100% Secure' },
            { icon: Zap, text: 'Instant Delivery' },
            { icon: Star, text: '1000+ Happy Customers' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <Icon className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-300 font-inter font-500">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row justify-center gap-4 transition-all duration-1000 delay-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={scrollToGames}
            className="btn-gold px-8 py-4 rounded-xl text-base font-rajdhani font-700 uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <Gamepad2 className="w-5 h-5" />
            Browse Games
          </button>
          <a
            href="https://t.me/JhojhaGames"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold px-8 py-4 rounded-xl text-base font-rajdhani font-700 uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            Order Now
          </a>
        </div>

        {/* Scroll indicator */}
        <div className={`mt-16 flex justify-center transition-all duration-1000 delay-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={scrollToGames}
            className="flex flex-col items-center gap-2 text-gray-500 hover:text-yellow-500 transition-colors group"
          >
            <span className="text-xs font-rajdhani uppercase tracking-widest">Scroll Down</span>
            <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-yellow-500" />
          </button>
        </div>
      </div>
    </section>
  );
}
