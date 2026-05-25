import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Render Portal */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="pointer-events-auto w-full bg-slate-50 dark:bg-zinc-950/90 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex gap-3 items-start relative overflow-hidden"
              >
                {/* Accent glow side bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${
                  isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-blue-500'
                }`} />

                <div className={`p-1 rounded-lg ${
                  isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 
                  isError ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {isSuccess ? <CheckCircle2 className="w-4 h-4" /> :
                   isError ? <AlertCircle className="w-4 h-4" /> :
                   <Info className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {isSuccess ? 'Success' : isError ? 'System Alert' : 'Notification'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-zinc-600 hover:text-slate-500 dark:text-zinc-400 p-0.5 rounded-lg hover:bg-white dark:bg-zinc-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
