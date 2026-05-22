import React from 'react';
import { motion } from 'framer-motion';

const TimelineDot = ({ color }) => {
  return (
    <motion.div 
      className="absolute left-[15px] md:left-1/2 w-8 h-8 flex items-center justify-center transform -translate-x-1/2 z-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-10%" }}
    >
      {/* Outer Rotating Glow Ring */}
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0, rotate: -180 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            rotate: 0,
            transition: { duration: 0.8, type: "spring", bounce: 0.5 }
          }
        }}
        className="absolute inset-0 rounded-full border border-dashed opacity-50"
        style={{ borderColor: color }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Ping/Breathing Effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30 blur-sm"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner Solid Dot */}
      <motion.div
        variants={{
          hidden: { scale: 0 },
          visible: { 
            scale: 1, 
            transition: { delay: 0.2, type: "spring", stiffness: 300, damping: 20 }
          }
        }}
        className="relative w-4 h-4 rounded-full shadow-xl"
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}`
        }}
      />
    </motion.div>
  );
};

export default TimelineDot;
