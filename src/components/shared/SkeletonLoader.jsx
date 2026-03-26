/**
 * @fileoverview Skeleton loader components for loading states.
 * Provides placeholder UI while content is being fetched.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from './theme-context';

/**
 * Animated typing indicator with bouncing dots
 * Matches the chat bubble style for consistency
 * Respects user's reduced motion preference for accessibility
 *
 * @component
 * @returns {JSX.Element} Bouncing dots animation or static indicator
 */
export const TypingIndicator = () => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';

  return (
    <div className="flex justify-start">
      <div
        className={
          isLiquid
            ? 'lg-surface-3 lg-pill px-4 py-3 flex items-center gap-1 rounded-full text-[color:var(--text-primary)]'
            : 'bg-card px-4 py-3 border-nb border-[color:var(--color-border)] flex items-center gap-1 rounded-nb'
        }
        style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Visually hidden text for screen readers */}
        <span className="sr-only">Digital Rishabh is thinking...</span>

        {/* Decorative animated dots hidden from screen readers */}
        <div className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map(i =>
            shouldReduceMotion ? (
              <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full" />
            ) : (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-primary rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.15,
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};
