import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, GitFork, Eye, TrendingUp } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext';

/**
 * ProjectMetrics - Animated counters for project stats
 * Only renders in dark mode for the analytics dashboard aesthetic
 */
const ProjectMetrics = ({ metrics }) => {
    const { isDark } = useTheme();
    const shouldReduceMotion = useReducedMotion();

    // Only render in dark mode
    if (!isDark) return null;

    const defaultMetrics = metrics || [
        { label: 'Stars', value: 127, icon: Star, color: 'text-fun-yellow' },
        { label: 'Forks', value: 34, icon: GitFork, color: 'text-accent' },
        { label: 'Views', value: 2840, icon: Eye, color: 'text-fun-pink' },
        { label: 'Growth', value: 23, suffix: '%', icon: TrendingUp, color: 'text-green-400' },
    ];

    return (
        <div className="glass-panel p-6 rounded-glass">
            <h3 className="text-lg font-heading font-bold text-primary mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-fun-yellow rounded-full animate-pulse" />
                Project Metrics
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {defaultMetrics.map((metric, index) => (
                    <MetricCard
                        key={metric.label}
                        metric={metric}
                        index={index}
                        shouldReduceMotion={shouldReduceMotion}
                    />
                ))}
            </div>
        </div>
    );
};

const MetricCard = ({ metric, index, shouldReduceMotion }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (shouldReduceMotion) {
            setCount(metric.value);
            return;
        }

        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = metric.value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= metric.value) {
                setCount(metric.value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [metric.value, shouldReduceMotion]);

    return (
        <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="bg-glass-bg border border-glass-border rounded-glass p-4 hover:shadow-glow-purple transition-shadow cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-glass bg-glass-highlight ${metric.color}`}>
                    <metric.icon size={20} />
                </div>
                <div>
                    <p className="text-2xl font-heading font-bold text-primary">
                        {count.toLocaleString()}{metric.suffix || ''}
                    </p>
                    <p className="text-xs text-muted">{metric.label}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectMetrics;
