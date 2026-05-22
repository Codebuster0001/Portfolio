import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function GlobalLoader({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="admin-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-zinc-950 to-purple-900/10" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-xl">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                A
              </span>
            </div>
            
            <h1 className="text-lg font-semibold text-white tracking-widest mb-1 uppercase">Admin System</h1>
            <p className="text-xs text-zinc-500 mb-8 font-mono tracking-widest uppercase">Authenticating & Loading</p>
            
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
