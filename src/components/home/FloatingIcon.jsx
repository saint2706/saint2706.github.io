import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const FloatingIcon = ({ icon, delay, x, y }) => {
  const shouldReduceMotion = useReducedMotion();

  // Hide floating icons if user prefers reduced motion to prevent distraction
  if (shouldReduceMotion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.2, 0.5, 0.2],
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        delay: delay,
        ease: 'easeInOut',
      }}
      className="absolute text-slate-700"
      style={{ left: x, top: y }}
      aria-hidden="true" // Hide purely decorative elements from screen readers
    >
      {icon}
    </motion.div>
  );
};

export default FloatingIcon;
