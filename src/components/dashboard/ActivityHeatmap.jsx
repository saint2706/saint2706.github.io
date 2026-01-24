import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../shared/ThemeContext';

/**
 * ActivityHeatmap - GitHub-style contribution grid
 * Only renders in dark mode for the analytics dashboard aesthetic
 */
const ActivityHeatmap = ({ data }) => {
    const { isDark } = useTheme();
    const shouldReduceMotion = useReducedMotion();

    // Only render in dark mode
    if (!isDark) return null;

    // Generate sample activity data (last 52 weeks, 7 days each)
    const generateActivityData = () => {
        const today = new Date();
        const weeks = 20; // Show 20 weeks for compact display
        const days = [];

        for (let w = weeks - 1; w >= 0; w--) {
            for (let d = 0; d < 7; d++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (w * 7 + (6 - d)));
                days.push({
                    date,
                    count: Math.floor(Math.random() * 10), // Random activity 0-9
                });
            }
        }
        return days;
    };

    const activityData = data || generateActivityData();

    const getColor = (count) => {
        if (count === 0) return 'bg-glass-bg';
        if (count <= 2) return 'bg-accent/30';
        if (count <= 4) return 'bg-accent/50';
        if (count <= 6) return 'bg-accent/70';
        return 'bg-accent';
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const weeks = [];
    for (let i = 0; i < activityData.length; i += 7) {
        weeks.push(activityData.slice(i, i + 7));
    }

    return (
        <div className="glass-panel p-6 rounded-glass">
            <h3 className="text-lg font-heading font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-fun-pink rounded-full animate-pulse" />
                Activity Heatmap
            </h3>

            <div className="overflow-x-auto">
                <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                                <motion.div
                                    key={`${weekIndex}-${dayIndex}`}
                                    initial={shouldReduceMotion ? {} : { scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: shouldReduceMotion ? 0 : (weekIndex * 7 + dayIndex) * 0.01,
                                        duration: 0.2,
                                    }}
                                    className={`w-3 h-3 rounded-sm ${getColor(day.count)} border border-glass-border transition-all hover:scale-150 hover:z-10 cursor-pointer`}
                                    title={`${formatDate(day.date)}: ${day.count} contributions`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-glass-bg border border-glass-border" />
                    <div className="w-3 h-3 rounded-sm bg-accent/30 border border-glass-border" />
                    <div className="w-3 h-3 rounded-sm bg-accent/50 border border-glass-border" />
                    <div className="w-3 h-3 rounded-sm bg-accent/70 border border-glass-border" />
                    <div className="w-3 h-3 rounded-sm bg-accent border border-glass-border" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
