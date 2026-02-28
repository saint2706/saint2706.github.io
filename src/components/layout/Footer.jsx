/**
 * @fileoverview Footer component displaying social links, copyright information,
 * and a hidden easter egg.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../shared/theme-context';
import { Github, Linkedin, Coffee, Heart } from 'lucide-react';
import ScrollReveal from '../shared/ScrollReveal';
import ZigzagDivider from '../shared/ZigzagDivider';
import MarqueeTicker from '../shared/MarqueeTicker';
import { resumeData } from '../../data/resume';

/**
 * Footer component with social links, attribution, and easter egg
 */
const Footer = () => {
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';

  const [heartClicks, setHeartClicks] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimeoutRef = useRef(null);
  const HEARTS_REQUIRED = 5;

  /** Handle easter egg heart clicks */
  const handleHeartClick = useCallback(() => {
    const next = heartClicks + 1;
    setHeartClicks(next);
    if (next >= HEARTS_REQUIRED && !showSecret) {
      setShowSecret(true);
      setShowConfetti(true);
      clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [heartClicks, showSecret]);

  useEffect(() => () => clearTimeout(confettiTimeoutRef.current), []);

  /** Pre-generate confetti particle styles (only computed once on mount) */
  const [confettiParticles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      x: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      color: ['#ffd54f', '#9c0e4b', '#0052cc', '#ff5252', '#4caf50'][i % 5],
      rotation: `${Math.random() * 360}deg`,
      duration: `${1.5 + Math.random() * 1.5}s`,
    }))
  );

  const linkedInUrl = resumeData.basics.socials.find(s => s.network === 'LinkedIn')?.url;
  const githubUrl = resumeData.basics.socials.find(s => s.network === 'GitHub')?.url;

  // Helper to switch classes based on theme
  const themeClass = (neubClass, liquidClass) => (isLiquid ? liquidClass : neubClass);

  return (
    <footer
      className={themeClass(
        'mt-20 bg-primary relative overflow-hidden',
        'mt-20 relative overflow-hidden lg-ambient-bg'
      )}
    >
      {/* Zigzag divider */}
      <ZigzagDivider
        variant={isLiquid ? 'gradient' : 'zigzag'}
        className={isLiquid ? 'opacity-80' : ''}
      />

      {/* Marquee Ticker */}
      <MarqueeTicker
        variant={isLiquid ? 'liquid' : 'neub'}
        useBlurBand={isLiquid}
        bgColor="bg-fun-yellow"
        items={[
          'Python',
          'React',
          'SQL',
          'Tableau',
          'TensorFlow',
          'Machine Learning',
          'Deep Learning',
          'NLP',
          'D3.js',
        ]}
      />

      <div className="py-12">
        {/* CSS Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-20" aria-hidden="true">
            {confettiParticles.map((p, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  '--x': p.x,
                  '--delay': p.delay,
                  '--color': p.color,
                  '--rotation': p.rotation,
                  '--duration': p.duration,
                }}
              />
            ))}
          </div>
        )}

        <ScrollReveal variant="fade-up">
          <div className="max-w-4xl mx-auto px-4">
            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-8">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={themeClass(
                    'group relative p-3 bg-card border-nb border-[color:var(--color-border)] rounded-nb nb-shadow-lift nb-color-invert',
                    'group relative p-3 lg-surface-3 rounded-full lg-spring-hover text-[color:var(--text-primary)]'
                  )}
                  style={
                    isLiquid
                      ? undefined
                      : { boxShadow: 'var(--nb-shadow)', '--invert-text': '#ffffff' }
                  }
                  aria-label="Visit GitHub"
                >
                  <Github size={24} />
                  <span
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans rounded"
                    aria-hidden="true"
                  >
                    GitHub
                  </span>
                </a>
              )}
              {linkedInUrl && (
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={themeClass(
                    'group relative p-3 bg-card border-nb border-[color:var(--color-border)] rounded-nb nb-shadow-lift nb-color-invert',
                    'group relative p-3 lg-surface-3 rounded-full lg-spring-hover text-[color:var(--text-primary)]'
                  )}
                  style={
                    isLiquid
                      ? undefined
                      : { boxShadow: 'var(--nb-shadow)', '--invert-text': '#ffffff' }
                  }
                  aria-label="Visit LinkedIn"
                >
                  <Linkedin size={24} />
                  <span
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans rounded"
                    aria-hidden="true"
                  >
                    LinkedIn
                  </span>
                </a>
              )}
            </div>

            {/* Made with love */}
            <div className="flex justify-center">
              <div
                className={themeClass(
                  'px-6 py-3 bg-fun-yellow border-nb border-[color:var(--color-border)] rounded-nb',
                  'px-6 py-3 lg-surface-3 lg-pill'
                )}
                style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
              >
                <p
                  className={themeClass(
                    'font-heading font-bold text-sm flex items-center justify-center gap-2 text-black',
                    'font-heading font-semibold text-sm flex items-center justify-center gap-2 text-[color:var(--text-secondary)]'
                  )}
                >
                  Made with{' '}
                  <Coffee
                    size={16}
                    className={isLiquid ? 'text-[color:var(--text-secondary)]' : 'text-black'}
                    aria-hidden="true"
                  />
                  +{' '}
                  <button
                    onClick={handleHeartClick}
                    className="group relative inline-flex cursor-pointer transition-transform hover:scale-125 p-0 bg-transparent border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-fun-pink focus-visible:rounded-full"
                    aria-label="Give a like"
                  >
                    <Heart
                      size={16}
                      className={`transition-colors ${showSecret ? 'text-red-500 fill-red-500' : 'text-fun-pink'}`}
                    />
                    <span
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans rounded"
                      aria-hidden="true"
                    >
                      Give a like
                    </span>
                  </button>
                  by {resumeData.basics.name}
                </p>
              </div>
            </div>

            {/* Secret Message */}
            {showSecret && (
              <div className="mt-4 text-center">
                <span
                  className={themeClass(
                    'inline-block px-4 py-2 text-sm font-heading font-bold animate-bounce bg-fun-pink text-white border-2 border-[color:var(--color-border)] rounded-nb',
                    'inline-block px-4 py-2 text-sm font-heading font-semibold animate-bounce lg-surface-3 lg-pill text-[color:var(--text-primary)]'
                  )}
                  style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
                >
                  You found a secret! ❤️
                </span>
              </div>
            )}

            {/* Copyright */}
            <p className="text-[color:var(--color-text-secondary)] font-sans text-sm md:text-xs mt-6 text-center leading-relaxed">
              © {new Date().getFullYear()} All rights reserved.
            </p>

            {/* Hint */}
            <p className="text-[color:var(--color-text-muted)] font-sans text-xs mt-2 text-center">
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-secondary border border-[color:var(--color-border)] rounded text-[10px] font-mono">
                Ctrl+K
              </kbd>{' '}
              to open command palette
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};

export default Footer;
