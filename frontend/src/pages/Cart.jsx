import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Cart() {
  const { items, updateItem, removeItem, subtotal, deliveryCharge, total } = useCart();
  const navigate = useNavigate();

  const backendBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
  const fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image';
  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
    return imageUrl.startsWith('/') ? `${backendBaseUrl}${imageUrl}` : `${backendBaseUrl}/${imageUrl}`;
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Shopping Cart</h1>
          <p className="mt-3 text-slate-400">Review your selected products and proceed to checkout.</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300 shadow-glass">
            <p className="text-xl font-medium text-white">Your cart is empty.</p>
            <Link to="/shop" className="mt-6 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => {
              const imageUrl = resolveImageUrl(item.imageUrl);
              return (
                <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
                  <div className="flex gap-5">
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl bg-slate-900">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImage;
                          }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500">No image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xl font-semibold text-white">{item.name}</p>
                          <p className="mt-2 text-sm text-slate-400">{item.category}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-sm text-rose-300 transition hover:text-rose-200">
                          Remove
                        </button>
                      </div>
                      <div className="mt-4 flex items-center gap-3 text-slate-300">
                        <span>₹{item.price} each</span>
                        <span>{item.availability}</span>
                      </div>
                      <div className="mt-5 flex items-center gap-3">
                        <button onClick={() => updateItem(item.id, item.quantity - 1)} className="rounded-full border border-white/10 px-3 py-2 text-slate-200">
                          -
                        </button>
                        <span className="min-w-[2rem] text-center text-white">{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} className="rounded-full border border-white/10 px-3 py-2 text-slate-200">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass">
              <h2 className="text-2xl font-semibold text-white">Order Summary</h2>
              <div className="mt-6 space-y-4 text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-4 text-white">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">₹{total}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')} className="mt-8 w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
