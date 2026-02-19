/**
 * @fileoverview Neubrutalism 2.0 decorative components.
 *
 * Pure visual flourishes that enhance the NB theme's physical, tactile aesthetic.
 * These are CSS-only — no JS state, minimal DOM, maximum personality.
 */

import React from 'react';
import { joinClasses } from './ThemedPrimitives.utils';
import { useTheme } from './theme-context';

/**
 * Tape strip decoration — a diagonal gradient strip that "tapes" content to the page.
 * Place in a corner of a card or image to add a physical metaphor.
 *
 * @param {'top-left'|'top-right'|'bottom-left'|'bottom-right'} corner - Which corner to tape
 * @param {'yellow'|'pink'|'blue'|'white'} color - Tape color
 */
export const TapeStrip = ({ corner = 'top-right', color = 'yellow', className, style }) => {
    const { theme } = useTheme();
    if (theme === 'liquid') return null;

    const colorMap = {
        yellow: 'bg-fun-yellow',
        pink: 'bg-fun-pink',
        blue: 'bg-accent',
        white: 'bg-white',
    };

    const cornerMap = {
        'top-left': '-left-3 -top-2 -rotate-45',
        'top-right': '-right-3 -top-2 rotate-45',
        'bottom-left': '-left-3 -bottom-2 rotate-45',
        'bottom-right': '-right-3 -bottom-2 -rotate-45',
    };

    return (
        <span
            className={joinClasses(
                'absolute w-16 h-5 border-2 border-[color:var(--color-border)] opacity-90 pointer-events-none z-10',
                colorMap[color] ?? colorMap.yellow,
                cornerMap[corner] ?? cornerMap['top-right'],
                className
            )}
            style={style}
            aria-hidden="true"
        />
    );
};

/**
 * Stamp badge — a rotated bordered badge that looks like an ink approval stamp.
 * Great for "Featured", "New", "Hot" indicators.
 *
 * @param {string} label - Text inside the stamp
 * @param {'yellow'|'pink'|'red'|'blue'} color - Stamp color
 * @param {number} rotate - Rotation in degrees (default: -12)
 */
export const StampBadge = ({ label = 'FEATURED', color = 'red', rotate = -12, className, style }) => {
    const { theme } = useTheme();
    if (theme === 'liquid') return null;

    const colorMap = {
        yellow: 'text-fun-yellow border-fun-yellow',
        pink: 'text-fun-pink border-fun-pink',
        red: 'text-nb-red border-nb-red',
        blue: 'text-nb-blue border-nb-blue',
    };

    return (
        <span
            className={joinClasses(
                'inline-block px-3 py-1.5 font-heading font-black text-xs uppercase tracking-widest border-[3px] border-dashed rounded-none opacity-80',
                colorMap[color] ?? colorMap.red,
                className
            )}
            style={{
                transform: `rotate(${rotate}deg)`,
                ...style,
            }}
            aria-hidden="true"
        >
            {label}
        </span>
    );
};

/**
 * Doodle divider — an SVG hand-drawn wavy or zig-zag line for section separation.
 * Replaces boring <hr> elements with personality.
 *
 * @param {'wavy'|'zigzag'|'scribble'} pattern - Line pattern style
 */
export const DoodleDivider = ({ pattern = 'wavy', className, style }) => {
    const { theme } = useTheme();
    if (theme === 'liquid') return <hr className={joinClasses('border-t border-[color:var(--border-soft)]', className)} style={style} />;

    const svgPaths = {
        wavy: 'M0 10 Q 25 0, 50 10 T 100 10 T 150 10 T 200 10 T 250 10 T 300 10 T 350 10 T 400 10',
        zigzag: 'M0 15 L 20 5 L 40 15 L 60 5 L 80 15 L 100 5 L 120 15 L 140 5 L 160 15 L 180 5 L 200 15 L 220 5 L 240 15 L 260 5 L 280 15 L 300 5 L 320 15 L 340 5 L 360 15 L 380 5 L 400 15',
        scribble: 'M0 10 C 20 2, 40 18, 60 10 S 100 2, 120 10 S 160 18, 180 10 S 220 2, 240 10 S 280 18, 300 10 S 340 2, 360 10 S 400 18, 400 10',
    };

    return (
        <div className={joinClasses('w-full py-4', className)} style={style} role="separator" aria-hidden="true">
            <svg viewBox="0 0 400 20" className="w-full h-5" preserveAspectRatio="none">
                <path
                    d={svgPaths[pattern] ?? svgPaths.wavy}
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
