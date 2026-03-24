import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  supportsViewTransition,
  VIEW_TRANSITION_NAVIGATION_ENABLED,
} from '../../navigation/viewTransitionNavigate';

/**
 * @fileoverview Page wrapper component providing consistent page transition animations.
 *
 * When the View Transitions API is available and the feature flag is on,
 * this renders a plain `<div>` so CSS-level transitions handle animation.
 * Otherwise it falls back to Framer Motion fade + slide animations.
 */

/** Animation variants for Framer Motion fallback */
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
 * Resolve once whether the browser can use view transitions.
 * Evaluated at module level so it doesn't re-run every render.
 */
const useNativeViewTransition = VIEW_TRANSITION_NAVIGATION_ENABLED && supportsViewTransition();

/**
 * Page wrapper with animated transitions
 *
 * Features:
 * - Uses the View Transitions API when available (CSS choreography in index.css)
 * - Falls back to Framer Motion fade in/out + slide animation
 * - Respects reduced motion preference in both paths
 * - Works with React Router route transitions
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to animate
 * @returns {JSX.Element} Animated (or plain) wrapper around page content
 */
const PageWrapper = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  if (useNativeViewTransition) {
    return <div>{children}</div>;
  }

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
