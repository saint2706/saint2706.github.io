/**
 * @fileoverview Animated skill progress bar component with gradient fill.
 * Displays skill proficiency with animated progress bar that fills on viewport entry.
 */

import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Animated skill progress bar component
 * 
 * Features:
 * - Animated progress bar fill on scroll into view
 * - Gradient color (accent blue to pink)
 * - Respects reduced motion preference
 * - ARIA progressbar role for accessibility
 * - Unique ID generation for label association
 * - Configurable animation delay for staggered appearance
 * 
 * @component
 * @param {Object} props
 * @param {string} props.name - Skill name
 * @param {number} props.proficiency - Skill proficiency level (0-100)
 * @param {number} [props.delay=0] - Animation delay in seconds
 * @returns {JSX.Element} Animated progress bar with label
 */
const SkillBar = ({ name, proficiency, delay = 0 }) => {
    const id = useId();
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
                <span id={id} className="text-sm font-medium text-primary">{name}</span>
                <span className="text-sm md:text-xs font-sans text-secondary" aria-hidden="true">{proficiency}%</span>
            </div>
            <div
                className="h-2 bg-slate-800 rounded-full overflow-hidden"
                role="progressbar"
                aria-labelledby={id}
                aria-valuenow={proficiency}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${proficiency}% proficiency`}
            >
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-fun-pink"
                    initial={
                        shouldReduceMotion
                            ? { width: `${proficiency}%` }
                            : { width: 0 }
                    }
                    animate={
                        shouldReduceMotion
                            ? { width: `${proficiency}%` }
                            : undefined
                    }
                    whileInView={
                        shouldReduceMotion
                            ? undefined
                            : { width: `${proficiency}%` }
                    }
                    viewport={
                        shouldReduceMotion
                            ? undefined
                            : { once: true, margin: "-50px" }
                    }
                    transition={{
                        duration: shouldReduceMotion ? 0 : 0.8,
                        delay: shouldReduceMotion ? 0 : delay,
                        ease: "easeOut"
                    }}
                />
            </div>
        </div>
    );
};

export default SkillBar;
