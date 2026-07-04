import { useState, useRef } from 'react';
import {
  X, ShieldCheck, ArrowRight, ChevronRight, CheckCircle2,
  Instagram, Send, Loader2, XCircle, ScanSearch,
  Smartphone, Wallet, CreditCard, AlertTriangle, Mail,
  KeyRound, Eye, EyeOff,
} from 'lucide-react';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void; escape?: boolean; backdropclose?: boolean };
  config?: {
    display?: {
      blocks?: Record<string, { name: string; instruments: { method: string; flows?: string[] }[] }>;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
  handler?: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
}

const INSTAGRAM_URL = 'https://www.instagram.com/jhojha.games?igsh=ZGltczl3MHh0ZTN1';
const TELEGRAM_URL  = 'https://t.me/jhojhagames';

type Step = 'details' | 'payment' | 'verifying' | 'success' | 'failed';
type PayMethod = 'upi' | 'phonepe' | 'gpay' | 'paytm';

interface Props { gameName: string; price: number; onClose: () => void; }

const METHODS: { id: PayMethod; label: string; desc: string; color: string; shadow: string; Icon: React.ElementType }[] = [
  { id: 'upi',     label: 'UPI',         desc: 'Any UPI App',        color: 'from-orange-500 to-amber-500',  shadow: 'rgba(249,115,22,0.35)', Icon: Smartphone  },
  { id: 'phonepe', label: 'PhonePe',     desc: 'Fast Transfer',      color: 'from-purple-600 to-indigo-600', shadow: 'rgba(139,92,246,0.35)', Icon: CreditCard  },
  { id: 'gpay',    label: 'Google Pay',  desc: 'Instant & Secure',   color: 'from-blue-500 to-cyan-500',     shadow: 'rgba(59,130,246,0.35)', Icon: Smartphone  },
  { id: 'paytm',   label: 'Paytm',       desc: 'Wallet / UPI',       color: 'from-sky-500 to-blue-600',      shadow: 'rgba(14,165,233,0.35)', Icon: Wallet      },
];

function validateInstagram(u: string) {
  const t = u.trim().replace(/^@/, '');
  if (!t) return 'Instagram username is required';
  if (t.length > 30) return 'Must be 30 characters or less';
  if (!/^[a-zA-Z0-9._]+$/.test(t)) return 'Only letters, numbers, . and _ allowed';
  if (/\.\./.test(t)) return 'Cannot have consecutive dots';
  if (t.startsWith('.') || t.endsWith('.')) return 'Cannot start or end with a dot';
  return '';
}

function validateEmail(e: string) {
  if (!e.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address';
  return '';
}

export default function CheckoutModal({ gameName, price, onClose }: Props) {
  const [step, setStep] = useState<Step>('details');
  const [method, setMethod] = useState<PayMethod>('upi');

  const [name, setName]           = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail]         = useState('');
  const [telegram, setTelegram]   = useState('');
  const [steamUser, setSteamUser] = useState('');
  const [steamPass, setSteamPass] = useState('');
  const [showSteam, setShowSteam] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const [verifyStatus, setVerifyStatus] = useState<string>('');
  const [failReason, setFailReason]     = useState('');
  const [orderId, setOrderId]           = useState('');

  const paying = useRef(false);

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    const igErr = validateInstagram(instagram); if (igErr) e.instagram = igErr;
    const emErr = validateEmail(email); if (emErr) e.email = emErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openRazorpay = async () => {
    if (paying.current) return;
    paying.current = true;
    setStep('verifying');
    setVerifyStatus('Creating secure payment session…');

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price, game_name: gameName }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      setVerifyStatus('Opening payment gateway…');

      const rzpConfig: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jhojha Games',
        description: `Payment for ${gameName}`,
        order_id: orderData.order_id,
        prefill: { name, email },
        theme: { color: '#F5A623' },
        modal: {
          escape: false,
          backdropclose: false,
          ondismiss: () => {
            paying.current = false;
            setStep('failed');
            setFailReason('Payment was cancelled. Please try again.');
          },
        },
        handler: async (response) => {
          setVerifyStatus('Verifying payment with gateway…');
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                customer_name: name,
                instagram: instagram.replace(/^@/, ''),
                email,
                telegram: telegram.replace(/^@/, '') || null,
                game_name: gameName,
                game_price: price,
                steam_username: steamUser || null,
                steam_password: steamPass || null,
                payment_method: method,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || verifyData.status !== 'verified') {
              throw new Error(verifyData.error || 'Verification failed');
            }
            setOrderId(verifyData.order_db_id?.toString() || '');
            setStep('success');
          } catch (err) {
            setFailReason((err as Error).message || 'Payment verification failed');
            setStep('failed');
          } finally {
            paying.current = false;
          }
        },
      };

      if (method === 'upi' || method === 'phonepe' || method === 'gpay') {
        rzpConfig.config = {
          display: {
            blocks: { utib0: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] } },
            sequence: ['block.utib0'],
            preferences: { show_default_blocks: false },
          },
        };
      } else if (method === 'paytm') {
        rzpConfig.config = {
          display: {
            blocks: { utib0: { name: 'Pay via Paytm', instruments: [{ method: 'upi', flows: ['intent'] }] } },
            sequence: ['block.utib0'],
            preferences: { show_default_blocks: false },
          },
        };
      }

      if (!window.Razorpay) throw new Error('Payment gateway not loaded. Please refresh the page.');
      const rzp = new window.Razorpay(rzpConfig);
      rzp.open();
    } catch (err) {
      paying.current = false;
      setFailReason((err as Error).message || 'Could not open payment gateway');
      setStep('failed');
    }
  };

  const stepOrder: Step[] = ['details', 'payment'];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={step === 'verifying' ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-yellow-500/30"
        style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.2), 0 40px 80px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {step !== 'verifying' && (
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-all">
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        {step !== 'verifying' && (
          <div className="px-6 pt-6 pb-5 border-b border-yellow-500/10">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 text-xs font-rajdhani font-bold uppercase tracking-widest">
                {step === 'success' ? 'Order Confirmed' : step === 'failed' ? 'Payment Failed' : 'Secure Checkout'}
              </span>
            </div>
            <h2 className="font-orbitron text-xl font-black text-white">
              {step === 'success' ? 'Payment Verified!' : step === 'failed' ? 'Transaction Failed' : 'Complete Your Order'}
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/25">
              <span className="text-yellow-400 font-rajdhani text-sm font-bold">{gameName}</span>
              <span className="w-1 h-1 rounded-full bg-yellow-500/50" />
              <span className="font-orbitron text-sm font-black text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
            </div>

            {(step === 'details' || step === 'payment') && (
              <div className="flex items-center gap-2 mt-4">
                {stepOrder.map((s, i) => {
                  const isActive = step === s;
                  const isDone = i === 0 && step === 'payment';
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-orbitron font-black transition-all duration-300 ${isActive ? 'bg-yellow-500 text-black' : isDone ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-500' : 'bg-white/5 border border-white/15 text-gray-500'}`}>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className={`text-xs font-rajdhani font-bold uppercase tracking-wider ${isActive ? 'text-yellow-500' : 'text-gray-600'}`}>
                        {s === 'details' ? 'Details' : 'Payment'}
                      </span>
                      {i < 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-700" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: DETAILS FORM ── */}
        {step === 'details' && (
          <div className="p-6 space-y-4">
            <p className="text-gray-400 font-inter text-sm">Fill in your details to receive your game after payment.</p>

            {/* Name */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }} placeholder="Your full name"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.name ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all`} />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Instagram */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Instagram Username <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                <input type="text" value={instagram} onChange={e => { setInstagram(e.target.value.replace(/^@/, '')); setErrors(p => ({ ...p, instagram: '' })); }} placeholder="your.username"
                  className={`w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border ${errors.instagram ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all`} />
              </div>
              {errors.instagram && <p className="mt-1 text-xs text-red-400">{errors.instagram}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">
                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email Address <span className="text-red-400">*</span></span>
              </label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.email ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all`} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Telegram */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Telegram <span className="text-gray-600 font-normal normal-case tracking-normal">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                <input type="text" value={telegram} onChange={e => setTelegram(e.target.value.replace(/^@/, ''))} placeholder="your.username"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-500/60 text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all" />
              </div>
            </div>

            {/* Game — read-only */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Game Purchased</label>
              <div className="w-full px-4 py-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 font-rajdhani text-sm font-bold flex items-center justify-between">
                <span>{gameName}</span>
                <span className="font-orbitron text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Steam Details toggle */}
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSteam(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2 font-rajdhani text-xs font-bold uppercase tracking-widest text-gray-400">
                  <KeyRound className="w-3.5 h-3.5" /> Steam Account Details <span className="text-gray-600 font-normal normal-case tracking-normal">(if required for delivery)</span>
                </span>
                <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showSteam ? 'rotate-90' : ''}`} />
              </button>
              {showSteam && (
                <div className="p-4 space-y-3 border-t border-white/8">
                  <div>
                    <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Steam Username</label>
                    <input type="text" value={steamUser} onChange={e => setSteamUser(e.target.value)} placeholder="SteamUsername123"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-500/60 text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">Steam Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={steamPass} onChange={e => setSteamPass(e.target.value)} placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-500/60 text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all" />
                      <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-600">Your credentials are encrypted and only used for game delivery.</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => { if (validateDetails()) setStep('payment'); }}
              className="order-btn w-full py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              Continue to Payment <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: PAYMENT METHOD ── */}
        {step === 'payment' && (
          <div className="p-6 space-y-5">
            <p className="text-gray-400 font-inter text-sm">Choose your payment method. You'll be redirected to a secure Razorpay checkout.</p>

            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {METHODS.map(({ id, label, desc, color, shadow, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMethod(id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${method === id ? 'border-yellow-500/60 bg-yellow-500/8 shadow-[0_0_20px_rgba(245,166,35,0.1)]' : 'border-white/8 bg-white/3 hover:border-white/20'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`} style={{ boxShadow: method === id ? `0 4px 12px ${shadow}` : 'none' }}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-rajdhani text-sm font-bold text-white leading-tight">{label}</p>
                      <p className="text-gray-500 text-xs truncate">{desc}</p>
                    </div>
                    {method === id && <CheckCircle2 className="w-4 h-4 text-yellow-500 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount summary */}
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15 space-y-2">
              <p className="font-rajdhani text-xs font-bold text-yellow-500 uppercase tracking-widest">Order Summary</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-inter text-sm">{gameName}</span>
                <span className="font-orbitron font-black text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between border-t border-yellow-500/10 pt-2">
                <span className="font-rajdhani font-bold text-yellow-400 uppercase tracking-wider text-sm">Total</span>
                <span className="font-orbitron font-black text-yellow-500 text-lg">₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/3 border border-white/8 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="font-inter text-xs text-gray-400 leading-relaxed">
                Secured by <span className="text-white font-semibold">Razorpay</span>. Your payment is encrypted and verified by the gateway — we never accept unverified transactions.
              </p>
            </div>

            <button onClick={openRazorpay} className="order-btn w-full py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
              <ShieldCheck className="w-4 h-4" />
              Pay ₹{price.toLocaleString('en-IN')} via {METHODS.find(m => m.id === method)?.label}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button onClick={() => setStep('details')} className="w-full text-center text-gray-600 font-inter text-xs hover:text-gray-400 transition-colors">
              ← Back to Details
            </button>
          </div>
        )}

        {/* ── VERIFYING ── */}
        {step === 'verifying' && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-6 mt-2">
              <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.15), transparent)', boxShadow: '0 0 0 1px rgba(245,166,35,0.3)', animation: 'pulse 2s ease-in-out infinite' }} />
              <div className="absolute inset-0 rounded-full border-t-2 border-yellow-500" style={{ animation: 'spin 1.2s linear infinite' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanSearch className="w-8 h-8 text-yellow-500" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>
            <h3 className="font-orbitron text-lg font-black text-white mb-2">Processing Payment</h3>
            <p className="text-gray-400 font-inter text-sm mb-2">{verifyStatus}</p>
            <div className="flex items-center gap-2 text-gray-600 font-inter text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Do not close this window…
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mt-2" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', boxShadow: '0 0 0 1px rgba(34,197,94,0.3), 0 0 40px rgba(34,197,94,0.15)' }}>
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>

            <div>
              <h3 className="font-orbitron text-xl font-black text-green-400 mb-1">Payment Verified!</h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-2">
                <span className="text-yellow-400 font-rajdhani text-sm font-bold">{gameName}</span>
                <span className="font-orbitron text-sm font-black text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-rajdhani text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Payment Verified
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-rajdhani text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Order Confirmed
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-rajdhani text-xs font-bold uppercase tracking-wider">
                <Loader2 className="w-3.5 h-3.5" /> Delivery Processing
              </span>
            </div>

            <div className="w-full p-4 rounded-xl bg-green-500/8 border border-green-500/20 text-left">
              <p className="font-inter text-sm text-gray-300 leading-relaxed">
                ✅ Payment verified successfully. Order accepted. Your game delivery is being processed.
              </p>
              <p className="font-inter text-xs text-gray-500 mt-2">
                Contact <span className="text-yellow-400 font-semibold">@jhojha.games</span> on Instagram or{' '}
                <span className="text-blue-400 font-semibold">@JhojhaGames</span> on Telegram for delivery status.
              </p>
            </div>

            <div className="w-full p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15 space-y-1.5 text-left">
              <p className="font-rajdhani text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Order Details</p>
              {[
                ['Customer', name],
                ['Instagram', `@${instagram}`],
                ...(telegram ? [['Telegram', `@${telegram}`]] : []),
                ['Email', email],
                ['Game', gameName],
                ['Amount Paid', `₹${price.toLocaleString('en-IN')}`],
                ...(orderId ? [['Order ID', `#${orderId}`]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500 font-inter text-xs">{k}</span>
                  <span className={`font-inter text-xs font-medium ${k === 'Amount Paid' ? 'text-yellow-500 font-orbitron font-black' : k === 'Game' ? 'text-yellow-400' : 'text-white'}`}>{v}</span>
                </div>
              ))}
            </div>

            <div className="w-full space-y-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-all duration-300">
                <Instagram className="w-4 h-4" /> Contact on Instagram
              </a>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-all duration-300">
                <Send className="w-4 h-4" /> Join Telegram
              </a>
            </div>
            <button onClick={onClose} className="text-gray-600 font-inter text-xs hover:text-gray-400 transition-colors">Close</button>
          </div>
        )}

        {/* ── FAILED ── */}
        {step === 'failed' && (
          <div className="p-6 flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mt-2" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.2), rgba(239,68,68,0.04))', boxShadow: '0 0 0 1px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.12)' }}>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h3 className="font-orbitron text-xl font-black text-red-400 mb-1">Payment Failed</h3>
              <p className="text-gray-500 font-inter text-xs">Transaction could not be completed</p>
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/8 border border-red-500/20">
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 font-rajdhani text-sm font-bold">❌ Payment Failed</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/8 border border-red-500/20">
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 font-rajdhani text-sm font-bold">❌ Invalid Transaction</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/8 border border-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-amber-300 font-rajdhani text-sm font-bold">❌ Please Try Again</span>
              </div>
            </div>

            {failReason && (
              <div className="w-full p-3 rounded-xl bg-white/3 border border-white/8 text-left">
                <p className="font-inter text-xs text-gray-400">{failReason}</p>
              </div>
            )}

            <div className="w-full space-y-2">
              <button onClick={() => { paying.current = false; setStep('payment'); setFailReason(''); }} className="order-btn w-full py-3.5 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                Try Again
              </button>
              <div className="grid grid-cols-2 gap-2">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-all">
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-rajdhani font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-all">
                  <Send className="w-3.5 h-3.5" /> Telegram
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
