import { Instagram, Send, MessageCircle, Mail } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 hex-bg" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">
              Get In Touch
            </span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
            <span className="text-white">CONTACT </span>
            <span className="text-yellow-500 gold-glow">US</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-lg uppercase tracking-wider">
            We're here to help you game better
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/jhojha.games?igsh=ZGltczl3MHh0ZTN1"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/10 hover:border-yellow-500/40 transition-all duration-500 hover:-translate-y-2 gold-hover-card shimmer-sweep"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-rajdhani text-xl font-700 text-white group-hover:text-yellow-500 transition-colors duration-300">
                  Instagram
                </h3>
                <p className="text-yellow-500/70 font-inter text-sm mt-1">@jhojha.games</p>
                <p className="text-gray-500 font-inter text-xs mt-1">Follow for deals & updates</p>
              </div>
            </div>
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/jhojhagames"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/10 hover:border-yellow-500/40 transition-all duration-500 hover:-translate-y-2 gold-hover-card shimmer-sweep"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Send className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-rajdhani text-xl font-700 text-white group-hover:text-yellow-500 transition-colors duration-300">
                  Telegram
                </h3>
                <p className="text-yellow-500/70 font-inter text-sm mt-1">@JhojhaGames</p>
                <p className="text-gray-500 font-inter text-xs mt-1">Chat & instant purchases</p>
              </div>
            </div>
          </a>
        </div>

        {/* Quick contact banner */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-rajdhani text-lg font-700 text-white">Need help choosing?</h4>
                <p className="text-gray-400 font-inter text-sm">Our team responds within minutes</p>
              </div>
            </div>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold px-6 py-3 rounded-lg font-rajdhani text-sm font-700 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap"
            >
              <Mail className="w-4 h-4" />
              Message Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
