import { useState, useRef } from 'react';
import {
  X, ShieldCheck, Smartphone, Wallet, CreditCard, QrCode,
  Upload, CheckCircle2, Instagram, Send, ArrowRight, ChevronRight,
} from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/jhojha.games?igsh=ZGltczl3MHh0ZTN1';
const TELEGRAM_URL = 'https://t.me/jhojhagames';

const paymentMethods = [
  { name: 'UPI',        Icon: Smartphone,  color: 'from-orange-500 to-amber-500',   shadow: 'rgba(249,115,22,0.4)',   desc: 'Any UPI App' },
  { name: 'PhonePe',   Icon: CreditCard,   color: 'from-purple-600 to-indigo-600',  shadow: 'rgba(139,92,246,0.4)',   desc: 'Instant Transfer' },
  { name: 'Google Pay',Icon: Smartphone,   color: 'from-blue-500 to-cyan-500',      shadow: 'rgba(59,130,246,0.4)',   desc: 'Fast & Secure' },
  { name: 'Paytm',     Icon: Wallet,       color: 'from-sky-500 to-blue-600',       shadow: 'rgba(14,165,233,0.4)',   desc: 'Wallet / UPI' },
];

interface Props {
  gameName: string;
  price: number;
  onClose: () => void;
}

type Step = 'payment' | 'form' | 'success';

