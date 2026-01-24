import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from '../shared/CustomCursor';

const CURSOR_STORAGE_KEY = 'custom_cursor_enabled';

const Layout = ({ children }) => {
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersContrast, setPrefersContrast] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(CURSOR_STORAGE_KEY);
    setCursorEnabled(stored === 'true');
  }, []);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMoreQuery = window.matchMedia('(prefers-contrast: more)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    const pointerFineQuery = window.matchMedia('(pointer: fine)');

    const updatePreferences = () => {
      setPrefersReducedMotion(reducedMotionQuery.matches);
      setPrefersContrast(contrastMoreQuery.matches || forcedColorsQuery.matches);
      setHasFinePointer(pointerFineQuery.matches);
    };

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

  const cursorForcedOff = prefersReducedMotion || prefersContrast || !hasFinePointer;
  const effectiveCursorEnabled = useMemo(() => (
    cursorEnabled && !cursorForcedOff
  ), [cursorEnabled, cursorForcedOff]);

  useEffect(() => {
    if (cursorForcedOff && cursorEnabled) {
      setCursorEnabled(false);
      localStorage.setItem(CURSOR_STORAGE_KEY, 'false');
    }
  }, [cursorForcedOff, cursorEnabled]);

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

      {/* Light mode: subtle grid | Dark mode: gradient mesh with floating orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Light mode grid pattern */}
        <div
          className="w-full h-full opacity-[0.03] dark:opacity-0 transition-opacity duration-500"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Dark mode gradient mesh */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500 gradient-mesh">
          {/* Animated floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-purple/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-glow-pink/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-glow-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
        </div>
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
