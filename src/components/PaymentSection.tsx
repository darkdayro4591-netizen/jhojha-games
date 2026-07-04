import { useState } from 'react';
import {
  ShieldCheck, Smartphone, Wallet, QrCode, Upload, Instagram,
  Send, CheckCircle2, CreditCard, Zap, Headphones, Star,
} from 'lucide-react';

const INSTAGRAM_URL = 'https://instagram.com/jhojha.games';
const TELEGRAM_URL = 'https://t.me/JhojhaGames';

const paymentMethods = [
  {
    name: 'UPI',
    icon: Smartphone,
    color: 'from-orange-500 to-amber-500',
    shadow: 'rgba(249,115,22,0.4)',
    desc: 'Any UPI App',
  },
  {
    name: 'PhonePe',
    icon: CreditCard,
    color: 'from-purple-600 to-indigo-600',
    shadow: 'rgba(139,92,246,0.4)',
    desc: 'Instant Transfer',
  },
  {
    name: 'Google Pay',
    icon: Smartphone,
    color: 'from-blue-500 to-cyan-500',
    shadow: 'rgba(59,130,246,0.4)',
    desc: 'Fast & Secure',
  },
  {
    name: 'Paytm',
    icon: Wallet,
    color: 'from-sky-500 to-blue-600',
    shadow: 'rgba(14,165,233,0.4)',
    desc: 'Wallet / UPI',
  },
];

const steps = [
  { num: '01', text: 'Select your game from our collection.' },
  { num: '02', text: 'Contact us on Instagram or Telegram.' },
  { num: '03', text: 'Make the payment using any method below.' },
  { num: '04', text: 'Send us your payment screenshot.' },
  { num: '05', text: 'Receive your game key instantly! 🎮' },
];

