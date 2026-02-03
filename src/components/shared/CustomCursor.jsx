import React, { useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';

/**
 * @fileoverview Neubrutalist custom cursor with geometric shapes and bold styling.
 * Adapts appearance based on hover target (clickable, text, card, input).
 */

/**
 * Custom cursor component with neubrutalist design
 *
 * Features:
 * - Bold geometric shapes with thick black borders
 * - Dynamic cursor variants (default, pointer, text, card, input)
 * - Smooth spring physics animation
 * - Shadow/trail element for depth effect
 * - Click ripple animation
 * - Respects reduced motion preference
 * - Auto-disabled on touch devices
 * - Hides native cursor when enabled
 *
 * Cursor Variants:
 * - default: Small square (20x20px, yellow)
 * - pointer: Larger rotated square (32x32px, pink) for clickable elements
 * - text: Thin vertical line (4x28px, blue) for text selection
 * - card: Large square (48x48px, blue) for hovering cards
 * - input: Thin vertical line (3x24px, black) for text inputs
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.enabled - Whether custom cursor is enabled
 * @returns {JSX.Element|null} Custom cursor elements or null if disabled
 */
const CustomCursor = ({ enabled }) => {
  const prefersReducedMotion = useReducedMotion();
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const [cursorVariant, setCursorVariant] = useState('default'); // Current cursor style
  const [isClicking, setIsClicking] = useState(false);

  // Mouse position motion values with spring physics
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Snappy spring for main cursor
  const springConfig = { damping: 30, stiffness: 500, mass: 0.3 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Slower spring for shadow/trail element (creates depth)
  const shadowSpringConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const shadowXSpring = useSpring(cursorX, shadowSpringConfig);
  const shadowYSpring = useSpring(cursorY, shadowSpringConfig);

  /**
   * Update cursor position on mouse move
   */
  const moveCursor = useCallback(
    e => {
      if (!hasMouseMoved) {
        setHasMouseMoved(true);
      }
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    },
    [cursorX, cursorY, hasMouseMoved]
  );

  /**
   * Detect hover target and update cursor style accordingly
   * Checks element type and sets appropriate cursor variant
   */
  const updateCursorVariant = useCallback(e => {
    const target = e.target;

    const isClickable =
      target.matches('a, button, [role="button"], input, textarea, select, [onclick]') ||
      target.closest('a, button, [role="button"]');
    const isText = target.matches('p, span, h1, h2, h3, h4, h5, h6, li, label');
    const isCard = target.closest('[class*="card"], article, [class*="project"]');
    const isInput = target.matches('input, textarea, select');

    if (isInput) {
      setCursorVariant('input');
    } else if (isClickable) {
      setCursorVariant('pointer');
    } else if (isCard) {
      setCursorVariant('card');
    } else if (isText) {
      setCursorVariant('text');
    } else {
      setCursorVariant('default');
    }
  }, []);

  const isEnabled = enabled && !prefersReducedMotion;
  const isVisible = isEnabled && hasMouseMoved;

  // Add/remove CSS class to hide native cursor when custom cursor is enabled
  useEffect(() => {
    const root = document.documentElement;
    if (isEnabled) {
      root.classList.add('custom-cursor-enabled');
    } else {
      root.classList.remove('custom-cursor-enabled');
    }
    return () => root.classList.remove('custom-cursor-enabled');
  }, [isEnabled]);

  // Attach mouse event listeners for cursor behavior
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setHasMouseMoved(false);
    const handleMouseEnter = () => setHasMouseMoved(true);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', updateCursorVariant);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', updateCursorVariant);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isEnabled, moveCursor, updateCursorVariant]);

  if (!isVisible || !isEnabled || prefersReducedMotion) return null;

  /** Cursor size/rotation variants for different hover states */
  const variants = {
    default: {
      width: 20,
      height: 20,
      rotate: 0,
    },
    pointer: {
      width: 32,
      height: 32,
      rotate: 45,
    },
    text: {
      width: 4,
      height: 28,
      rotate: 0,
    },
    card: {
      width: 48,
      height: 48,
      rotate: 0,
    },
    input: {
      width: 3,
      height: 24,
      rotate: 0,
    },
  };

  /** Color mapping for different cursor states (neubrutalist palette) */
  const colorMap = {
    default: '#FFD54F', // fun-yellow
    pointer: '#9C0E4B', // fun-pink
    text: '#0052CC', // accent blue
    card: '#0052CC', // accent blue
    input: '#000000', // black
  };

  const currentColor = colorMap[cursorVariant];
  const currentVariant = variants[cursorVariant];

  return (
    <>
      {/* Hide default cursor */}
      <style>{`
                .custom-cursor-enabled * {
                    cursor: none !important;
                }
            `}</style>

      {/* Shadow/offset element - creates the neubrutalist depth */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{
          x: shadowXSpring,
          y: shadowYSpring,
          translateX: '-50%',
          translateY: '-50%',
          marginLeft: 4,
          marginTop: 4,
        }}
        animate={{
          width: currentVariant.width,
          height: currentVariant.height,
          rotate: currentVariant.rotate,
          opacity: isClicking ? 0 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      >
        <div className="w-full h-full bg-black" style={{ borderRadius: 0 }} />
      </motion.div>

      {/* Main cursor element */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: currentVariant.width,
          height: currentVariant.height,
          rotate: currentVariant.rotate,
          scale: isClicking ? 0.85 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      >
        <div
          className="w-full h-full border-[3px] border-black"
          style={{
            backgroundColor: currentColor,
            borderRadius: 0,
          }}
        />
      </motion.div>

      {/* Center dot for precision */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: cursorVariant === 'text' || cursorVariant === 'input' ? 0 : 6,
          height: cursorVariant === 'text' || cursorVariant === 'input' ? 0 : 6,
          opacity: cursorVariant === 'text' || cursorVariant === 'input' ? 0 : 1,
        }}
      >
        <div className="w-full h-full bg-black border-2 border-white" style={{ borderRadius: 0 }} />
      </motion.div>

      {/* Click ripple effect */}
      {isClicking && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9996] border-[3px] border-black"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: '-50%',
            translateY: '-50%',
            backgroundColor: 'transparent',
            borderRadius: 0,
          }}
          initial={{ width: 20, height: 20, opacity: 1 }}
          animate={{ width: 60, height: 60, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      )}
    </>
  );
};

export default CustomCursor;
