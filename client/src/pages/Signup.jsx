import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FormField, GoogleButton, OTPInput, Loader } from '../components';
import apiFetch from '../utils/api';
import Logo from '../assets/Logo2.png';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      addToast('OTP sent to your email!', 'success');
      setStep('verify');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) { addToast('Enter all 6 digits', 'warning'); return; }
    setLoading(true);
    try {
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, otp }),
      });
      login(data.token, data.user);
      addToast('Account created! Welcome to Artzy-AI 🎨', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#f9fafe] via-white to-[#f0f1ff] dark:from-[#0f1117] dark:via-[#1a1a2e] dark:to-[#0f1117]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card-base rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-transparent mb-4">
              <img
              src={Logo}
              alt="Artzy Bot"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
                borderRadius: '50%',
              }}
            />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {step === 'register' ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {step === 'register'
                ? 'Join thousands of AI artists'
                : `Enter the 6-digit code sent to ${form.email}`}
            </p>
          </div>

          {step === 'register' ? (
            <>
              <form onSubmit={handleRegister} className="space-y-4">
                <FormField labelName="Full Name" name="name" placeholder="John Doe" value={form.name} handleChange={handleChange} required autoComplete="name" />
                <FormField labelName="Email" type="email" name="email" placeholder="john@example.com" value={form.email} handleChange={handleChange} required autoComplete="email" />
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      className="input-base pr-10"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <FormField labelName="Confirm Password" type="password" name="confirm" placeholder="Re-enter password" value={form.confirm} handleChange={handleChange} required autoComplete="new-password" />

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
                  {loading ? <Loader size="sm" color="#fff" /> : 'Create Account'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-sm text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <GoogleButton label="Sign up with Google" />

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-[#6469ff] font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <div className="space-y-6">
              <OTPInput length={6} value={otp} onChange={setOtp} />

              <button
                onClick={handleVerify}
                disabled={loading || otp.length < 6}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {loading ? <Loader size="sm" color="#fff" /> : 'Verify & Continue'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[#6469ff] text-sm font-semibold hover:underline disabled:opacity-50"
                >
                  {resending ? 'Resending…' : 'Resend OTP'}
                </button>
              </div>

              <button onClick={() => { setStep('register'); setOtp(''); }} className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                ← Back to registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
