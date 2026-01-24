import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const THROTTLE_DELAY = 100;

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let timeoutId = null;
    let lastRan = null;

    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const throttledToggleVisibility = () => {
      const now = Date.now();

      if (lastRan === null) {
        // First call - execute immediately
        toggleVisibility();
        lastRan = now;
      } else {
        const timeSinceLastRan = now - lastRan;

        if (timeSinceLastRan >= THROTTLE_DELAY) {
          // Enough time has passed - execute immediately
          toggleVisibility();
          lastRan = now;
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        } else if (timeoutId === null) {
          // Schedule execution for remaining time
          timeoutId = setTimeout(() => {
            toggleVisibility();
            lastRan = Date.now();
            timeoutId = null;
          }, THROTTLE_DELAY - timeSinceLastRan);
        }
      }
    };

    window.addEventListener('scroll', throttledToggleVisibility);

    return () => {
      window.removeEventListener('scroll', throttledToggleVisibility);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, []);

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
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-30 p-3 bg-secondary text-primary rounded-full shadow-lg border border-[color:var(--color-border)] hover:border-accent hover:text-accent hover:bg-primary/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-primary)]"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
