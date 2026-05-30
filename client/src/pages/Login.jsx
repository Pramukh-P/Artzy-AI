import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FormField, GoogleButton, OTPInput, Loader } from '../components';
import apiFetch from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  // Unverified flow
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
    const error = searchParams.get('error');
    if (error === 'google_failed') addToast('Google login failed. Please try again.', 'error');
  }, [isAuthenticated]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      login(data.token, data.user);
      addToast(`Welcome back, ${data.user.name}! 👋`, 'success');
      navigate('/');
    } catch (err) {
      if (err.data?.needsVerification) {
        setNeedsVerification(true);
        addToast('Please verify your email first', 'warning');
      } else {
        addToast(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) { addToast('Enter all 6 digits', 'warning'); return; }
    setVerifying(true);
    try {
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, otp }),
      });
      login(data.token, data.user);
      addToast('Verified! Welcome 🎨', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await apiFetch('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, type: 'verify' }),
      });
      addToast('New OTP sent!', 'success');
      setOtp('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setResending(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#f9fafe] via-white to-[#f0f1ff] dark:from-[#0f1117] dark:via-[#1a1a2e] dark:to-[#0f1117]">
        <div className="w-full max-w-md">
          <div className="card-base rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📧</div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Verify Your Email</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter the 6-digit code sent to <strong>{form.email}</strong></p>
            </div>
            <div className="space-y-6">
              <OTPInput length={6} value={otp} onChange={setOtp} />
              <button onClick={handleVerify} disabled={verifying || otp.length < 6} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {verifying ? <Loader size="sm" color="#fff" /> : 'Verify & Login'}
              </button>
              <div className="text-center">
                <button onClick={handleResend} disabled={resending} className="text-[#6469ff] text-sm font-semibold hover:underline disabled:opacity-50">
                  {resending ? 'Resending…' : 'Resend OTP'}
                </button>
              </div>
              <button onClick={() => setNeedsVerification(false)} className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                ← Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#f9fafe] via-white to-[#f0f1ff] dark:from-[#0f1117] dark:via-[#1a1a2e] dark:to-[#0f1117]">
      <div className="w-full max-w-md">
        <div className="card-base rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6469ff] to-[#8b5cf6] mb-4 shadow-lg">
              <span className="text-2xl">🎨</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to your Artzy-AI account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <FormField labelName="Email" type="email" name="email" placeholder="john@example.com" value={form.email} handleChange={handleChange} required autoComplete="email" />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#6469ff] hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="input-base pr-10"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <Loader size="sm" color="#fff" /> : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-sm text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <GoogleButton label="Sign in with Google" />

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#6469ff] font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
