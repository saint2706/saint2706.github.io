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
} from 'lucide-react';

/**
 * Navigation bar component with desktop and mobile layouts
 *
 * Features:
 * - Responsive navigation menu (desktop horizontal, mobile dropdown)
 * - Active link highlighting with neubrutalist styling
 * - Custom cursor toggle button
 * - Focus trap in mobile menu for accessibility
 * - Automatic close on route change
 * - Communicates with chatbot to prevent UI conflicts
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.cursorEnabled - Whether custom cursor is currently enabled
 * @param {boolean} props.cursorToggleDisabled - Whether cursor toggle should be disabled
 * @param {string} props.cursorToggleLabel - Accessible label for cursor toggle button
 * @param {Function} props.onToggleCursor - Callback to toggle cursor on/off
 * @returns {JSX.Element} Navigation bar with menu and controls
 */
const Navbar = ({ cursorEnabled, cursorToggleDisabled, cursorToggleLabel, onToggleCursor }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastFocusRef = useRef(null); // Stores element to restore focus to
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();

  // Close chatbot when mobile menu opens to prevent UI conflicts
  useEffect(() => {
    if (isMenuOpen) {
      document.dispatchEvent(new CustomEvent('closeChatbot'));
    }
  }, [isMenuOpen]);

  // Close mobile menu when navigating between routes
  useEffect(() => {
    // This is a legitimate use case for setState in an effect:
    // We need to synchronize the menu state with the router location.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [location.pathname]);

  /**
   * Trap focus within mobile menu for keyboard navigation
   * Handles Tab key to cycle through focusable elements
   * Handles Escape key to close menu
   */
  const trapFocus = useCallback(
    event => {
      if (!isMenuOpen || !menuRef.current) return;
      const focusable = menuRef.current.querySelectorAll('a, button');
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
      // Store current focus to restore later
      lastFocusRef.current = document.activeElement;
      // Hide main content from screen readers
      const main = document.getElementById('main-content');
      if (main) main.setAttribute('aria-hidden', 'true');
      document.addEventListener('keydown', trapFocus);
      // Auto-focus first interactive element in menu
      setTimeout(() => menuRef.current?.querySelector('a, button')?.focus(), 0);
    } else {
      // Show main content to screen readers
      const main = document.getElementById('main-content');
      if (main) main.removeAttribute('aria-hidden');
      document.removeEventListener('keydown', trapFocus);
      // Restore focus to trigger element
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
    { name: 'Contact', path: '/contact', icon: <Mail size={18} /> },
  ];

  /** Close mobile menu (called on nav link click) */
  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <motion.nav
      initial={shouldReduceMotion ? false : { y: -100 }}
      animate={{ y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : undefined}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:py-6"
    >
      <div
        className="relative max-w-5xl mx-auto bg-card border-nb border-[color:var(--color-border)] px-4 py-3 flex justify-between items-center rounded-nb"
        style={{ boxShadow: 'var(--nb-shadow)' }}
      >
        <NavLink
          to="/"
          className="text-xl font-heading font-bold text-primary"
          aria-label="Rishabh Agrawal - Home page"
        >
          <span className="bg-fun-yellow px-2 py-1 border-2 border-[color:var(--color-border)] rounded-nb">
            &lt;Rishabh /&gt;
          </span>
        </NavLink>

        <div className="hidden md:flex gap-1 md:gap-2">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 text-sm font-heading font-semibold transition-all duration-200 border-2 rounded-nb
                ${isActive
                  ? 'bg-fun-yellow text-black border-[color:var(--color-border)] -rotate-1'
                  : 'text-primary border-transparent hover:border-[color:var(--color-border)] hover:bg-secondary nb-shadow-lift'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                    boxShadow: 'inset 2px 2px 0 var(--color-border)',
                    transform: 'translateY(1px) rotate(-1deg)',
                  }
                  : { boxShadow: 'var(--nb-shadow)' }
              }
            >
              <span className="hidden lg:inline" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Cursor Toggle and Mobile Menu container */}
        <div className="flex items-center gap-2">
          {/* Cursor Toggle Button */}
          <button
            type="button"
            onClick={onToggleCursor}
            className="group relative hidden md:flex p-2.5 bg-card border-2 border-[color:var(--color-border)] text-primary transition-all duration-200 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed motion-reduce:transform-none motion-reduce:transition-none rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
            aria-pressed={cursorEnabled}
            aria-label={cursorToggleLabel}
            disabled={cursorToggleDisabled}
          >
            <MousePointer2 size={18} aria-hidden="true" />

            {/* Tooltip */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans">
              {cursorEnabled ? 'Disable Custom Cursor' : 'Enable Custom Cursor'}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            ref={menuButtonRef}
            className="md:hidden p-3 bg-card border-2 border-[color:var(--color-border)] text-primary cursor-pointer rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
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

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-nav-menu"
              initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }}
              className="absolute right-4 top-full mt-3 w-64 bg-card border-nb border-[color:var(--color-border)] md:hidden rounded-nb"
              style={{ boxShadow: 'var(--nb-shadow)' }}
              ref={menuRef}
            >
              <div className="flex flex-col">
                {navItems.map((item, index) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={handleCloseMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-5 py-4 text-base font-heading font-semibold transition-colors duration-200
                      ${index !== navItems.length - 1 ? 'border-b-2 border-[color:var(--color-border)]' : ''}
                      ${isActive ? 'bg-fun-yellow text-black' : 'text-primary hover:bg-secondary'}`
                    }
                  >
                    <span aria-hidden="true">{item.icon}</span>
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
