/**
 * @fileoverview Main layout wrapper component providing consistent structure across all pages.
 * Manages the custom cursor feature, accessibility preferences, command palette, terminal mode,
 * and renders header/footer/content.
 */

import React, { lazy, Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from '../shared/CustomCursor';
import {
  canUseDOM,
  safeGetLocalStorage,
  safeKeyboardKey,
  safeMediaQueryMatch,
  safeSetLocalStorage,
} from '../../utils/storage';

/** Local storage key for persisting custom cursor preference */
const CURSOR_STORAGE_KEY = 'custom_cursor_enabled';

/** Konami Code sequence: ↑↑↓↓←→←→BA */
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

/** Lazy load overlays so they don't impact initial bundle */
const CommandPalette = lazy(() => import('../shared/CommandPalette'));
const TerminalMode = lazy(() => import('../shared/TerminalMode'));

/**
 * Layout component that wraps all page content
 *
 * Provides:
 * - Custom cursor with accessibility-aware auto-disable
 * - Neubrutalist grid background pattern
 * - Skip navigation link for keyboard users
 * - Consistent header/footer structure
 * - Command Palette (Ctrl+K / Cmd+K)
 * - Centralized global shortcut ownership and event dispatch
 * - Terminal Mode overlay
 * - Konami Code easter egg
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render within the layout
 * @returns {JSX.Element} Complete page layout with header, content, and footer
 */
const Layout = ({ children }) => {
  // ── Custom Cursor State ──
  const [cursorEnabled, setCursorEnabled] = useState(() => {
    const stored = safeGetLocalStorage(CURSOR_STORAGE_KEY, 'false');
    return stored === 'true';
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => safeMediaQueryMatch('(prefers-reduced-motion: reduce)')
  );

  const [prefersContrast, setPrefersContrast] = useState(
    () =>
      safeMediaQueryMatch('(prefers-contrast: more)') ||
      safeMediaQueryMatch('(forced-colors: active)')
  );

  const [hasFinePointer, setHasFinePointer] = useState(() => safeMediaQueryMatch('(pointer: fine)'));

  // ── Command Palette & Terminal State ──
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalWelcome, setTerminalWelcome] = useState('');

  // ── Konami Code Tracking ──
  const konamiIndexRef = useRef(0);

  // Subscribe to accessibility preference changes
  useEffect(() => {
    if (!canUseDOM() || typeof window.matchMedia !== 'function') return undefined;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMoreQuery = window.matchMedia('(prefers-contrast: more)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    const pointerFineQuery = window.matchMedia('(pointer: fine)');

    const updatePreferences = () => {
      setPrefersReducedMotion(reducedMotionQuery.matches);
      setPrefersContrast(contrastMoreQuery.matches || forcedColorsQuery.matches);
      setHasFinePointer(pointerFineQuery.matches);
    };

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
  const toggleCursor = useCallback(() => {
    if (cursorForcedOff) return;
    const next = !cursorEnabled;
    setCursorEnabled(next);
    safeSetLocalStorage(CURSOR_STORAGE_KEY, next ? 'true' : 'false');
  }, [cursorEnabled, cursorForcedOff]);

  // Listen for custom toggleCursor event (from Command Palette)
  useEffect(() => {
    const handler = () => toggleCursor();
    document.addEventListener('toggleCursor', handler);
    return () => document.removeEventListener('toggleCursor', handler);
  }, [toggleCursor]);

  /**
   * Global keyboard listener for this shell.
   *
   * Shortcut ownership note:
   * Layout is the single authoritative owner of Cmd/Ctrl+K so feature
   * components do not bind the same combination independently. Components
   * should react only to explicit custom events dispatched from here.
   *
   * - Ctrl+K / Cmd+K → toggle command palette + emit open/close events
   * - Escape → close overlays/chatbot via explicit close events
   * - Konami Code → open Terminal Mode
   */
  useEffect(() => {
    const handleKeyDown = e => {
      const normalizedKey = safeKeyboardKey(e).toLowerCase();

      // ── Command Palette shortcut ──
      if ((e.ctrlKey || e.metaKey) && normalizedKey === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => {
          const next = !prev;
          document.dispatchEvent(
            new CustomEvent(next ? 'openCommandPalette' : 'closeCommandPalette')
          );
          return next;
        });
        return;
      }

      if (normalizedKey === 'escape') {
        setIsCommandPaletteOpen(false);
        setIsTerminalOpen(false);
        document.dispatchEvent(new CustomEvent('closeCommandPalette'));
        document.dispatchEvent(new CustomEvent('closeChatbot'));
        return;
      }

      // ── Konami Code detection ──
      if (
        e.key === KONAMI_CODE[konamiIndexRef.current] ||
        normalizedKey === KONAMI_CODE[konamiIndexRef.current]
      ) {
        konamiIndexRef.current += 1;
        if (konamiIndexRef.current === KONAMI_CODE.length) {
          konamiIndexRef.current = 0;
          setTerminalWelcome('🎮 KONAMI CODE ACTIVATED! You found the secret terminal!');
          setIsTerminalOpen(true);
        }
      } else {
        konamiIndexRef.current = 0;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /** Open terminal from command palette */
  const handleOpenTerminal = useCallback(() => {
    setTerminalWelcome('');
    setIsTerminalOpen(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-primary text-primary overflow-hidden relative nb-paper-bg">
      {/* Custom interactive cursor */}
      <CustomCursor enabled={effectiveCursorEnabled} />

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

      {/* Command Palette & Terminal Mode overlays */}
      <Suspense fallback={null}>
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onOpenTerminal={handleOpenTerminal}
        />
        <TerminalMode
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
          welcomeMessage={terminalWelcome}
        />
      </Suspense>
    </div>
  );
};

export default Layout;
