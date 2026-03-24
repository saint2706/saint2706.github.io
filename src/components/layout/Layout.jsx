/**
 * @fileoverview Main layout wrapper component providing consistent structure across all pages.
 * Manages the custom cursor feature, accessibility preferences, command palette, terminal mode,
 * and renders header/footer/content.
 */

import React, { lazy, Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from '../shared/CustomCursor';
import SettingsModal from '../shared/SettingsModal';
import { useTheme } from '../shared/theme-context';
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
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid' || theme === 'liquid-dark';
  const { pathname } = useLocation();
  const routeAnnouncementRef = useRef(null);

  // Per-page ambient tint for liquid theme
  const liquidTint = useMemo(() => {
    if (!isLiquid) return undefined;
    if (pathname === '/') return 'blue';
    if (pathname.startsWith('/resume')) return 'green';
    if (pathname.startsWith('/projects')) return 'purple';
    if (pathname.startsWith('/blog')) return 'amber';
    if (pathname.startsWith('/contact')) return 'amber';
    if (pathname.startsWith('/playground')) return 'purple';
    if (pathname.startsWith('/games')) return 'blue';
    return 'blue';
  }, [isLiquid, pathname]);

  // ── Custom Cursor State ──
  const [cursorEnabled, setCursorEnabled] = useState(() => {
    const stored = safeGetLocalStorage(CURSOR_STORAGE_KEY, 'false');
    return stored === 'true';
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    safeMediaQueryMatch('(prefers-reduced-motion: reduce)')
  );

  const [prefersContrast, setPrefersContrast] = useState(
    () =>
      safeMediaQueryMatch('(prefers-contrast: more)') ||
      safeMediaQueryMatch('(forced-colors: active)')
  );

  const [hasFinePointer, setHasFinePointer] = useState(() =>
    safeMediaQueryMatch('(pointer: fine)')
  );

  // ── Command Palette & Terminal State ──
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalWelcome, setTerminalWelcome] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  useEffect(() => {
    if (!canUseDOM()) return undefined;

    const root = document.documentElement;
    root.dataset.contrast = prefersContrast ? 'more' : 'no-preference';

    return () => {
      delete root.dataset.contrast;
    };
  }, [prefersContrast]);

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

  // Restore focus to new route content and announce route changes for assistive tech
  useEffect(() => {
    if (!canUseDOM()) return;

    const main = document.getElementById('main-content');
    if (!main) return;

    const heading = main.querySelector('h1, [role="heading"][aria-level="1"]');
    const focusTarget = heading || main;

    if (!focusTarget.hasAttribute('tabindex')) {
      focusTarget.setAttribute('tabindex', '-1');
    }

    focusTarget.focus({ preventScroll: true });

    const headingText = heading?.textContent?.trim();
    const nextAnnouncement = headingText
      ? `Navigated to ${headingText}`
      : `Navigated to ${pathname}`;

    if (routeAnnouncementRef.current) {
      routeAnnouncementRef.current.textContent = nextAnnouncement;
    }
  }, [pathname]);

  /** Open terminal from command palette */
  const handleOpenTerminal = useCallback(() => {
    setTerminalWelcome('');
    setIsTerminalOpen(true);
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col text-primary overflow-hidden relative ${isLiquid ? 'lg-ambient-bg' : 'bg-primary nb-paper-bg'
        }`}
      style={{ background: isLiquid ? 'var(--bg)' : undefined }}
      data-theme={theme}
      data-contrast={prefersContrast ? 'more' : 'no-preference'}
      {...(liquidTint ? { 'data-liquid-tint': liquidTint } : {})}
    >
      {/* Custom interactive cursor */}
      <CustomCursor enabled={effectiveCursorEnabled} />

      {/* Skip navigation link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:bg-fun-yellow focus-visible:text-black focus-visible:px-4 focus-visible:py-2 focus-visible:border-2 focus-visible:border-black focus-visible:z-100 focus-visible:font-heading focus-visible:font-bold"
      >
        Skip to main content
      </a>

      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <div
        ref={routeAnnouncementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      <main id="main-content" className="grow pt-28 px-4 z-10 relative">
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cursorEnabled={effectiveCursorEnabled}
        cursorToggleDisabled={cursorForcedOff}
        onToggleCursor={toggleCursor}
      />
    </div>
  );
};

export default Layout;
