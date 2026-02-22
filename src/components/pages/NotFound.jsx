/**
 * @fileoverview 404 Not Found page with interactive animations and quick navigation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import SEOHead from '../shared/SEOHead';
import { Home, ArrowLeft, Compass, Rocket, Star, Sparkles, Ghost, Map } from 'lucide-react';
import ThemedButton from '../shared/ThemedButton';
import ThemedCard from '../shared/ThemedCard';
import ThemedChip from '../shared/ThemedChip';
import { useTheme } from '../shared/theme-context';

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
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const [glitchText, setGlitchText] = useState('404');
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [clickCount, setClickCount] = useState(0); // Track ghost clicks for easter egg
  const glitchTimeoutRef = useRef(null);

  // 🕵️ Console easter egg for curious developers who inspect the 404 page
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.log(
      '%c🕵️ SECRET AGENT MODE ACTIVATED',
      'background: #9c0e4b; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 16px;'
    );
    console.log(
      "%cYou found the 404 page AND opened DevTools? You're clearly a person of taste.\nTry pressing Ctrl+K for a surprise, or type the Konami Code anywhere on the site!",
      'color: #ffd54f; font-size: 12px; line-height: 1.6;'
    );
  }, []);

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

  const themeClass = (neubClass, liquidClass) => (isLiquid ? liquidClass : neubClass);

  return (
    <>
      <SEOHead
        title="Page Not Found | Rishabh Agrawal"
        description="The page you're looking for doesn't exist. Navigate back to explore the portfolio."
        path={location.pathname}
        noindex
      />

      <div
        className={themeClass(
          'min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden',
          'min-h-[80vh] flex items-center justify-center px-4 py-14 relative overflow-hidden'
        )}
      >
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

        <section
          className={themeClass(
            'max-w-2xl mx-auto text-center relative z-10',
            'max-w-3xl mx-auto text-center relative z-10 lg-surface-2 rounded-[2rem] px-6 py-8 md:px-10 md:py-10'
          )}
        >
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
              <ThemedCard
                className={themeClass(
                  'w-24 h-24 mx-auto bg-fun-yellow border-nb border-[color:var(--color-border)] flex items-center justify-center rounded-nb',
                  'w-24 h-24 mx-auto lg-surface-2 flex items-center justify-center rounded-3xl'
                )}
                style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
              >
                <Ghost size={48} className="text-black" />
              </ThemedCard>
            </motion.div>

            {/* Easter egg message */}
            {showEasterEgg && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={themeClass(
                  'absolute left-1/2 -translate-x-1/2 top-4 bg-fun-pink text-white px-4 py-2 rounded-nb font-heading text-sm',
                  'absolute left-1/2 -translate-x-1/2 top-4 lg-surface-3 lg-pill px-4 py-2 rounded-full font-heading text-sm text-[color:var(--text-primary)]'
                )}
                style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                <Sparkles size={14} className="inline mr-2" />
                Boo! You found me!
              </motion.div>
            )}

            {/* Glitchy 404 text */}
            <motion.h1
              className="font-heading text-8xl md:text-9xl font-black text-primary tracking-tight select-none"
              style={isLiquid ? undefined : { textShadow: 'var(--nb-shadow)' }}
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
            <ThemedChip
              as="h2"
              variant="accent"
              className={themeClass(
                'inline-block font-heading text-2xl md:text-3xl font-bold px-6 py-3 mb-4 rounded-nb text-white',
                'inline-flex font-heading text-2xl md:text-3xl font-semibold px-6 py-3 mb-4 rounded-full text-[color:var(--text-primary)]'
              )}
              style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
            >
              Page Not Found
            </ThemedChip>
            <p className="text-secondary text-lg font-sans max-w-md mx-auto mt-4">
              Oops! Looks like this page took a wrong turn somewhere in the digital cosmos.
              {location.pathname && (
                <span className="block mt-3 text-[color:var(--text-secondary)] text-sm font-mono">
                  Path:{' '}
                  <code
                    className={themeClass(
                      'bg-secondary px-2 py-1 rounded text-[color:var(--text-primary)]',
                      'lg-surface-3 lg-pill px-2.5 py-1 rounded-md text-[color:var(--text-primary)]'
                    )}
                  >
                    {location.pathname}
                  </code>
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
            <ThemedButton
              as={Link}
              to="/"
              size="lg"
              variant="primary"
              className={themeClass(
                'inline-flex items-center gap-2 px-8 py-4 rounded-nb',
                'inline-flex items-center gap-2 px-8 py-4 rounded-full liquid-button-primary border border-[color:var(--border-soft)] focus-visible:ring-[color:var(--accent-soft)] focus-visible:ring-offset-0'
              )}
              style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
            >
              <Home size={20} />
              Go Home
            </ThemedButton>
            <ThemedButton
              onClick={() => window.history.back()}
              size="lg"
              variant="secondary"
              className={themeClass(
                'inline-flex items-center gap-2 px-8 py-4 rounded-nb',
                'inline-flex items-center gap-2 px-8 py-4 rounded-full lg-surface-3 lg-pill focus-visible:ring-[color:var(--accent-soft)] focus-visible:ring-offset-0'
              )}
              style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
            >
              <ArrowLeft size={20} />
              Go Back
            </ThemedButton>
          </motion.div>

          {/* Quick navigation */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.6 }}
          >
            <ThemedCard
              className={themeClass(
                'bg-card border-nb border-[color:var(--color-border)] p-6 rounded-nb',
                'lg-surface-2 p-6 rounded-3xl'
              )}
              style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
            >
              <ThemedChip
                as="h3"
                variant="pink"
                className={themeClass(
                  'inline-block font-heading text-lg font-bold px-4 py-2 mb-6 text-white rounded-nb',
                  'inline-flex font-heading text-lg font-semibold px-4 py-2 mb-6 rounded-full text-[color:var(--text-primary)]'
                )}
                style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                <Compass size={16} className="inline mr-2" />
                Quick Navigation
              </ThemedChip>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickLinks.map(link => (
                  <ThemedButton
                    key={link.path}
                    as={Link}
                    to={link.path}
                    variant="subtle"
                    className={themeClass(
                      'flex items-center justify-center gap-2 p-3 font-heading font-bold text-sm rounded-nb bg-secondary hover:bg-accent hover:text-white',
                      'flex items-center justify-center gap-2 p-3 font-heading font-semibold text-sm rounded-full lg-surface-3 lg-pill text-[color:var(--text-primary)] focus-visible:ring-[color:var(--accent-soft)] focus-visible:ring-offset-0'
                    )}
                    style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
                  >
                    {link.icon}
                    {link.label}
                  </ThemedButton>
                ))}
              </div>
            </ThemedCard>
          </motion.div>

          {/* Fun footer message */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.8 }}
            className="mt-8 text-[color:var(--text-secondary)] text-sm font-sans flex items-center justify-center gap-2"
          >
            <Sparkles size={14} className="text-fun-yellow" />
            Pro tip: Use the chatbot (Ctrl+K) if you need help navigating!
          </motion.p>
        </section>
      </div>
    </>
  );
};

export default NotFound;
