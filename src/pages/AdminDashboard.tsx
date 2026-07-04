import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck, LogOut, RefreshCw, TrendingUp, ShoppingBag,
  CheckCircle2, XCircle, Clock, IndianRupee, Search, Trash2,
  ChevronDown, Eye, EyeOff, Zap, ScanLine, AlertTriangle,
  Plus, Edit2, Package, Star, Image, Tag, ToggleLeft, ToggleRight,
  Loader2, Save, X, Gamepad2,
} from 'lucide-react';
import { invalidateGamesCache } from '../hooks/useGames';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Order {
  id: number; order_ref: string;
  customer_name: string; instagram: string; email: string; telegram: string;
  game_name: string; game_price: number; steam_username: string;
  payment_method: string; payment_status: string; failure_reason: string | null;
  upi_transaction_id: string | null; ocr_amount: number | null;
  ocr_date: string | null; ocr_time: string | null; ocr_receiver: string | null;
  ocr_raw_status: string | null; verification_mode: string | null;
  created_at: string; verified_at: string | null;
}

interface Stats {
  verified: string; auto_matched: string; pending: string;
  pending_review: string; rejected: string; failed: string;
  total_revenue: string; total_orders: string;
}

interface AdminGame {
  id: number; title: string; category: string; image_url: string;
  sale_price: number; original_price: number; discount: number; rating: number;
  badge: string | null; description: string; steam_url: string | null;
  is_featured: boolean; in_stock: boolean; is_active: boolean;
  sort_order: number; created_at: string;
}

