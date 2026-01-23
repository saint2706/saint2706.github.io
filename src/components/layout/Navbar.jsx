import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
} from 'lucide-react';
import { useTheme } from '../shared/ThemeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  // Close chatbot when mobile menu opens
  useEffect(() => {
    if (isMenuOpen) {
      document.dispatchEvent(new CustomEvent('closeChatbot'));
    }
  }, [isMenuOpen]);

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
      initial={{ y: -100 }}
      animate={{ y: 0 }}
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
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="group relative p-2.5 bg-card border-2 border-[color:var(--color-border)] text-primary transition-all duration-200 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-4 top-full mt-3 w-64 bg-card border-[3px] border-[color:var(--color-border)] md:hidden"
              style={{ boxShadow: 'var(--nb-shadow)' }}
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
