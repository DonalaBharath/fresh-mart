import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiTruck, FiShield, FiHeart, FiRefreshCcw, FiStar, FiTrendingUp } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import Footer from '../components/Footer';

const features = [
  { title: '100% Fresh Products', description: 'Sourced directly from trusted farmers every morning.', icon: <FiHeart /> },
  { title: 'Fast Delivery', description: 'Get your order delivered in record time with live updates.', icon: <FiTruck /> },
  { title: 'Organic Farming', description: 'Natural, pesticide-free vegetables and fruits.', icon: <FiShield /> },
  { title: 'Affordable Prices', description: 'Smart pricing, seasonal discounts, and bundle offers.', icon: <FiTrendingUp /> },
  { title: 'Customer Satisfaction', description: 'Support that cares about your healthy lifestyle.', icon: <FiStar /> },
  { title: 'Daily Fresh Stock', description: 'New arrivals every day so you always have choice.', icon: <FiRefreshCcw /> },
];

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#why') {
      const section = document.getElementById('why');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <Hero />
      <main className="mx-auto max-w-7xl px-6 py-16 text-slate-100">
        <section id="why" className="mb-16">
          <div className="mb-10 flex items-center gap-4 text-sm uppercase tracking-[0.3em] text-emerald-300">
            <span className="inline-flex h-1.5 w-16 rounded-full bg-emerald-300"></span>
            Why Choose Us
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glass backdrop-blur-xl">
            <h2 className="text-3xl font-semibold text-white">Fresh Picks for Every Meal</h2>
            <p className="mt-5 text-slate-300">Browse the latest vegetables and fruits with ratings, daily savings, and seasonal bundles created for your kitchen.</p>
            <div className="mt-8 space-y-4 text-slate-300">
              <p>• Simple cart management and checkout flow</p>
              <p>• Track orders from confirmation to delivery</p>
              <p>• Manage your profile and wishlist with ease</p>
            </div>
          </article>
          <div className="rounded-[2rem] border border-white/10 bg-emerald-500/10 p-10 shadow-glass">
            <h3 className="text-2xl font-semibold text-white">Seasonal Offers</h3>
            <p className="mt-4 text-slate-300">Shop fresh fruits and vegetables with exclusive discounts, bundle savings, and limited-time seasonal deals.</p>
            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Discount</p>
                <p className="mt-2 text-xl font-semibold text-white">Up to 20% off selected organic vegetables</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Featured</p>
                <p className="mt-2 text-xl font-semibold text-white">Fresh mangoes and berries bundle</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
