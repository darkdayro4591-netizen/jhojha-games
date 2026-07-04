import { useState, useEffect } from 'react';
import { Instagram, Send, X, Headphones } from 'lucide-react';

const INSTAGRAM_URL = 'https://instagram.com/jhojha.games';
const TELEGRAM_URL  = 'https://t.me/JhojhaGames';

export default function FloatingSupportButton() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const links = [
    {
      href: INSTAGRAM_URL,
      label: 'Instagram',
      sublabel: '@jhojha.games',
      icon: Instagram,
      color: 'from-purple-600 via-pink-500 to-yellow-500',
      glow: 'rgba(236,72,153,0.4)',
    },
    {
      href: TELEGRAM_URL,
      label: 'Telegram',
      sublabel: '@jhojhagames',
      icon: Send,
      color: 'from-blue-600 to-sky-500',
      glow: 'rgba(59,130,246,0.4)',
    },
  ];

  return (
    <div className="fixed bottom-6 left-5 z-50 flex flex-col items-start gap-2">
      {/* Popup links */}
      <div
        className={`flex flex-col gap-2 transition-all duration-300 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        {/* Label */}
        <div className="mb-1 px-3 py-1.5 rounded-lg bg-black/80 border border-yellow-500/20 backdrop-blur-sm">
          <p className="text-yellow-500 font-rajdhani text-xs font-bold uppercase tracking-widest">Need Help?</p>
        </div>

        {links.map(({ href, label, sublabel, icon: Icon, color, glow }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 pl-2 pr-4 py-2 rounded-xl bg-gradient-to-r ${color} text-white shadow-lg hover:scale-105 transition-all duration-200`}
            style={{ boxShadow: `0 4px 20px ${glow}` }}
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-rajdhani font-bold text-sm leading-tight">{label}</p>
              <p className="text-white/70 text-xs leading-tight">{sublabel}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Main button */}
      <button
        onClick={() => setOpen(p => !p)}
        className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-black transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #F5A623, #E8920A)', boxShadow: '0 4px 20px rgba(245,166,35,0.5)' }}
        aria-label="Support"
      >
        {pulse && !open && (
          <span className="absolute inset-0 rounded-2xl animate-ping bg-yellow-500/60" />
        )}
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <Headphones className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
