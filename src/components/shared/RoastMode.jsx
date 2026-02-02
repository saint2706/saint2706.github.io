/**
 * @fileoverview Roast mode floating action button (alternative/deprecated version).
 * Standalone roast button with inline popup display.
 */

import React, { useState } from 'react';
import { roastResume } from '../../services/ai';
import { Flame, RefreshCw, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Roast mode floating button component
 * 
 * Features:
 * - Floating action button with flame icon
 * - Inline popup to display roast
 * - Loading state with spinner
 * - Tooltip on hover
 * 
 * Note: This is an alternative version. The main roast feature
 * is handled by RoastInterface component.
 * 
 * @component
 * @returns {JSX.Element} Floating roast button with popup
 */
const RoastMode = () => {
  const shouldReduceMotion = useReducedMotion();
  const [roast, setRoast] = useState(null);
  const [loading, setLoading] = useState(false);

  /** Generate roast using AI service */
  const handleRoast = async () => {
    setLoading(true);
    const text = await roastResume();
    setRoast(text);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-24 left-6 z-40">
      <div className="relative group">
        <button
          onClick={() => {
            if (roast) setRoast(null);
            else handleRoast();
          }}
          className="p-4 bg-fun-pink text-white rounded-full shadow-lg hover:shadow-fun-pink/50 transition-all duration-300 motion-reduce:transition-none"
          aria-label={loading ? "Roasting your resume..." : (roast ? "Close roast" : "Roast my resume")}
          aria-busy={loading}
        >
          {loading ? (
            <RefreshCw size={28} className="animate-spin motion-reduce:animate-none" />
          ) : (
            <Flame size={28} />
          )}
        </button>

        {/* Tooltip */}
        {!roast && (
          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Roast My Resume
          </span>
        )}

        {/* Roast Popup */}
        {roast && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className="absolute bottom-full left-0 mb-4 w-64 md:w-80 bg-white text-slate-900 p-4 rounded-xl shadow-2xl origin-bottom-left"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-fun-pink flex items-center gap-1">
                <Flame size={16} /> Resume Roasted
              </h4>
              <button
                onClick={() => setRoast(null)}
                className="text-slate-400 hover:text-slate-900 transition-colors"
                aria-label="Close roast"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm italic font-medium leading-relaxed">
              &quot;{roast}&quot;
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoastMode;
