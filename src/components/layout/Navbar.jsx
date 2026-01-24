import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Terminal,
  User,
  Briefcase,
  FileText,
  Mail,
  Menu,
  X,
  Sun,
  Moon,
  MousePointer2,
} from 'lucide-react';
import { useTheme } from '../shared/ThemeContext';

const Navbar = ({
  cursorEnabled,
  cursorToggleDisabled,
  cursorToggleLabel,
  onToggleCursor,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastFocus, setLastFocus] = useState(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const { theme, toggleTheme, isDark } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  // Close chatbot when mobile menu opens
  useEffect(() => {
    if (isMenuOpen) {
      document.dispatchEvent(new CustomEvent('closeChatbot'));
    }
  }, [isMenuOpen]);

  // Trap focus inside mobile menu when open
  const trapFocus = useCallback((event) => {
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
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      setLastFocus(document.activeElement);
      const main = document.getElementById('main-content');
      if (main) main.setAttribute('aria-hidden', 'true');
      document.addEventListener('keydown', trapFocus);
      setTimeout(() => menuRef.current?.querySelector('a, button')?.focus(), 0);
    } else {
      const main = document.getElementById('main-content');
      if (main) main.removeAttribute('aria-hidden');
      document.removeEventListener('keydown', trapFocus);
      lastFocus?.focus?.();
    }
    return () => document.removeEventListener('keydown', trapFocus);
  }, [isMenuOpen, trapFocus, lastFocus]);

  // Listen for close event from chatbot
  useEffect(() => {
    const handleCloseMobileMenu = () => setIsMenuOpen(false);
    document.addEventListener('closeMobileMenu', handleCloseMobileMenu);
    return () => document.removeEventListener('closeMobileMenu', handleCloseMobileMenu);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: <Terminal size={18} /> },
    { name: 'Projects', path: '/projects', icon: <Briefcase size={18} /> },
    { name: 'Resume', path: '/resume', icon: <User size={18} /> },
    { name: 'Blog', path: '/blog', icon: <FileText size={18} /> },
    { name: 'Contact', path: '/contact', icon: <Mail size={18} /> },
  ];

  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <motion.nav
      initial={shouldReduceMotion ? false : { y: -100 }}
      animate={{ y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : undefined}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:py-6"
    >
      <div
        className="relative max-w-4xl mx-auto bg-card border-[3px] border-[color:var(--color-border)] px-6 py-3 flex justify-between items-center"
        style={{ boxShadow: 'var(--nb-shadow)' }}
      >
        <NavLink
          to="/"
          className="text-xl font-heading font-bold text-primary"
          aria-label="Rishabh Agrawal - Home page"
        >
          <span className="bg-fun-yellow px-2 py-1 border-2 border-[color:var(--color-border)]">
            &lt;Rishabh /&gt;
          </span>
        </NavLink>

        <div className="hidden md:flex gap-1 md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-sm font-heading font-semibold transition-all duration-200 border-2
                ${isActive
                  ? 'bg-fun-yellow text-black border-[color:var(--color-border)]'
                  : 'text-primary border-transparent hover:border-[color:var(--color-border)] hover:bg-secondary'
                }`
              }
              style={({ isActive }) => isActive ? { boxShadow: '2px 2px 0 var(--color-border)' } : {}}
            >
              <span className="hidden lg:inline" aria-hidden="true">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Theme Toggle and Mobile Menu container */}
        <div className="flex items-center gap-2">
          {/* Cursor Toggle Button */}
          <button
            type="button"
            onClick={onToggleCursor}
            className="group relative hidden md:flex items-center gap-2 px-3 py-2 bg-card border-2 border-[color:var(--color-border)] text-primary transition-all duration-200 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed motion-reduce:transform-none motion-reduce:transition-none"
            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            aria-pressed={cursorEnabled}
            disabled={cursorToggleDisabled}
            title={cursorToggleLabel}
          >
            <MousePointer2 size={18} aria-hidden="true" />
            <span className="text-xs font-heading font-semibold">
              Cursor: {cursorEnabled ? 'On' : 'Off'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="group relative p-2.5 bg-card border-2 border-[color:var(--color-border)] text-primary transition-all duration-200 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <motion.div
              key={theme}
              initial={shouldReduceMotion ? false : { rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.div>

            {/* Tooltip */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            ref={menuButtonRef}
            className="md:hidden p-3 bg-card border-2 border-[color:var(--color-border)] text-primary cursor-pointer"
            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
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
              className="absolute right-4 top-full mt-3 w-64 bg-card border-[3px] border-[color:var(--color-border)] md:hidden"
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
