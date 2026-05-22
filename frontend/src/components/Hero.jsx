import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Github, ArrowRight, Code2, Cpu, Layers, Database, FileText, Loader2 } from 'lucide-react';
import Reveal from './animations/Reveal';
import CodeAnimation from './CodeAnimation';
import axiosClient from '../utils/axiosClient';

const FALLBACK = {
  name: 'Deepak Kushwaha',
  role: 'Full Stack Developer',
  description: 'Crafting high-performance web applications with precision and passion. Focused on building scalable solutions that deliver exceptional user experiences.',
  availabilityStatus: 'Available for new opportunities',
  techStack: ['React', 'Node.js', 'Tailwind CSS', 'ASP.NET Core', 'PostgreSQL'],
  githubUrl: 'https://github.com',
  profilePhoto: '',
  resumeUrl: '',
};

export default function Hero() {
  const particles = Array.from({ length: 20 });
  
  // Production-level state tracking
  const [hero, setHero] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchHeroData = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(false);
        }
        const response = await axiosClient.get('Hero');
        if (isMounted && response.data) {
          setHero(response.data);
        }
      } catch (err) {
        console.error('[HERO API] Connection error: Backend is offline or returned an error.', err);
        if (isMounted) {
          setError(true);
          // Set to fallback defaults so the page doesn't crash
          setHero(FALLBACK);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHeroData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="home" className="min-h-screen relative flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{ y: [0, Math.random() * -100 - 50], opacity: [0, 0.8, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: Math.random() * 8 + 6, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
          
          <Reveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              {hero?.availabilityStatus || 'Available'}
            </div>
          </Reveal>

          <div className="space-y-4">
            <Reveal delay={0.2}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                Hi, I'm{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-[pulse_6s_ease-in-out_infinite]">
                  {hero?.name}
                </span>
                <br />
                <span className="text-zinc-300 font-medium text-3xl sm:text-4xl md:text-5xl">
                  {hero?.role}
                </span>
              </h1>
            </Reveal>
          </div>

          <Reveal delay={0.3}>
            <p className="text-zinc-400 max-w-xl text-base sm:text-lg md:text-xl leading-relaxed">
              {hero?.description}
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              
              {/* View Projects Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button 
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full px-8 h-12 text-base font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                  View Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>

              {/* Dynamic Resume Trigger Container */}
              <div className="w-full sm:w-auto min-w-[200px]">
                {loading ? (
                  // State 1: Server is Loading
                  <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm font-medium px-6 h-12 border border-zinc-800 rounded-full animate-pulse bg-zinc-900/40 w-full sm:w-auto">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    Checking Resume...
                  </div>
                ) : error ? (
                  // State 2: Server Disconnected / Error (Hide Resume Button)
                  <div className="hidden" />
                ) : hero?.resumeUrl ? (
                  // State 3: Resume URL Exists
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button 
                      variant="outline"
                      onClick={() => window.open(hero.resumeUrl, '_blank')}
                      className="w-full sm:w-auto border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 rounded-full px-8 h-12 text-base font-semibold transition-all shadow-md shadow-blue-500/5"
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      Download Resume
                    </Button>
                  </motion.div>
                ) : (
                  // State 4: Resume URL Does Not Exist (Show Fallback Message)
                  <div className="w-full sm:w-auto text-zinc-500 text-sm font-semibold px-8 h-12 border border-zinc-800 bg-zinc-900/30 rounded-full cursor-not-allowed select-none flex items-center justify-center">
                    Resume Not Available
                  </div>
                )}
              </div>

              {/* GitHub Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button 
                  variant="outline"
                  onClick={() => hero?.githubUrl && window.open(hero.githubUrl, '_blank')}
                  className="w-full sm:w-auto border-zinc-800 bg-[#080b14]/60 hover:bg-zinc-800 text-white rounded-full px-8 h-12 text-base font-semibold transition-all"
                >
                  <Github className="mr-2 h-5 w-5 text-zinc-400" />
                  GitHub
                </Button>
              </motion.div>

            </div>
          </Reveal>

          {/* Connected/Error Indicator Banner */}
          {error && (
            <Reveal delay={0.5}>
              <div className="flex items-center gap-2 text-red-400/90 text-xs font-semibold px-4 py-2 border border-red-950/40 bg-red-950/20 rounded-xl mt-4">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Network offline: Portfolio backend server disconnected.
              </div>
            </Reveal>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 flex items-center justify-center relative w-full aspect-square max-w-[500px] mx-auto lg:max-w-none">
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-3xl rounded-full opacity-80 pointer-events-none" />
          <div className="w-[90%] z-20">
            <CodeAnimation techStack={hero?.techStack || FALLBACK.techStack} name={hero?.name || FALLBACK.name} role={hero?.role || FALLBACK.role} />
          </div>

          <motion.div animate={{ y: [0, -12, 0], x: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="absolute top-[8%] left-[2%] w-12 h-12 rounded-2xl bg-[#0f1424]/80 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg z-30">
            <Code2 className="w-5 h-5 text-blue-400" />
          </motion.div>
          <motion.div animate={{ y: [0, -15, 0], x: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute top-[18%] right-[-2%] w-12 h-12 rounded-2xl bg-[#0f1424]/80 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg z-30">
            <Cpu className="w-5 h-5 text-green-400" />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0], x: [0, 6, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.4 }} className="absolute bottom-[15%] left-[2%] w-12 h-12 rounded-2xl bg-[#0f1424]/80 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg z-30">
            <Layers className="w-5 h-5 text-cyan-400" />
          </motion.div>
          <motion.div animate={{ y: [0, -14, 0], x: [0, -6, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 2.0 }} className="absolute bottom-[25%] right-[-2%] w-12 h-12 rounded-2xl bg-[#0f1424]/80 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg z-30">
            <Database className="w-5 h-5 text-purple-400" />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
