import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, MessageSquare, LineChart, Settings, Code2, User, Zap, Layers, Briefcase } from 'lucide-react';

const menuItems = [
  { id: 'home',       label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'hero',       label: 'Hero Section', icon: Zap             },
  { id: 'about',      label: 'About',        icon: User            },
  { id: 'projects',   label: 'Projects',     icon: FolderKanban    },
  { id: 'skills',     label: 'Skills',       icon: Layers          },
  { id: 'experience', label: 'Experience',   icon: Briefcase       },
  { id: 'messages',   label: 'Messages',     icon: MessageSquare   },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-slate-900 dark:text-white shadow-lg shadow-blue-500/20">
          <Code2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Deepak Kushwaha</h2>
          <span className="text-[11px] text-blue-400 font-mono tracking-wider uppercase">Admin Portal</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative group ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
