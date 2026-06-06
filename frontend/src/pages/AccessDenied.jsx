import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-24 text-center text-slate-200">
        <h1 className="text-4xl font-semibold text-white">Access Denied</h1>
        <p className="mt-4">You do not have permission to view this page.</p>
        <Link to="/" className="mt-8 inline-block rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
          Back to Home
        </Link>
      </main>
    </div>
  );
}
