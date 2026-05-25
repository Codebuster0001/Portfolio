import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Layers, Users, MessageCircle, Code2, LineChart, Settings } from 'lucide-react';

import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
const DashboardStats = React.lazy(() => import('../components/dashboard/DashboardStats'));
const AnalyticsChart = React.lazy(() => import('../components/dashboard/Chart'));
const ProjectTable = React.lazy(() => import('../components/dashboard/ProjectTable'));
const MessageTable = React.lazy(() => import('../components/dashboard/MessageTable'));
const AboutManager = React.lazy(() => import('../components/dashboard/AboutManager'));
const HeroManager = React.lazy(() => import('../components/dashboard/HeroManager'));
const ProjectsManager = React.lazy(() => import('../components/dashboard/ProjectsManager'));
const SkillsManager = React.lazy(() => import('../components/dashboard/SkillsManager'));
const ExperienceManager = React.lazy(() => import('../components/dashboard/ExperienceManager'));
const ContactManager = React.lazy(() => import('../components/dashboard/ContactManager'));
const ProjectDetails = React.lazy(() => import('./ProjectDetails'));

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract the base tab for the sidebar (e.g. /projects/123 -> projects)
  const pathname = location.pathname;
  const pathParts = pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length === 0 ? 'home' : pathParts[0];

  const setActiveTab = (tab) => {
    navigate(tab === 'home' ? '/' : `/${tab}`);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.15, ease: 'easeIn'  } },
  };

  const AnimatedRoute = ({ children, keyName }) => (
    <motion.div
      key={keyName}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );

  const renderContent = () => {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <AnimatedRoute keyName="home">
            <div className="space-y-6">
              <DashboardStats />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <AnalyticsChart />
                  <ProjectTable />
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <MessageTable />
                </div>
              </div>
            </div>
          </AnimatedRoute>
        } />

        <Route path="/hero" element={<AnimatedRoute keyName="hero"><HeroManager /></AnimatedRoute>} />
        <Route path="/about" element={<AnimatedRoute keyName="about"><AboutManager /></AnimatedRoute>} />
        
        <Route path="/projects">
          <Route index element={<AnimatedRoute keyName="projects"><ProjectsManager /></AnimatedRoute>} />
          <Route path=":id" element={<AnimatedRoute keyName="project-details"><ProjectDetails /></AnimatedRoute>} />
        </Route>

        <Route path="/skills" element={<AnimatedRoute keyName="skills"><SkillsManager /></AnimatedRoute>} />
        <Route path="/experience" element={<AnimatedRoute keyName="experience"><ExperienceManager /></AnimatedRoute>} />
        <Route path="/messages" element={<AnimatedRoute keyName="messages"><ContactManager /></AnimatedRoute>} />

        <Route path="/analytics" element={
          <AnimatedRoute keyName="analytics">
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 flex items-center justify-center mb-2">
                <LineChart className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h2>
              <p className="text-slate-400 dark:text-zinc-500 text-sm max-w-xs">Visitor analytics and traffic data will appear here. Coming soon.</p>
            </div>
          </AnimatedRoute>
        } />

        <Route path="/settings" element={
          <AnimatedRoute keyName="settings">
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 flex items-center justify-center mb-2">
                <Settings className="w-8 h-8 text-slate-500 dark:text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
              <p className="text-slate-400 dark:text-zinc-500 text-sm max-w-xs">Admin configuration and account settings. Coming soon.</p>
            </div>
          </AnimatedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  };

  return (
    <div className="relative flex h-screen bg-[#08080c] overflow-hidden selection:bg-blue-500/30">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-50 dark:bg-zinc-950/80 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 z-40">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-screen relative z-10 overflow-hidden">
        <Navbar
          activeTabTitle={activeTab}
          onLogout={onLogout}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <React.Suspense fallback={
              <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            }>
              {renderContent()}
            </React.Suspense>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-64 h-full bg-slate-50 dark:bg-zinc-950 border-r border-slate-200 dark:border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
