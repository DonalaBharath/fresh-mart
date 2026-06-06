import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = ['all', 'vegetable', 'fruit'];

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const backendBaseUrl = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('data:')) return imageUrl;
  return imageUrl.startsWith('/') ? `${backendBaseUrl}${imageUrl}` : `${backendBaseUrl}/${imageUrl}`;
};

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [error, setError] = useState('');
  const [addingProductId, setAddingProductId] = useState(null);
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'all') params.category = category;
      if (filterAvailability) params.availability = filterAvailability;
      const response = await api.get('/products', { params });
      setProducts(response.data.products);
    } catch (err) {
      setError('Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    const intervalId = setInterval(loadProducts, 25000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.info('Only customer accounts can add items to the cart.');
      return;
    }

    try {
      setAddingProductId(product._id);
      await addItem(product, 1);
    } finally {
      setAddingProductId(null);
    }
  };

  const handleSearch = (event) => setSearch(event.target.value);
  const handleFilter = () => loadProducts();

  const displayedProducts = useMemo(() => products, [products]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white">Shop Vegetables & Fruits</h1>
            <p className="mt-3 text-slate-400">Browse fresh produce, filter by category, and add items to your cart.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <input value={search} onChange={handleSearch} placeholder="Search products" className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none" />
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none">
              {categories.map((option) => (
                <option key={option} value={option}>{option === 'all' ? 'All Categories' : option}</option>
              ))}
            </select>
            <button onClick={handleFilter} className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              Filter
            </button>
          </div>
        </div>

        {error && <div className="mb-6 rounded-3xl bg-rose-500/10 p-4 text-rose-200">{error}</div>}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-3xl bg-slate-800/70" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {displayedProducts.map((product) => {
              const imageUrl = resolveImageUrl(product.imageUrl);
              return (
                <div key={product._id} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glass transition hover:-translate-y-1">
                  <div className="overflow-hidden rounded-3xl bg-slate-900">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center text-slate-500">No image available</div>
                    )}
                  </div>
                  <div className="mt-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">{product.category}</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">{product.name}</h3>
                    <p className="mt-3 text-slate-300 line-clamp-2">{product.description}</p>
                    <div className="mt-5 flex flex-col gap-3">
                      <div>
                        <p className="text-slate-400 text-sm">Per kg</p>
                        <p className="text-2xl font-semibold text-white">₹{product.price}</p>
                      </div>
                      <div className="grid gap-2 rounded-3xl bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-200">
                        <span>{product.availability === 'In Stock' ? 'In Stock' : 'Out of Stock'}</span>
                        <span>Stock: {product.quantity}</span>
                      </div>
                      {user?.role === 'customer' && (
                        <button
                          type="button"
                          disabled={product.availability !== 'In Stock' || addingProductId === product._id}
                          onClick={() => handleAddToCart(product)}
                          className="rounded-full bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600"
                        >
                          {product.availability !== 'In Stock'
                            ? 'Out of Stock'
                            : addingProductId === product._id
                            ? 'Adding...'
                            : 'Add to Cart'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
