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
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive 
                  ? 'bg-blue-500/10 border-l-4 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold' 
                  : 'text-[#64748B] dark:text-zinc-400 hover:text-[#0F172A] dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'group-hover:text-blue-500 dark:group-hover:text-blue-400'}`} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
