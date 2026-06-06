import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/orders');
        setOrders(response.data.orders);
      } catch (err) {
        setError('Unable to load your orders.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Order History</h1>
          <p className="mt-3 text-slate-400">Track your recent purchases, status updates, and delivery progress.</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((index) => (
              <div key={index} className="h-32 animate-pulse rounded-3xl bg-slate-800/70" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-rose-500/10 p-6 text-rose-200">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300 shadow-glass">
            <p className="text-xl font-medium text-white">No orders yet.</p>
            <p className="mt-2">Start shopping to place your first order.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Order #{order._id.slice(-8)}</p>
                    <p className="mt-2 text-xl font-semibold text-white">₹{order.total}</p>
                    <p className="mt-2 text-sm text-slate-400">{order.items.length} items • {order.deliveryAddress}</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
