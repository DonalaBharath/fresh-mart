import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const backendBaseUrl = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');



const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';

  if (
    /^https?:\/\//i.test(imageUrl) ||
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('blob:')
  ) {
    return imageUrl;
  }

  return imageUrl.startsWith('/')
    ? `${backendBaseUrl}${imageUrl}`
    : `${backendBaseUrl}/${imageUrl}`;
};
const initialForm = { name: '', description: '', price: '', quantity: '', category: 'vegetable', availability: 'In Stock', discount: 0, featured: false, imageFile: null };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [error, setError] = useState('');

 
const fetchProducts = async () => {
  try {
    const response = await api.get('/products/admin');

   

    setProducts(response.data.products);
  } catch (err) {
    setError('Unable to load products.');
  }
};






  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setCurrentImageUrl('');
    setImagePreviewUrl('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('quantity', form.quantity);
      formData.append('category', form.category);
      formData.append('availability', form.availability);
      formData.append('discount', form.discount);
      formData.append('featured', form.featured);

      if (form.imageFile) {
        formData.append('image', form.imageFile);
      }

      if (!editingId && !form.imageFile) {
        throw new Error('Please choose a product image from your computer.');
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post('/products', formData);
      }

      await fetchProducts();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to save product.');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setCurrentImageUrl(product.imageUrl);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      availability: product.availability,
      discount: product.discount ?? 0,
      featured: product.featured ?? false,
      imageFile: null,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    await fetchProducts();
  };

  const handleToggleAvailability = async (product) => {
    await api.put(`/products/${product._id}`, {
      ...product,
      availability: product.availability === 'In Stock' ? 'Out of Stock' : 'In Stock',
    });
    await fetchProducts();
  };

  const totalInStock = useMemo(() => products.filter((product) => product.availability === 'In Stock').length, [products]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Vegetables & Fruits Management</h1>
          <p className="mt-3 text-slate-400">Add, edit, delete products, and manage stock availability for your store.</p>
          <p className="mt-4 text-slate-300">Total in-stock items: {totalInStock}</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {error && <div className="rounded-3xl bg-rose-500/10 p-4 text-rose-200">{error}</div>}
            {products.map((product) => {
              const imageUrl = resolveImageUrl(product.imageUrl);
              return (
                <div key={product._id} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
                  <div className="grid gap-6 md:grid-cols-[150px_1fr]">
                    <div className="overflow-hidden rounded-3xl bg-slate-900 h-52 md:h-full">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          onError={(e) => {
                            console.log("FAILED IMAGE:", imageUrl);
                          }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500">No image</div>
                      )}
                    </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">{product.category}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{product.name}</p>
                    <p className="mt-2 text-slate-300 line-clamp-2">{product.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-slate-400">
                      <span>₹{product.price} / kg</span>
                      <span>{product.quantity} pcs</span>
                      <span>{product.availability}</span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button onClick={() => handleEdit(product)} className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-400/20">Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="rounded-full bg-rose-500/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/20">Delete</button>
                      <button onClick={() => handleToggleAvailability(product)} className="rounded-full bg-slate-700/70 px-4 py-2 text-sm text-slate-200 hover:bg-slate-600/80">Toggle Stock</button>
                    </div>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass">
            <h2 className="text-2xl font-semibold text-white">{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" placeholder="Description" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none" />
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none" />
                <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="Quantity" type="number" className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none" />
              </div>
              <label className="block rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100">
                <span className="text-slate-300">Product image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setForm({ ...form, imageFile: file });
                    if (file) {
                      setImagePreviewUrl(URL.createObjectURL(file));
                    } else {
                      setImagePreviewUrl('');
                    }
                  }}
                  className="mt-2 w-full text-slate-100"
                />
              </label>
              {(imagePreviewUrl || currentImageUrl) && (
                <div className="rounded-3xl border border-white/10 bg-slate-900 p-3">
                  <p className="mb-2 text-sm text-slate-400">Image preview</p>
                  <img
                    src={resolveImageUrl(imagePreviewUrl || currentImageUrl)}
                    alt="Product preview"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                    className="h-40 w-full rounded-3xl object-cover"
                  />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none">
                  <option value="vegetable">Vegetable</option>
                  <option value="fruit">Fruit</option>
                </select>
                <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none">
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="Discount %" type="number" className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none" />
                <label className="inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 rounded border-white/30 bg-slate-700 text-emerald-400" />
                  <span className="text-slate-300">Featured</span>
                </label>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={resetForm} className="rounded-full border border-white/10 bg-slate-800 px-6 py-3 text-sm text-slate-200 transition hover:bg-slate-700">
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
