import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GitCommit, GitPullRequest, Star, Users } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext';

/**
 * StatsTicker - A scrolling banner of GitHub stats for dark mode only
 * Creates a premium analytics dashboard aesthetic
 */
const StatsTicker = ({ stats }) => {
    const { isDark } = useTheme();
    const shouldReduceMotion = useReducedMotion();

    // Only render in dark mode
    if (!isDark) return null;

    const defaultStats = stats || [
        { label: 'Commits', value: '500+', icon: GitCommit },
        { label: 'Pull Requests', value: '50+', icon: GitPullRequest },
        { label: 'Repositories', value: '30+', icon: Star },
        { label: 'Followers', value: '100+', icon: Users },
    ];

    // Duplicate stats for seamless loop
    const duplicatedStats = [...defaultStats, ...defaultStats];

    return (
        <div className="w-full overflow-hidden py-4 glass-panel">
            <motion.div
                className="flex gap-12 whitespace-nowrap"
                animate={shouldReduceMotion ? {} : { x: ['0%', '-50%'] }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            >
                {duplicatedStats.map((stat, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 px-6 py-2"
                    >
                        <div className="p-2 rounded-glass bg-glass-bg border border-glass-border">
                            <stat.icon size={20} className="text-accent" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-heading font-bold text-primary">
                                {stat.value}
                            </span>
                            <span className="text-sm text-muted">
                                {stat.label}
                            </span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default StatsTicker;
