import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';

export default function StatCard({ title, count, icon: Icon, subtext, color = 'blue', index = 0 }) {
  const { theme } = useTheme();

  // Glow color maps
  const colorMap = {
    blue: 'from-blue-500/20 to-transparent border-blue-500/20 text-blue-400 shadow-blue-500/10',
    purple: 'from-purple-500/20 to-transparent border-purple-500/20 text-purple-400 shadow-purple-500/10',
    pink: 'from-pink-500/20 to-transparent border-pink-500/20 text-pink-400 shadow-pink-500/10',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/20 text-emerald-400 shadow-emerald-500/10',
  };

  const bgClasses = colorMap[color] || colorMap.blue;

  const cardGradient = theme === 'light'
    ? 'linear-gradient(135deg, rgba(255,255,255,.8), rgba(248,250,252,.95))'
    : 'linear-gradient(135deg, rgba(24,24,27,.95), rgba(9,9,11,.95))';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{ background: cardGradient }}
      className={`relative overflow-hidden rounded-3xl border border-[#E2E8F0] dark:border-white/5 p-6 group transition-all duration-300 shadow-lg hover:shadow-xl`}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-br ${bgClasses.split(' ')[0]} ${bgClasses.split(' ')[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      
      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-4">
          <p className="text-xs font-semibold text-[#64748B] dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight">{count}</h3>
          </div>
          {subtext && (
            <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-950/50 border border-[#E2E8F0] dark:border-white/5 shadow-inner`}>
          <Icon className={`w-6 h-6 ${bgClasses.split(' ')[3]}`} />
        </div>
      </div>
    </motion.div>
  );
}
