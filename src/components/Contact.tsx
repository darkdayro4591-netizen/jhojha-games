import { useState, useMemo } from 'react';
import {
  Instagram, Send, MessageCircle, Flame, Wallet, Target,
  Headphones, ChevronRight, CheckCircle2, Gamepad2, Star,
  ShoppingCart, ArrowRight, Zap,
} from 'lucide-react';
import games from '../data/games';
import CheckoutModal from './CheckoutModal';

const INSTAGRAM_URL = 'https://www.instagram.com/jhojha.games?igsh=ZGltczl3MHh0ZTN1';
const TELEGRAM_URL  = 'https://t.me/jhojhagames';
const WHATSAPP_URL  = 'https://wa.me/message/jhojhagames';

const CATEGORIES = ['Action', 'Horror', 'Racing', 'Open World', 'RPG', 'Multiplayer'];

const BUDGET_RANGES = [
  { label: 'Under ₹300', max: 300 },
  { label: '₹300 – ₹500', max: 500, min: 300 },
  { label: '₹500 – ₹1000', max: 1000, min: 500 },
  { label: '₹1000+', min: 1000 },
];

const SUPPORT_CARDS = [
  {
    icon: Flame,
    title: 'Best Sellers',
    desc: 'See our most popular games this week.',
    color: 'from-orange-500 to-red-500',
    shadow: 'rgba(249,115,22,0.3)',
    action: 'bestsellers',
  },
  {
    icon: Wallet,
    title: 'Budget Games',
    desc: 'Top games available under ₹300.',
    color: 'from-green-500 to-emerald-600',
    shadow: 'rgba(34,197,94,0.3)',
    action: 'budget',
  },
  {
    icon: Target,
    title: 'Recommendations',
    desc: 'Get personalized game suggestions.',
    color: 'from-yellow-500 to-amber-500',
    shadow: 'rgba(245,166,35,0.3)',
    action: 'form',
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    desc: 'Talk to our team before ordering.',
    color: 'from-blue-500 to-indigo-600',
    shadow: 'rgba(99,102,241,0.3)',
    action: 'contact',
  },
];

interface CheckoutGame { name: string; price: number }

