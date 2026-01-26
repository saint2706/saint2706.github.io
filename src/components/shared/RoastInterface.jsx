import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, Flame, RefreshCw } from 'lucide-react';
import { roastResume } from '../../services/ai';

const RoastInterface = ({ onClose, roastContent, onRoastComplete }) => {
  const [roastLoading, setRoastLoading] = useState(false);
  const roastDialogRef = useRef(null);
  const roastCloseRef = useRef(null);
  const isMountedRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleRoast = useCallback(async () => {
    setRoastLoading(true);
    try {
      const text = await roastResume();
      if (isMountedRef.current) {
        onRoastComplete(text);
      }
    } finally {
      if (isMountedRef.current) {
        setRoastLoading(false);
      }
    }
  }, [onRoastComplete]);

  useEffect(() => {
    if (!roastContent && !roastLoading) {
      handleRoast();
    }
  }, [roastContent, roastLoading, handleRoast]);

  useEffect(() => {
    if (roastCloseRef.current) {
      setTimeout(() => roastCloseRef.current?.focus(), 100);
    }
  }, []);

  // Focus trap and Escape handling
  useEffect(() => {
    const focusSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event) => {
      const container = roastDialogRef.current;
      if (!container) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = container.querySelectorAll(focusSelectors);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 100, scale: 0.9 }}
      className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 w-auto md:w-[380px] bg-fun-pink border-nb border-[color:var(--color-border)] overflow-hidden rounded-nb dark:border-transparent dark:shadow-glow-pink"
      style={{ boxShadow: 'var(--nb-shadow-hover)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="roast-title"
      aria-describedby="roast-helper"
      ref={roastDialogRef}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b-nb border-[color:var(--color-border)] bg-fun-pink dark:border-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border-2 border-[color:var(--color-border)] rounded-nb dark:bg-glass-bg dark:border-transparent">
            <Flame size={20} className="text-fun-pink" />
          </div>
          <h3 className="font-heading font-bold text-white" id="roast-title">Resume Roasted 🔥</h3>
        </div>
        <button
          ref={roastCloseRef}
          onClick={onClose}
          className="p-1 text-white hover:bg-white/20 transition-colors"
          aria-label="Close roast"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        {roastLoading ? (
          <div className="flex items-center gap-3 text-fun-pink">
            <RefreshCw size={20} className="animate-spin motion-reduce:animate-none" />
            <span className="font-heading font-bold">Roasting your resume...</span>
          </div>
        ) : roastContent ? (
          <p className="text-black font-sans text-base italic leading-relaxed">
            &quot;{roastContent}&quot;
          </p>
        ) : null}
      </div>

      <p id="roast-helper" className="sr-only">Resume roast dialog. Press Escape to close. Focus remains inside until closed.</p>

      {/* Actions */}
      <div className="p-4 bg-secondary border-t-nb border-[color:var(--color-border)] flex gap-2 dark:border-glass-border">
        <button
          onClick={handleRoast}
          disabled={roastLoading}
          className="flex-1 py-3 bg-fun-yellow text-black font-heading font-bold border-nb border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-y-0.5 disabled:bg-secondary disabled:text-muted flex items-center justify-center gap-2 motion-reduce:transform-none motion-reduce:transition-none rounded-nb dark:bg-accent dark:text-white dark:border-transparent dark:hover:shadow-glow-purple"
          style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
        >
          <RefreshCw size={16} className={roastLoading ? 'animate-spin motion-reduce:animate-none' : ''} />
          Roast Again
        </button>
        <button
          onClick={onClose}
          className="py-3 px-6 bg-card text-primary font-heading font-bold border-nb border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none rounded-nb dark:border-glass-border dark:hover:shadow-glow-purple"
          style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
        >
          Close
        </button>
      </div>
    </motion.div>
  );
};

export default RoastInterface;
