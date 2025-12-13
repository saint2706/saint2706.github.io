import React, { useState } from 'react';
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
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="relative max-w-4xl mx-auto bg-secondary/80 backdrop-blur-md border border-slate-700 rounded-full px-6 py-3 flex justify-between items-center shadow-lg shadow-blue-500/10">
        <NavLink to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-fun-pink font-mono">
          &lt;Rishabh /&gt;
        </NavLink>

        <div className="hidden md:flex gap-1 md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${isActive
                  ? 'bg-accent/20 text-accent shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="hidden md:inline">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          className="md:hidden p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-4 top-full mt-3 w-64 rounded-2xl bg-secondary/95 border border-slate-700 shadow-lg shadow-blue-500/10 backdrop-blur-md md:hidden"
            >
              <div className="flex flex-col divide-y divide-white/5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={handleCloseMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-5 py-4 text-base font-medium transition-colors duration-200
                      ${isActive ? 'text-accent bg-accent/10' : 'text-slate-200 hover:text-white hover:bg-white/5'}`
                    }
                  >
                    <span>{item.icon}</span>
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
