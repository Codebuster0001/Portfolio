import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForgotPasswordMutation } from '../store/apiSlice';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const triggerError = (msg) => {
    setError(true);
    setErrorMessage(msg);
    setTimeout(() => setError(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      triggerError('Please enter your recovery email address.');
      return;
    }

    try {
      const response = await forgotPassword({ email: email.trim() }).unwrap();
      
      // The API now returns a 200 OK with { success: false/true, message: "..." }
      if (response && response.success === false) {
        triggerError(response.message || 'Email account not found');
        return;
      }
      
      setError(false);
      setIsSent(true);
    } catch (err) {
      triggerError(err?.data?.message || err?.data || 'Email account not found');
    }
  };

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
          className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/60 rounded-3xl p-8 backdrop-blur-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-center"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 w-full"
              >
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-center mb-4 text-blue-400">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Password Recovery</h1>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm text-center">
                    Enter your registered email to receive a secure recovery link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Recovery Email
                    </label>
                    <Input
                      type="email"
                      placeholder="admin@portfolio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800/60 text-white rounded-xl py-5 pl-4 focus:ring-blue-500/20 placeholder:text-zinc-600"
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
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>

                <Link
                  to="/login"
                  className="w-full py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/40 bg-white dark:bg-zinc-900/10 text-slate-500 dark:text-zinc-400 text-sm font-medium hover:bg-white dark:bg-zinc-900/40 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 flex flex-col justify-center items-center py-6 w-full"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recovery Email Sent</h2>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                    A secure password reset link has been dispatched to <span className="text-blue-400 font-mono">{email}</span>. Check your inbox!
                  </p>
                </div>

                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-white hover:bg-zinc-100 text-black font-semibold py-6 rounded-xl transition-all"
                >
                  Return to Sign In
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
