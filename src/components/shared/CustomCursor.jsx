import React, { useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';

/**
 * Neubrutalist Custom Cursor
 * - Bold geometric shapes with thick black borders
 * - Sharp corners (no rounded edges)
 * - High contrast solid colors
 * - Playful offset shadow effect
 */
const CustomCursor = ({ enabled }) => {
    const prefersReducedMotion = useReducedMotion();
    const [isVisible, setIsVisible] = useState(false);
    const [cursorVariant, setCursorVariant] = useState('default');
    const [isClicking, setIsClicking] = useState(false);

    // Mouse position with snappy spring physics
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 30, stiffness: 500, mass: 0.3 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    // Slower spring for the shadow/trail element
    const shadowSpringConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const shadowXSpring = useSpring(cursorX, shadowSpringConfig);
    const shadowYSpring = useSpring(cursorY, shadowSpringConfig);

    // Handle mouse movement
    const moveCursor = useCallback((e) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
    }, [cursorX, cursorY]);

    // Detect hover target and update cursor style
    const updateCursorVariant = useCallback((e) => {
        const target = e.target;

        const isClickable = target.matches('a, button, [role="button"], input, textarea, select, [onclick]') ||
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

    // Manage document class for hiding native cursor
    useEffect(() => {
        const root = document.documentElement;
        if (isEnabled) {
            root.classList.add('custom-cursor-enabled');
        } else {
            root.classList.remove('custom-cursor-enabled');
        }
        return () => root.classList.remove('custom-cursor-enabled');
    }, [isEnabled]);

    // Attach event listeners
    useEffect(() => {
        if (!isEnabled) {
            setIsVisible(false);
            return;
        }

        setIsVisible(true);

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);
        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

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

    // Neubrutalist cursor variants - bold, geometric, high contrast
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

    // Color mapping for different states
    const colorMap = {
        default: '#FFD54F', // fun-yellow
        pointer: '#9C0E4B', // fun-pink
        text: '#0052CC',    // accent blue
        card: '#0052CC',    // accent blue
        input: '#000000',   // black
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
                <div
                    className="w-full h-full bg-black"
                    style={{ borderRadius: 0 }}
                />
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
                <div
                    className="w-full h-full bg-black border-2 border-white"
                    style={{ borderRadius: 0 }}
                />
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
