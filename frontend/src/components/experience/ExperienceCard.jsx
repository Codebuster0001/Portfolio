import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { MapPin, Calendar, Briefcase } from 'lucide-react';
import DynamicIcon from '../skills/DynamicIcon';
import TimelineDot from './TimelineDot';

const ExperienceCard = ({ experience, index }) => {
  const isEven = index % 2 === 0;
  const cardRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["0 1.2", "1 0"] // Start tracking when top enters viewport, end when bottom leaves top
  });

  // Parallax subtle effect on scroll
  const yParallax = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const smoothY = useSpring(yParallax, { stiffness: 100, damping: 30 });

  // Mouse follow hover tilt effect (optional, simple version)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Safe color values
  const fromColor = experience.gradientFrom || '#3b82f6';
  const toColor = experience.gradientTo || '#8b5cf6';
  const borderStyle = experience.gradientFrom?.startsWith('#') ? { borderColor: experience.gradientFrom } : {};
  const bgStyle = experience.gradientFrom?.startsWith('#') ? { background: `linear-gradient(135deg, ${fromColor}0a, ${toColor}0a)` } : {};

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      x: isEven ? -100 : 100, 
      y: 50,
      scale: 0.9,
      rotate: isEven ? -2 : 2,
      filter: 'blur(10px)'
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      scale: 1,
      rotate: 0,
      filter: 'blur(0px)',
      transition: { 
        duration: 0.8, 
        type: "spring", 
        bounce: 0.3,
        delay: 0.1 
      }
    }
  };

  return (
    <div className={`relative flex items-center justify-between w-full mb-16 md:mb-24 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      
      {/* Spacer */}
      <div className="hidden md:block w-5/12" />

      {/* Center Dot */}
      <TimelineDot color={fromColor} />

      {/* Card Container */}
      <motion.div
        ref={cardRef}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-10%" }} // REPLAY ANIMATION ON EVERY SCROLL
        style={{ y: smoothY }}
        className="w-full md:w-5/12 pl-12 md:pl-0 z-10 perspective-1000"
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="relative group w-full h-full transform-gpu"
        >
          {/* Animated Glow Shadow Behind Card */}
          <div 
            className="absolute -inset-1 opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-2xl rounded-[2.5rem]"
            style={{ background: `linear-gradient(to right, ${fromColor}, ${toColor})` }}
          />

          <div 
            className="relative p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl bg-zinc-900/60 border border-zinc-700/50 group-hover:border-transparent overflow-hidden transition-all duration-500"
            style={{ ...bgStyle }}
          >
            {/* Inner dynamic gradient border on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${fromColor}22, ${toColor}22)`,
                border: `1px solid ${fromColor}66`,
                borderRadius: 'inherit'
              }}
            />

            <div className="relative z-10 flex flex-col gap-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="p-3.5 rounded-2xl bg-zinc-800/80 shadow-inner border border-white/5 relative group-hover:shadow-[0_0_20px_currentColor]"
                    style={{ color: fromColor }}
                  >
                    <DynamicIcon 
                      iconName={experience.iconName} 
                      iconLibrary={experience.iconLibrary} 
                      size={26} 
                      className="text-white relative z-10 transition-colors"
                      style={experience.iconColor ? { color: experience.iconColor } : {}}
                    />
                  </motion.div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300" style={{ backgroundImage: `linear-gradient(to right, ${fromColor}, ${toColor})` }}>
                      {experience.role}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-zinc-400 font-medium text-sm">
                      <Briefcase className="w-4 h-4" />
                      <span>{experience.company}</span>
                    </div>
                  </div>
                </div>

                {experience.isCurrent && (
                  <span 
                    className="self-start px-3 py-1.5 text-xs font-bold tracking-wide uppercase rounded-full border shadow-[0_0_15px_currentColor] animate-pulse"
                    style={{ 
                      borderColor: fromColor, 
                      color: fromColor,
                      backgroundColor: `${fromColor}15`
                    }}
                  >
                    Current
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                {experience.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {experience.location}
                  </div>
                )}
                {experience.duration && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {experience.duration}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
                {experience.description}
              </p>

              {/* Skills Array */}
              {experience.skills && experience.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {experience.skills.map((skill, idx) => (
                    <motion.span 
                      key={idx}
                      whileHover={{ scale: 1.05, backgroundColor: `${fromColor}22`, borderColor: fromColor, color: '#fff' }}
                      className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-800/40 border border-zinc-700/50 rounded-xl transition-colors cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ExperienceCard;
