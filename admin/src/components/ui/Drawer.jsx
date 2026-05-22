import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer container sliding from the right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-zinc-950 border-l border-zinc-800/80 z-50 shadow-2xl flex flex-col"
          >
            {/* Top border ambient gradient */}
            <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800/60">
              <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800/40 text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body (scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
