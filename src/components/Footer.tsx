import { Instagram, Send, Heart } from 'lucide-react';

const footerLinks = {
  Company: ['Home', 'Games', 'Deals', 'Reviews'],
  Support: ['FAQ', 'Need Help', 'Contact', 'Terms & Conditions', 'Privacy Policy'],
  Categories: ['Action', 'Open World', 'Horror', 'Racing', 'RPG', 'Multiplayer'],
};

function getFooterHref(link: string) {
  if (link === 'Privacy Policy') return '/privacy-policy';
  if (link === 'Terms & Conditions') return '/terms-and-conditions';
  if (link === 'Home') return '#home';
  if (link === 'Games') return '#games';
  if (link === 'Deals') return '#deals';
  if (link === 'Reviews') return '#reviews';
  if (link === 'FAQ') return '#faq';
  if (link === 'Need Help') return '#help';
  if (link === 'Contact') return '#contact';
  return '#';
}

export default function Footer() {
  return (
    <footer className="relative border-t border-yellow-500/10 bg-black overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/WhatsApp_Image_2026-07-03_at_9.09.26_PM.jpeg"
                alt="Jhojha Games"
                className="h-12 w-12 rounded-full object-cover border border-yellow-500/40"
              />
              <span className="font-orbitron text-lg font-black">
                <span className="text-white">JHOJHA</span>
                <span className="text-yellow-500"> GAMES</span>
              </span>
            </div>
            <p className="text-gray-400 font-inter text-sm leading-relaxed mb-4">
              Your trusted source for premium PC games at affordable prices. Instant delivery, secure transactions, and 24/7 support.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/jhojha.games"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 border border-yellow-500/20 flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/JhojhaGames"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 border border-yellow-500/20 flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all duration-300"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-rajdhani text-sm font-700 uppercase tracking-widest text-yellow-500 mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}>
                    <a
                      href={getFooterHref(link)}
                      className="text-gray-400 font-inter text-sm hover:text-yellow-500 transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="section-divider my-10" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 font-inter text-sm">
            © {new Date().getFullYear()} Jhojha Games. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-gray-500 font-inter text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>for gamers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
