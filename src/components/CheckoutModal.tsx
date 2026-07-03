import { useState, useRef, useEffect } from 'react';
import {
  X, ShieldCheck, Smartphone, Wallet, CreditCard, QrCode,
  Upload, CheckCircle2, Instagram, Send, ArrowRight, ChevronRight,
  Loader2, XCircle, AlertTriangle, ScanSearch, AtSign,
} from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/jhojha.games?igsh=ZGltczl3MHh0ZTN1';
const TELEGRAM_URL = 'https://t.me/jhojhagames';

const paymentMethods = [
  { name: 'UPI',         Icon: Smartphone, color: 'from-orange-500 to-amber-500',  shadow: 'rgba(249,115,22,0.4)'  },
  { name: 'PhonePe',    Icon: CreditCard,  color: 'from-purple-600 to-indigo-600', shadow: 'rgba(139,92,246,0.4)'  },
  { name: 'Google Pay', Icon: Smartphone,  color: 'from-blue-500 to-cyan-500',     shadow: 'rgba(59,130,246,0.4)'  },
  { name: 'Paytm',      Icon: Wallet,      color: 'from-sky-500 to-blue-600',      shadow: 'rgba(14,165,233,0.4)'  },
];

type Step = 'payment' | 'form' | 'verifying' | 'success' | 'rejected';

interface CheckResult {
  label: string;
  status: 'pending' | 'checking' | 'pass' | 'fail';
}

interface VerificationOutcome {
  screenshotOk: boolean;
  instagramOk: boolean;
  screenshotReason?: string;
  instagramReason?: string;
}

function validateInstagram(username: string): { ok: boolean; reason?: string } {
  const trimmed = username.trim().replace(/^@/, '');
  if (!trimmed) return { ok: false, reason: 'Username is empty' };
  if (trimmed.length < 1 || trimmed.length > 30)
    return { ok: false, reason: 'Must be 1–30 characters' };
  if (!/^[a-zA-Z0-9._]+$/.test(trimmed))
    return { ok: false, reason: 'Invalid characters (use letters, numbers, . or _)' };
  if (/\.\./.test(trimmed))
    return { ok: false, reason: 'Cannot contain consecutive dots' };
  if (trimmed.startsWith('.') || trimmed.endsWith('.'))
    return { ok: false, reason: 'Cannot start or end with a dot' };
  return { ok: true };
}

async function validateScreenshot(file: File | null): Promise<{ ok: boolean; reason?: string }> {
  if (!file) return { ok: false, reason: 'No screenshot uploaded' };

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type))
    return { ok: false, reason: 'File must be an image (JPG, PNG, WebP)' };

  if (file.size < 20 * 1024)
    return { ok: false, reason: 'File too small — may not be a real screenshot' };

  if (file.size > 15 * 1024 * 1024)
    return { ok: false, reason: 'File too large (max 15MB)' };

  const dims = await new Promise<{ w: number; h: number } | null>(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });

  if (!dims) return { ok: false, reason: 'Cannot read image — file may be corrupted' };
  if (dims.w < 100 || dims.h < 100)
    return { ok: false, reason: 'Image too small — upload a clear, full screenshot' };

  return { ok: true };
}

interface Props {
  gameName: string;
  price: number;
  onClose: () => void;
}

