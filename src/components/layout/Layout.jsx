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
    const contrastHighQuery = window.matchMedia('(prefers-contrast: high)');
    const pointerFineQuery = window.matchMedia('(pointer: fine)');

    const updatePreferences = () => {
      setPrefersReducedMotion(reducedMotionQuery.matches);
      setPrefersContrast(contrastMoreQuery.matches || contrastHighQuery.matches);
      setHasFinePointer(pointerFineQuery.matches);
    };

    updatePreferences();
    reducedMotionQuery.addEventListener('change', updatePreferences);
    contrastMoreQuery.addEventListener('change', updatePreferences);
    contrastHighQuery.addEventListener('change', updatePreferences);
    pointerFineQuery.addEventListener('change', updatePreferences);

    return () => {
      reducedMotionQuery.removeEventListener('change', updatePreferences);
      contrastMoreQuery.removeEventListener('change', updatePreferences);
      contrastHighQuery.removeEventListener('change', updatePreferences);
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

      {/* Neubrutalism subtle grid background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
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
