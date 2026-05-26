import React from 'react';
import { motion } from 'framer-motion';
import { Bell, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';

const TAB_TITLES = {
  home: 'Dashboard',
  hero: 'Hero Section',
  about: 'About',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  messages: 'Messages',
  analytics: 'Analytics',
  settings: 'Settings',
};

export default function Navbar({ activeTabTitle, onLogout, onOpenSidebar }) {
  const pageTitle = TAB_TITLES[activeTabTitle] ?? activeTabTitle;
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between bg-[#F8FAFC]/95 dark:bg-[#111217]/90 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-white/5 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-[#64748B] dark:text-zinc-400 hover:text-[#0F172A] dark:hover:text-zinc-100 hover:bg-[#EEF2FF] dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all md:hidden"
        >
          <Menu className="w-6 h-6" />
        </motion.button>
        <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight transition-colors duration-300">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle Button */}
        <motion.button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-[#64748B] dark:text-zinc-400 hover:text-[#0F172A] dark:hover:text-zinc-100 hover:bg-[#EEF2FF] dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-700 hover:scale-110 active:scale-95"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-5 h-5 flex items-center justify-center"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </motion.div>
        </motion.button>

        {/* Notifications Icon Button */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-full text-[#64748B] dark:text-zinc-400 hover:text-[#0F172A] dark:hover:text-zinc-100 hover:bg-[#EEF2FF] dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-300"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-[#F8FAFC] dark:ring-[#111217] shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
        </motion.button>

        <div className="hidden sm:block h-8 w-px bg-[#E2E8F0] dark:bg-white/10 mx-1 md:mx-2" />

        <div className="flex items-center gap-2 md:gap-3">
          {/* Avatar Area with active status indicator */}
          <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-slate-50 dark:bg-zinc-950 flex items-center justify-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#F8FAFC] dark:ring-[#111217] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onLogout} 
            className="p-2 rounded-full text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all duration-300" 
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}

