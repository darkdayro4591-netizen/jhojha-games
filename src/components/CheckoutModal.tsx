import { useState, useRef, useCallback } from 'react';
import {
  X, ShieldCheck, ArrowRight, ChevronRight, CheckCircle2,
  Instagram, Send, Loader2, XCircle, Clock,
  Smartphone, Wallet, CreditCard, AlertTriangle, Mail,
  KeyRound, Eye, EyeOff, QrCode, Upload, ScanLine,
  BadgeCheck, AlertCircle, Zap,
} from 'lucide-react';

const INSTAGRAM_URL = 'https://instagram.com/jhojha.games';
const TELEGRAM_URL  = 'https://t.me/JhojhaGames';

type Step        = 'details' | 'payment' | 'submitting' | 'pending' | 'failed';
type PayMethod   = 'upi' | 'phonepe' | 'gpay' | 'paytm';
type OcrState    = 'idle' | 'analyzing' | 'auto_matched' | 'pending_review' | 'rejected' | 'error';

interface OcrResult {
  verificationMode: OcrState;
  rejectionReason:  string | null;
  ocrToken:         string; // HMAC-signed server token — sent back with the order
  extracted: {
    amount:        number | null;
    transactionId: string | null;
    date:          string | null;
    time:          string | null;
    receiverName:  string | null;
    isSuccess:     boolean;
    rawStatus:     string;
  };
}

interface Props { gameName: string; price: number; onClose: () => void; }

