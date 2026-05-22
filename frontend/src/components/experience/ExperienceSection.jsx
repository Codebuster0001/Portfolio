import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useScroll, useTransform } from 'framer-motion';
import { fetchExperiences } from '../../store/experienceSlice';
import ExperienceCard from './ExperienceCard';
import TimelineLine from './TimelineLine';
import { Briefcase, Loader2, AlertCircle } from 'lucide-react';

const ExperienceSection = () => {
  const dispatch = useDispatch();
  const { experiences, loading, error } = useSelector((state) => state.experience);
  const containerRef = useRef(null);

  // Setup scroll tracking for the whole section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const orb1Y = useTransform(scrollYProgress, [0, 1], ["-20%", "40%"]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], ["50%", "-30%"]);

  useEffect(() => {
    dispatch(fetchExperiences());
  }, [dispatch]);

  return (
    <div className="relative w-full overflow-hidden bg-zinc-950 py-24" ref={containerRef}>
      
      {/* Background Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ top: orb1Y }}
          className="absolute left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          style={{ top: orb2Y }}
          className="absolute right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" 
        />
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="text-center mb-28"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 mb-8 shadow-xl">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">Career Journey</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 animate-gradient-x">Experience</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
            A cinematic timeline of my career, roles, and the technologies I've mastered along the way.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 text-blue-400"
          >
            <Loader2 className="w-12 h-12 animate-spin mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
            <p className="text-sm font-medium tracking-widest uppercase animate-pulse">Loading Timeline...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 backdrop-blur-md flex flex-col items-center text-center max-w-md">
              <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Failed to load</h3>
              <p className="text-sm text-zinc-400 mb-6">{error}</p>
              <button 
                onClick={() => dispatch(fetchExperiences())}
                className="px-6 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Timeline Content */}
        {!loading && !error && experiences.length > 0 && (
          <div className="relative mt-16 pb-20">
            {/* The animated vertical center line */}
            <TimelineLine scrollYProgress={scrollYProgress} />
            
            <div className="relative z-10 w-full flex flex-col items-center">
              {experiences.map((exp, idx) => (
                <ExperienceCard key={exp.id} experience={exp} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && experiences.length === 0 && (
          <div className="text-center py-32 opacity-50">
            <Briefcase className="w-16 h-16 mx-auto text-zinc-600 mb-6" />
            <p className="text-lg font-medium text-zinc-400">No professional experience listed yet.</p>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ExperienceSection;
