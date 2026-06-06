import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero bg-cover bg-center bg-no-repeat text-slate-100">
      <div className="absolute inset-0 bg-slate-950/75"></div>
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-24 md:py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="mb-6 inline-flex rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-200">100% fresh, organic, and delivered fast</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Fresh vegetables & fruits delivered to your door.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-200/90 sm:text-xl">
            Discover daily fresh stock, unbeatable offers, secure checkout, and a green shopping experience built for modern households.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link to="/shop" className="btn-glass inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white shadow-glass transition hover:bg-emerald-400/25">
              Order Now
            </Link>
            <Link to="/#why" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm text-slate-100 transition hover:border-emerald-300 hover:text-emerald-200">
              Why Choose Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
