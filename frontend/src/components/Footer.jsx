export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 px-6 py-10 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">Fresh Mart</p>
          <p className="mt-2 max-w-md text-sm text-slate-400">A modern grocery platform for fresh vegetables and fruits, daily deals, and fast delivery.</p>
        </div>
        <p className="text-sm">© 2026 Fresh Mart. All rights reserved.</p>
      </div>
    </footer>
  );
}
