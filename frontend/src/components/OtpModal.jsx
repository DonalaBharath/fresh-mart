import { useEffect, useRef } from 'react';

export default function OtpModal({ isOpen, otpValue, onChange, onSubmit, onClose, onResend, loading, error, countdown }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const digits = otpValue.split('');
    digits[index] = value;
    onChange(digits.join(''));
    if (value && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Enter OTP</h2>
            <p className="mt-2 text-sm text-slate-400">Check your inbox and type the 4-digit code.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700">
            Close
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {error && <div className="rounded-3xl bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                value={otpValue[index] || ''}
                onChange={(e) => handleChange(e.target.value, index)}
                maxLength={1}
                type="text"
                inputMode="numeric"
                className="h-14 w-14 rounded-3xl border border-white/10 bg-slate-950/90 text-center text-2xl font-semibold text-white outline-none transition focus:border-emerald-400"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || otpValue.length < 4}
            className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Validating...' : 'Validate OTP'}
          </button>

          <button
            type="button"
            onClick={onResend}
            disabled={countdown > 0 || loading}
            className="w-full rounded-full border border-white/10 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}
