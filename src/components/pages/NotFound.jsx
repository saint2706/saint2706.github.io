/**
 * @fileoverview 404 Not Found page with interactive animations and quick navigation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft, Compass, Rocket, Star, Sparkles, Ghost, Map } from 'lucide-react';
import { resumeData } from '../../data/resume';

/**
 * 404 Not Found page component
 *
 * Features:
 * - Glitchy 404 text animation
 * - Floating ghost icon with easter egg (click 5 times)
 * - Animated background particles
 * - Quick navigation links to main pages
 * - Displays attempted path
 * - Helpful chatbot hint
 *
 * @component
 * @returns {JSX.Element} 404 error page with navigation options
 */
const NotFound = () => {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const [glitchText, setGlitchText] = useState('404');
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [clickCount, setClickCount] = useState(0); // Track ghost clicks for easter egg
  const glitchTimeoutRef = useRef(null);

  // Generate random floating particles for background animation (only once on mount)
  const [particles] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }))
  );

  const title = `404 - Page Not Found | ${resumeData.basics.name}`;
  const description =
    "Oops! The page you're looking for seems to have wandered off into the digital void.";

  // Glitch effect for 404 text (random character substitution)
  useEffect(() => {
    if (shouldReduceMotion) return;

    const glitchChars = '!@#$%^&*()_+{}[]|\\:;"<>?,./~`';
    const interval = setInterval(() => {
      const shouldGlitch = Math.random() > 0.7;
      if (shouldGlitch) {
        const glitched = '404'
          .split('')
          .map(char => {
            if (Math.random() > 0.5) {
              return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
            return char;
          })
          .join('');
        setGlitchText(glitched);
        if (glitchTimeoutRef.current) {
          clearTimeout(glitchTimeoutRef.current);
        }
        glitchTimeoutRef.current = setTimeout(() => {
          setGlitchText('404');
        }, 100);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
      }
    };
  }, [shouldReduceMotion]);

  /**
   * Handle ghost icon click for easter egg
   * Shows message after 5 clicks
   */
  const handleGhostClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 3000);
      setClickCount(0);
    }
  };

  /** Quick navigation links to main pages */
  const quickLinks = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/projects', label: 'Projects', icon: <Rocket size={18} /> },
    { path: '/resume', label: 'Resume', icon: <Map size={18} /> },
    { path: '/contact', label: 'Contact', icon: <Compass size={18} /> },
  ];

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Animated background particles */}
        {!shouldReduceMotion &&
          particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Star size={12} className="text-accent opacity-40" />
            </motion.div>
          ))}

        <div className="max-w-2xl mx-auto text-center relative z-10">
          {/* Main 404 Display */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, type: 'spring' }}
            className="mb-8"
          >
            {/* Ghost icon with easter egg */}
            <motion.div
              onClick={handleGhostClick}
              className="inline-block cursor-pointer mb-6"
              animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: [0, -5, 5, 0] }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              aria-label="Floating ghost icon"
            >
              <div
                className="w-24 h-24 mx-auto bg-fun-yellow border-nb border-[color:var(--color-border)] flex items-center justify-center rounded-nb"
                style={{ boxShadow: 'var(--nb-shadow)' }}
              >
                <Ghost size={48} className="text-black" />
              </div>
            </motion.div>

            {/* Easter egg message */}
            {showEasterEgg && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-1/2 -translate-x-1/2 top-4 bg-fun-pink text-white px-4 py-2 rounded-nb font-heading text-sm"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                <Sparkles size={14} className="inline mr-2" />
                Boo! You found me!
              </motion.div>
            )}

            {/* Glitchy 404 text */}
            <motion.h1
              className="font-heading text-8xl md:text-9xl font-black text-primary tracking-tight select-none"
              style={{
                textShadow: 'var(--nb-shadow)',
              }}
              aria-label="404 Error"
            >
              <span className="relative">
                <span className="relative z-10">{glitchText}</span>
                {/* Glitch layers for dark mode */}
                <span
                  className="absolute inset-0 text-glow-purple opacity-50 -translate-x-1 hidden"
                  aria-hidden="true"
                >
                  {glitchText}
                </span>
                <span
                  className="absolute inset-0 text-glow-pink opacity-50 translate-x-1 hidden"
                  aria-hidden="true"
                >
                  {glitchText}
                </span>
              </span>
            </motion.h1>
          </motion.div>

          {/* Error message */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
            className="mb-8"
          >
            <h2
              className="inline-block font-heading text-2xl md:text-3xl font-bold bg-accent text-white px-6 py-3 border-nb border-[color:var(--color-border)] mb-4 rounded-nb"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              Page Not Found
            </h2>
            <p className="text-secondary text-lg font-sans max-w-md mx-auto mt-4">
              Oops! Looks like this page took a wrong turn somewhere in the digital cosmos.
              {location.pathname && (
                <span className="block mt-2 text-muted text-sm font-mono">
                  Path: <code className="bg-secondary px-2 py-1 rounded">{location.pathname}</code>
                </span>
              )}
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-fun-yellow text-black font-heading font-bold border-nb border-[color:var(--color-border)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none rounded-nb"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              <Home size={20} />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-card text-primary font-heading font-bold border-nb border-[color:var(--color-border)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none rounded-nb"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </motion.div>

          {/* Quick navigation */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.6 }}
            className="bg-card border-nb border-[color:var(--color-border)] p-6 rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          >
            <h3
              className="inline-block font-heading text-lg font-bold bg-fun-pink px-4 py-2 border-nb border-[color:var(--color-border)] mb-6 text-white rounded-nb"
              style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            >
              <Compass size={16} className="inline mr-2" />
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-center gap-2 p-3 bg-secondary border-[3px] border-[color:var(--color-border)] font-heading font-bold text-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:text-white motion-reduce:transform-none motion-reduce:transition-none"
                  style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Fun footer message */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.8 }}
            className="mt-8 text-muted text-sm font-sans flex items-center justify-center gap-2"
          >
            <Sparkles size={14} className="text-fun-yellow" />
            Pro tip: Use the chatbot (Ctrl+K) if you need help navigating!
          </motion.p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
