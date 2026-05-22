import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { fetchCategories } from '../../store/skillsSlice';
import SkillCard from './SkillCard';

// ============================================================
// Loading skeleton
// ============================================================
const SkeletonCard = () => (
  <div className="rounded-3xl border border-zinc-700/30 bg-zinc-900/40 backdrop-blur-xl p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-zinc-700/50" />
      <div className="flex-1">
        <div className="h-4 bg-zinc-700/50 rounded-full w-3/4 mb-2" />
        <div className="h-3 bg-zinc-700/30 rounded-full w-1/2" />
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-9 w-24 rounded-full bg-zinc-700/40" />
      ))}
    </div>
  </div>
);

// ============================================================
// Stagger container variants
// ============================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

// ============================================================
// SkillsSection — main public-facing section
// ============================================================
const SkillsSection = () => {
  const dispatch = useDispatch();
  const { categories, categoriesLoading, error } = useSelector((s) => s.skills);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <section className="py-24 relative w-full overflow-hidden" aria-label="Technical Skills">
      {/* ── Ambient background glows ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-3/4 left-1/2 w-[400px] h-[400px] bg-emerald-500/4 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.65 }}
          className="text-center mb-16 space-y-4"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/40 text-zinc-300 text-sm font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            My Expertise
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Technical{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500">
              Skills
            </span>
          </h2>

          <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            A comprehensive overview of my technical stack, frameworks, and tools I use to craft
            modern, high-performance digital experiences.
          </p>

          {/* Animated divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
          />
        </motion.div>

        {/* ── Error state ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-8 max-w-xl mx-auto"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* ── Loading skeleton ── */}
        {categoriesLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Category cards grid ── */}
        {!categoriesLoading && !error && categories.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category) => (
              <SkillCard key={category.id} category={category} />
            ))}
          </motion.div>
        )}

        {/* ── Empty state ── */}
        {!categoriesLoading && !error && categories.length === 0 && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">No skill categories found.</p>
          </div>
        )}


      </div>
    </section>
  );
};

export default SkillsSection;
