import React from 'react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DynamicIcon from './DynamicIcon';

/**
 * SkillBadge
 * Animated pill/badge for an individual skill.
 * Shows icon + name; on hover reveals a proficiency bar tooltip.
 */
const SkillBadge = ({ skill, index = 0 }) => {
  const {
    skillName,
    iconName,
    iconLibrary,
    iconColor = 'text-blue-400',
    bgColor = 'bg-blue-500/10',
    borderColor = 'border-blue-500/30',
    proficiency = 80,
  } = skill;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative group/pill flex items-center gap-2 px-4 py-2.5
            rounded-full border ${borderColor} ${bgColor}
            backdrop-blur-md cursor-pointer select-none
            transition-all duration-300
            hover:shadow-lg hover:shadow-current/20
          `}
        >
          {/* Icon */}
          <DynamicIcon
            iconName={iconName}
            iconLibrary={iconLibrary}
            className={iconColor}
            size={15}
          />

          {/* Label */}
          <span className="text-sm font-medium text-zinc-200 whitespace-nowrap">
            {skillName}
          </span>

          {/* Animated shimmer border on hover */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover/pill:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
            <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>
        </motion.div>
      </TooltipTrigger>

      {/* Tooltip — proficiency bar */}
      <TooltipContent
        side="top"
        className="bg-zinc-900/95 border border-zinc-700/80 text-zinc-100 px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl shadow-black/50"
      >
        <div className="flex flex-col gap-2 min-w-[140px]">
          <div className="flex items-center gap-2">
            <DynamicIcon
              iconName={iconName}
              iconLibrary={iconLibrary}
              className={iconColor}
              size={14}
            />
            <span className="font-semibold text-sm">{skillName}</span>
          </div>

          {/* Proficiency bar */}
          <div className="w-full h-1.5 bg-zinc-700/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${proficiency}%` }}
              transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 rounded-full"
            />
          </div>

          <span className="text-xs text-zinc-400 text-right">
            {proficiency}% Proficiency
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default SkillBadge;