interface GameForm {
  title: string; category: string; image_url: string;
  sale_price: string; original_price: string; badge: string;
  description: string; steam_url: string;
  is_featured: boolean; in_stock: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = ['Action', 'Open World', 'Horror', 'Racing', 'RPG', 'Multiplayer', 'Sports', 'Simulation', 'Adventure'];
const BADGES     = ['', 'PRE-ORDER', 'SALE', 'HOT DEAL', 'BEST SELLER', 'NEW'];

const STATUS_STYLES: Record<string, string> = {
  verified:       'text-green-400 bg-green-500/10 border-green-500/30',
  auto_matched:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  pending:        'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  pending_review: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  rejected:       'text-red-400 bg-red-500/10 border-red-500/30',
  failed:         'text-red-400 bg-red-500/10 border-red-500/30',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  verified:       <CheckCircle2 className="w-3 h-3" />,
  auto_matched:   <Zap className="w-3 h-3" />,
  pending:        <Clock className="w-3 h-3" />,
  pending_review: <ScanLine className="w-3 h-3" />,
  rejected:       <XCircle className="w-3 h-3" />,
  failed:         <XCircle className="w-3 h-3" />,
};

const STATUS_LABEL: Record<string, string> = {
  verified: 'Verified', auto_matched: 'Auto-Matched', pending: 'Pending',
  pending_review: 'Pending Review', rejected: 'Rejected', failed: 'Failed',
};

const EMPTY_FORM: GameForm = {
  title: '', category: 'Action', image_url: '', sale_price: '', original_price: '',
  badge: '', description: '', steam_url: '', is_featured: false, in_stock: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  // Auth
  const [password, setPassword] = useState('');
  const [authed,   setAuthed]   = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'games'>('orders');

  // Orders
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [stats,        setStats]         = useState<Stats | null>(null);
  const [loading,      setLoading]       = useState(false);
  const [statusFilter, setStatusFilter]  = useState('');
  const [search,       setSearch]        = useState('');
  const [expandedRow,  setExpandedRow]   = useState<number | null>(null);
  const [deleting,     setDeleting]      = useState<number | null>(null);
  const [verifying,    setVerifying]     = useState<number | null>(null);
  const [rejectingId,  setRejectingId]   = useState<number | null>(null);
  const [rejectReason, setRejectReason]  = useState('');

  // Games
  const [adminGames,   setAdminGames]  = useState<AdminGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [showAddForm,  setShowAddForm]  = useState(false);
  const [editingGame,  setEditingGame]  = useState<AdminGame | null>(null);
  const [gameForm,     setGameForm]     = useState<GameForm>(EMPTY_FORM);
  const [savingGame,   setSavingGame]   = useState(false);
  const [gameError,    setGameError]    = useState('');
  const [togglingId,   setTogglingId]   = useState<number | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>('');

  const savedPass = () => sessionStorage.getItem('jhojha_admin_pass') || '';

  // ── Session timeout: auto-logout after 30 minutes of inactivity ──────────
  const logout = useCallback(() => {
    sessionStorage.removeItem('jhojha_admin_pass');
    sessionStorage.removeItem('jhojha_owner_session');
    window.dispatchEvent(new Event('owner-login-status'));
    setAuthed(false);
    setPassword('');
    setOrders([]);
    setStats(null);
    setAdminGames([]);
  }, []);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!authed) return;
    const TIMEOUT = 30 * 60 * 1000;
    const reset = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(logout, TIMEOUT);
    };
    reset();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [authed, logout]);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async (pass: string) => {
    setLoading(true);
    try {
      const headers = { 'x-admin-password': pass };
      const [ordersRes, statsRes] = await Promise.all([
        fetch(`/api/admin/orders?limit=200${statusFilter ? `&status=${statusFilter}` : ''}`, { headers }),
        fetch('/api/admin/stats', { headers }),
      ]);
      if (ordersRes.status === 401) { logout(); return; }
      const ordersData = await ordersRes.json();
      const statsData  = await statsRes.json();
      setOrders(ordersData.orders || []);
      setStats(statsData);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [statusFilter, logout]);

  const fetchAdminGames = useCallback(async () => {
    setGamesLoading(true);
    try {
      const res  = await fetch('/api/admin/games', { headers: { 'x-admin-password': savedPass() } });
      const data = await res.json();
      setAdminGames(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setGamesLoading(false); }
  }, []);

  useEffect(() => {
    const saved = savedPass();
    if (saved) { setPassword(saved); setAuthed(true); fetchData(saved); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authed) fetchData(savedPass() || password);
  }, [statusFilter, authed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authed && activeTab === 'games') fetchAdminGames();
  }, [authed, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    setAuthError('');
    const enteredPassword = password.trim();
    if (!enteredPassword) {
      setAuthError('Enter the admin password');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { headers: { 'x-admin-password': enteredPassword } });
      if (res.status === 401) { setAuthError('Wrong password'); return; }
      if (res.status === 503) { setAuthError('Admin not configured on server'); return; }
      if (!res.ok) { setAuthError('Admin login is temporarily unavailable'); return; }
      sessionStorage.setItem('jhojha_admin_pass', enteredPassword);
      sessionStorage.setItem('jhojha_owner_session', '1');
      window.dispatchEvent(new Event('owner-login-status'));
      setAuthed(true);
      fetchData(enteredPassword);
    } catch {
      setAuthError('Admin login is temporarily unavailable');
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Order actions ─────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this order permanently?')) return;
    setDeleting(id);
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE', headers: { 'x-admin-password': savedPass() } });
    setOrders(prev => prev.filter(o => o.id !== id));
    setDeleting(null);
  };

  const handleVerify = async (id: number) => {
    setVerifying(id);
    const res  = await fetch(`/api/admin/orders/${id}/verify`, { method: 'PATCH', headers: { 'x-admin-password': savedPass() } });
    const data = await res.json();
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: data.payment_status } : o));
    }
    setVerifying(null);
  };

  const handleReject = async (id: number) => {
    setVerifying(id);
    const res  = await fetch(`/api/admin/orders/${id}/reject`, {
      method: 'PATCH',
      headers: { 'x-admin-password': savedPass(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: rejectReason || 'Rejected by admin' }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: data.payment_status, failure_reason: rejectReason || 'Rejected by admin' } : o));
      setRejectingId(null);
      setRejectReason('');
    }
    setVerifying(null);
  };

  // ── Game actions ──────────────────────────────────────────────────────────

  const openAddForm = () => { setEditingGame(null); setGameForm(EMPTY_FORM); setGameError(''); setPosterPreview(''); setShowAddForm(true); };
  const openEditForm = (g: AdminGame) => {
    setEditingGame(g);
    setGameForm({
      title: g.title, category: g.category, image_url: g.image_url,
      sale_price: String(g.sale_price), original_price: String(g.original_price),
      badge: g.badge || '', description: g.description,
      steam_url: g.steam_url || '', is_featured: g.is_featured, in_stock: g.in_stock,
    });
    setGameError('');
    setPosterPreview(g.image_url || '');
    setShowAddForm(true);
  };
  const closeGameForm = () => { setShowAddForm(false); setEditingGame(null); setGameError(''); setPosterPreview(''); };

  const handlePosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setGameForm(f => ({ ...f, image_url: dataUrl }));
      setPosterPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGame = async () => {
    if (!gameForm.title.trim()) { setGameError('Game title is required'); return; }
    if (!gameForm.sale_price || Number(gameForm.sale_price) <= 0) { setGameError('Sale price must be greater than 0'); return; }
    if (!gameForm.original_price || Number(gameForm.original_price) <= 0) { setGameError('Original price must be greater than 0'); return; }
    setSavingGame(true);
    setGameError('');
    try {
      const disc    = Math.round((1 - Number(gameForm.sale_price) / Number(gameForm.original_price)) * 100);
      const payload = {
        title:         gameForm.title.trim(),
        category:      gameForm.category,
        image_url:     gameForm.image_url.trim(),
        sale_price:    Number(gameForm.sale_price),
        original_price: Number(gameForm.original_price),
        discount:      Math.max(0, disc),
        badge:         gameForm.badge || null,
        description:   gameForm.description.trim(),
        steam_url:     gameForm.steam_url.trim() || null,
        is_featured:   gameForm.is_featured,
        in_stock:      gameForm.in_stock,
        is_active:     true,
      };
      const url     = editingGame ? `/api/admin/games/${editingGame.id}` : '/api/admin/games';
      const method  = editingGame ? 'PUT' : 'POST';
      const res     = await fetch(url, {
        method,
        headers: { 'x-admin-password': savedPass(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setGameError(data.error || 'Failed to save game'); return; }
      await fetchAdminGames();
      invalidateGamesCache();
      closeGameForm();
    } catch { setGameError('Network error — please try again'); }
    finally { setSavingGame(false); }
  };

  const handleDeleteGame = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;
    await fetch(`/api/admin/games/${id}`, { method: 'DELETE', headers: { 'x-admin-password': savedPass() } });
    setAdminGames(prev => prev.filter(g => g.id !== id));
    invalidateGamesCache();
  };

  const handleToggleGame = async (id: number, field: 'is_featured' | 'in_stock' | 'is_active', value: boolean) => {
    setTogglingId(id);
    const res = await fetch(`/api/admin/games/${id}`, {
      method: 'PATCH',
      headers: { 'x-admin-password': savedPass(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setAdminGames(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
      invalidateGamesCache();
    }
    setTogglingId(null);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.customer_name?.toLowerCase().includes(q) ||
      o.instagram?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.game_name?.toLowerCase().includes(q) ||
      o.order_ref?.toLowerCase().includes(q) ||
      o.upi_transaction_id?.toLowerCase().includes(q)
    );
  });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

  const autoMatched   = Number(stats?.auto_matched   || 0);
  const pendingReview = Number(stats?.pending_review  || 0);
  const pendingNormal = Number(stats?.pending         || 0);
  const totalPending  = autoMatched + pendingReview + pendingNormal;

  // ── Login screen ──────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div className="w-full max-w-sm rounded-2xl bg-[#111] border border-yellow-500/20 p-8" style={{ boxShadow: '0 0 40px rgba(245,166,35,0.08)' }}>
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-6 h-6 text-yellow-500" />
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Admin Dashboard</h1>
              <p className="text-gray-600 text-xs">Jhojha Games — Owner Access</p>
            </div>
          </div>
          <label className="block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-2">Admin Password</label>
          <div className="relative mb-4">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/60 transition-all"
            />
            <button onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {authError && <p className="text-red-400 text-xs mb-3">{authError}</p>}
          <button
            onClick={handleLogin}
            disabled={authLoading}
            className="w-full py-3 rounded-xl bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm hover:bg-yellow-400 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {authLoading ? 'Checking...' : 'Login'}
          </button>
          <a href="/" className="block text-center text-gray-600 text-xs mt-4 hover:text-gray-400 transition-colors">← Back to store</a>
        </div>
      </div>
    );
  }

  // ── Main dashboard ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-yellow-500/10 bg-black/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Jhojha Games — Admin</h1>
              <p className="text-gray-600 text-xs">{stats?.total_orders || 0} orders · {adminGames.length || '—'} games</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (activeTab === 'orders') fetchData(savedPass()); else fetchAdminGames(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/25 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${(loading || gamesLoading) ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <a href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white transition-all">← Store</a>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto flex gap-1 mt-3">
          {(['orders', 'games'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'orders' ? <ShoppingBag className="w-3.5 h-3.5" /> : <Gamepad2 className="w-3.5 h-3.5" />}
              {tab === 'orders' ? 'Orders' : 'Manage Games'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ═══════════════ ORDERS TAB ═══════════════ */}
        {activeTab === 'orders' && (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Verified',       value: stats.verified,        icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,   border: 'border-green-500/20'  },
                  { label: 'Auto-Matched',   value: stats.auto_matched,    icon: <Zap          className="w-4 h-4 text-cyan-400" />,     border: 'border-cyan-500/20'   },
                  { label: 'Pending Review', value: stats.pending_review,  icon: <ScanLine     className="w-4 h-4 text-orange-400" />,   border: 'border-orange-500/20' },
                  { label: 'Pending',        value: String(totalPending),  icon: <Clock        className="w-4 h-4 text-yellow-400" />,   border: 'border-yellow-500/20' },
                  { label: 'Rejected',       value: stats.rejected,        icon: <AlertTriangle className="w-4 h-4 text-red-400" />,    border: 'border-red-500/20'    },
                  { label: 'Revenue',        value: `₹${Number(stats.total_revenue).toLocaleString('en-IN')}`, icon: <IndianRupee className="w-4 h-4 text-yellow-400" />, border: 'border-yellow-500/20' },
                ].map(s => (
                  <div key={s.label} className={`p-4 rounded-xl bg-white/3 border ${s.border}`}>
                    <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-gray-500 text-xs font-medium uppercase tracking-wider truncate">{s.label}</span></div>
                    <p className="text-white text-xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, Instagram, game, txn ID…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500/50 cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="auto_matched">Auto-Matched</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <ShoppingBag className="w-4 h-4" /> {filtered.length} orders
              </div>
            </div>

            {/* Orders table — desktop */}
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/3 border-b border-white/8">
                      {['#', 'Customer', 'Instagram', 'Game', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-600">No orders found</td></tr>
                    )}
                    {filtered.map(o => (
                      <>
                        <tr key={o.id} className="hover:bg-white/2 transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === o.id ? null : o.id)}>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{o.id}</td>
                          <td className="px-4 py-3">
                            <p className="text-white font-medium">{o.customer_name}</p>
                            <p className="text-gray-500 text-xs">{o.email}</p>
                          </td>
                          <td className="px-4 py-3 text-blue-400 text-xs">@{o.instagram}</td>
                          <td className="px-4 py-3 text-yellow-400 font-medium max-w-[140px] truncate">{o.game_name}</td>
                          <td className="px-4 py-3 text-yellow-500 font-mono font-bold whitespace-nowrap">₹{o.game_price?.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs uppercase">{o.payment_method || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[o.payment_status] || STATUS_STYLES.pending}`}>
                              {STATUS_ICON[o.payment_status]}
                              {STATUS_LABEL[o.payment_status] || o.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmt(o.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              {/* Verify button — only for pending/auto_matched/pending_review */}
                              {['pending', 'auto_matched', 'pending_review'].includes(o.payment_status) && (
                                <button
                                  onClick={() => handleVerify(o.id)}
                                  disabled={verifying === o.id}
                                  title="Mark as Verified"
                                  className="p-1.5 rounded-lg text-gray-600 hover:text-green-400 hover:bg-green-500/10 transition-all disabled:opacity-40"
                                >
                                  {verifying === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              {/* Reject button */}
                              {['pending', 'auto_matched', 'pending_review'].includes(o.payment_status) && (
                                <button
                                  onClick={() => { setRejectingId(rejectingId === o.id ? null : o.id); setRejectReason(''); }}
                                  title="Reject order"
                                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(o.id)}
                                disabled={deleting === o.id}
                                title="Delete order"
                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Reject reason input */}
                        {rejectingId === o.id && (
                          <tr key={`${o.id}-reject`} className="bg-red-500/5">
                            <td colSpan={9} className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <input
                                  value={rejectReason}
                                  onChange={e => setRejectReason(e.target.value)}
                                  placeholder="Rejection reason (optional)"
                                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-red-500/30 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-red-500/60"
                                />
                                <button
                                  onClick={() => handleReject(o.id)}
                                  disabled={verifying === o.id}
                                  className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/30 transition-all disabled:opacity-40"
                                >
                                  {verifying === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Reject'}
                                </button>
                                <button onClick={() => setRejectingId(null)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Expanded OCR details */}
                        {expandedRow === o.id && (
                          <tr key={`${o.id}-detail`} className="bg-white/2">
                            <td colSpan={9} className="px-6 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                {[
                                  ['Order Ref',      o.order_ref],
                                  ['Telegram',       o.telegram ? `@${o.telegram}` : '—'],
                                  ['Steam Username', o.steam_username || '—'],
                                  ['Verified At',    o.verified_at ? fmt(o.verified_at) : '—'],
                                  ['Txn ID (OCR)',   o.upi_transaction_id || '—'],
                                  ['OCR Amount',     o.ocr_amount != null ? `₹${Number(o.ocr_amount).toLocaleString('en-IN')}` : '—'],
                                  ['OCR Date',       o.ocr_date || '—'],
                                  ['OCR Time',       o.ocr_time || '—'],
                                  ['OCR Receiver',   o.ocr_receiver || '—'],
                                  ['Verification',   o.verification_mode || '—'],
                                  ...(o.failure_reason ? [['Rejection Reason', o.failure_reason]] : []),
                                ].map(([k, v]) => (
                                  <div key={k} className="bg-white/3 rounded-lg p-3">
                                    <p className="text-gray-600 mb-1 uppercase tracking-wider">{k}</p>
                                    <p className={`font-mono break-all ${k === 'Txn ID (OCR)' && v !== '—' ? 'text-cyan-400' : k === 'OCR Amount' && v !== '—' ? 'text-yellow-400' : k === 'Rejection Reason' ? 'text-red-400' : 'text-white'}`}>{v}</p>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Orders — mobile cards */}
              <div className="md:hidden divide-y divide-white/5">
                {filtered.length === 0 && <p className="px-4 py-8 text-center text-gray-600 text-sm">No orders found</p>}
                {filtered.map(o => (
                  <div key={o.id} className="p-4 space-y-2" onClick={() => setExpandedRow(expandedRow === o.id ? null : o.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{o.customer_name}</p>
                        <p className="text-blue-400 text-xs">@{o.instagram}</p>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold uppercase ${STATUS_STYLES[o.payment_status] || STATUS_STYLES.pending}`}>
                        {STATUS_ICON[o.payment_status]} {STATUS_LABEL[o.payment_status] || o.payment_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-yellow-400 font-medium truncate max-w-[160px]">{o.game_name}</span>
                      <span className="text-yellow-500 font-bold font-mono">₹{o.game_price?.toLocaleString('en-IN')}</span>
                    </div>
                    {o.upi_transaction_id && (
                      <p className="text-cyan-400 font-mono text-xs">Txn: {o.upi_transaction_id}</p>
                    )}
                    <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
                      <p className="text-gray-600 text-xs">{fmt(o.created_at)}</p>
                      <div className="flex gap-1">
                        {['pending', 'auto_matched', 'pending_review'].includes(o.payment_status) && (
                          <button onClick={() => handleVerify(o.id)} disabled={verifying === o.id} className="p-1.5 rounded text-gray-600 hover:text-green-400 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(o.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {expandedRow === o.id && o.upi_transaction_id && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
                        {[
                          ['OCR Amount', o.ocr_amount != null ? `₹${Number(o.ocr_amount).toLocaleString('en-IN')}` : '—'],
                          ['OCR Date',   o.ocr_date   || '—'],
                          ['Receiver',   o.ocr_receiver || '—'],
                          ['Verification', o.verification_mode || '—'],
                        ].map(([k, v]) => (
                          <div key={k} className="bg-white/3 rounded p-2">
                            <p className="text-gray-600 text-[10px] uppercase mb-0.5">{k}</p>
                            <p className="text-white font-mono break-all">{v}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              <p className="text-gray-600 text-xs">Showing {filtered.length} of {orders.length} orders. Click a row to expand details.</p>
            </div>
          </>
        )}

        {/* ═══════════════ GAMES TAB ═══════════════ */}
        {activeTab === 'games' && (
          <>
            {/* Game stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Games',  value: adminGames.length,                             icon: <Package  className="w-4 h-4 text-yellow-400" />, border: 'border-yellow-500/20' },
                { label: 'Featured',     value: adminGames.filter(g => g.is_featured).length,  icon: <Star     className="w-4 h-4 text-yellow-400" />, border: 'border-yellow-500/20' },
                { label: 'In Stock',     value: adminGames.filter(g => g.in_stock).length,     icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, border: 'border-green-500/20'  },
                { label: 'Out of Stock', value: adminGames.filter(g => !g.in_stock).length,    icon: <XCircle  className="w-4 h-4 text-red-400" />,    border: 'border-red-500/20'    },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-xl bg-white/3 border ${s.border}`}>
                  <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{s.label}</span></div>
                  <p className="text-white text-xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Add / Edit Form */}
            {!showAddForm ? (
              <button
                onClick={openAddForm}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm hover:bg-yellow-400 transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> Quick Add Game
              </button>
            ) : (
              <div className="rounded-2xl border border-yellow-500/20 bg-white/2 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-yellow-500/8 border-b border-yellow-500/15">
                  <div className="flex items-center gap-2">
                    {editingGame ? <Edit2 className="w-4 h-4 text-yellow-500" /> : <Plus className="w-4 h-4 text-yellow-500" />}
                    <span className="text-yellow-500 font-bold text-sm uppercase tracking-widest">
                      {editingGame ? `Edit: ${editingGame.title.slice(0, 30)}` : 'Quick Add Game'}
                    </span>
                  </div>
                  <button onClick={closeGameForm} className="p-1 text-gray-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Game Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1.5">Game Title *</label>
                    <input
                      value={gameForm.title}
                      onChange={e => setGameForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. God of War Ragnarök"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/60 transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1.5">Category *</label>
                    <select
                      value={gameForm.category}
                      onChange={e => setGameForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-all cursor-pointer"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Badge */}
                  <div>
                    <label className="block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1.5">Badge</label>
                    <select
                      value={gameForm.badge}
                      onChange={e => setGameForm(f => ({ ...f, badge: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-all cursor-pointer"
                    >
                      {BADGES.map(b => <option key={b} value={b}>{b || '(none)'}</option>)}
                    </select>
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1.5">Sale Price (₹) *</label>
                    <input
                      type="number" min="1" step="1"
                      value={gameForm.sale_price}
                      onChange={e => setGameForm(f => ({ ...f, sale_price: e.target.value }))}
                      placeholder="e.g. 299"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/60 transition-all"
                    />
                  </div>

                  {/* Original Price */}
                  <div>
                    <label className="block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1.5">Original Price (₹) *</label>
                    <input
                      type="number" min="1" step="1"
                      value={gameForm.original_price}
                      onChange={e => setGameForm(f => ({ ...f, original_price: e.target.value }))}
                      placeholder="e.g. 1299"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/60 transition-all"
                    />
                    {gameForm.sale_price && gameForm.original_price && Number(gameForm.original_price) > 0 && (
                      <p className="mt-1 text-green-400 text-xs">
                        Discount: {Math.round((1 - Number(gameForm.sale_price) / Number(gameForm.original_price)) * 100)}% OFF
                      </p>
                    )}
                  </div>

                  {/* Poster upload */}
                  <div className="sm:col-span-2">
                    <label className="block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1.5">
                      <span className="flex items-center gap-1.5"><Image className="w-3 h-3" /> Poster Upload</span>
                    </label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handlePosterUpload}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-black file:font-semibold"
                    />
                    <input
                      type="url"
                      value={gameForm.image_url}
                      onChange={e => { setGameForm(f => ({ ...f, image_url: e.target.value })); setPosterPreview(e.target.value); }}
                      placeholder="Or paste an image URL"
                      className="mt-2 w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/60 transition-all"
                    />
                    {(posterPreview || gameForm.image_url) && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-2">
                        <img src={posterPreview || gameForm.image_url} alt="Preview" className="h-16 w-12 rounded object-cover border border-yellow-500/20" onError={() => setPosterPreview('')} />
                        <p className="text-xs text-gray-400">Poster will be saved with the game and used across the catalog and featured deals.</p>
                      </div>
                    )}
                  </div>

                  {/* Steam URL */}
                  <div className="sm:col-span-2">
                    <label className="block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1.5">Steam URL (optional)</label>
                    <input
                      type="url"
                      value={gameForm.steam_url}
                      onChange={e => setGameForm(f => ({ ...f, steam_url: e.target.value }))}
                      placeholder="https://store.steampowered.com/app/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/60 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1.5">Description</label>
                    <textarea
                      rows={2}
                      value={gameForm.description}
                      onChange={e => setGameForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Short description shown on game card..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/60 transition-all resize-none"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={gameForm.is_featured} onChange={e => setGameForm(f => ({ ...f, is_featured: e.target.checked }))} className="sr-only" />
                      <div className={`w-10 h-5 rounded-full transition-colors ${gameForm.is_featured ? 'bg-yellow-500' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-transform ${gameForm.is_featured ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-xs text-gray-400">Featured Deal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={gameForm.in_stock} onChange={e => setGameForm(f => ({ ...f, in_stock: e.target.checked }))} className="sr-only" />
                      <div className={`w-10 h-5 rounded-full transition-colors ${gameForm.in_stock ? 'bg-green-500' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-transform ${gameForm.in_stock ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-xs text-gray-400">In Stock</span>
                    </label>
                  </div>

                  {/* Error + Save */}
                  <div className="sm:col-span-2 flex items-center justify-between gap-4 flex-wrap">
                    {gameError && <p className="text-red-400 text-xs">{gameError}</p>}
                    <div className="flex items-center gap-3 ml-auto">
                      <button onClick={closeGameForm} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:text-white transition-all">
                        Cancel
                      </button>
                      {editingGame && (
                        <button
                          onClick={() => handleDeleteGame(editingGame.id, editingGame.title)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-sm uppercase tracking-widest hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Game
                        </button>
                      )}
                      <button
                        onClick={handleSaveGame}
                        disabled={savingGame}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500 text-black font-bold text-sm uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50"
                      >
                        {savingGame ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {editingGame ? 'Update Game' : 'Add Game'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Games list */}
            {gamesLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-yellow-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm uppercase tracking-widest">Loading games…</span>
              </div>
            ) : (
              <div className="rounded-xl border border-white/8 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/3 border-b border-white/8">
                        {['Poster', 'Title', 'Category', 'Prices', 'Badge', 'Featured', 'Stock', ''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminGames.length === 0 && (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-600">No games yet. Add one above.</td></tr>
                      )}
                      {adminGames.map(g => (
                        <tr key={g.id} className={`hover:bg-white/2 transition-colors ${!g.is_active ? 'opacity-40' : ''}`}>
                          {/* Poster */}
                          <td className="px-4 py-3">
                            {g.image_url ? (
                              <img
                                src={g.image_url}
                                alt={g.title}
                                className="w-10 h-14 object-cover rounded-md border border-yellow-500/20"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-10 h-14 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                                <Tag className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                          </td>

                          {/* Title */}
                          <td className="px-4 py-3 max-w-[200px]">
                            <p className="text-white font-medium text-sm truncate">{g.title}</p>
                            <p className="text-gray-600 text-xs font-mono">#{g.id}</p>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">{g.category}</td>

                          {/* Prices */}
                          <td className="px-4 py-3">
                            <p className="text-yellow-400 font-bold font-mono text-sm">₹{Number(g.sale_price).toLocaleString('en-IN')}</p>
                            <p className="text-gray-600 text-xs line-through">₹{Number(g.original_price).toLocaleString('en-IN')}</p>
                          </td>

                          {/* Badge */}
                          <td className="px-4 py-3">
                            {g.badge ? (
                              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                                {g.badge}
                              </span>
                            ) : <span className="text-gray-600 text-xs">—</span>}
                          </td>

                          {/* Featured toggle */}
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleGame(g.id, 'is_featured', !g.is_featured)}
                              disabled={togglingId === g.id}
                              className="transition-colors disabled:opacity-40"
                            >
                              {g.is_featured
                                ? <ToggleRight className="w-6 h-6 text-yellow-400" />
                                : <ToggleLeft  className="w-6 h-6 text-gray-600"   />}
                            </button>
                          </td>

                          {/* In-stock toggle */}
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleGame(g.id, 'in_stock', !g.in_stock)}
                              disabled={togglingId === g.id}
                              className="transition-colors disabled:opacity-40"
                            >
                              {g.in_stock
                                ? <ToggleRight className="w-6 h-6 text-green-400"  />
                                : <ToggleLeft  className="w-6 h-6 text-red-400"    />}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditForm(g)}
                                title="Edit game"
                                className="p-1.5 rounded-lg text-gray-600 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteGame(g.id, g.title)}
                                title="Delete game"
                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-yellow-500" />
              <p className="text-gray-600 text-xs">
                Toggle Featured to show a game in Featured Deals. Toggle Stock to mark as unavailable.
                Games added here appear instantly in the store and search.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
