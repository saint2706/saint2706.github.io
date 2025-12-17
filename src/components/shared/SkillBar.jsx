import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated skill progress bar component
 * @param {Object} props
 * @param {string} props.name - Skill name
 * @param {number} props.proficiency - Skill proficiency level (0-100)
 * @param {number} props.delay - Animation delay in seconds
 */
const SkillBar = ({ name, proficiency, delay = 0 }) => {
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-slate-200">{name}</span>
                <span className="text-xs font-mono text-slate-400">{proficiency}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-fun-pink"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${proficiency}%` }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                        duration: 0.8,
                        delay: delay,
                        ease: "easeOut"
                    }}
                />
            </div>
        </div>
    );
};

export default SkillBar;
