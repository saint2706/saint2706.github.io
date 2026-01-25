import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';
import { useTheme } from './ThemeContext';

/**
 * Interactive custom cursor with spotlight effect.
 * - Follows the mouse with smooth spring animation
 * - Changes size/color when hovering interactive elements
 * - Creates a spotlight that reveals hidden text
 * - Only shows on devices with pointer (no touch)
 */
const CustomCursor = ({ enabled }) => {
    const prefersReducedMotion = useReducedMotion();
    const { isDark, isLight } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [cursorVariant, setCursorVariant] = useState('default');
    const [cursorColor, setCursorColor] = useState('rgba(56, 189, 248, 0.5)'); // accent color
    const cursorRef = useRef(null);

    // Mouse position with spring physics for smooth following
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    // Handle mouse movement
    const moveCursor = useCallback((e) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
    }, [cursorX, cursorY]);

    // Build theme palette from CSS variables
    const themeColors = useMemo(() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);

        const hexToRgba = (hex, alpha = 1) => {
            let h = hex.trim();
            if (!h) return `rgba(0,0,0,${alpha})`;
            if (h.startsWith('#')) h = h.slice(1);
            if (h.length === 3) {
                h = h.split('').map(c => c + c).join('');
            }
            const r = parseInt(h.slice(0, 2), 16);
            const g = parseInt(h.slice(2, 4), 16);
            const b = parseInt(h.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const accent = styles.getPropertyValue('--color-accent') || '#3b82f6';
        const funPink = styles.getPropertyValue('--color-fun-pink') || '#ec4899';
        const funYellow = styles.getPropertyValue('--color-fun-yellow') || '#fbbf24';
        const textPrimary = styles.getPropertyValue('--color-text-primary') || (isDark ? '#f8fafc' : '#000000');
        const textMuted = styles.getPropertyValue('--color-text-muted') || (isDark ? '#64748b' : '#666666');
        const glow = styles.getPropertyValue('--glow-color') || 'rgba(139, 92, 246, 0.4)';

        return {
            accent,
            funPink,
            funYellow,
            textPrimary,
            textMuted,
            glow,
            accentAlpha: (a) => hexToRgba(accent, a),
            funPinkAlpha: (a) => hexToRgba(funPink, a),
            funYellowAlpha: (a) => hexToRgba(funYellow, a),
            textPrimaryAlpha: (a) => hexToRgba(textPrimary, a),
            textMutedAlpha: (a) => hexToRgba(textMuted, a),
        };
    }, [isDark]);

    // Detect hover target and update cursor style
    const updateCursorVariant = useCallback((e) => {
        const target = e.target;


        // Check for interactive elements
        const isClickable = target.matches('a, button, [role="button"], input, textarea, select, [onclick]') ||
            target.closest('a, button, [role="button"]');
        const isText = target.matches('p, span, h1, h2, h3, h4, h5, h6, li');
        const isCard = target.closest('[class*="card"], article, [class*="project"]');
        const isImage = target.matches('img, [class*="image"], [class*="avatar"]');

        // Choose color based on theme-specific palette (set via CSS vars)
        if (isClickable) {
            setCursorVariant('pointer');
            setCursorColor(themeColors.funPinkAlpha(0.6));
        } else if (isImage) {
            setCursorVariant('zoom');
            setCursorColor(themeColors.funYellowAlpha(0.5));
        } else if (isCard) {
            setCursorVariant('card');
            setCursorColor(themeColors.accentAlpha(0.4));
        } else if (isText) {
            setCursorVariant('text');
            setCursorColor(themeColors.textMutedAlpha(0.3));
        } else {
            setCursorVariant('default');
            setCursorColor(themeColors.accentAlpha(isDark ? 0.5 : 0.35));
        }
    }, [isDark, themeColors]);

    const isEnabled = enabled && !prefersReducedMotion;

    // Manage document class so we only hide the native cursor when enabled
    useEffect(() => {
        const root = document.documentElement;
        if (isEnabled) {
            root.classList.add('custom-cursor-enabled');
        } else {
            root.classList.remove('custom-cursor-enabled');
        }
        return () => root.classList.remove('custom-cursor-enabled');
    }, [isEnabled]);

    // Only attach listeners when enabled
    useEffect(() => {
        if (!isEnabled) {
            setIsVisible(false);
            return;
        }

        setIsVisible(true);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', updateCursorVariant);

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', updateCursorVariant);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isEnabled, moveCursor, updateCursorVariant]);

    // Don't render when disabled or on touch/reduced-motion
    if (!isVisible || !isEnabled || prefersReducedMotion) return null;

    const blendDefault = isLight ? 'difference' : 'screen';
    const variants = {
        default: {
            width: 32,
            height: 32,
            backgroundColor: cursorColor,
            mixBlendMode: blendDefault,
        },
        pointer: {
            width: 48,
            height: 48,
            backgroundColor: cursorColor,
            mixBlendMode: 'normal',
        },
        text: {
            width: 4,
            height: 24,
            backgroundColor: themeColors.accentAlpha(isDark ? 0.9 : 0.8),
            borderRadius: '2px',
            mixBlendMode: 'normal',
        },
        card: {
            width: 64,
            height: 64,
            backgroundColor: 'transparent',
            border: `2px solid ${cursorColor}`,
            mixBlendMode: 'normal',
        },
        zoom: {
            width: 56,
            height: 56,
            backgroundColor: cursorColor,
            mixBlendMode: blendDefault,
        },
    };

    return (
        <>
                        {/* Hide default cursor only when enabled */}
                        <style>{`
                .custom-cursor-enabled * {
                    cursor: none !important;
                }
            `}</style>

            {/* Main cursor dot */}
            <motion.div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={cursorVariant}
                variants={variants}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            />

            {/* Spotlight/trail effect */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: 120,
                    height: 120,
                    background: `radial-gradient(circle, ${cursorColor.replace(/rgba\((.*?)\s*,\s*([0-9]*\.?[0-9]+)\)/, (m, rgb) => `rgba(${rgb}, ${isDark ? 0.12 : 0.15})`)} 0%, transparent 70%)`,
                }}
                animate={{
                    scale: cursorVariant === 'pointer' ? 1.5 : 1,
                    opacity: cursorVariant === 'text' ? 0 : (isDark ? 0.7 : 0.8),
                }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            />

            {/* Inner dot for precision */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[10000] rounded-full bg-white"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: 4,
                    height: 4,
                    backgroundColor: themeColors.textPrimary,
                }}
                animate={{
                    scale: cursorVariant === 'pointer' ? 0 : 1,
                    opacity: cursorVariant === 'text' ? 0 : 1,
                }}
            />
        </>
    );
};

export default CustomCursor;
