import { Link, NavLink } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Why Choose Us', path: '/#why' },
  { label: 'Products', path: '/shop' },
  { label: 'Contact Us', path: '/contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl shadow-glass">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-emerald-300">Fresh Mart</Link>
          <nav className="hidden gap-6 md:flex">
            {navItems.map((item) => (
              <Link key={item.label} to={item.path} className="text-sm text-slate-200 transition hover:text-emerald-300">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {user?.role === 'customer' && (
            <NavLink to="/cart" className="btn-glass inline-flex items-center gap-2 px-4 py-2 text-sm font-medium">
              <FiShoppingCart className="h-5 w-5" /> Cart ({items.length})
            </NavLink>
          )}
          {user ? (
            <>
              {user.role === 'admin' ? (
                <NavLink to="/admin/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-emerald-400/10 hover:text-emerald-300">
                  Admin
                </NavLink>
              ) : (
                <NavLink to="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-emerald-400/10 hover:text-emerald-300">
                  Dashboard
                </NavLink>
              )}
              <button onClick={logout} className="rounded-full border border-white/10 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-400/20">
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <NavLink to="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-emerald-400/10 hover:text-emerald-300">
                Login
              </NavLink>
              <NavLink to="/register" className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
