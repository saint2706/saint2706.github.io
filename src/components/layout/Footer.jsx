/**
 * @fileoverview Footer component displaying social links, copyright information,
 * and a hidden easter egg.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../shared/theme-context';
import { Github, Linkedin, Coffee, Heart, Grid } from 'lucide-react';
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
  const HEARTS_REQUIRED = 5;

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

  if (isLiquid) {
    return (
      <footer className="bg-ios-bg-1 pt-24 pb-24 border-t border-black/[0.08]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col gap-2 items-center md:items-start">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 bg-ios-dark rounded-[8px] flex items-center justify-center text-white">
                  <Grid size={18} />
                </div>
                <span className="text-[15px] font-bold tracking-tight uppercase text-ios-dark">System Audit</span>
              </div>
              <p className="text-[14px] font-semibold text-ios-gray tracking-tight">
                © {new Date().getFullYear()} {resumeData.basics.name}. Designed for accessibility and performance.
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <nav aria-label="Footer Navigation" className="flex flex-wrap justify-center items-center gap-2">
                <a className="touch-target flex items-center justify-center px-6 text-[15px] font-bold text-ios-gray hover:text-ios-dark transition-colors" href="#">Archive</a>
                <a className="touch-target flex items-center justify-center px-6 text-[15px] font-bold text-ios-gray hover:text-ios-dark transition-colors" href="#">Methodology</a>
                <a className="touch-target flex items-center justify-center px-6 text-[15px] font-bold text-ios-gray hover:text-ios-dark transition-colors" href="#">Privacy</a>
              </nav>
              <div className="flex items-center gap-4">
                {linkedInUrl && (
                  <a aria-label="Connect on LinkedIn" className="touch-target flex items-center justify-center w-[48px] h-[48px] text-ios-gray hover:text-ios-dark transition-all hover:scale-110" href={linkedInUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="size-6 fill-current" />
                  </a>
                )}
                {githubUrl && (
                  <a aria-label="View on GitHub" className="touch-target flex items-center justify-center w-[48px] h-[48px] text-ios-gray hover:text-ios-dark transition-all hover:scale-110" href={githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="size-6 fill-current" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Original Neubrutalism Footer
  return (
    <footer className="mt-20 bg-primary relative overflow-hidden">
      <ZigzagDivider variant="zigzag" />

      <MarqueeTicker
        variant="neub"
        bgColor="bg-fun-yellow"
        items={[
          'Python', 'React', 'SQL', 'Tableau', 'TensorFlow', 'Machine Learning', 'Deep Learning', 'NLP', 'D3.js',
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
            <div className="flex justify-center gap-4 mb-8">
               {githubUrl && (
                 <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-card border-nb border-[color:var(--color-border)] rounded-nb nb-shadow-lift nb-color-invert" style={{ boxShadow: 'var(--nb-shadow)', '--invert-text': '#ffffff' }} aria-label="Visit GitHub">
                    <Github size={24} />
                 </a>
               )}
               {linkedInUrl && (
                 <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-card border-nb border-[color:var(--color-border)] rounded-nb nb-shadow-lift nb-color-invert" style={{ boxShadow: 'var(--nb-shadow)', '--invert-text': '#ffffff' }} aria-label="Visit LinkedIn">
                    <Linkedin size={24} />
                 </a>
               )}
            </div>

            <div className="flex justify-center">
              <div className="px-6 py-3 bg-fun-yellow border-nb border-[color:var(--color-border)] rounded-nb" style={{ boxShadow: 'var(--nb-shadow)' }}>
                <p className="font-heading font-bold text-sm flex items-center justify-center gap-2 text-black">
                  Made with <Coffee size={16} className="text-black" aria-hidden="true" />
                  + <button onClick={handleHeartClick} className="inline-flex cursor-pointer transition-transform hover:scale-125 p-0 bg-transparent border-none">
                    <Heart size={16} className={`transition-colors ${showSecret ? 'text-red-500 fill-red-500' : 'text-fun-pink'}`} />
                  </button>
                  by {resumeData.basics.name}
                </p>
              </div>
            </div>

            {showSecret && (
              <div className="mt-4 text-center">
                <span className="inline-block px-4 py-2 text-sm font-heading font-bold animate-bounce bg-fun-pink text-white border-2 border-[color:var(--color-border)] rounded-nb" style={{ boxShadow: '2px 2px 0 var(--color-border)' }}>
                  You found a secret! ❤️
                </span>
              </div>
            )}

            <p className="text-[color:var(--color-text-secondary)] font-sans text-sm md:text-xs mt-6 text-center leading-relaxed">
              © {new Date().getFullYear()} All rights reserved.
            </p>

            <p className="text-[color:var(--color-text-muted)] font-sans text-xs mt-2 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-secondary border border-[color:var(--color-border)] rounded text-[10px] font-mono">Ctrl+K</kbd> to open command palette
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};

export default Footer;
