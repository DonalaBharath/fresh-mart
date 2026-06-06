import { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const statusOptions = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders);
    } catch (err) {
      setError('Failed to load orders.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      setError('Unable to update status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Order Management</h1>
          <p className="mt-3 text-slate-400">Review all customer orders and update delivery status.</p>
        </div>
        {error && <div className="mb-6 rounded-3xl bg-rose-500/10 p-4 text-rose-200">{error}</div>}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base uppercase tracking-[0.25em] text-emerald-300">Order #{order._id.slice(-8)}</p>
                  <p className="mt-2 text-xl font-semibold text-white">₹{order.total}</p>
                  <p className="mt-2 text-sm text-slate-400">{order.customer?.fullName} • {order.items.length} items</p>
                </div>
                <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none">
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
