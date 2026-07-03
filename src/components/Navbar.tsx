import { useState, useEffect } from 'react';
import { Menu, X, Search, Send, Instagram } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Games', href: '#games' },
  { label: 'Deals', href: '#deals' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
            {searchOpen ? (
              <div className="relative">
                <input autoFocus type="text" value={searchQuery} onChange={e => onSearchChange(e.target.value)} placeholder="Search games..." className="search-input w-44 px-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 font-inter" onBlur={() => !searchQuery && setSearchOpen(false)} />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500/60" />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-300"><Search className="w-5 h-5" /></button>
            )}
            <a href="https://www.instagram.com/jhojha.games?igsh=ZGltczl3MHh0ZTN1" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-white/5 border border-yellow-500/20 text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all duration-300" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://t.me/jhojhagames" target="_blank" rel="noopener noreferrer" className="btn-gold px-5 py-2.5 rounded-lg text-sm font-rajdhani font-700 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4" /> Join
            </a>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"><Search className="w-5 h-5" /></button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-300 hover:text-yellow-500 transition-colors">{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>

        {searchOpen && (
          <div className="lg:hidden pb-3">
            <div className="relative">
              <input autoFocus type="text" value={searchQuery} onChange={e => onSearchChange(e.target.value)} placeholder="Search games..." className="search-input w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500/60" />
            </div>
          </div>
        )}
      </div>

      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-black/98 backdrop-blur-xl border-t border-yellow-500/10 px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <button key={link.label} onClick={() => handleNavClick(link.href)} className={`block w-full text-left px-4 py-3 rounded-lg font-rajdhani text-sm font-600 uppercase tracking-widest transition-all duration-300 ${activeSection === link.href.replace('#', '') ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'}`}>{link.label}</button>
          ))}
          <div className="flex gap-3 mt-3">
            <a href="https://www.instagram.com/jhojha.games?igsh=ZGltczl3MHh0ZTN1" target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-3 rounded-lg bg-white/5 border border-yellow-500/20 text-gray-300 hover:text-yellow-500 hover:border-yellow-500/50 transition-all font-rajdhani text-sm font-700 uppercase tracking-wider flex items-center justify-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a href="https://t.me/jhojhagames" target="_blank" rel="noopener noreferrer" className="flex-1 btn-gold text-center px-4 py-3 rounded-lg text-sm font-rajdhani font-700 uppercase tracking-wider flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Join
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