const trustBadges = [
  { icon: ShieldCheck, label: 'Secure Payments', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  { icon: Zap, label: 'Instant Delivery', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { icon: Star, label: 'Trusted Seller', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  { icon: Headphones, label: 'Customer Support', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
];

export default function PaymentSection() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploaded(true);
    }
  };

  return (
    <section id="payment" className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 hex-bg opacity-10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-yellow-500/3 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">Payment & Checkout</span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
            <span className="text-white">💳 Secure </span>
            <span className="text-yellow-500 gold-glow">Payment Options</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-base sm:text-lg uppercase tracking-[0.15em] max-w-xl mx-auto">
            Complete your order using any of the payment methods below.
          </p>
          <div className="mt-5 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-14">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${badge.bg} transition-all duration-300 hover:-translate-y-1`}
                style={{ animation: `fadeInUp 0.5s ease ${idx * 0.08}s both` }}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${badge.color}`} />
                <span className={`font-rajdhani text-sm font-bold uppercase tracking-wider ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-10">

          {/* LEFT — Payment methods + QR */}
          <div className="space-y-6">
            {/* Payment method cards */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/15">
              <h3 className="font-orbitron text-sm font-bold text-yellow-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Accepted Payment Methods
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method, idx) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={idx}
                      className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/3 border border-white/8 hover:border-yellow-500/40 hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                      style={{ animation: `fadeInUp 0.5s ease ${idx * 0.1}s both` }}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                        style={{ boxShadow: `0 4px 14px ${method.shadow}` }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-rajdhani text-sm font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
                          {method.name}
                        </p>
                        <p className="text-gray-500 font-inter text-xs">{method.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QR Code area */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/15 flex flex-col items-center text-center">
              <h3 className="font-orbitron text-sm font-bold text-yellow-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Scan QR Code to Pay
              </h3>

              {/* Actual QR image */}
              <div className="relative rounded-2xl overflow-hidden p-1 mb-4"
                style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.5), 0 0 40px rgba(245,166,35,0.2)' }}
              >
                {/* Animated gold border pulse */}
                <div className="absolute inset-0 rounded-2xl opacity-60" style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.3), transparent, rgba(245,166,35,0.3))', animation: 'borderPulse 2s ease-in-out infinite' }} />
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-yellow-400 rounded-tl-2xl z-10" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-yellow-400 rounded-tr-2xl z-10" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-yellow-400 rounded-bl-2xl z-10" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-yellow-400 rounded-br-2xl z-10" />

                <img
                  src="/payment-qr.jpeg"
                  alt="Scan to pay with any UPI app"
                  className="relative w-56 h-56 sm:w-64 sm:h-64 object-cover rounded-xl"
                />
              </div>

              <p className="font-rajdhani text-sm font-bold text-yellow-400 uppercase tracking-widest mb-1">
                Scan to Pay with Any UPI App
              </p>
              <p className="text-gray-500 font-inter text-xs">UPI · PhonePe · Google Pay · Paytm</p>
            </div>

            {/* Screenshot upload */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/15">
              <h3 className="font-orbitron text-sm font-bold text-yellow-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Payment Screenshot
              </h3>
              <label className={`group flex flex-col items-center justify-center gap-3 w-full py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${uploaded ? 'border-green-500/60 bg-green-500/5' : 'border-yellow-500/25 bg-yellow-500/3 hover:border-yellow-500/50 hover:bg-yellow-500/8'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                {uploaded ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                    <div className="text-center">
                      <p className="font-rajdhani text-sm font-bold text-green-400 uppercase tracking-wider">Screenshot Uploaded!</p>
                      <p className="font-inter text-xs text-gray-500 mt-1 truncate max-w-[200px]">{fileName}</p>
                    </div>
                    <span className="text-xs text-gray-500 font-inter">Click to change</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors duration-300">
                      <Upload className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-rajdhani text-sm font-bold text-white uppercase tracking-wider">Upload Payment Screenshot</p>
                      <p className="font-inter text-xs text-gray-500 mt-1">After Payment</p>
                    </div>
                    <span className="text-xs text-gray-600 font-inter">PNG, JPG up to 10MB</span>
                  </>
                )}
              </label>
              {uploaded && (
                <a
                  href={`${TELEGRAM_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 font-rajdhani text-xs font-bold uppercase tracking-wider hover:bg-blue-500/25 transition-all duration-300"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send on Telegram
                </a>
              )}
            </div>
          </div>

          {/* RIGHT — Instructions + Order buttons */}
          <div className="space-y-6">
            {/* How to order */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/15">
              <h3 className="font-orbitron text-sm font-bold text-yellow-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                How to Order
              </h3>
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-yellow-500/25 hover:bg-yellow-500/4 transition-all duration-300"
                    style={{ animation: `fadeInUp 0.5s ease ${idx * 0.1}s both` }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center"
                      style={{ boxShadow: '0 4px 14px rgba(245,166,35,0.35)' }}
                    >
                      <span className="font-orbitron text-xs font-black text-black">{step.num}</span>
                    </div>
                    <p className="font-rajdhani text-sm sm:text-base font-medium text-gray-300 group-hover:text-white transition-colors duration-300 leading-snug pt-1.5">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order buttons */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/15">
              <h3 className="font-orbitron text-sm font-bold text-yellow-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Place Your Order
              </h3>
              <div className="space-y-3">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between w-full px-5 py-4 rounded-xl bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-yellow-500/20 border border-purple-500/30 hover:border-pink-500/60 hover:from-purple-600/30 hover:via-pink-500/30 hover:to-yellow-500/30 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ boxShadow: '0 0 0 0 rgba(236,72,153,0)' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(236,72,153,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(236,72,153,0)')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-500 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-rajdhani text-sm font-bold text-white uppercase tracking-wider">Order on Instagram</p>
                      <p className="font-inter text-xs text-gray-400">@jhojha.games</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors duration-300">
                    <Instagram className="w-4 h-4 text-pink-400" />
                  </div>
                </a>

                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between w-full px-5 py-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-sky-500/20 border border-blue-500/30 hover:border-blue-400/60 hover:from-blue-600/30 hover:to-sky-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-rajdhani text-sm font-bold text-white uppercase tracking-wider">Join Telegram</p>
                      <p className="font-inter text-xs text-gray-400">@JhojhaGames</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                    <Send className="w-4 h-4 text-blue-400" />
                  </div>
                </a>
              </div>
            </div>

            {/* Security note */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-green-500/8 to-emerald-500/8 border border-green-500/20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-rajdhani text-sm font-bold text-green-400 uppercase tracking-wider mb-1">100% Safe & Secure</p>
                  <p className="font-inter text-xs text-gray-400 leading-relaxed">
                    All transactions are monitored and verified. Your payment details are never stored. We've served 1000+ happy customers with instant delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
