import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalCustomers: 0, totalOrders: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/users/stats');
        setStats(response.data);
      } catch (err) {
        setError('Unable to fetch dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-24 text-center text-slate-200">
          <h1 className="text-4xl font-semibold text-white">Access denied</h1>
          <p className="mt-4">You must be an admin to view this page.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Admin Dashboard</h1>
          <p className="mt-3 text-slate-400">Manage products, customers, and orders from your admin panel.</p>
        </div>

        {error && <div className="mb-6 rounded-3xl bg-rose-500/10 p-4 text-rose-200">{error}</div>}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Total Products</p>
            <p className="mt-4 text-4xl font-semibold text-white">{stats.totalProducts}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Total Customers</p>
            <p className="mt-4 text-4xl font-semibold text-white">{stats.totalCustomers}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Total Orders</p>
            <p className="mt-4 text-4xl font-semibold text-white">{stats.totalOrders}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Actions</p>
            <div className="mt-4 flex flex-col gap-3">
              <Link to="/admin/products" className="rounded-full bg-emerald-400 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">Manage Products</Link>
              <Link to="/admin/orders" className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-200 transition hover:bg-emerald-400/10">Manage Orders</Link>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
            <h2 className="text-2xl font-semibold text-white">Revenue Overview</h2>
            <p className="mt-3 text-slate-300">Track product performance and order status from the backend.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
            <h2 className="text-2xl font-semibold text-white">Recent Activity</h2>
            {loading ? (
              <p className="mt-4 text-slate-400">Loading...</p>
            ) : (
              <p className="mt-4 text-slate-300">Latest orders and inventory changes appear in your admin pages.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
