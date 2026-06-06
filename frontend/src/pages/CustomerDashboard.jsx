import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Welcome back, {user?.fullName}</h1>
          <p className="mt-3 text-slate-400">This is your customer dashboard. Track your orders and continue shopping.</p>
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          <Link to="/orders" className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center transition hover:bg-emerald-400/10">
            <h2 className="text-xl font-semibold text-white">My Orders</h2>
            <p className="mt-3 text-slate-400">View recent purchases and delivery status.</p>
          </Link>
          <Link to="/shop" className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center transition hover:bg-emerald-400/10">
            <h2 className="text-xl font-semibold text-white">Shop Fresh Produce</h2>
            <p className="mt-3 text-slate-400">Browse today’s vegetables, fruits, and offers.</p>
          </Link>
          <Link to="/cart" className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center transition hover:bg-emerald-400/10">
            <h2 className="text-xl font-semibold text-white">My Cart</h2>
            <p className="mt-3 text-slate-400">Review items before checkout.</p>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
