import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetPasswordMutation, useValidateResetTokenQuery } from '../store/apiSlice';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on mount
  const { data: isValid, error: tokenError, isLoading: isValidating } = useValidateResetTokenQuery(token, {
    skip: !token
  });

  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  useEffect(() => {
    if (tokenError) {
      triggerError('Invalid or expired reset link. Please request a new one.');
    }
  }, [tokenError]);

  const triggerError = (msg) => {
    setError(true);
    setErrorMessage(msg);
    setTimeout(() => setError(false), 3000);
  };

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 5
  };

  const strength = calculateStrength(password);
  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (password.length === 0) return 'Enter a password';
    if (strength <= 1) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (strength < 5) {
      triggerError('Password must be at least 8 chars long and contain uppercase, lowercase, numbers, and special characters.');
      return;
    }

    if (password !== confirmPassword) {
      triggerError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      setError(false);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      triggerError(err?.data || 'Failed to reset password. Token may have expired.');
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080b14] px-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080b14] px-4">
        <div className="bg-zinc-950/40 border border-red-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Invalid Link</h2>
          <p className="text-zinc-400 text-sm">The password reset link is invalid or has expired. Please request a new one.</p>
          <Button onClick={() => navigate('/forgot-password')} className="w-full mt-4">
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b14] relative overflow-hidden px-4">
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
          className="bg-zinc-950/40 border border-zinc-800/60 rounded-3xl p-8 backdrop-blur-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-center"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 w-full"
              >
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-4 text-blue-400">
                    <Key className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Reset Password</h1>
                  <p className="text-zinc-400 text-sm text-center">
                    Please enter your new secure password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      New Password
                    </label>
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
                    {/* Password Strength Meter */}
                    <div className="pt-2 space-y-1">
                      <div className="flex h-1.5 w-full gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level} 
                            className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? getStrengthColor() : 'bg-zinc-800'}`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${strength === 5 ? 'text-emerald-400' : 'text-zinc-500'} text-right font-medium`}>
                        {getStrengthText()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-900/60 border-zinc-800/60 text-white rounded-xl py-5 pl-4 pr-12 focus:ring-blue-500/20 placeholder:text-zinc-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    disabled={isResetting}
                    className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/5 active:scale-[0.98] disabled:opacity-50 mt-2"
                  >
                    {isResetting ? "Updating..." : "Reset Password"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="resetsuccess"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 flex flex-col justify-center items-center py-6 w-full"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Password Updated</h2>
                  <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                    Your password has been successfully reset. Redirecting to login...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
