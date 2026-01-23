import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';

/**
 * Interactive custom cursor with spotlight effect.
 * - Follows the mouse with smooth spring animation
 * - Changes size/color when hovering interactive elements
 * - Creates a spotlight that reveals hidden text
 * - Only shows on devices with pointer (no touch)
 */
const CURSOR_STORAGE_KEY = 'custom_cursor_enabled';

const CustomCursor = () => {
    const prefersReducedMotion = useReducedMotion();
    const [isVisible, setIsVisible] = useState(false);
    const [cursorVariant, setCursorVariant] = useState('default');
    const [cursorColor, setCursorColor] = useState('rgba(56, 189, 248, 0.5)'); // accent color
    const [isEnabled, setIsEnabled] = useState(false);
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

    // Detect hover target and update cursor style
    const updateCursorVariant = useCallback((e) => {
        const target = e.target;


        // Check for interactive elements
        const isClickable = target.matches('a, button, [role="button"], input, textarea, select, [onclick]') ||
            target.closest('a, button, [role="button"]');
        const isText = target.matches('p, span, h1, h2, h3, h4, h5, h6, li');
        const isCard = target.closest('[class*="card"], article, [class*="project"]');
        const isImage = target.matches('img, [class*="image"], [class*="avatar"]');

        // Get background color to determine cursor color


        if (isClickable) {
            setCursorVariant('pointer');
            setCursorColor('rgba(236, 72, 153, 0.6)'); // fun-pink
        } else if (isImage) {
            setCursorVariant('zoom');
            setCursorColor('rgba(234, 179, 8, 0.5)'); // fun-yellow
        } else if (isCard) {
            setCursorVariant('card');
            setCursorColor('rgba(56, 189, 248, 0.4)'); // accent
        } else if (isText) {
            setCursorVariant('text');
            setCursorColor('rgba(148, 163, 184, 0.3)'); // secondary text
        } else {
            setCursorVariant('default');
            setCursorColor('rgba(56, 189, 248, 0.5)'); // accent
        }
    }, []);

    // Load preference and respect motion preference / coarse pointers
    useEffect(() => {
        const hasPointer = window.matchMedia('(pointer: fine)').matches;
        const stored = localStorage.getItem(CURSOR_STORAGE_KEY);
        const shouldEnable = hasPointer && !prefersReducedMotion && stored !== 'false';
        setIsEnabled(shouldEnable);
    }, [prefersReducedMotion]);

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
        if (!isEnabled) return;

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

    const handleToggle = useCallback((next) => {
        const value = typeof next === 'boolean' ? next : !isEnabled;
        setIsEnabled(value);
        localStorage.setItem(CURSOR_STORAGE_KEY, value ? 'true' : 'false');
    }, [isEnabled]);

    // Allow external toggle (e.g., from a settings button)
    useEffect(() => {
        const handler = (event) => {
            const requested = event.detail?.enabled;
            handleToggle(typeof requested === 'boolean' ? requested : !isEnabled);
        };
        document.addEventListener('customCursorToggle', handler);
        return () => document.removeEventListener('customCursorToggle', handler);
    }, [handleToggle, isEnabled]);

    // Don't render when disabled or on touch/reduced-motion
    if (!isVisible || !isEnabled || prefersReducedMotion) return null;

    const variants = {
        default: {
            width: 32,
            height: 32,
            backgroundColor: cursorColor,
            mixBlendMode: 'difference',
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
            backgroundColor: 'rgba(56, 189, 248, 0.8)',
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
            mixBlendMode: 'difference',
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
                    background: `radial-gradient(circle, ${cursorColor.replace('0.5', '0.15')} 0%, transparent 70%)`,
                }}
                animate={{
                    scale: cursorVariant === 'pointer' ? 1.5 : 1,
                    opacity: cursorVariant === 'text' ? 0 : 0.8,
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
