/**
 * @fileoverview Reusable scroll-triggered reveal animation wrapper.
 * Uses Framer Motion's useInView for intersection-based animations.
 */

import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * Animation variant presets for scroll reveals
 * Each variant defines initial (hidden) and animate (visible) states
 */
const variants = {
  'fade-up': {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-down': {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-left': {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  'fade-right': {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  'scale-in': {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
};

/**
 * ScrollReveal wrapper component
 *
 * Wraps children in a motion.div that animates when scrolled into view.
 * Respects prefers-reduced-motion accessibility setting.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to reveal on scroll
 * @param {'fade-up'|'fade-down'|'fade-left'|'fade-right'|'scale-in'|'slide-up'} props.variant - Animation variant
 * @param {number} props.delay - Animation delay in seconds
 * @param {number} props.duration - Animation duration in seconds
 * @param {number} props.threshold - How much of the element must be visible (0-1)
 * @param {boolean} props.once - Whether to animate only once
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Animated wrapper
 */
const ScrollReveal = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
  once = true,
  className = '',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const shouldReduceMotion = useReducedMotion();

  const selectedVariant = variants[variant] || variants['fade-up'];

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={selectedVariant.hidden}
      animate={isInView ? selectedVariant.visible : selectedVariant.hidden}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