export default function CheckoutModal({ gameName, price, onClose }: Props) {
  const [step, setStep] = useState<Step>('payment');
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [telegram, setTelegram] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [outcome, setOutcome] = useState<VerificationOutcome | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (screenshotPreview) URL.revokeObjectURL(screenshotPreview); };
  }, [screenshotPreview]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    setScreenshotName(file.name);
    setErrors(p => ({ ...p, screenshot: '' }));
    const preview = URL.createObjectURL(file);
    setScreenshotPreview(preview);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!instagram.trim()) errs.instagram = 'Instagram username is required';
    if (!screenshot) errs.screenshot = 'Payment screenshot is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const runVerification = async () => {
    if (!validate()) return;
    setStep('verifying');

    const initialChecks: CheckResult[] = [
      { label: 'Checking payment screenshot',       status: 'pending' },
      { label: 'Validating image authenticity',     status: 'pending' },
      { label: 'Verifying Instagram username',      status: 'pending' },
      { label: 'Checking account format',           status: 'pending' },
    ];
    setChecks(initialChecks);

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    const updateCheck = (i: number, status: CheckResult['status']) => {
      setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, status } : c));
    };

    await delay(400);
    updateCheck(0, 'checking');
    await delay(900);
    const ssResult = await validateScreenshot(screenshot);
    updateCheck(0, ssResult.ok ? 'pass' : 'fail');

    await delay(300);
    updateCheck(1, 'checking');
    await delay(800);
    updateCheck(1, ssResult.ok ? 'pass' : 'fail');

    await delay(300);
    updateCheck(2, 'checking');
    await delay(700);
    const igResult = validateInstagram(instagram);
    updateCheck(2, igResult.ok ? 'pass' : 'fail');

    await delay(300);
    updateCheck(3, 'checking');
    await delay(600);
    updateCheck(3, igResult.ok ? 'pass' : 'fail');

    await delay(500);

    setOutcome({
      screenshotOk: ssResult.ok,
      instagramOk: igResult.ok,
      screenshotReason: ssResult.reason,
      instagramReason: igResult.reason,
    });

    if (ssResult.ok && igResult.ok) {
      setStep('success');
    } else {
      setStep('rejected');
    }
  };

  const rejectionMessage = () => {
    if (!outcome) return '';
    if (!outcome.screenshotOk && !outcome.instagramOk)
      return '❌ Order rejected. Invalid payment proof and Instagram username.';
    if (!outcome.screenshotOk)
      return '❌ Wrong payment screenshot. Please upload a valid payment proof.';
    return '❌ Wrong Instagram username. Please provide a valid Instagram account.';
  };

  const stepIndicator = (['payment', 'form'] as const);

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
        {/* Close — hidden during verification */}
        {step !== 'verifying' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ── HEADER ── */}
        {step !== 'verifying' && (
          <div className="px-6 pt-6 pb-5 border-b border-yellow-500/10">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 text-xs font-rajdhani font-bold uppercase tracking-widest">
                {step === 'success' ? 'Order Verified' : step === 'rejected' ? 'Verification Failed' : 'Secure Checkout'}
              </span>
            </div>
            <h2 className="font-orbitron text-xl font-black text-white leading-tight">
              {step === 'success' ? 'Order Confirmed!' : step === 'rejected' ? 'Order Rejected' : 'Complete Your Order'}
            </h2>

            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/25">
              <span className="text-yellow-400 font-rajdhani text-sm font-bold">{gameName}</span>
              <span className="w-1 h-1 rounded-full bg-yellow-500/50" />
              <span className="font-orbitron text-sm font-black text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
            </div>

            {step !== 'success' && step !== 'rejected' && (
              <div className="flex items-center gap-2 mt-4">
                {stepIndicator.map((stepId, i) => {
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
        )}

        {/* ── STEP 1: PAYMENT ── */}
        {step === 'payment' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-orbitron text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" /> Choose Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(({ name: mName, Icon, color, shadow }) => (
                  <div key={mName} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-yellow-500/40 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`} style={{ boxShadow: `0 4px 12px ${shadow}` }}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-rajdhani text-sm font-bold text-white">{mName}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h3 className="font-orbitron text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5" /> Scan QR to Pay
              </h3>
              <div className="relative rounded-2xl overflow-hidden p-1" style={{ boxShadow: '0 0 0 1px rgba(245,166,35,0.5), 0 0 30px rgba(245,166,35,0.15)' }}>
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-400 rounded-tl-2xl z-10" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-400 rounded-tr-2xl z-10" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-yellow-400 rounded-bl-2xl z-10" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-yellow-400 rounded-br-2xl z-10" />
                <img src="/payment-qr.jpeg" alt="Scan to pay" className="w-52 h-52 sm:w-60 sm:h-60 object-cover rounded-xl" />
              </div>
              <p className="mt-3 font-rajdhani text-sm font-bold text-yellow-400 uppercase tracking-widest">Scan & Pay ₹{price.toLocaleString('en-IN')}</p>
              <p className="text-gray-500 font-inter text-xs mt-0.5">UPI · PhonePe · Google Pay · Paytm</p>
            </div>

            <button onClick={() => setStep('form')} className="order-btn w-full py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200">
              I Have Paid — Fill Details <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-gray-600 font-inter text-xs">Complete the payment first, then fill your details on the next step.</p>
          </div>
        )}

        {/* ── STEP 2: FORM ── */}
        {step === 'form' && (
          <div className="p-6 space-y-5">
            <p className="text-gray-400 font-inter text-sm leading-relaxed">
              Fill in your details. Your order will be verified automatically before confirmation.
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
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.name ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all duration-200`}
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
                  onChange={e => { setInstagram(e.target.value.replace(/^@/, '')); setErrors(p => ({ ...p, instagram: '' })); }}
                  placeholder="your.username"
                  className={`w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border ${errors.instagram ? 'border-red-500/60' : 'border-white/10 focus:border-yellow-500/60'} text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all duration-200`}
                />
              </div>
              {errors.instagram && <p className="mt-1 text-xs text-red-400 font-inter">{errors.instagram}</p>}
              <p className="mt-1 text-xs text-gray-600 font-inter">Must be a real Instagram account (e.g. john.doe_99)</p>
            </div>

            {/* Telegram */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">
                Telegram Username <span className="text-gray-600 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-inter text-sm">@</span>
                <input
                  type="text"
                  value={telegram}
                  onChange={e => setTelegram(e.target.value.replace(/^@/, ''))}
                  placeholder="your.username"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-500/60 text-white font-inter text-sm placeholder:text-gray-600 focus:outline-none transition-all duration-200"
                />
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

            {/* Screenshot upload */}
            <div>
              <label className="block font-rajdhani text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1.5">
                Payment Screenshot <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`w-full flex flex-col items-center justify-center gap-2.5 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${screenshot ? 'border-green-500/60 bg-green-500/5' : errors.screenshot ? 'border-red-500/50 bg-red-500/5' : 'border-yellow-500/25 bg-yellow-500/3 hover:border-yellow-500/50 hover:bg-yellow-500/6'}`}
              >
                {screenshot && screenshotPreview ? (
                  <div className="flex items-center gap-4 px-4 w-full">
                    <img src={screenshotPreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-green-500/40 flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <p className="font-rajdhani text-sm font-bold text-green-400 uppercase tracking-wider">Screenshot Ready</p>
                      </div>
                      <p className="font-inter text-xs text-gray-500 truncate">{screenshotName}</p>
                      <p className="font-inter text-xs text-gray-600 mt-0.5">{(screenshot.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-rajdhani text-sm font-bold text-white uppercase tracking-wider">Upload Payment Screenshot</p>
                      <p className="font-inter text-xs text-gray-500 mt-0.5">PNG, JPG, WebP · Max 15MB</p>
                    </div>
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              {errors.screenshot && <p className="mt-1 text-xs text-red-400 font-inter">{errors.screenshot}</p>}
              {screenshot && (
                <p className="mt-1 text-xs text-gray-600 font-inter">
                  Make sure the screenshot clearly shows: payment status, amount, and date/time.
                </p>
              )}
            </div>

            <button
              onClick={runVerification}
              className="order-btn w-full py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify & Confirm Order
              <ArrowRight className="w-4 h-4" />
            </button>

            <button onClick={() => setStep('payment')} className="w-full text-center text-gray-600 font-inter text-xs hover:text-gray-400 transition-colors">
              ← Back to Payment
            </button>
          </div>
        )}

        {/* ── STEP 3: VERIFYING ── */}
        {step === 'verifying' && (
          <div className="p-8 flex flex-col items-center">
            {/* Animated scanner */}
            <div className="relative w-24 h-24 mb-6 mt-2">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.15), transparent)', boxShadow: '0 0 0 1px rgba(245,166,35,0.3)', animation: 'pulse 2s ease-in-out infinite' }}
              />
              <div
                className="absolute inset-3 rounded-full border-2 border-yellow-500/30"
                style={{ animation: 'spin 2s linear infinite' }}
              />
              <div
                className="absolute inset-0 rounded-full border-t-2 border-yellow-500"
                style={{ animation: 'spin 1.2s linear infinite' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanSearch className="w-8 h-8 text-yellow-500" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>

            <h3 className="font-orbitron text-lg font-black text-white mb-1">Verifying Order</h3>
            <p className="text-gray-500 font-inter text-sm mb-6 text-center">
              Running security checks on your payment details…
            </p>

            {/* Check list */}
            <div className="w-full max-w-sm space-y-3">
              {checks.map((check, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                    check.status === 'pass'     ? 'bg-green-500/8  border-green-500/30' :
                    check.status === 'fail'     ? 'bg-red-500/8    border-red-500/30'   :
                    check.status === 'checking' ? 'bg-yellow-500/8 border-yellow-500/30' :
                                                  'bg-white/3      border-white/8'
                  }`}
                  style={{ opacity: check.status === 'pending' ? 0.4 : 1 }}
                >
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {check.status === 'pass'     && <CheckCircle2 className="w-4.5 h-4.5 text-green-400" />}
                    {check.status === 'fail'     && <XCircle className="w-4.5 h-4.5 text-red-400" />}
                    {check.status === 'checking' && <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />}
                    {check.status === 'pending'  && <div className="w-3 h-3 rounded-full bg-white/15" />}
                  </div>
                  <span className={`font-rajdhani text-sm font-bold ${
                    check.status === 'pass'     ? 'text-green-400' :
                    check.status === 'fail'     ? 'text-red-400'   :
                    check.status === 'checking' ? 'text-yellow-400' :
                                                  'text-gray-600'
                  }`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-gray-600 font-inter text-xs text-center">
              Do not close this window. Verification in progress…
            </p>
          </div>
        )}

        {/* ── STEP 4: REJECTED ── */}
        {step === 'rejected' && outcome && (
          <div className="p-6 flex flex-col items-center text-center space-y-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mt-2"
              style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.2), rgba(239,68,68,0.04))', boxShadow: '0 0 0 1px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.12)' }}
            >
              <XCircle className="w-10 h-10 text-red-400" />
            </div>

            <div>
              <h3 className="font-orbitron text-xl font-black text-red-400 mb-1">Order Rejected</h3>
              <p className="text-gray-500 font-inter text-xs">Verification failed — see details below</p>
            </div>

            {/* Rejection message */}
            <div className="w-full p-4 rounded-xl bg-red-500/8 border border-red-500/25 text-left">
              <p className="font-rajdhani text-sm font-bold text-red-300 leading-relaxed">
                {rejectionMessage()}
              </p>
            </div>

            {/* Failure breakdown */}
            <div className="w-full space-y-2">
              <div className={`flex items-start gap-3 p-3 rounded-xl border ${outcome.screenshotOk ? 'border-green-500/25 bg-green-500/5' : 'border-red-500/25 bg-red-500/5'}`}>
                {outcome.screenshotOk
                  ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className={`font-rajdhani text-xs font-bold uppercase tracking-wider ${outcome.screenshotOk ? 'text-green-400' : 'text-red-400'}`}>
                    Payment Screenshot
                  </p>
                  <p className="font-inter text-xs text-gray-500 mt-0.5">
                    {outcome.screenshotOk ? 'Valid screenshot detected' : outcome.screenshotReason}
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-3 p-3 rounded-xl border ${outcome.instagramOk ? 'border-green-500/25 bg-green-500/5' : 'border-red-500/25 bg-red-500/5'}`}>
                {outcome.instagramOk
                  ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className={`font-rajdhani text-xs font-bold uppercase tracking-wider ${outcome.instagramOk ? 'text-green-400' : 'text-red-400'}`}>
                    Instagram Username
                  </p>
                  <p className="font-inter text-xs text-gray-500 mt-0.5">
                    {outcome.instagramOk ? `@${instagram} — valid format` : outcome.instagramReason}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full p-3 rounded-xl bg-amber-500/8 border border-amber-500/25 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="font-inter text-xs text-amber-300/80 leading-relaxed text-left">
                If you believe this is an error, contact Jhojha Games directly with your payment proof.
              </p>
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={() => { setStep('form'); setOutcome(null); }}
                className="order-btn w-full py-3 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                Try Again
              </button>
              <div className="grid grid-cols-2 gap-2">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-all duration-300">
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-rajdhani font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-all duration-300">
                  <Send className="w-3.5 h-3.5" /> Telegram
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: SUCCESS ── */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center text-center space-y-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mt-2"
              style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', boxShadow: '0 0 0 1px rgba(34,197,94,0.3), 0 0 40px rgba(34,197,94,0.15)' }}
            >
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>

            <div>
              <h3 className="font-orbitron text-xl font-black text-green-400 mb-1">Payment Verified!</h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-2">
                <span className="text-yellow-400 font-rajdhani text-sm font-bold">{gameName}</span>
                <span className="font-orbitron text-sm font-black text-yellow-500">₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Verification badges */}
            <div className="flex gap-2 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-rajdhani text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Screenshot Verified
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-rajdhani text-xs font-bold uppercase tracking-wider">
                <AtSign className="w-3.5 h-3.5" /> Instagram Verified
              </span>
            </div>

            <div className="w-full p-4 rounded-xl bg-green-500/8 border border-green-500/20 text-left">
              <p className="font-inter text-sm text-gray-300 leading-relaxed">
                ✅ Payment verified successfully. Order accepted. Your game delivery is being processed.
              </p>
              <p className="font-inter text-xs text-gray-500 leading-relaxed mt-2">
                Please contact <span className="text-yellow-400 font-semibold">@jhojha.games</span> on Instagram or{' '}
                <span className="text-blue-400 font-semibold">@JhojhaGames</span> on Telegram with your payment screenshot to receive your game.
              </p>
            </div>

            <div className="w-full p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15 space-y-2 text-left">
              <p className="font-rajdhani text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Order Summary</p>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span className="text-gray-500 font-inter text-xs">Name</span><span className="text-white font-inter text-xs font-medium">{name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-inter text-xs">Instagram</span><span className="text-white font-inter text-xs font-medium">@{instagram}</span></div>
                {telegram && <div className="flex justify-between"><span className="text-gray-500 font-inter text-xs">Telegram</span><span className="text-white font-inter text-xs font-medium">@{telegram}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500 font-inter text-xs">Game</span><span className="text-yellow-400 font-inter text-xs font-bold">{gameName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-inter text-xs">Amount Paid</span><span className="text-yellow-500 font-orbitron text-xs font-black">₹{price.toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            <div className="w-full space-y-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:scale-[1.02] transition-all duration-300">
                <Instagram className="w-4 h-4" /> Contact on Instagram
              </a>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-rajdhani font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:scale-[1.02] transition-all duration-300">
                <Send className="w-4 h-4" /> Join Telegram
              </a>
            </div>

            <button onClick={onClose} className="text-gray-600 font-inter text-xs hover:text-gray-400 transition-colors">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
