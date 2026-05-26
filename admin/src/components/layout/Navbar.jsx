import React from 'react';
import { Bell, LogOut, Search, Menu, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
    <header className="h-20 px-4 md:px-8 flex items-center justify-between bg-slate-50 dark:bg-zinc-950/50 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-30">
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        <button 
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/5 transition-colors md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>

        <button className="relative p-2 rounded-full hover:bg-white/5 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]" />
        </button>

        <div className="hidden sm:block h-8 w-px bg-white/10 mx-1 md:mx-2" />

        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
            <div className="w-full h-full rounded-full bg-slate-50 dark:bg-zinc-950 flex items-center justify-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
          <button onClick={onLogout} className="p-2 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

