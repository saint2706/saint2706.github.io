/**
 * @fileoverview Scroll to top button with visibility based on scroll position.
 * Appears after scrolling down 300px with throttled scroll listener.
 */

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ⚡ Bolt: Extracted Framer Motion variants to prevent unnecessary allocations during renders
const buttonInitial = { opacity: 0, scale: 0.8 };
const buttonAnimate = { opacity: 1, scale: 1 };
const buttonExit = { opacity: 0, scale: 0.8 };

/**
 * Scroll to top floating action button
 *
 * Features:
 * - Appears after scrolling 300px down
 * - Optimized scroll listener using requestAnimationFrame and a ticking boolean
 * - Smooth scroll to top (respects reduced motion)
 * - Tooltip on hover
 * - Fade in/out animation
 * - Positioned at bottom-left
 *
 * @component
 * @returns {JSX.Element|null} Scroll to top button (hidden when at top)
 */
const ScrollToTop = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // ⚡ Bolt: Optimized scroll listener with requestAnimationFrame to prevent layout thrashing
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /** Scroll to top with smooth behavior (or instant if reduced motion) */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={shouldReduceMotion ? false : buttonInitial}
          animate={buttonAnimate}
          exit={shouldReduceMotion ? undefined : buttonExit}
          onClick={scrollToTop}
          className="group fixed bottom-6 left-6 z-30 p-3 bg-secondary text-primary rounded-full shadow-lg border border-[color:var(--color-border)] hover:border-accent hover:text-accent hover:bg-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-primary)]"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} aria-hidden="true" />
          {/* Tooltip */}
          <span
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
            aria-hidden="true"
          >
            Scroll to top
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
});

ScrollToTop.displayName = 'ScrollToTop';

export default ScrollToTop;
