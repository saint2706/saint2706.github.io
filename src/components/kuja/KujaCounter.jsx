import React from 'react';
import { motion } from 'framer-motion';

const KujaCounter = ({ days, longestStreak }) => {
  return (
    <div
      className="flex flex-col items-center justify-center py-12"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="text-center"
      >
        <div
          className="text-9xl font-bold text-accent font-mono mb-4"
          aria-label={`${days} days since Kuja lost something`}
        >
          {days}
        </div>
        <div className="text-2xl md:text-3xl text-text-primary font-bold" aria-hidden="true">
          Days Since Kuja Lost Something
        </div>
        
        {longestStreak !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 bg-accent/10 border border-accent/30 rounded-lg"
          >
            <div className="text-sm text-text-secondary mb-1">🏆 Longest Streak</div>
            <div
              className="text-4xl font-bold text-accent font-mono"
              aria-label={`Longest streak: ${longestStreak} days`}
            >
              {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default KujaCounter;
