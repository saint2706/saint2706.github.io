/**
 * @fileoverview Roast interface component showing AI-generated resume roasts.
 * Displays roast results in a modal dialog with regeneration capability.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, Flame, RefreshCw } from 'lucide-react';
import { roastResume } from '../../services/ai';
import { useTheme } from './theme-context';
import { getOverlayShell, joinClasses } from './ThemedPrimitives.utils';

/**
 * Roast interface dialog component
 *
 * Features:
 * - Modal dialog with focus trap for accessibility
 * - Auto-loads roast on mount if not provided
 * - Regenerate roast button
 * - Escape key to close
 * - Restores focus on close
 * - Prevents memory leaks with mount tracking
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Callback to close the roast interface
 * @param {string} props.roastContent - Current roast text to display
 * @param {Function} props.onRoastComplete - Callback when new roast is generated
 * @returns {JSX.Element} Roast interface modal dialog
 */
const RoastInterface = ({ onClose, roastContent, onRoastComplete }) => {
  const { theme } = useTheme();
  const isAura = theme === 'aura';
  const [roastLoading, setRoastLoading] = useState(false);
  const roastDialogRef = useRef(null);
  const roastCloseRef = useRef(null);
  const isMountedRef = useRef(true); // Track mount status to prevent state updates after unmount
  const prefersReducedMotion = useReducedMotion();
  const shell = getOverlayShell({ theme, depth: 'hover', tone: 'pink' });

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Generate roast using AI service
   * Only updates state if component is still mounted
   */
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

  // Auto-load roast on mount if not provided
  useEffect(() => {
    if (!roastContent && !roastLoading) {
      handleRoast();
    }
  }, [roastContent, roastLoading, handleRoast]);

  // Auto-focus close button on mount
  useEffect(() => {
    if (roastCloseRef.current) {
      setTimeout(() => roastCloseRef.current?.focus(), 100);
    }
  }, []);

  /**
   * Trap focus within dialog and handle keyboard navigation
   * - Tab cycles through focusable elements
   * - Escape closes dialog
   */
  useEffect(() => {
    const focusSelectors =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = event => {
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
      className={`fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 w-auto md:w-[380px] overflow-hidden ${shell.className}`}
      style={shell.style}
      role="dialog"
      aria-modal="true"
      aria-labelledby="roast-title"
      aria-describedby="roast-helper"
      ref={roastDialogRef}
    >
      {/* Header */}
      <div
        className={joinClasses(
          'p-4 flex justify-between items-center',
          isAura
            ? 'bg-[color:var(--surface-muted)] border-b border-[color:var(--border-soft)]'
            : 'bg-fun-pink border-b-nb border-[color:var(--color-border)]'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={joinClasses(
              'p-2',
              isAura
                ? 'aura-chip border border-[color:var(--border-soft)] rounded-full'
                : 'bg-white border-2 border-[color:var(--color-border)] rounded-nb'
            )}
          >
            <Flame size={20} className="text-fun-pink" />
          </div>
          <h3 className="font-heading font-bold text-white" id="roast-title">
            Resume Roasted 🔥
          </h3>
        </div>
        <button
          ref={roastCloseRef}
          onClick={onClose}
          className="group relative p-1 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-fun-pink rounded-sm"
          aria-label="Close roast"
        >
          <X size={20} />
          <span
            className="absolute top-full mt-2 right-0 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
            aria-hidden="true"
          >
            Close
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 bg-white" aria-live="polite" aria-atomic="true" aria-busy={roastLoading}>
        {roastLoading ? (
          <div className="flex items-center gap-3 text-fun-pink" role="status">
            <RefreshCw size={20} className="animate-spin motion-reduce:animate-none" />
            <span className="font-heading font-bold">Roasting your resume...</span>
          </div>
        ) : roastContent ? (
          <p className="text-black font-sans text-base italic leading-relaxed">
            &quot;{roastContent}&quot;
          </p>
        ) : null}
      </div>

      <p id="roast-helper" className="sr-only">
        Resume roast dialog. Press Escape to close. Focus remains inside until closed.
      </p>

      {/* Actions */}
      <div
        className={joinClasses(
          'p-4 flex gap-2',
          isAura
            ? 'bg-[color:var(--surface-muted)] border-t border-[color:var(--border-soft)]'
            : 'bg-secondary border-t-nb border-[color:var(--color-border)]'
        )}
      >
        <button
          onClick={handleRoast}
          disabled={roastLoading}
          className={joinClasses(
            'flex-1 py-3 font-heading font-bold cursor-pointer disabled:bg-secondary disabled:text-muted flex items-center justify-center gap-2 motion-reduce:transform-none motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transition-transform',
            isAura
              ? 'aura-overlay-action aura-interactive-surface bg-[color:var(--surface-muted)] border border-[color:var(--border-soft)] text-[color:var(--text-primary)] rounded-full hover:brightness-110 hover:scale-[1.01]'
              : 'bg-fun-yellow text-black border-nb border-[color:var(--color-border)] hover:-translate-y-0.5 rounded-nb'
          )}
          style={isAura ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
        >
          <RefreshCw
            size={16}
            className={roastLoading ? 'animate-spin motion-reduce:animate-none' : ''}
          />
          Roast Again
        </button>
        <button
          onClick={onClose}
          className={joinClasses(
            'py-3 px-6 font-heading font-bold cursor-pointer motion-reduce:transform-none motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transition-transform',
            isAura
              ? 'aura-overlay-action aura-interactive-surface bg-[color:var(--surface)] border border-[color:var(--border-soft)] text-[color:var(--text-primary)] rounded-full hover:brightness-110 hover:scale-[1.01]'
              : 'bg-card text-primary border-nb border-[color:var(--color-border)] hover:-translate-y-0.5 rounded-nb'
          )}
          style={isAura ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
        >
          Close
        </button>
      </div>
    </motion.div>
  );
};

export default RoastInterface;
