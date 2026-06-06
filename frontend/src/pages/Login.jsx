import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      const response = await login({ email, password });
      toast.success('Login successful!');
      const destination = response.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(destination);
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      
      // Provide helpful message if user hasn't created account yet
      if (errorCode === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password. If you don\'t have an account, please register first.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-4xl items-center justify-center px-6 py-12">
        <div className="w-full rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Welcome back</h1>
          <p className="mt-3 text-slate-400">Login to continue ordering fresh vegetables and fruits.</p>
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="john@example.com" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            New here? <Link to="/register" className="text-emerald-300 hover:text-emerald-200">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
