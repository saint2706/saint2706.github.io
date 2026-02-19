/**
 * @fileoverview Navigation bar component with responsive design and accessibility features.
 * Features mobile menu, custom cursor toggle, and active link highlighting.
 *
 * Layout contract: the structural HTML is identical across both themes.
 * Only className strings swap to apply different visual skins (neubrutalism ↔ liquid).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Terminal,
  User,
  Briefcase,
  FileText,
  Mail,
  Menu,
  X,
  MousePointer2,
  Code2,
  Grid,
  Moon,
} from 'lucide-react';
import { useTheme } from '../shared/theme-context';

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Navigation menu items — shared across both themes */
const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: <Terminal size={18} /> },
  { name: 'Projects', path: '/projects', icon: <Briefcase size={18} /> },
  { name: 'Resume', path: '/resume', icon: <User size={18} /> },
  { name: 'Blog', path: '/blog', icon: <FileText size={18} /> },
  { name: 'Playground', path: '/playground', icon: <Code2 size={18} /> },
  { name: 'Contact', path: '/contact', icon: <Mail size={18} /> },
];

/**
 * Navigation bar component with desktop and mobile layouts.
 * Renders the same structural HTML for both themes — only visual classes differ.
 */
const Navbar = ({ cursorEnabled, cursorToggleDisabled, cursorToggleLabel, onToggleCursor }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastFocusRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isLiquid = theme === 'liquid';

  // Scroll-aware navbar compaction for liquid theme
  useEffect(() => {
    if (!isLiquid) { setIsScrolled(false); return undefined; }
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLiquid]);

  // Close chatbot when mobile menu opens to prevent UI conflicts
  useEffect(() => {
    if (isMenuOpen) {
      document.dispatchEvent(new CustomEvent('closeChatbot'));
    }
  }, [isMenuOpen]);

  // Close mobile menu when navigating between routes
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /**
   * Trap focus within mobile menu for keyboard navigation
   */
  const trapFocus = useCallback(
    event => {
      if (!isMenuOpen || !menuRef.current) return;
      const focusable = menuRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    },
    [isMenuOpen]
  );

  // Manage focus, aria-hidden, and event listeners when menu toggles
  useEffect(() => {
    if (isMenuOpen) {
      lastFocusRef.current = document.activeElement;
      const main = document.getElementById('main-content');
      if (main) main.setAttribute('aria-hidden', 'true');
      document.addEventListener('keydown', trapFocus);
      setTimeout(() => menuRef.current?.querySelector(FOCUSABLE_SELECTOR)?.focus(), 0);
    } else {
      const main = document.getElementById('main-content');
      if (main) main.removeAttribute('aria-hidden');
      document.removeEventListener('keydown', trapFocus);
      lastFocusRef.current?.focus?.();
    }
    return () => document.removeEventListener('keydown', trapFocus);
  }, [isMenuOpen, trapFocus]);

  // Listen for custom event from chatbot to close this menu
  useEffect(() => {
    const handleCloseMobileMenu = () => setIsMenuOpen(false);
    document.addEventListener('closeMobileMenu', handleCloseMobileMenu);
    return () => document.removeEventListener('closeMobileMenu', handleCloseMobileMenu);
  }, []);

  const handleCloseMenu = () => setIsMenuOpen(false);

  /* ── Theme-dependent class maps ── */

  const navCls = `fixed top-0 left-0 right-0 z-50 px-4 ${isLiquid ? `pt-6 flex justify-center pointer-events-none ${isScrolled ? 'lg-nav-compact' : ''}` : 'py-4 md:py-5'
    }`;

  const containerCls = isLiquid
    ? 'lg-surface-1 lg-specular-rim flex items-center justify-between w-full max-w-5xl h-[64px] px-6 pointer-events-auto transition-all duration-300'
    : 'relative max-w-5xl mx-auto px-4 py-3 flex justify-between items-center bg-card border-nb border-[color:var(--color-border)] rounded-nb shadow-nb';

  const logoCls = isLiquid
    ? 'lg-surface-3 px-4 py-1.5 rounded-full text-[color:var(--text-primary)] font-heading font-bold whitespace-nowrap text-sm'
    : 'text-xl font-heading font-bold text-primary bg-fun-yellow px-2 py-1 border-2 border-[color:var(--color-border)] rounded-nb whitespace-nowrap';

  const desktopLinkCls = (isActive) =>
    isLiquid
      ? `touch-target flex items-center justify-center gap-1.5 px-4 text-[14px] font-semibold rounded-full transition-all duration-300 whitespace-nowrap ${isActive
        ? 'bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.12)] text-[color:var(--text-primary)]'
        : 'text-[color:var(--text-secondary)] hover:bg-white/40'
      }`
      : `flex items-center gap-1.5 px-3 py-2 text-sm font-heading font-semibold transition-all duration-200 border-2 rounded-nb whitespace-nowrap ${isActive
        ? 'bg-fun-yellow text-black border-[color:var(--color-border)] -rotate-1 shadow-[inset_2px_2px_0_var(--color-border)] translate-y-[1px]'
        : 'text-primary border-transparent hover:border-[color:var(--color-border)] hover:bg-secondary nb-shadow-lift'
      }`;

  const actionBtnCls = isLiquid
    ? 'lg-surface-3 text-[color:var(--text-primary)] hover:bg-white/80'
    : 'bg-card border-2 border-[color:var(--color-border)] rounded-nb shadow-nb hover:-translate-x-0.5 hover:-translate-y-0.5 text-primary';

  const mobileBtnCls = isLiquid
    ? 'text-[color:var(--text-primary)] lg-surface-3 rounded-full'
    : 'text-primary bg-card border-2 border-[color:var(--color-border)] rounded-nb shadow-nb';

  const mobileMenuCls = isLiquid
    ? 'lg-surface-2 lg-specular-rim'
    : 'bg-card border-nb border-[color:var(--color-border)] rounded-nb shadow-nb';

  const mobileThemeBtnCls = isLiquid
    ? 'lg-surface-3 text-[color:var(--text-primary)] hover:bg-white/80'
    : 'text-primary bg-primary border-2 border-[color:var(--color-border)] rounded-nb';

  const mobileLinkCls = (isActive, index) => {
    const base = 'flex items-center gap-3 px-5 py-4 text-base font-semibold transition-colors duration-200';
    const activeStyle = isLiquid
      ? (isActive ? 'bg-white/60 text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)] hover:bg-white/40')
      : (isActive ? 'bg-fun-yellow text-black' : 'text-primary hover:bg-secondary');
    const separator = !isLiquid && index < NAV_ITEMS.length - 1 ? 'border-b-2 border-[color:var(--color-border)]' : '';
    return `${base} ${activeStyle} ${separator}`;
  };

  return (
    <motion.nav
      initial={shouldReduceMotion ? false : { y: -100 }}
      animate={{ y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={navCls}
    >
      <div className={containerCls}>
        {/* ── Logo ── */}
        <NavLink
          to="/"
          className="flex items-center gap-4 group flex-shrink-0"
          aria-label="Rishabh Agrawal - Home page"
        >
          <span className={logoCls}>&lt;Rishabh /&gt;</span>
        </NavLink>

        {/* ── Desktop Navigation ── */}
        <div className="hidden md:flex items-center gap-1 flex-grow justify-center">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => desktopLinkCls(isActive)}
            >
              <span className="hidden lg:inline opacity-70" aria-hidden="true">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`group relative hidden md:flex items-center justify-center p-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${actionBtnCls}`}
            aria-label={`Switch to ${isLiquid ? 'Neubrutalism' : 'Liquid'} theme`}
          >
            {isLiquid ? <Grid size={18} /> : <Moon size={18} />}
            <span
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans rounded"
              aria-hidden="true"
            >
              {isLiquid ? 'Switch to Neubrutalism' : 'Switch to Liquid'}
            </span>
          </button>

          {/* Cursor Toggle */}
          <button
            type="button"
            onClick={onToggleCursor}
            className={`group relative hidden md:flex items-center justify-center p-2 rounded-full transition-all duration-300 cursor-pointer disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${actionBtnCls}`}
            aria-pressed={cursorEnabled}
            aria-label={cursorToggleLabel}
            disabled={cursorToggleDisabled}
          >
            <MousePointer2 size={18} aria-hidden="true" />
            <span
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans rounded"
              aria-hidden="true"
            >
              {cursorToggleLabel}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            ref={menuButtonRef}
            className={`md:hidden p-3 cursor-pointer ${mobileBtnCls}`}
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* ── Mobile Menu Dropdown ── */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-nav-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute right-4 top-full mt-3 w-64 md:hidden overflow-hidden ${mobileMenuCls}`}
              ref={menuRef}
            >
              <div className="flex flex-col">
                {/* Theme switcher row */}
                <div className={`px-5 py-4 ${isLiquid ? 'border-b border-black/5' : 'border-b-2 border-[color:var(--color-border)]'}`}>
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-between text-sm font-bold px-3 py-2 rounded-lg transition-colors ${mobileThemeBtnCls}`}
                  >
                    <span>{isLiquid ? 'Switch to Neubrutalism' : 'Switch to Liquid'}</span>
                    {isLiquid ? <Grid size={16} /> : <Moon size={16} />}
                  </button>
                </div>

                {/* Nav links */}
                {NAV_ITEMS.map((item, index) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={handleCloseMenu}
                    className={({ isActive }) => mobileLinkCls(isActive, index)}
                  >
                    <span aria-hidden="true" className={isLiquid ? 'opacity-70' : ''}>{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
