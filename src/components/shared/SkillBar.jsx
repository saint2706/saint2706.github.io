import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Animated skill progress bar component
 * @param {Object} props
 * @param {string} props.name - Skill name
 * @param {number} props.proficiency - Skill proficiency level (0-100)
 * @param {number} props.delay - Animation delay in seconds
 */
const SkillBar = ({ name, proficiency, delay = 0 }) => {
    const id = useId();
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
                <span id={id} className="text-sm font-medium text-primary">{name}</span>
                <span className="text-xs font-mono text-muted" aria-hidden="true">{proficiency}%</span>
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
                    initial={shouldReduceMotion ? false : { width: 0 }}
                    whileInView={{ width: `${proficiency}%` }}
                    viewport={{ once: true, margin: "-50px" }}
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
