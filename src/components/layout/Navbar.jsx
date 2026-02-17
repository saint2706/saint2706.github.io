/**
 * @fileoverview Navigation bar component with responsive design and accessibility features.
 * Features mobile menu, custom cursor toggle, and active link highlighting.
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
} from 'lucide-react';
import { useTheme } from '../shared/theme-context';

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Navigation bar component with desktop and mobile layouts
 */
const Navbar = ({ cursorEnabled, cursorToggleDisabled, cursorToggleLabel, onToggleCursor }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastFocusRef = useRef(null); // Stores element to restore focus to
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isLiquid = theme === 'liquid';

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

  /** Navigation menu items with icons */
  const navItems = [
    { name: 'Home', path: '/', icon: <Terminal size={18} /> },
    { name: 'Projects', path: '/projects', icon: <Briefcase size={18} /> },
    { name: 'Resume', path: '/resume', icon: <User size={18} /> },
    { name: 'Blog', path: '/blog', icon: <FileText size={18} /> },
    { name: 'Playground', path: '/playground', icon: <Code2 size={18} /> },
    // Contact is separated in Liquid theme
  ];

  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <motion.nav
      initial={shouldReduceMotion ? false : { y: -100 }}
      animate={{ y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 px-4 ${isLiquid ? 'pt-8 flex justify-center pointer-events-none' : 'py-4 md:py-6'}`}
    >
      <div
        className={
          isLiquid
            ? 'glass-surface ios-sheet flex items-center justify-between w-full max-w-[1200px] h-[72px] px-8 pointer-events-auto transition-all duration-300'
            : 'relative max-w-5xl mx-auto px-4 py-3 flex justify-between items-center bg-card border-nb border-[color:var(--color-border)] rounded-nb shadow-nb'
        }
      >
        {/* Logo Section */}
        <NavLink
          to="/"
          className="flex items-center gap-4 group"
          aria-label="Rishabh Agrawal - Home page"
        >
          {isLiquid ? (
            <div className="flex items-center gap-4">
              <div className="size-9 bg-ios-dark rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <Grid size={20} />
              </div>
              <span className="text-[14px] font-bold tracking-tight uppercase text-ios-dark">Liquid</span>
            </div>
          ) : (
            <span className="text-xl font-heading font-bold text-primary bg-fun-yellow px-2 py-1 border-2 border-[color:var(--color-border)] rounded-nb">
              &lt;Rishabh /&gt;
            </span>
          )}
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isLiquid
                  ? `touch-target flex items-center justify-center px-6 text-[15px] font-semibold rounded-full transition-colors ${
                      isActive ? 'bg-black/5 text-ios-dark' : 'text-ios-dark hover:bg-black/[0.06]'
                    }`
                  : `flex items-center gap-1.5 px-3 py-2 text-sm font-heading font-semibold transition-all duration-200 border-2 rounded-nb ${
                      isActive
                        ? 'bg-fun-yellow text-black border-[color:var(--color-border)] -rotate-1 shadow-[inset_2px_2px_0_var(--color-border)] translate-y-[1px]'
                        : 'text-primary border-transparent hover:border-[color:var(--color-border)] hover:bg-secondary nb-shadow-lift'
                    }`
              }
            >
              {!isLiquid && <span className="hidden lg:inline" aria-hidden="true">{item.icon}</span>}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
           {/* Theme Switcher - Always Visible but Styled Differently */}
           <label htmlFor="theme-preference" className="sr-only">Select Theme</label>
           <div className={`relative flex items-center ${isLiquid ? 'hidden lg:flex' : 'hidden md:flex'}`}>
              <select
                id="theme-preference"
                value={theme}
                onChange={event => setTheme(event.target.value)}
                className={`text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    isLiquid
                    ? 'bg-transparent text-ios-dark font-medium border-none pr-8 py-2'
                    : 'bg-primary border-2 border-[color:var(--color-border)] rounded-nb px-2 py-1'
                }`}
              >
                <option value="neubrutalism">Neubrutalism</option>
                <option value="liquid">Liquid</option>
              </select>
           </div>

           {/* Contact Button (Liquid Only) or Cursor Toggle (Neubrutalism) */}
           {isLiquid ? (
             <NavLink
                to="/contact"
                className="hidden md:flex touch-target bg-primary text-white px-8 h-[44px] items-center justify-center rounded-full text-[15px] font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
             >
                Contact
             </NavLink>
           ) : (
            <button
                type="button"
                onClick={onToggleCursor}
                className="group relative hidden md:flex p-2.5 text-primary transition-all duration-200 cursor-pointer disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed bg-card border-2 border-[color:var(--color-border)] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-nb shadow-nb"
                aria-pressed={cursorEnabled}
                aria-label={cursorToggleLabel}
                disabled={cursorToggleDisabled}
            >
                <MousePointer2 size={18} aria-hidden="true" />
            </button>
           )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            ref={menuButtonRef}
            className={`md:hidden p-3 cursor-pointer ${
                isLiquid
                ? 'text-ios-dark hover:bg-black/5 rounded-full'
                : 'text-primary bg-card border-2 border-[color:var(--color-border)] rounded-nb shadow-nb'
            }`}
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

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-nav-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute right-4 top-full mt-3 w-64 md:hidden overflow-hidden ${
                  isLiquid
                  ? 'glass-surface ios-card border border-black/10'
                  : 'bg-card border-nb border-[color:var(--color-border)] rounded-nb shadow-nb'
              }`}
              ref={menuRef}
            >
              <div className="flex flex-col">
                <div className={`px-5 py-4 ${isLiquid ? 'border-b border-black/5' : 'border-b-2 border-[color:var(--color-border)]'}`}>
                  <label htmlFor="mobile-theme-preference" className={`block text-sm font-bold mb-2 ${isLiquid ? 'text-ios-dark' : 'font-heading text-primary'}`}>
                    Theme
                  </label>
                  <select
                    id="mobile-theme-preference"
                    value={theme}
                    onChange={event => setTheme(event.target.value)}
                    className={`w-full text-sm px-3 py-2 ${
                        isLiquid
                        ? 'bg-ios-bg-2 rounded-lg text-ios-dark border-none'
                        : 'text-primary bg-primary border-2 border-[color:var(--color-border)] rounded-nb'
                    }`}
                  >
                    <option value="neubrutalism">Neubrutalism</option>
                    <option value="liquid">Liquid</option>
                  </select>
                </div>
                {[...navItems, { name: 'Contact', path: '/contact', icon: <Mail size={18} /> }].map((item, index) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={handleCloseMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-5 py-4 text-base font-semibold transition-colors duration-200
                      ${isLiquid
                        ? (isActive ? 'bg-primary/5 text-primary' : 'text-ios-dark hover:bg-black/5')
                        : (isActive ? 'bg-fun-yellow text-black' : 'text-primary hover:bg-secondary')
                      }
                      ${!isLiquid && index !== navItems.length ? 'border-b-2 border-[color:var(--color-border)]' : ''}`
                    }
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
