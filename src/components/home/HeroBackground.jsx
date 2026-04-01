/**
 * @fileoverview Background decorative elements for the Hero section.
 * Memoized to prevent re-renders during interactive state changes.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../shared/theme-context';

// ⚡ Bolt: Static liquid background styles extracted
const orb1Style = {
  background: 'radial-gradient(circle, rgba(0,122,255,0.18) 0%, transparent 70%)',
  animation: 'lg-orb-drift 12s ease-in-out infinite',
  filter: 'blur(40px)',
};

const orb2Style = {
  background: 'radial-gradient(circle, rgba(175,82,222,0.16) 0%, transparent 70%)',
  animation: 'lg-orb-drift 15s ease-in-out infinite reverse',
  filter: 'blur(50px)',
};

const orb3Style = {
  background: 'radial-gradient(circle, rgba(255,159,10,0.14) 0%, transparent 70%)',
  animation: 'lg-orb-drift 18s ease-in-out infinite',
  animationDelay: '3s',
  filter: 'blur(45px)',
};

// ⚡ Bolt: Static motion animation props extracted
const initialXLeft = { opacity: 0, x: -50 };
const animateX0 = { opacity: 1, x: 0 };
const transitionBob1 = { duration: 0.6, delay: 0.2 };

const initialYDown = { opacity: 0, y: 50 };
const animateY0 = { opacity: 1, y: 0 };
const transitionBob2 = { duration: 0.6, delay: 0.4 };

const initialXRight = { opacity: 0, x: 50 };
const transitionBob3 = { duration: 0.6, delay: 0.3 };

// ⚡ Bolt: Static style generators extracted
const yellowBobStyleLight = {
  boxShadow: '4px 4px 0 var(--nb-shadow-color-pink)',
  '--sticker-rotate': '3deg',
};
const yellowBobStyleDark = {
  boxShadow: '5px 5px 0 var(--nb-shadow-color-pink), 0 0 32px rgba(255, 61, 120, 0.2)',
  '--sticker-rotate': '3deg',
};

const pinkBobStyleLight = {
  boxShadow: '4px 4px 0 var(--nb-shadow-color-yellow)',
  '--sticker-rotate': '-2deg',
  animationDelay: '1s',
};
const pinkBobStyleDark = {
  boxShadow: '5px 5px 0 var(--nb-shadow-color-yellow), 0 0 24px rgba(255, 224, 51, 0.2)',
  '--sticker-rotate': '-2deg',
  animationDelay: '1s',
};

const violetBobStyleLight = {
  boxShadow: '4px 4px 0 var(--nb-shadow-color-violet)',
  '--sticker-rotate': '5deg',
  animationDelay: '2s',
};
const violetBobStyleDark = {
  boxShadow: '5px 5px 0 var(--nb-shadow-color-violet), 0 0 20px rgba(191, 90, 242, 0.22)',
  '--sticker-rotate': '5deg',
  animationDelay: '2s',
};

/**
 * HeroBackground Component
 *
 * Provides a dynamic, themed background for the Hero section.
 * Adapts to 'liquid' (animated gradients and glassmorphism), 'neubrutalism' (solid colors and bold shapes),
 * and 'neubrutalism-dark' (vibrant shapes with atmospheric glow effects) themes.
 * Uses Framer Motion for subtle entry animations.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isLiquid - True if the active theme is liquid.
 * @param {boolean} props.shouldReduceMotion - True if the user prefers reduced motion.
 * @returns {React.ReactElement} The animated hero background component.
 */
const HeroBackground = React.memo(({ isLiquid, shouldReduceMotion }) => {
  const { theme } = useTheme();
  const isNBDark = theme === 'neubrutalism-dark';

  if (isLiquid) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[10%] left-[15%] w-64 h-64 md:w-80 md:h-80 rounded-full opacity-60 lg-hero-orb"
          style={orb1Style}
        />
        <div
          className="absolute top-[30%] right-[10%] w-56 h-56 md:w-72 md:h-72 rounded-full opacity-50 lg-hero-orb"
          style={orb2Style}
        />
        <div
          className="absolute bottom-[15%] left-[40%] w-48 h-48 md:w-64 md:h-64 rounded-full opacity-40 lg-hero-orb"
          style={orb3Style}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        initial={shouldReduceMotion ? false : initialXLeft}
        animate={animateX0}
        transition={shouldReduceMotion ? { duration: 0 } : transitionBob1}
        className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-fun-yellow border-nb border-[color:var(--color-border)] rounded-nb nb-float-bob nb-halftone-bg"
        style={isNBDark ? yellowBobStyleDark : yellowBobStyleLight}
      />
      <motion.div
        initial={shouldReduceMotion ? false : initialYDown}
        animate={animateY0}
        transition={shouldReduceMotion ? { duration: 0 } : transitionBob2}
        className="absolute bottom-20 left-20 w-24 h-24 md:w-32 md:h-32 bg-fun-pink border-nb border-[color:var(--color-border)] rounded-nb nb-float-bob"
        style={isNBDark ? pinkBobStyleDark : pinkBobStyleLight}
      />
      <motion.div
        initial={shouldReduceMotion ? false : initialXRight}
        animate={animateX0}
        transition={shouldReduceMotion ? { duration: 0 } : transitionBob3}
        className="absolute top-20 right-16 w-20 h-20 md:w-28 md:h-28 bg-accent border-nb border-[color:var(--color-border)] rounded-nb nb-float-bob"
        style={isNBDark ? violetBobStyleDark : violetBobStyleLight}
      />
    </div>
  );
});

HeroBackground.displayName = 'HeroBackground';

/** @type {React.NamedExoticComponent} */
export default HeroBackground;
