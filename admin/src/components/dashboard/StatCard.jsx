import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, count, icon: Icon, subtext, color = 'blue', index = 0 }) {
  // Glow color maps
  const colorMap = {
    blue: 'from-blue-500/20 to-transparent border-blue-500/20 text-blue-400 shadow-blue-500/10',
    purple: 'from-purple-500/20 to-transparent border-purple-500/20 text-purple-400 shadow-purple-500/10',
    pink: 'from-pink-500/20 to-transparent border-pink-500/20 text-pink-400 shadow-pink-500/10',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/20 text-emerald-400 shadow-emerald-500/10',
  };

  const bgClasses = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-sm border ${bgClasses.split(' ')[2]} p-6 group hover:bg-white dark:bg-zinc-900/80 transition-colors shadow-lg ${bgClasses.split(' ')[4]}`}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-br ${bgClasses.split(' ')[0]} ${bgClasses.split(' ')[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      
      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{count}</h3>
          </div>
          {subtext && (
            <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border ${bgClasses.split(' ')[2]}`}>
          <Icon className={`w-6 h-6 ${bgClasses.split(' ')[3]}`} />
        </div>
      </div>
    </motion.div>
  );
}
