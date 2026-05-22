import React from 'react';
import { motion, useTransform, useSpring } from 'framer-motion';

const TimelineLine = ({ scrollYProgress }) => {
  // Apply a spring physics smoothing to the scroll progress
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate opacity based on scroll progress to make it fade in beautifully
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[2px] bg-zinc-800 transform md:-translate-x-1/2 z-0 overflow-hidden rounded-full">
      {/* Animated Filled Line */}
      <motion.div
        style={{ scaleY, opacity, originY: 0 }}
        className="w-full h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]"
      />
      
      {/* Glow effect moving with the line */}
      <motion.div 
        style={{ top: useTransform(scaleY, (s) => `${s * 100}%`), opacity }}
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-32 bg-purple-500/30 blur-2xl rounded-full mix-blend-screen pointer-events-none"
      />
    </div>
  );
};

export default TimelineLine;
