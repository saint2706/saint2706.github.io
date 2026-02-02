import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * @fileoverview Page wrapper component providing consistent page transition animations.
 * Wraps page content with fade and slide animations on route changes.
 */

/** Animation variants for page enter/exit transitions */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Page wrapper with animated transitions
 *
 * Features:
 * - Fade in/out animation on route change
 * - Slide up on enter, slide down on exit
 * - Respects reduced motion preference
 * - Works with React Router route transitions
 *
 * Usage: Wrap each page component for consistent transitions
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to animate
 * @returns {JSX.Element} Animated wrapper around page content
 */
const PageWrapper = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={pageVariants}
      initial={shouldReduceMotion ? false : 'initial'}
      animate="animate"
      exit={shouldReduceMotion ? undefined : 'exit'}
      transition={shouldReduceMotion ? { duration: 0 } : undefined}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
