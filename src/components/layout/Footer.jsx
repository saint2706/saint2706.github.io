/**
 * @fileoverview Footer component displaying social links, copyright information,
 * and a hidden easter egg.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../shared/theme-context';
import { Github, Linkedin, Coffee, Heart } from 'lucide-react';
import ScrollReveal from '../shared/ScrollReveal';
import ZigzagDivider from '../shared/ZigzagDivider';
import MarqueeTicker from '../shared/MarqueeTicker';

/**
 * Footer component with social links, attribution, and easter egg
 *
 * Features:
 * - Social media links (GitHub, LinkedIn) with hover effects
 * - "Made with coffee + love" badge with neubrutalist styling
 * - Dynamic copyright year
 * - Accessible link labels
 * - Scroll-triggered reveal animation
 * - Easter egg: click Heart icon 5 times for a surprise
 *
 * @component
 * @returns {JSX.Element} Footer with social links and copyright
 */
const Footer = () => {
  const { theme } = useTheme();
  const isAura = theme === 'aura';

  const [heartClicks, setHeartClicks] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const HEARTS_REQUIRED = 5;

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

  /** Handle easter egg heart clicks */
  const handleHeartClick = useCallback(() => {
    const next = heartClicks + 1;
    setHeartClicks(next);
    if (next >= HEARTS_REQUIRED && !showSecret) {
      setShowSecret(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [heartClicks, showSecret]);

  /** Social media links configuration */
  const socialLinks = [
    {
      href: 'https://github.com/saint2706',
      icon: <Github size={24} />,
      label: 'Visit my GitHub profile',
      hoverColor: 'hover:bg-fun-yellow',
    },
    {
      href: 'https://www.linkedin.com/in/rishabh-agrawal-1807321b9',
      icon: <Linkedin size={24} />,
      label: 'Visit my LinkedIn profile',
      hoverColor: 'hover:bg-accent',
    },
  ];

  return (
    <footer className="mt-20 bg-primary relative overflow-hidden">
      {/* Zigzag divider — replaces thin border-top */}
      <ZigzagDivider />

      {/* Tech stack marquee band */}
      <MarqueeTicker
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
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 text-[color:var(--color-text-primary)] nb-color-invert motion-reduce:transform-none motion-reduce:transition-none ${isAura ? 'aura-glass aura-interactive-surface border border-[color:var(--border-soft)] rounded-full hover:brightness-110 hover:scale-[1.01] transition-[filter,transform]' : 'bg-card border-nb border-[color:var(--color-border)] nb-shadow-lift rounded-nb'}`}
                  style={{ boxShadow: isAura ? undefined : 'var(--nb-shadow)', '--invert-text': '#ffffff' }}
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>

            {/* Made with love - Centered */}
            <div className="flex justify-center">
              <div
                className={`px-6 py-3 ${isAura ? 'aura-glass border border-[color:var(--border-soft)] rounded-full' : 'bg-fun-yellow border-nb border-[color:var(--color-border)] rounded-nb'}`}
                style={{ boxShadow: isAura ? undefined : 'var(--nb-shadow)' }}
              >
                <p className={`font-heading font-bold text-sm flex items-center justify-center gap-2 ${isAura ? 'text-[color:var(--text-primary)]' : 'text-black'}`}>
                  Made with <Coffee size={16} className={isAura ? 'text-[color:var(--text-primary)]' : 'text-black'} aria-hidden="true" />
                  <span className="sr-only">coffee</span>+{' '}
                  <button
                    onClick={handleHeartClick}
                    className={`inline-flex cursor-pointer transition-transform motion-reduce:transform-none p-0 bg-transparent border-none ${isAura ? 'hover:scale-105' : 'hover:scale-125'}`}
                    aria-label={
                      showSecret
                        ? 'You found the secret!'
                        : `Click ${HEARTS_REQUIRED - heartClicks} more times for a surprise`
                    }
                  >
                    <Heart
                      size={16}
                      className={`transition-colors ${showSecret ? 'text-red-500 fill-red-500' : 'text-fun-pink'}`}
                      aria-hidden="true"
                    />
                  </button>
                  <span className="sr-only">love</span>
                  by Rishabh Agrawal
                </p>
              </div>
            </div>

            {/* Easter egg secret message */}
            {showSecret && (
              <div className="mt-4 text-center">
                <span
                  className="inline-block bg-fun-pink text-white px-4 py-2 text-sm font-heading font-bold border-2 border-[color:var(--color-border)] rounded-nb animate-bounce"
                  style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                >
                  You found a secret! ❤️ Thanks for clicking around!
                </span>
              </div>
            )}

            {/* Copyright */}
            <p className="text-[color:var(--color-text-secondary)] font-sans text-sm md:text-xs mt-6 text-center leading-relaxed">
              © {new Date().getFullYear()} All rights reserved.
            </p>

            {/* Cmd+K hint */}
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
