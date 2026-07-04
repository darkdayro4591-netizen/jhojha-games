import { useState, useEffect } from 'react';
import { Menu, X, Search, Send, Instagram, ShieldCheck } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Games', href: '#games' },
  { label: 'Deals', href: '#deals' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Need Help', href: '#help' },
  { label: 'Contact', href: '#contact' },
];

interface NavbarProps {
  onSearchOpen: () => void;
}

export default function Navbar({ onSearchOpen }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [ownerAuthed, setOwnerAuthed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = navLinks.map(l => l.href.replace('#', ''));
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActiveSection(section);
          break;
        }
      }
    };
    const syncOwnerState = () => {
      setOwnerAuthed(sessionStorage.getItem('jhojha_owner_session') === '1');
    };
    syncOwnerState();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('owner-login-status', syncOwnerState);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('owner-login-status', syncOwnerState);
    };
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/95 backdrop-blur-xl border-b border-yellow-500/20 shadow-lg shadow-black/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#home" onClick={() => handleNavClick('#home')} className="flex items-center gap-3 group">
            <img src="/WhatsApp_Image_2026-07-03_at_9.09.26_PM.jpeg" alt="Jhojha Games" className="h-10 w-10 lg:h-12 lg:w-12 rounded-full object-cover border border-yellow-500/40 group-hover:border-yellow-500 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(245,166,35,0.5)]" />
            <div className="hidden sm:block">
              <span className="font-orbitron text-lg lg:text-xl font-black tracking-wider">
                <span className="text-white">JHOJHA</span><span className="text-yellow-500"> GAMES</span>
              </span>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map(link => (
              <button key={link.label} onClick={() => handleNavClick(link.href)} className={`nav-link font-rajdhani text-sm font-600 uppercase tracking-widest transition-colors duration-300 ${activeSection === link.href.replace('#', '') ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}>
                {link.label}
                {activeSection === link.href.replace('#', '') && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500 shadow-[0_0_8px_rgba(245,166,35,0.8)]" />}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onSearchOpen}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-yellow-500/20 text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all duration-300"
              aria-label="Search games"
            >
              <Search className="w-4 h-4" />
              <span className="font-inter text-xs text-gray-500">Search games...</span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-600 font-mono text-[10px]">⌘K</kbd>
            </button>
            <a href="https://instagram.com/jhojha.games" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-white/5 border border-yellow-500/20 text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all duration-300" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://t.me/JhojhaGames" target="_blank" rel="noopener noreferrer" className="btn-gold px-5 py-2.5 rounded-lg text-sm font-rajdhani font-700 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4" /> Join
            </a>
            {ownerAuthed && (
              <a href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 text-sm font-rajdhani font-700 uppercase tracking-widest" aria-label="Owner dashboard">
                <ShieldCheck className="w-4 h-4" /> Owner
              </a>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <button onClick={onSearchOpen} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-300 hover:text-yellow-500 transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-black/98 backdrop-blur-xl border-t border-yellow-500/10 px-4 py-4 space-y-1">
          {/* Mobile search button */}
          <button
            onClick={() => { setIsOpen(false); onSearchOpen(); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-gray-400 hover:text-yellow-500 transition-all duration-300 mb-2"
          >
            <Search className="w-4 h-4" />
            <span className="font-rajdhani text-sm font-600 uppercase tracking-widest">Search Games</span>
          </button>
          {navLinks.map(link => (
            <button key={link.label} onClick={() => handleNavClick(link.href)} className={`block w-full text-left px-4 py-3 rounded-lg font-rajdhani text-sm font-600 uppercase tracking-widest transition-all duration-300 ${activeSection === link.href.replace('#', '') ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'}`}>{link.label}</button>
          ))}
          <div className="flex gap-3 mt-3">
            <a href="https://instagram.com/jhojha.games" target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-3 rounded-lg bg-white/5 border border-yellow-500/20 text-gray-300 hover:text-yellow-500 hover:border-yellow-500/50 transition-all font-rajdhani text-sm font-700 uppercase tracking-wider flex items-center justify-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a href="https://t.me/JhojhaGames" target="_blank" rel="noopener noreferrer" className="flex-1 btn-gold text-center px-4 py-3 rounded-lg text-sm font-rajdhani font-700 uppercase tracking-wider flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Join
            </a>
          </div>
          {ownerAuthed && (
            <div className="mt-3">
              <a href="/admin" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 text-sm font-rajdhani font-700 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Owner Dashboard
              </a>
            </div>
          )}
          <div className="flex gap-3 mt-3">
          </div>
        </div>
      </div>
    </nav>
  );
}
