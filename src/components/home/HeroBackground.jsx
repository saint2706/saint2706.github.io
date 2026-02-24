/**
 * @fileoverview Background decorative elements for the Hero section.
 * Memoized to prevent re-renders during interactive state changes.
 */

import React from 'react';
import { motion } from 'framer-motion';

const HeroBackground = React.memo(({ isLiquid, shouldReduceMotion }) => {
  if (isLiquid) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[10%] left-[15%] w-64 h-64 md:w-80 md:h-80 rounded-full opacity-60 lg-hero-orb"
          style={{
            background: 'radial-gradient(circle, rgba(0,122,255,0.18) 0%, transparent 70%)',
            animation: 'lg-orb-drift 12s ease-in-out infinite',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute top-[30%] right-[10%] w-56 h-56 md:w-72 md:h-72 rounded-full opacity-50 lg-hero-orb"
          style={{
            background: 'radial-gradient(circle, rgba(175,82,222,0.16) 0%, transparent 70%)',
            animation: 'lg-orb-drift 15s ease-in-out infinite reverse',
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute bottom-[15%] left-[40%] w-48 h-48 md:w-64 md:h-64 rounded-full opacity-40 lg-hero-orb"
          style={{
            background: 'radial-gradient(circle, rgba(255,159,10,0.14) 0%, transparent 70%)',
            animation: 'lg-orb-drift 18s ease-in-out infinite',
            animationDelay: '3s',
            filter: 'blur(45px)',
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
        className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-fun-yellow border-nb border-[color:var(--color-border)] rounded-nb nb-float-bob nb-halftone-bg"
        style={{
          boxShadow: '4px 4px 0 var(--nb-shadow-color-pink)',
          '--sticker-rotate': '3deg',
        }}
      />
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.4 }}
        className="absolute bottom-20 left-20 w-24 h-24 md:w-32 md:h-32 bg-fun-pink border-nb border-[color:var(--color-border)] rounded-nb nb-float-bob"
        style={{
          boxShadow: '4px 4px 0 var(--nb-shadow-color-yellow)',
          '--sticker-rotate': '-2deg',
          animationDelay: '1s',
        }}
      />
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
        className="absolute top-20 right-16 w-20 h-20 md:w-28 md:h-28 bg-accent border-nb border-[color:var(--color-border)] rounded-nb nb-float-bob"
        style={{
          boxShadow: '4px 4px 0 var(--nb-shadow-color-violet)',
          '--sticker-rotate': '5deg',
          animationDelay: '2s',
        }}
      />
    </div>
  );
});

HeroBackground.displayName = 'HeroBackground';

export default HeroBackground;
