/**
 * @fileoverview Main layout wrapper component providing consistent structure across all pages.
 * Manages the custom cursor feature, accessibility preferences, and renders header/footer/content.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from '../shared/CustomCursor';

/** Local storage key for persisting custom cursor preference */
const CURSOR_STORAGE_KEY = 'custom_cursor_enabled';

/**
 * Layout component that wraps all page content
 *
 * Provides:
 * - Custom cursor with accessibility-aware auto-disable
 * - Neubrutalist grid background pattern
 * - Skip navigation link for keyboard users
 * - Consistent header/footer structure
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render within the layout
 * @returns {JSX.Element} Complete page layout with header, content, and footer
 */
const Layout = ({ children }) => {
  // State for custom cursor toggle and accessibility preferences
  // Load cursor preference from localStorage on mount
  const [cursorEnabled, setCursorEnabled] = useState(() => {
    const stored = localStorage.getItem(CURSOR_STORAGE_KEY);
    return stored === 'true';
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersContrast, setPrefersContrast] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(true);

  // Monitor system accessibility preferences via media queries
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMoreQuery = window.matchMedia('(prefers-contrast: more)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    const pointerFineQuery = window.matchMedia('(pointer: fine)');

    /** Update accessibility preference states based on media query matches */
    const updatePreferences = () => {
      setPrefersReducedMotion(reducedMotionQuery.matches);
      setPrefersContrast(contrastMoreQuery.matches || forcedColorsQuery.matches);
      setHasFinePointer(pointerFineQuery.matches);
    };

    // Initial check and subscribe to changes
    updatePreferences();
    reducedMotionQuery.addEventListener('change', updatePreferences);
    contrastMoreQuery.addEventListener('change', updatePreferences);
    forcedColorsQuery.addEventListener('change', updatePreferences);
    pointerFineQuery.addEventListener('change', updatePreferences);

    return () => {
      reducedMotionQuery.removeEventListener('change', updatePreferences);
      contrastMoreQuery.removeEventListener('change', updatePreferences);
      forcedColorsQuery.removeEventListener('change', updatePreferences);
      pointerFineQuery.removeEventListener('change', updatePreferences);
    };
  }, []);

  // Determine if cursor should be disabled due to accessibility preferences
  const cursorForcedOff = prefersReducedMotion || prefersContrast || !hasFinePointer;

  // Memoized effective cursor state (respects both user preference and accessibility)
  const effectiveCursorEnabled = useMemo(
    () => cursorEnabled && !cursorForcedOff,
    [cursorEnabled, cursorForcedOff]
  );

  /**
   * Toggle custom cursor on/off (unless disabled by accessibility preferences)
   * Persists preference to localStorage
   */
  const toggleCursor = () => {
    if (cursorForcedOff) return;
    const next = !cursorEnabled;
    setCursorEnabled(next);
    localStorage.setItem(CURSOR_STORAGE_KEY, next ? 'true' : 'false');
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary text-primary overflow-hidden relative">
      {/* Custom interactive cursor */}
      <CustomCursor enabled={effectiveCursorEnabled} />

      {/* Subtle grid background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="w-full h-full opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Skip navigation link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-fun-yellow focus:text-black focus:px-4 focus:py-2 focus:border-2 focus:border-black focus:z-[100] focus:font-heading focus:font-bold"
      >
        Skip to main content
      </a>

      <Navbar
        cursorEnabled={effectiveCursorEnabled}
        cursorToggleDisabled={cursorForcedOff}
        cursorToggleLabel={
          cursorForcedOff
            ? 'Custom cursor disabled by motion/contrast or pointer settings'
            : 'Toggle custom cursor'
        }
        onToggleCursor={toggleCursor}
      />

      <main id="main-content" className="flex-grow pt-28 px-4 z-10 relative">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
