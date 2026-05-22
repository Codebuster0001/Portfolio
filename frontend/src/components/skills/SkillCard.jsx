import React from 'react';
import { motion } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import DynamicIcon from './DynamicIcon';
import SkillBadge from './SkillBadge';

// Card entrance animation
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

/**
 * SkillCard
 * Glassmorphism card for a skill category.
 * DB-driven gradient, neon border, icon, and animated skill badges.
 */
const SkillCard = ({ category }) => {
  const {
    title,
    description,
    iconName,
    iconLibrary,
    gradientFrom = 'blue-500',
    gradientTo = 'cyan-500',
    skills = [],
  } = category;

  // Build Tailwind-compatible gradient and border classes
  // Since we store color names like "blue-500", we use inline style for reliability
  const glowColor = gradientFrom.split('-')[0]; // e.g. "blue"

  return (
    <motion.div
      variants={cardVariants}
      className="relative rounded-3xl overflow-hidden group"
    >
      {/* Neon glow on hover — matches gradient */}
      <div
        className={`
          absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100
          transition-opacity duration-500 pointer-events-none blur-xl -z-10
        `}
        style={{
          background: `radial-gradient(ellipse at center, ${colorToHex(glowColor, 0.3)}, transparent 70%)`,
        }}
      />

      {/* Card body */}
      <div
        className="
          relative rounded-3xl border border-zinc-700/40 bg-zinc-900/50
          backdrop-blur-xl overflow-hidden p-6
          hover:border-zinc-600/60 hover:bg-zinc-900/70
          transition-all duration-400
        "
      >
        {/* Gradient background overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${colorToHex(glowColor, 0.25)} 0%, transparent 60%)`,
          }}
        />

        {/* Top-right corner accent */}
        <div
          className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at top right, ${colorToHex(glowColor, 1)}, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          {/* Category header */}
          <div className="flex items-start gap-3 mb-5">
            <div
              className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 backdrop-blur-sm flex-shrink-0"
              style={{ boxShadow: `0 0 12px ${colorToHex(glowColor, 0.2)}` }}
            >
              <DynamicIcon
                iconName={iconName}
                iconLibrary={iconLibrary}
                className=""
                size={18}
                style={{ color: colorToHex(glowColor, 1) }}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
              {description && (
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
              )}
            </div>
          </div>

          {/* Skill count badge */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                color: colorToHex(glowColor, 0.9),
                borderColor: colorToHex(glowColor, 0.3),
                backgroundColor: colorToHex(glowColor, 0.1),
              }}
            >
              {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
            </div>
          </div>

          {/* Skill badges */}
          <TooltipProvider delayDuration={120}>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill, idx) => (
                <SkillBadge key={skill.id} skill={skill} index={idx} />
              ))}
              {skills.length === 0 && (
                <p className="text-xs text-zinc-600 italic">No skills added yet.</p>
              )}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// Helper: map Tailwind color name → approximate hex with alpha
// ============================================================
const COLOR_PALETTE = {
  blue: '#3b82f6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  green: '#22c55e',
  purple: '#a855f7',
  violet: '#8b5cf6',
  pink: '#ec4899',
  rose: '#f43f5e',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  teal: '#14b8a6',
  indigo: '#6366f1',
  red: '#ef4444',
  zinc: '#71717a',
  sky: '#0ea5e9',
  fuchsia: '#d946ef',
  lime: '#84cc16',
};

function colorToHex(colorName, alpha = 1) {
  const hex = COLOR_PALETTE[colorName] || '#3b82f6';
  if (alpha === 1) return hex;

  // Convert hex to rgba
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default SkillCard;
