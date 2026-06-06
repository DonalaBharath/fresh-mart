import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import OtpModal from '../components/OtpModal';
import { useAuth } from '../contexts/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pendingEmail, setPendingEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const startCountdown = () => setCountdown(30);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({ fullName, email, password });
      setPendingEmail(email);
      setOtpOpen(true);
      setOtpValue('');
      setOtpError('');
      toast.success('OTP has been sent to your email');
      startCountdown();
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message || 'Unable to send OTP.';
      
      // Handle account already exists error
      if (errorCode === 'ACCOUNT_EXISTS') {
        setError(errorMessage);
        toast.info('Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otpValue.length !== 4) {
      setOtpError('Please enter the 4-digit OTP.');
      return;
    }

    try {
      setOtpLoading(true);
      await verifyOtp({ email: pendingEmail, otp: otpValue });
      toast.success('Registration successful! Welcome to Fresh Mart.');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message || 'OTP verification failed.';
      
      // Handle specific error codes
      if (errorCode === 'ACCOUNT_EXISTS') {
        setOtpError(errorMessage);
        toast.info('Redirecting to login...');
        setTimeout(() => {
          setOtpOpen(false);
          navigate('/login');
        }, 2000);
        return;
      }
      
      setOtpError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    setOtpError('');
    try {
      await resendOtp({ email: pendingEmail });
      toast.success('OTP resent to your email');
      setOtpValue('');
      startCountdown();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Unable to resend OTP.';
      const retryAfter = err.response?.data?.retryAfter;
      
      if (retryAfter) {
        setOtpError(`${errorMessage} (Retry after ${retryAfter}s)`);
      } else {
        setOtpError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <OtpModal
        isOpen={otpOpen}
        otpValue={otpValue}
        onChange={setOtpValue}
        onSubmit={handleVerify}
        onClose={() => setOtpOpen(false)}
        onResend={handleResend}
        loading={otpLoading}
        error={otpError}
        countdown={countdown}
      />
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-4xl items-center justify-center px-6 py-12">
        <div className="w-full rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Create your account</h1>
          <p className="mt-3 text-slate-400">Register with email verification to secure your account.</p>
          <form onSubmit={handleSubmit} className="mt-10 grid gap-6 md:grid-cols-2">
            {error && <div className="md:col-span-2 rounded-3xl bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" placeholder="John Doe" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="john@example.com" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Confirm Password</label>
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <button type="submit" disabled={loading} className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Sending OTP...' : 'Register'}
              </button>
              <p className="text-sm text-slate-400">Already have an account? <Link to="/login" className="text-emerald-300">Sign in</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