export default function Contact() {
  const [activeCard, setActiveCard]       = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [submitted, setSubmitted]         = useState(false);
  const [checkoutGame, setCheckoutGame]   = useState<CheckoutGame | null>(null);

  const [form, setForm] = useState({
    name: '', instagram: '', budget: '', genre: '', message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredGames = useMemo(() => {
    if (activeCard === 'bestsellers') return [...games].sort((a, b) => b.discount - a.discount).slice(0, 4);
    if (activeCard === 'budget') return games.filter(g => g.salePrice < 300);
    if (activeCategory) return games.filter(g => g.category === activeCategory);
    return [];
  }, [activeCard, activeCategory]);

  const handleCardClick = (action: string) => {
    setActiveCategory(null);
    setActiveCard(prev => prev === action ? null : action);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCard(null);
    setActiveCategory(prev => prev === cat ? null : cat);
  };

  const handleFormChange = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setFormErrors(p => ({ ...p, [k]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.instagram.trim()) errs.instagram = 'Instagram username is required';
    if (!form.budget) errs.budget = 'Select your budget';
    if (!form.genre) errs.genre = 'Select a genre';
    setFormErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  };

  return (
    <>
      <section id="contact" className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 hex-bg" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-yellow-500/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── HEADER ── */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-5">
              <Gamepad2 className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-yellow-500 text-xs font-rajdhani font-bold uppercase tracking-widest">Game Advisor</span>
            </div>
            <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              <span className="text-white">🎮 Need Help </span>
              <span className="text-yellow-500 gold-glow">Choosing?</span>
            </h2>
            <p className="text-gray-400 font-inter text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Our team will help you find the perfect game based on your budget and interests.
            </p>
          </div>

          {/* ── SUPPORT CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {SUPPORT_CARDS.map(({ icon: Icon, title, desc, color, shadow, action }) => {
              const isActive = activeCard === action;
              return (
                <button
                  key={action}
                  onClick={() => handleCardClick(action)}
                  className={`relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 group ${
                    isActive
                      ? 'border-yellow-500/60 bg-yellow-500/8 shadow-[0_0_30px_rgba(245,166,35,0.15)] -translate-y-1'
                      : 'border-white/8 bg-white/3 hover:border-yellow-500/30 hover:-translate-y-1 hover:bg-white/5'
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}
                    style={{ boxShadow: isActive ? `0 4px 20px ${shadow}` : 'none' }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className={`font-rajdhani text-sm sm:text-base font-bold uppercase tracking-wider mb-1 transition-colors ${isActive ? 'text-yellow-500' : 'text-white'}`}>
                    {title}
                  </h3>
                  <p className="text-gray-500 font-inter text-xs leading-relaxed hidden sm:block">{desc}</p>
                  {isActive && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── CATEGORY FILTER ── */}
          <div className="mb-8">
            <p className="text-center text-gray-500 font-rajdhani text-xs uppercase tracking-widest mb-4 font-bold">
              Or browse by genre
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2 rounded-full border font-rajdhani text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : 'border-white/15 text-gray-400 hover:border-yellow-500/50 hover:text-yellow-400 bg-white/3'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ── GAME RESULTS PANEL ── */}
          {(filteredGames.length > 0 || activeCard === 'budget') && activeCard !== 'form' && activeCard !== 'contact' && (
            <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-[#111] border border-yellow-500/15">
              {activeCard === 'budget' && filteredGames.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 font-inter text-sm">No games under ₹300 right now.</p>
                  <p className="text-gray-600 font-inter text-xs mt-1">Check back soon — we add new deals daily!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <p className="font-rajdhani text-sm font-bold text-yellow-500 uppercase tracking-widest">
                      {activeCard === 'bestsellers' ? '🔥 Top Picks This Week'
                        : activeCard === 'budget' ? '💰 Budget-Friendly Games'
                        : `🎯 ${activeCategory} Games`}
                    </p>
                    <span className="ml-auto text-gray-600 font-inter text-xs">{filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} found</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {filteredGames.map(game => (
                      <div
                        key={game.id}
                        className="group relative rounded-xl overflow-hidden border border-white/8 hover:border-yellow-500/40 transition-all duration-300 bg-black"
                      >
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src={game.image}
                            alt={game.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/1a1a1a/f5a623?text=Game'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          {game.badge && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-orbitron font-black bg-yellow-500 text-black">
                              {game.badge}
                            </span>
                          )}
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold bg-green-500/90 text-white">
                            -{game.discount}%
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-white font-rajdhani text-sm font-bold leading-tight mb-2 line-clamp-2">{game.title}</p>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-yellow-500 font-orbitron font-black text-sm">₹{game.salePrice.toLocaleString('en-IN')}</span>
                              <span className="text-gray-600 text-xs line-through ml-1.5">₹{game.originalPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex">
                              {[...Array(game.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => setCheckoutGame({ name: game.title, price: game.salePrice })}
                            className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-rajdhani font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ShoppingCart className="w-3 h-3" /> Order Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── RECOMMENDATION FORM ── */}
          {activeCard === 'form' && (
            <div className="mb-10 max-w-2xl mx-auto">
              <div className="p-6 sm:p-8 rounded-2xl bg-[#111] border border-yellow-500/20">
                {submitted ? (
                  <div className="flex flex-col items-center text-center py-6 space-y-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.2), rgba(34,197,94,0.04))', boxShadow: '0 0 0 1px rgba(34,197,94,0.3)' }}
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-orbitron text-lg font-black text-green-400 mb-2">Request Sent!</h3>
                      <p className="text-gray-400 font-inter text-sm leading-relaxed max-w-sm">
                        Thank you! Our team will contact you shortly on Instagram with the best game recommendations for you.
                      </p>
                    </div>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', instagram: '', budget: '', genre: '', message: '' }); }}
                      className="px-5 py-2.5 rounded-xl border border-yellow-500/30 text-yellow-500 font-rajdhani text-sm font-bold uppercase tracking-wider hover:bg-yellow-500/10 transition-colors"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-6">
                      <Target className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-orbitron text-base font-black text-white">Get Game Recommendations</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Your Name *</label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={e => handleFormChange('name', e.target.value)}
                            placeholder="Enter your name"
                            className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border ${formErrors.name ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all`}
                          />
                          {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
                        </div>
                        <div>
                          <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Instagram Username *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                            <input
                              type="text"
                              value={form.instagram}
                              onChange={e => handleFormChange('instagram', e.target.value.replace(/^@/, ''))}
                              placeholder="your.username"
                              className={`w-full pl-7 pr-4 py-2.5 rounded-xl bg-white/5 border ${formErrors.instagram ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all`}
                            />
                          </div>
                          {formErrors.instagram && <p className="mt-1 text-xs text-red-400">{formErrors.instagram}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Budget *</label>
                          <select
                            value={form.budget}
                            onChange={e => handleFormChange('budget', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border ${formErrors.budget ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm focus:outline-none transition-all cursor-pointer`}
                          >
                            <option value="" className="bg-[#111]">Select budget</option>
                            {BUDGET_RANGES.map(b => (
                              <option key={b.label} value={b.label} className="bg-[#111]">{b.label}</option>
                            ))}
                          </select>
                          {formErrors.budget && <p className="mt-1 text-xs text-red-400">{formErrors.budget}</p>}
                        </div>
                        <div>
                          <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Favorite Genre *</label>
                          <select
                            value={form.genre}
                            onChange={e => handleFormChange('genre', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border ${formErrors.genre ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm focus:outline-none transition-all cursor-pointer`}
                          >
                            <option value="" className="bg-[#111]">Select genre</option>
                            {CATEGORIES.map(c => (
                              <option key={c} value={c} className="bg-[#111]">{c}</option>
                            ))}
                          </select>
                          {formErrors.genre && <p className="mt-1 text-xs text-red-400">{formErrors.genre}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Message / Preferences</label>
                        <textarea
                          value={form.message}
                          onChange={e => handleFormChange('message', e.target.value)}
                          placeholder="Tell us what kind of games you enjoy, platforms you use, or anything else..."
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-500/60 text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="order-btn w-full py-3.5 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                      >
                        <Target className="w-4 h-4" />
                        Get Game Recommendations
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── CONTACT PANEL ── */}
          {activeCard === 'contact' && (
            <div className="mb-10 max-w-2xl mx-auto p-6 rounded-2xl bg-[#111] border border-yellow-500/20 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="w-5 h-5 text-yellow-500" />
                <h3 className="font-orbitron text-base font-black text-white">Contact Our Team</h3>
              </div>
              <p className="text-gray-400 font-inter text-sm">We respond within minutes on all platforms. Choose your preferred way to reach us:</p>
              <div className="space-y-3">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-rajdhani font-bold text-white text-sm group-hover:text-purple-400 transition-colors">Instagram</p>
                    <p className="text-gray-500 text-xs">@jhojha.games · DM for support</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                </a>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-rajdhani font-bold text-white text-sm group-hover:text-blue-400 transition-colors">Telegram</p>
                    <p className="text-gray-500 text-xs">@jhojhagames · Fast responses</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-rajdhani font-bold text-white text-sm group-hover:text-green-400 transition-colors">WhatsApp Support</p>
                    <p className="text-gray-500 text-xs">Chat directly with our team</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-green-400 transition-colors" />
                </a>
              </div>
            </div>
          )}

          {/* ── BOTTOM CONTACT BUTTONS (always visible) ── */}
          <div className="max-w-3xl mx-auto">
            <div className="p-5 sm:p-6 rounded-2xl border border-yellow-500/15 bg-gradient-to-r from-yellow-500/8 via-yellow-500/4 to-transparent">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-rajdhani text-base font-bold text-white">Still not sure? Talk to us!</h4>
                    <p className="text-gray-500 font-inter text-xs mt-0.5">Our team responds within minutes ⚡</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani font-bold text-xs uppercase tracking-wider hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-200">
                    <Instagram className="w-3.5 h-3.5" /> Instagram
                  </a>
                  <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-rajdhani font-bold text-xs uppercase tracking-wider hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-200">
                    <Send className="w-3.5 h-3.5" /> Telegram
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-rajdhani font-bold text-xs uppercase tracking-wider hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-200">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {checkoutGame && (
        <CheckoutModal
          gameName={checkoutGame.name}
          price={checkoutGame.price}
          onClose={() => setCheckoutGame(null)}
        />
      )}
    </>
  );
}
