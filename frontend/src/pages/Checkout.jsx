import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Checkout() {
  const { items, subtotal, deliveryCharge, total, clearCart } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setError('Please log in to place your order.');
      return;
    }
    if (!address.trim()) {
      setError('Delivery address is required.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/orders', {
        items: items.map((item) => ({ product: item.id, name: item.name, price: item.price, quantity: item.quantity, imageUrl: item.imageUrl })),
        deliveryAddress: address,
        subtotal,
        deliveryCharge,
        total,
        paymentMethod: 'Cash on Delivery',
      });
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to place your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Checkout</h1>
          <p className="mt-3 text-slate-400">Confirm your delivery details and complete the order.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300">Delivery Address</label>
              <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows="5" className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" placeholder="Enter your delivery address" />
            </div>
            {error && <p className="mb-4 rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
            <button type="submit" disabled={loading || items.length === 0} className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
            {!user && (
              <p className="mt-4 text-sm text-slate-400">You must be logged in to complete checkout.</p>
            )}
          </form>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass">
            <h2 className="text-2xl font-semibold text-white">Order Summary</h2>
            <div className="mt-6 space-y-4 text-slate-300">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">{items.length} items in cart</p>
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-3xl border border-white/10 p-4">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-white">₹{item.price * item.quantity}</p>
                </div>
              ))}
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivery</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="mt-4 flex justify-between text-white">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
