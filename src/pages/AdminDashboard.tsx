import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, LogOut, RefreshCw, TrendingUp, ShoppingBag,
  CheckCircle2, XCircle, Clock, IndianRupee, Search, Trash2,
  ChevronDown, Eye, EyeOff,
} from 'lucide-react';

interface Order {
  id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  customer_name: string;
  instagram: string;
  email: string;
  telegram: string;
  game_name: string;
  game_price: number;
  steam_username: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  verified_at: string;
}

interface Stats {
  verified: string;
  pending: string;
  failed: string;
  total_revenue: string;
  total_orders: string;
}

const STATUS_COLORS: Record<string, string> = {
  verified: 'text-green-400 bg-green-500/10 border-green-500/30',
  pending:  'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  failed:   'text-red-400 bg-red-500/10 border-red-500/30',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  verified: <CheckCircle2 className="w-3 h-3" />,
  pending:  <Clock className="w-3 h-3" />,
  failed:   <XCircle className="w-3 h-3" />,
};

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const savedPass = () => sessionStorage.getItem('jhojha_admin_pass') || '';

  const fetchData = useCallback(async (pass: string) => {
    setLoading(true);
    try {
      const headers = { 'x-admin-password': pass };
      const [ordersRes, statsRes] = await Promise.all([
        fetch(`/api/admin/orders?limit=200${statusFilter ? `&status=${statusFilter}` : ''}`, { headers }),
        fetch('/api/admin/stats', { headers }),
      ]);
      if (ordersRes.status === 401) { setAuthed(false); sessionStorage.removeItem('jhojha_admin_pass'); return; }
      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();
      setOrders(ordersData.orders || []);
      setStats(statsData);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const saved = savedPass();
    if (saved) { setPassword(saved); setAuthed(true); fetchData(saved); }
  }, []);

  useEffect(() => {
    if (authed) fetchData(savedPass() || password);
  }, [statusFilter, authed]);

  const handleLogin = async () => {
    setAuthError('');
    const res = await fetch('/api/admin/stats', { headers: { 'x-admin-password': password } });
    if (res.status === 401) { setAuthError('Wrong password'); return; }
    if (res.status === 503) { setAuthError('Admin not configured on server'); return; }
    sessionStorage.setItem('jhojha_admin_pass', password);
    setAuthed(true);
    fetchData(password);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this order permanently?')) return;
    setDeleting(id);
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE', headers: { 'x-admin-password': savedPass() || password } });
    setOrders(prev => prev.filter(o => o.id !== id));
    setDeleting(null);
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.customer_name?.toLowerCase().includes(q) ||
      o.instagram?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.game_name?.toLowerCase().includes(q) ||
      o.razorpay_payment_id?.toLowerCase().includes(q)
    );
  });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div className="w-full max-w-sm rounded-2xl bg-[#111] border border-yellow-500/20 p-8" style={{ boxShadow: '0 0 40px rgba(245,166,35,0.08)' }}>
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-6 h-6 text-yellow-500" />
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Admin Dashboard</h1>
              <p className="text-gray-600 text-xs">Jhojha Games</p>
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
            className="w-full py-3 rounded-xl bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm hover:bg-yellow-400 transition-colors"
          >
            Login
          </button>
          <a href="/" className="block text-center text-gray-600 text-xs mt-4 hover:text-gray-400 transition-colors">← Back to store</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-yellow-500/10 bg-black/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Jhojha Games — Admin</h1>
              <p className="text-gray-600 text-xs">{stats?.total_orders || 0} total orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchData(savedPass() || password)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/25 transition-all">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <a href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white transition-all">
              ← Store
            </a>
            <button
              onClick={() => { sessionStorage.removeItem('jhojha_admin_pass'); setAuthed(false); setPassword(''); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Verified', value: stats.verified, icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, color: 'border-green-500/20' },
              { label: 'Pending', value: stats.pending, icon: <Clock className="w-4 h-4 text-yellow-400" />, color: 'border-yellow-500/20' },
              { label: 'Failed', value: stats.failed, icon: <XCircle className="w-4 h-4 text-red-400" />, color: 'border-red-500/20' },
              { label: 'Revenue', value: `₹${Number(stats.total_revenue).toLocaleString('en-IN')}`, icon: <IndianRupee className="w-4 h-4 text-yellow-400" />, color: 'border-yellow-500/20' },
            ].map(s => (
              <div key={s.label} className={`p-4 rounded-xl bg-white/3 border ${s.color}`}>
                <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{s.label}</span></div>
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
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, Instagram, email, game, payment ID…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <ShoppingBag className="w-4 h-4" />
            {filtered.length} orders
          </div>
        </div>

        {/* Orders table */}
        <div className="rounded-xl border border-white/8 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/3 border-b border-white/8">
                  {['#', 'Customer', 'Instagram', 'Game', 'Amount', 'Method', 'Status', 'Date', ''].map(h => (
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
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[o.payment_status] || STATUS_COLORS.pending}`}>
                          {STATUS_ICON[o.payment_status]} {o.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmt(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); handleDelete(o.id); }} disabled={deleting === o.id} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                    {expandedRow === o.id && (
                      <tr key={`${o.id}-detail`} className="bg-white/2">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            {[
                              ['Razorpay Order ID', o.razorpay_order_id],
                              ['Payment ID', o.razorpay_payment_id || '—'],
                              ['Telegram', o.telegram ? `@${o.telegram}` : '—'],
                              ['Steam Username', o.steam_username || '—'],
                              ['Verified At', o.verified_at ? fmt(o.verified_at) : '—'],
                            ].map(([k, v]) => (
                              <div key={k} className="bg-white/3 rounded-lg p-3">
                                <p className="text-gray-600 mb-1 uppercase tracking-wider">{k}</p>
                                <p className="text-white font-mono break-all">{v}</p>
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

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/5">
            {filtered.length === 0 && <p className="px-4 py-8 text-center text-gray-600 text-sm">No orders found</p>}
            {filtered.map(o => (
              <div key={o.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{o.customer_name}</p>
                    <p className="text-blue-400 text-xs">@{o.instagram}</p>
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold uppercase ${STATUS_COLORS[o.payment_status] || STATUS_COLORS.pending}`}>
                    {STATUS_ICON[o.payment_status]} {o.payment_status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-yellow-400 font-medium truncate max-w-[160px]">{o.game_name}</span>
                  <span className="text-yellow-500 font-bold font-mono">₹{o.game_price?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-xs">{fmt(o.created_at)}</p>
                  <button onClick={() => handleDelete(o.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {o.razorpay_payment_id && (
                  <p className="text-gray-700 font-mono text-xs break-all">{o.razorpay_payment_id}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-yellow-500" />
          <p className="text-gray-600 text-xs">Showing {filtered.length} of {orders.length} orders. Click a row to expand details.</p>
        </div>
      </div>
    </div>
  );
}
