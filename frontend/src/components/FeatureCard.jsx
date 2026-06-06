export default function FeatureCard({ title, description, icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass transition hover:-translate-y-1 hover:bg-white/10">
      <div className="mb-4 h-14 w-14 rounded-3xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center text-xl">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  );
}