export default function CheckoutModal({ gameName, price, onClose }: Props) {
  const [step, setStep] = useState<Step>('payment');
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [telegram, setTelegram] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setScreenshotName(file.name);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!instagram.trim()) errs.instagram = 'Instagram username is required';
    if (!screenshot) errs.screenshot = 'Payment screenshot is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) setStep('success');
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5"
      style={{ background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-yellow-500/30"
        style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.2), 0 40px 80px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-yellow-500/10">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 text-xs font-rajdhani font-bold uppercase tracking-widest">
              Secure Checkout
            </span>
          </div>
          <h2 className="font-orbitron text-xl font-black text-white leading-tight">
            {step === 'success' ? 'Order Confirmed!' : 'Complete Your Order'}
          </h2>

          {/* Game pill */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/25">
            <span className="text-yellow-400 font-rajdhani text-sm font-bold">{gameName}</span>
            <span className="w-1 h-1 rounded-full bg-yellow-500/50" />
            <span className="font-orbitron text-sm font-black text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
          </div>

          {/* Step indicator */}
          {step !== 'success' && (
            <div className="flex items-center gap-2 mt-4">
              {(['payment', 'form'] as const).map((stepId, i) => {
                const isActive = step === stepId;
                const isDone = i === 0 && step === 'form';
                return (
                  <div key={stepId} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-orbitron font-black transition-all duration-300 ${isActive ? 'bg-yellow-500 text-black' : isDone ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-500' : 'bg-white/5 border border-white/15 text-gray-500'}`}>
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-xs font-rajdhani font-bold uppercase tracking-wider ${isActive ? 'text-yellow-500' : 'text-gray-600'}`}>
                      {stepId === 'payment' ? 'Pay' : 'Details'}
                    </span>
                    {i < 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-700" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── STEP 1: PAYMENT ── */}
        {step === 'payment' && (
          <div className="p-6 space-y-6">
            {/* Payment methods */}
            <div>
              <h3 className="font-orbitron text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" /> Choose Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(({ name: mName, Icon, color, shadow, desc }) => (
                  <div
                    key={mName}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-yellow-500/40 hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}
                      style={{ boxShadow: `0 4px 12px ${shadow}` }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-rajdhani text-sm font-bold text-white">{mName}</p>
                      <p className="text-gray-500 font-inter text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <h3 className="font-orbitron text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5" /> Scan QR to Pay
              </h3>
              <div
                className="relative rounded-2xl overflow-hidden p-1"
                style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.5), 0 0 30px rgba(245,166,35,0.15)' }}
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-400 rounded-tl-2xl z-10" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-400 rounded-tr-2xl z-10" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-yellow-400 rounded-bl-2xl z-10" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-yellow-400 rounded-br-2xl z-10" />
                <img
                  src="/payment-qr.jpeg"
                  alt="Scan to pay"
                  className="w-52 h-52 sm:w-60 sm:h-60 object-cover rounded-xl"
                />
              </div>
              <p className="mt-3 font-rajdhani text-sm font-bold text-yellow-400 uppercase tracking-widest">
                Scan & Pay ₹{price.toLocaleString('en-IN')}
              </p>
              <p className="text-gray-500 font-inter text-xs mt-0.5">UPI · PhonePe · Google Pay · Paytm</p>
            </div>

            {/* Paid CTA */}
            <button
              onClick={() => setStep('form')}
              className="order-btn w-full py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200"
            >
              I Have Paid — Fill Details
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-gray-600 font-inter text-xs">
              Complete the payment first, then fill your details on the next step.
            </p>
          </div>
        )}

        {/* ── STEP 2: FORM ── */}
        {step === 'form' && (
          <div className="p-6 space-y-5">
            <p className="text-gray-400 font-inter text-sm leading-relaxed">
              Great! Now fill in your details so we can deliver your game.
            </p>

            {/* Name */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.name ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none focus:bg-white/8 transition-all duration-200`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-400 font-inter">{errors.name}</p>}
            </div>

            {/* Instagram */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">
                Instagram Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-inter text-sm">@</span>
                <input
                  type="text"
                  value={instagram}
                  onChange={e => { setInstagram(e.target.value); setErrors(p => ({ ...p, instagram: '' })); }}
                  placeholder="your.username"
                  className={`w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border ${errors.instagram ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none focus:bg-white/8 transition-all duration-200`}
                />
              </div>
              {errors.instagram && <p className="mt-1 text-xs text-red-400 font-inter">{errors.instagram}</p>}
            </div>

            {/* Telegram (optional) */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">
                Telegram Username <span className="text-gray-600 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-inter text-sm">@</span>
                <input
                  type="text"
                  value={telegram}
                  onChange={e => setTelegram(e.target.value)}
                  placeholder="your.username"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-500/60 text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none focus:bg-white/8 transition-all duration-200"
                />
              </div>
            </div>

            {/* Game purchased (pre-filled, read-only) */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">
                Game Purchased
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 font-rajdhani text-sm font-bold flex items-center justify-between">
                <span>{gameName}</span>
                <span className="font-orbitron text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">
                Payment Screenshot <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`w-full flex flex-col items-center justify-center gap-2.5 py-7 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${screenshot ? 'border-green-500/60 bg-green-500/5' : errors.screenshot ? 'border-red-500/50 bg-red-500/5' : 'border-yellow-500/25 bg-yellow-500/3 hover:border-yellow-500/50 hover:bg-yellow-500/6'}`}
              >
                {screenshot ? (
                  <>
                    <CheckCircle2 className="w-9 h-9 text-green-400" />
                    <div className="text-center">
                      <p className="font-rajdhani text-sm font-bold text-green-400 uppercase tracking-wider">Screenshot Attached!</p>
                      <p className="font-inter text-xs text-gray-500 mt-0.5 max-w-[220px] truncate">{screenshotName}</p>
                    </div>
                    <span className="text-xs text-gray-600 font-inter">Tap to change</span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-rajdhani text-sm font-bold text-white uppercase tracking-wider">Upload Screenshot</p>
                      <p className="font-inter text-xs text-gray-500 mt-0.5">PNG, JPG up to 10MB</p>
                    </div>
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              {errors.screenshot && <p className="mt-1 text-xs text-red-400 font-inter">{errors.screenshot}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="order-btn w-full py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200"
            >
              Confirm Order
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setStep('payment')}
              className="w-full text-center text-gray-600 font-inter text-xs hover:text-gray-400 transition-colors"
            >
              ← Back to Payment
            </button>
          </div>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center text-center space-y-5">
            {/* Animated checkmark */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mt-2"
              style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', boxShadow: '0 0 0 1px rgba(34,197,94,0.3), 0 0 40px rgba(34,197,94,0.15)' }}
            >
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>

            <div>
              <h3 className="font-orbitron text-xl font-black text-green-400 mb-1">Payment Received!</h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-2">
                <span className="text-yellow-400 font-rajdhani text-sm font-bold">{gameName}</span>
                <span className="font-orbitron text-sm font-black text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Success message */}
            <div className="p-4 rounded-xl bg-white/3 border border-white/8 text-left">
              <p className="font-inter text-sm text-gray-300 leading-relaxed">
                Payment received successfully. Please contact{' '}
                <span className="text-yellow-400 font-semibold">@jhojha.games</span> on Instagram or{' '}
                <span className="text-blue-400 font-semibold">@JhojhaGames</span> on Telegram with your payment screenshot to receive your game.
              </p>
            </div>

            {/* Details summary */}
            <div className="w-full p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15 space-y-2 text-left">
              <p className="font-rajdhani text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Order Summary</p>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-inter text-xs">Name</span>
                  <span className="text-white font-inter text-xs font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-inter text-xs">Instagram</span>
                  <span className="text-white font-inter text-xs font-medium">@{instagram}</span>
                </div>
                {telegram && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-inter text-xs">Telegram</span>
                    <span className="text-white font-inter text-xs font-medium">@{telegram}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 font-inter text-xs">Game</span>
                  <span className="text-yellow-400 font-inter text-xs font-bold">{gameName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-inter text-xs">Amount Paid</span>
                  <span className="text-yellow-500 font-orbitron text-xs font-black">₹{price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Contact buttons */}
            <div className="w-full space-y-3">
              <a
                href={`${INSTAGRAM_URL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:scale-[1.02] transition-all duration-300"
              >
                <Instagram className="w-4 h-4" />
                Contact on Instagram
              </a>
              <a
                href={`${TELEGRAM_URL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:scale-[1.02] transition-all duration-300"
              >
                <Send className="w-4 h-4" />
                Join Telegram
              </a>
            </div>

            <button
              onClick={onClose}
              className="text-gray-600 font-inter text-xs hover:text-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
