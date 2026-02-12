import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * FloatingIcon Component
 *
 * A decorative animated icon that floats, rotates, and pulses opacity in a continuous loop.
 * Respects user's motion preferences by hiding itself when reduced motion is preferred.
 *
 * This component is used in the Hero section to add visual interest with subtle animations
 * that don't distract from the main content. The animations include:
 * - Vertical floating motion (up and down)
 * - Gentle rotation oscillation
 * - Pulsing opacity for a breathing effect
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - The icon element to be animated (typically from lucide-react)
 * @param {number} props.delay - Animation start delay in seconds to stagger multiple icons
 * @param {string} props.x - Horizontal position as CSS value (e.g., '10%', '200px')
 * @param {string} props.y - Vertical position as CSS value (e.g., '50px', '20%')
 * @returns {React.ReactElement|null} Animated icon or null if reduced motion is preferred
 *
 * @example
 * <FloatingIcon
 *   icon={<Code size={32} />}
 *   delay={0.5}
 *   x="10%"
 *   y="20%"
 * />
 */
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
