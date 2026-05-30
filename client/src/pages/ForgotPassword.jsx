import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { FormField, OTPInput, Loader } from '../components';
import apiFetch from '../utils/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      addToast('If this email exists, an OTP has been sent', 'info');
      setStep('otp');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) { addToast('Enter all 6 digits', 'warning'); return; }
    setLoading(true);
    try {
      const data = await apiFetch('/auth/verify-reset-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      setResetToken(data.resetToken);
      setStep('reset');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      addToast('Passwords do not match', 'error'); return;
    }
    if (passwords.newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error'); return;
    }
    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword: passwords.newPassword }),
      });
      addToast('Password reset successfully! Please login.', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      addToast('OTP resent!', 'success');
      setOtp('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Email', icon: '📧' },
    { label: 'Verify', icon: '🔐' },
    { label: 'Reset', icon: '✅' },
  ];
  const currentStep = step === 'email' ? 0 : step === 'otp' ? 1 : 2;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#f9fafe] via-white to-[#f0f1ff] dark:from-[#0f1117] dark:via-[#1a1a2e] dark:to-[#0f1117]">
      <div className="w-full max-w-md">
        <div className="card-base rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6469ff] to-[#8b5cf6] mb-4 shadow-lg">
              <span className="text-2xl">🔑</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Reset Password</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">We'll send a verification code to your email</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 ${i <= currentStep ? 'text-[#6469ff]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                    ${i < currentStep ? 'bg-[#6469ff] border-[#6469ff] text-white' :
                      i === currentStep ? 'border-[#6469ff] text-[#6469ff] bg-[#6469ff]/10' :
                      'border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${i < currentStep ? 'bg-[#6469ff]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <FormField labelName="Email Address" type="email" name="email" placeholder="john@example.com" value={email} handleChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? <Loader size="sm" color="#fff" /> : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <div className="space-y-6">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Code sent to <strong className="text-gray-800 dark:text-white">{email}</strong>
              </p>
              <OTPInput length={6} value={otp} onChange={setOtp} />
              <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? <Loader size="sm" color="#fff" /> : 'Verify OTP'}
              </button>
              <div className="text-center">
                <button onClick={handleResend} disabled={loading} className="text-[#6469ff] text-sm font-semibold hover:underline disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* Step: New Password */}
          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                    required
                    className="input-base pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <FormField labelName="Confirm Password" type="password" name="confirm" placeholder="Re-enter password" value={passwords.confirm} handleChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))} required />
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? <Loader size="sm" color="#fff" /> : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-[#6469ff] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
