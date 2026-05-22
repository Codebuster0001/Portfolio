import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Mail, CheckCircle2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoginMutation, useForgotPasswordMutation, useResetPasswordMutation } from '../store/apiSlice';

export default function LoginGate({ onAccessGranted }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // RTK Query Mutations
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  // Mode: 'login' | 'forgot' | 'resetsent' | 'reset' | 'resetsuccess'
  const [mode, setMode] = useState('login');
  const [forgotEmail, setForgotEmail] = useState('');
  
  // For reset password
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isLoading = isLoginLoading || isForgotLoading || isResetLoading;

  // Check URL on mount for reset token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (window.location.pathname === '/reset-password' && token) {
      setResetToken(token);
      setMode('reset');
    }
  }, []);

  const triggerError = (msg) => {
    setError(true);
    setErrorMessage(msg);
    setTimeout(() => setError(false), 2000); // Increased timeout a bit for readability
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      triggerError('Please fill in all security credentials.');
      return;
    }

    try {
      const data = await login({ email, password }).unwrap();
      // Save token
      localStorage.setItem('admin_token', data.token);
      setError(false);
      onAccessGranted();
    } catch (err) {
      triggerError(err?.data || 'Invalid email address or passcode combination.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      triggerError('Please enter your recovery email address.');
      return;
    }

    try {
      await forgotPassword({ email: forgotEmail }).unwrap();
      setError(false);
      // Show success message telling user to check email
      setMode('resetsent');
    } catch (err) {
      triggerError(err?.data || 'Email not registered or error occurred.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      triggerError('Please enter a new password.');
      return;
    }

    try {
      await resetPassword({ token: resetToken, newPassword }).unwrap();
      setError(false);
      setMode('resetsuccess');
      
      // Automatically redirect to login page after 2.5 seconds
      setTimeout(() => {
        navigate('/login');
        setMode('login');
      }, 2500);
    } catch (err) {
      triggerError(err?.data || 'Invalid or expired token.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b14] relative overflow-hidden px-4">
      {/* Background soft gradients */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          animate={error ? { x: [-10, 10, -8, 8, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-950/40 border border-zinc-800/60 rounded-3xl p-8 backdrop-blur-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between"
        >
          {/* Accent glow line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

          <AnimatePresence mode="wait">
            {/* --- SIGN IN MODE --- */}
            {mode === 'login' && (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-4 text-blue-400">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Portfolio Admin Hub</h1>
                  <p className="text-zinc-400 text-sm text-center">
                    Enter your administrator credentials to gain console access.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <Input
                      type="text"
                      placeholder="admin@portfolio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900/60 border-zinc-800/60 text-white rounded-xl py-5 pl-4 focus:ring-blue-500/20 placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-900/60 border-zinc-800/60 text-white rounded-xl py-5 pl-4 pr-12 focus:ring-blue-500/20 placeholder:text-zinc-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {errorMessage && error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/5 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? "Authenticating..." : "Access Dashboard"}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* --- FORGOT PASSWORD MODE --- */}
            {mode === 'forgot' && (
              <motion.div
                key="forgot-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-1 flex flex-col justify-center"
              >
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-4 text-blue-400">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Password Recovery</h1>
                  <p className="text-zinc-400 text-sm text-center">
                    Enter your registered email to receive a secure recovery link.
                  </p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Recovery Email
                    </label>
                    <Input
                      type="email"
                      placeholder="admin@portfolio.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-zinc-900/60 border-zinc-800/60 text-white rounded-xl py-5 pl-4 focus:ring-blue-500/20 placeholder:text-zinc-600"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {errorMessage && error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/5 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "Send Recovery Link"}
                  </Button>
                </form>

                <button
                  onClick={() => setMode('login')}
                  className="w-full py-3.5 rounded-xl border border-zinc-800/40 bg-zinc-900/10 text-zinc-400 text-sm font-medium hover:bg-zinc-900/40 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>
              </motion.div>
            )}

            {/* --- RESET SENT SUCCESS MODE --- */}
            {mode === 'resetsent' && (
              <motion.div
                key="resetsent-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 flex-1 flex flex-col justify-center items-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Recovery Email Sent</h2>
                  <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                    A secure password reset link has been dispatched to <span className="text-blue-400 font-mono">{forgotEmail}</span>. Check your inbox!
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setForgotEmail('');
                    setMode('login');
                  }}
                  className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-6 rounded-xl transition-all"
                >
                  Return to Sign In
                </Button>
              </motion.div>
            )}

            {/* --- ACTUAL RESET PASSWORD FORM --- */}
            {mode === 'reset' && (
              <motion.div
                key="reset-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-1 flex flex-col justify-center"
              >
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-4 text-blue-400">
                    <Key className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create New Password</h1>
                  <p className="text-zinc-400 text-sm text-center">
                    Please enter your new password below.
                  </p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-zinc-900/60 border-zinc-800/60 text-white rounded-xl py-5 pl-4 pr-12 focus:ring-blue-500/20 placeholder:text-zinc-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {errorMessage && error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/5 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Update Password"}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* --- RESET SUCCESS MODE --- */}
            {mode === 'resetsuccess' && (
              <motion.div
                key="resetsuccess-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 flex-1 flex flex-col justify-center items-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Password Updated</h2>
                  <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                    Your password has been successfully reset. You can now use your new credentials to access the admin hub.
                  </p>
                </div>

                <Button
                  disabled={true}
                  className="w-full bg-white/50 text-black font-semibold py-6 rounded-xl transition-all"
                >
                  Redirecting to Sign In...
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
