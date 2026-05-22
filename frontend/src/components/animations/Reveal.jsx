import React from 'react';
import { motion } from 'framer-motion';

const Reveal = ({ children, delay = 0, className = "" }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 80 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-70px" }}
      transition={{ duration: 1.2, delay: delay + 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