const METHODS: { id: PayMethod; label: string; desc: string; color: string; shadow: string; Icon: React.ElementType }[] = [
  { id: 'upi',     label: 'UPI',        desc: 'Any UPI App',       color: 'from-orange-500 to-amber-500',  shadow: 'rgba(249,115,22,0.35)', Icon: Smartphone },
  { id: 'phonepe', label: 'PhonePe',    desc: 'Fast Transfer',     color: 'from-purple-600 to-indigo-600', shadow: 'rgba(139,92,246,0.35)', Icon: CreditCard  },
  { id: 'gpay',    label: 'Google Pay', desc: 'Instant & Secure',  color: 'from-blue-500 to-cyan-500',     shadow: 'rgba(59,130,246,0.35)', Icon: Smartphone  },
  { id: 'paytm',   label: 'Paytm',      desc: 'Wallet / UPI',      color: 'from-sky-500 to-blue-600',      shadow: 'rgba(14,165,233,0.35)', Icon: Wallet       },
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
  if (!e.trim()) return '';
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

  const [fileName, setFileName]           = useState<string | null>(null);
  const [ocrState, setOcrState]           = useState<OcrState>('idle');
  const [ocrResult, setOcrResult]         = useState<OcrResult | null>(null);
  const [_screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const [failReason, setFailReason] = useState('');
  const [orderId, setOrderId]       = useState('');
  const [finalStatus, setFinalStatus] = useState('');

  const submitting = useRef(false);

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    const igErr = validateInstagram(instagram); if (igErr) e.instagram = igErr;
    const emErr = validateEmail(email);         if (emErr) e.email     = emErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const analyzeScreenshot = useCallback(async (file: File) => {
    setOcrState('analyzing');
    setOcrResult(null);

    try {
      const fd = new FormData();
      fd.append('screenshot', file);
      fd.append('game_name', gameName);

      const res  = await fetch('/api/ocr/analyze', { method: 'POST', body: fd });
      const data = await res.json() as OcrResult;

      if (!res.ok) throw new Error((data as any).error || 'Analysis failed');

      setOcrResult(data);
      setOcrState(data.verificationMode as OcrState);
    } catch (err) {
      console.error('OCR error:', err);
      setOcrState('error');
    }
  }, [gameName]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setScreenshotFile(file);
    analyzeScreenshot(file);
  };

  const submitOrder = async () => {
    if (submitting.current) return;
    // Block rejected / unanalysed screenshots
    if (ocrState === 'rejected' || ocrState === 'idle') return;

    submitting.current = true;
    setStep('submitting');

    try {
      const body: Record<string, unknown> = {
        amount:         price,
        game_name:      gameName,
        customer_name:  name,
        instagram:      instagram.replace(/^@/, ''),
        email:          email   || null,
        telegram:       telegram.replace(/^@/, '') || null,
        steam_username: steamUser || null,
        steam_password: steamPass || null,
        payment_method: method,
        // Send the server-signed token; the server verifies it and derives all
        // OCR fields server-side — we never trust raw client fields for status.
        ocr_token: ocrResult?.ocrToken || null,
      };

      const res  = await fetch('/api/orders/manual', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit order. Please try again or contact support.');

      setOrderId(data.order_db_id?.toString() || '');
      setFinalStatus(data.verification_mode || 'pending');
      setStep('pending');
    } catch (err) {
      setFailReason((err as Error).message || 'Failed to submit order. Please try again or contact support.');
      setStep('failed');
    } finally {
      submitting.current = false;
    }
  };

  // Screenshot is required — idle (no upload yet) does not allow submission
  const canSubmit  = ocrState === 'auto_matched' || ocrState === 'pending_review';
  const isAnalyzing = ocrState === 'analyzing';

  const stepOrder: Step[] = ['details', 'payment'];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={step === 'submitting' ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-yellow-500/30"
        style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.2), 0 40px 80px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {step !== 'submitting' && (
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-all">
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        {step !== 'submitting' && (
          <div className="px-6 pt-6 pb-5 border-b border-yellow-500/10">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 text-xs font-rajdhani font-bold uppercase tracking-widest">
                {step === 'pending' ? 'Order Received' : step === 'failed' ? 'Submission Failed' : 'Checkout'}
              </span>
            </div>
            <h2 className="font-orbitron text-xl font-black text-white">
              {step === 'pending' ? 'Order Confirmed' : step === 'failed' ? 'Something Went Wrong' : 'Complete Your Order'}
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
                  const isDone   = i === 0 && step === 'payment';
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
                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email Address <span className="text-gray-600 font-normal normal-case tracking-normal">(optional)</span></span>
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
              <button type="button" onClick={() => setShowSteam(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2 font-rajdhani text-xs font-bold uppercase tracking-widest text-gray-400">
                  <KeyRound className="w-3.5 h-3.5" /> Steam Account Details <span className="text-gray-600 font-normal normal-case tracking-normal">(if required)</span>
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

        {/* ── STEP 2: PAYMENT ── */}
        {step === 'payment' && (
          <div className="p-6 space-y-5">
            <p className="text-gray-400 font-inter text-sm">Scan the QR code, pay the exact amount, then upload your payment screenshot for instant verification.</p>

            {/* Payment method selector */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {METHODS.map(({ id, label, desc, color, shadow, Icon }) => (
                  <button key={id} onClick={() => setMethod(id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${method === id ? 'border-yellow-500/60 bg-yellow-500/8 shadow-[0_0_20px_rgba(245,166,35,0.1)]' : 'border-white/8 bg-white/3 hover:border-white/20'}`}>
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

            {/* QR Code */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/20 flex flex-col items-center text-center">
              <h3 className="font-orbitron text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Scan QR Code to Pay
              </h3>
              <div className="relative rounded-2xl overflow-hidden p-1" style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.5), 0 0 30px rgba(245,166,35,0.15)' }}>
                <img src="/payment-qr.jpeg" alt="Scan to pay with any UPI app" className="relative w-44 h-44 sm:w-52 sm:h-52 object-cover rounded-xl" />
              </div>
              <p className="font-rajdhani text-sm font-bold text-yellow-400 uppercase tracking-widest mt-3">
                Pay ₹{price.toLocaleString('en-IN')} exactly
              </p>
              <p className="text-gray-500 font-inter text-xs mt-0.5">UPI · PhonePe · Google Pay · Paytm</p>
            </div>

            {/* ── Screenshot upload + OCR ── */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-2">
                Payment Screenshot <span className="text-red-400">*</span>
                <span className="ml-2 text-gray-500 font-normal normal-case tracking-normal text-xs">— required for verification</span>
              </label>

              {/* Drop zone */}
              <label className={`group flex flex-col items-center justify-center gap-2 w-full py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300
                ${ocrState === 'analyzing'    ? 'border-yellow-500/60 bg-yellow-500/5 cursor-default'        : ''}
                ${ocrState === 'auto_matched' ? 'border-green-500/60 bg-green-500/5'                          : ''}
                ${ocrState === 'pending_review' ? 'border-yellow-500/60 bg-yellow-500/5'                      : ''}
                ${ocrState === 'rejected'     ? 'border-red-500/60 bg-red-500/5'                              : ''}
                ${ocrState === 'error'        ? 'border-red-500/40 bg-red-500/3'                              : ''}
                ${ocrState === 'idle'         ? 'border-yellow-500/25 bg-yellow-500/3 hover:border-yellow-500/50 hover:bg-yellow-500/8' : ''}
              `}>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={ocrState === 'analyzing'} />

                {ocrState === 'idle' && (
                  <>
                    <Upload className="w-7 h-7 text-yellow-500" />
                    <p className="font-rajdhani text-xs font-bold text-white uppercase tracking-wider">Upload Payment Screenshot</p>
                    <p className="text-xs text-gray-600 font-inter">PNG, JPG up to 10MB · Auto-scanned instantly</p>
                  </>
                )}

                {ocrState === 'analyzing' && (
                  <>
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-t-2 border-yellow-500 animate-spin" />
                      <ScanLine className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="font-rajdhani text-xs font-bold text-yellow-400 uppercase tracking-wider">Scanning Screenshot…</p>
                    <p className="text-xs text-gray-500 font-inter">Extracting payment details via OCR</p>
                  </>
                )}

                {ocrState === 'auto_matched' && (
                  <>
                    <BadgeCheck className="w-9 h-9 text-green-400" />
                    <p className="font-rajdhani text-xs font-bold text-green-400 uppercase tracking-wider">Payment Verified</p>
                    <p className="font-inter text-xs text-gray-400 truncate max-w-[220px]">{fileName}</p>
                  </>
                )}

                {ocrState === 'pending_review' && (
                  <>
                    <Clock className="w-8 h-8 text-yellow-400" />
                    <p className="font-rajdhani text-xs font-bold text-yellow-400 uppercase tracking-wider">Screenshot Uploaded — Pending Review</p>
                    <p className="font-inter text-xs text-gray-400 truncate max-w-[220px]">{fileName}</p>
                  </>
                )}

                {ocrState === 'rejected' && (
                  <>
                    <XCircle className="w-8 h-8 text-red-400" />
                    <p className="font-rajdhani text-xs font-bold text-red-400 uppercase tracking-wider">Verification Failed</p>
                    <p className="font-inter text-xs text-gray-500">Tap to upload a different screenshot</p>
                  </>
                )}

                {ocrState === 'error' && (
                  <>
                    <AlertCircle className="w-8 h-8 text-orange-400" />
                    <p className="font-rajdhani text-xs font-bold text-orange-400 uppercase tracking-wider">Scan Error — Tap to Retry</p>
                    <p className="font-inter text-xs text-gray-500 truncate max-w-[220px]">{fileName}</p>
                  </>
                )}
              </label>

              {/* OCR result panel */}
              {ocrState === 'auto_matched' && ocrResult?.extracted && (
                <div className="mt-3 rounded-xl border border-green-500/25 bg-green-500/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border-b border-green-500/15">
                    <Zap className="w-3.5 h-3.5 text-green-400" />
                    <span className="font-rajdhani text-xs font-bold text-green-400 uppercase tracking-widest">Auto-Matched — Extracted Details</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {([
                      ['Amount',         ocrResult.extracted.amount != null ? `₹${ocrResult.extracted.amount.toLocaleString('en-IN')}` : null],
                      ['Transaction ID', ocrResult.extracted.transactionId],
                      ['Date',           ocrResult.extracted.date],
                      ['Time',           ocrResult.extracted.time],
                      ['Receiver',       ocrResult.extracted.receiverName],
                      ['Status',         ocrResult.extracted.isSuccess ? 'Success ✓' : null],
                    ] as [string, string | null][]).filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="bg-black/20 rounded-lg px-3 py-2">
                        <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-0.5">{k}</p>
                        <p className="text-green-300 text-xs font-mono font-medium truncate">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ocrState === 'pending_review' && ocrResult?.extracted && (
                <div className="mt-3 rounded-xl border border-yellow-500/25 bg-yellow-500/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border-b border-yellow-500/15">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="font-rajdhani text-xs font-bold text-yellow-400 uppercase tracking-widest">Partial Match — Admin Will Review</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {([
                      ['Amount',         ocrResult.extracted.amount != null ? `₹${ocrResult.extracted.amount.toLocaleString('en-IN')}` : '—'],
                      ['Transaction ID', ocrResult.extracted.transactionId || '—'],
                      ['Date',           ocrResult.extracted.date          || '—'],
                      ['Status',         ocrResult.extracted.isSuccess ? 'Success ✓' : 'Not detected'],
                    ] as [string, string][]).map(([k, v]) => (
                      <div key={k} className="bg-black/20 rounded-lg px-3 py-2">
                        <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-0.5">{k}</p>
                        <p className={`text-xs font-mono font-medium truncate ${v === '—' || v === 'Not detected' ? 'text-gray-600' : 'text-yellow-300'}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ocrState === 'rejected' && (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-rajdhani text-xs font-bold text-red-400 uppercase tracking-wider">Screenshot Verification Failed</p>
                      <p className="font-inter text-xs text-gray-400 mt-1 leading-relaxed">
                        Please upload a clear payment screenshot showing the transaction ID, success status, and amount.
                      </p>
                      {ocrResult?.rejectionReason && (
                        <p className="font-inter text-[11px] text-red-400/70 mt-1.5">{ocrResult.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {ocrState === 'error' && (
                <div className="mt-3 rounded-xl border border-orange-500/25 bg-orange-500/5 px-4 py-3 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <p className="font-inter text-xs text-gray-400">OCR scan failed. Please try uploading the screenshot again.</p>
                </div>
              )}
            </div>

            {/* Notice */}
            <div className="p-3 rounded-xl bg-yellow-500/8 border border-yellow-500/25 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <p className="font-inter text-xs text-yellow-200 leading-relaxed font-medium">
                Upload a clear screenshot showing the full payment confirmation to speed up verification.
              </p>
            </div>

            <button
              onClick={submitOrder}
              disabled={!canSubmit || isAnalyzing}
              className={`order-btn w-full py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all
                ${(!canSubmit || isAnalyzing) ? 'opacity-40 cursor-not-allowed scale-100' : 'hover:scale-[1.02]'}
              `}
            >
              <ShieldCheck className="w-4 h-4" />
              {isAnalyzing ? 'Verifying Screenshot…' : "I've Paid — Submit Order"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button onClick={() => setStep('details')} className="w-full text-center text-gray-600 font-inter text-xs hover:text-gray-400 transition-colors">
              ← Back to Details
            </button>
          </div>
        )}

        {/* ── SUBMITTING ── */}
        {step === 'submitting' && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-6 mt-2">
              <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.15), transparent)', boxShadow: '0 0 0 1px rgba(245,166,35,0.3)', animation: 'pulse 2s ease-in-out infinite' }} />
              <div className="absolute inset-0 rounded-full border-t-2 border-yellow-500" style={{ animation: 'spin 1.2s linear infinite' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
              </div>
            </div>
            <h3 className="font-orbitron text-lg font-black text-white mb-2">Submitting Order</h3>
            <p className="text-gray-400 font-inter text-sm mb-2">Recording your order details…</p>
            <div className="flex items-center gap-2 text-gray-600 font-inter text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Do not close this window…
            </div>
          </div>
        )}

        {/* ── PENDING / SUCCESS ── */}
        {step === 'pending' && (
          <div className="p-6 flex flex-col items-center text-center space-y-5">
            {finalStatus === 'auto_matched' ? (
              <div className="w-20 h-20 rounded-full flex items-center justify-center mt-2" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', boxShadow: '0 0 0 1px rgba(34,197,94,0.3), 0 0 40px rgba(34,197,94,0.15)' }}>
                <BadgeCheck className="w-10 h-10 text-green-400" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center mt-2" style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.2), rgba(245,166,35,0.05))', boxShadow: '0 0 0 1px rgba(245,166,35,0.3), 0 0 40px rgba(245,166,35,0.15)' }}>
                <Clock className="w-10 h-10 text-yellow-400" />
              </div>
            )}

            <div>
              <h3 className={`font-orbitron text-xl font-black mb-1 ${finalStatus === 'auto_matched' ? 'text-green-400' : 'text-yellow-400'}`}>
                {finalStatus === 'auto_matched' ? 'Payment Auto-Verified!' : 'Order Submitted'}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-2">
                <span className="text-yellow-400 font-rajdhani text-sm font-bold">{gameName}</span>
                <span className="font-orbitron text-sm font-black text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {finalStatus === 'auto_matched' && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-rajdhani text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" /> Auto-Matched
                </span>
              )}
              {finalStatus === 'pending_review' && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-rajdhani text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Pending Review
                </span>
              )}
              {(!finalStatus || finalStatus === 'pending') && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-rajdhani text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Pending Verification
                </span>
              )}
            </div>

            <div className="w-full p-4 rounded-xl bg-yellow-500/8 border border-yellow-500/20 text-left">
              <p className="font-inter text-sm text-gray-300 leading-relaxed">
                {finalStatus === 'auto_matched'
                  ? 'Your payment screenshot was verified automatically. Your order is being processed.'
                  : 'Your order will be processed after payment verification. Send your screenshot on Instagram or Telegram to speed this up.'}
              </p>
            </div>

            <div className="w-full p-4 rounded-xl bg-white/3 border border-white/8 space-y-1.5 text-left">
              <p className="font-rajdhani text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Order Details</p>
              {([
                ['Customer',  name],
                ['Instagram', `@${instagram}`],
                ...(telegram ? [['Telegram', `@${telegram}`]] : []),
                ['Game',      gameName],
                ['Amount',    `₹${price.toLocaleString('en-IN')}`],
                ...(ocrResult?.extracted.transactionId ? [['Txn ID', ocrResult.extracted.transactionId]] : []),
                ...(orderId ? [['Order ID', `#${orderId}`]] : []),
                ['Status', finalStatus === 'auto_matched' ? 'Auto-Matched ✓' : finalStatus === 'pending_review' ? 'Pending Review' : 'Pending Verification'],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500 font-inter text-xs">{k}</span>
                  <span className={`font-inter text-xs font-medium ${k === 'Amount' ? 'text-yellow-500 font-orbitron font-black' : k === 'Game' || k === 'Status' ? 'text-yellow-400' : k === 'Txn ID' ? 'text-green-400 font-mono' : 'text-white'}`}>{v}</span>
                </div>
              ))}
            </div>

            {finalStatus !== 'auto_matched' && (
              <div className="w-full space-y-2">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-all duration-300">
                  <Instagram className="w-4 h-4" /> Send Screenshot on Instagram
                </a>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-all duration-300">
                  <Send className="w-4 h-4" /> Send Screenshot on Telegram
                </a>
              </div>
            )}
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
              <h3 className="font-orbitron text-xl font-black text-red-400 mb-1">Submission Failed</h3>
              <p className="text-gray-500 font-inter text-xs">We couldn't record your order</p>
            </div>
            {failReason && (
              <div className="w-full p-3 rounded-xl bg-white/3 border border-white/8 text-left">
                <p className="font-inter text-xs text-gray-400">{failReason}</p>
              </div>
            )}
            <div className="w-full space-y-2">
              <button onClick={() => { submitting.current = false; setStep('payment'); setFailReason(''); }} className="order-btn w-full py-3.5 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
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
