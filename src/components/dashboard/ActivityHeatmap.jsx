import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext';

const GITHUB_USERNAME = 'saint2706';

/**
 * ActivityHeatmap - GitHub-style contribution grid
 * Shows actual commit activity: blank = 0 commits, filled = has commits
 */
const ActivityHeatmap = () => {
    const { isDark } = useTheme();
    const shouldReduceMotion = useReducedMotion();
    const [activityData, setActivityData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommitActivity = async () => {
            try {
                // Fetch push events (commits) from GitHub API
                const eventsRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`);
                const events = await eventsRes.json();

                // Filter for PushEvents and count commits per day
                const commitMap = new Map();

                events.forEach(event => {
                    if (event.type === 'PushEvent') {
                        const date = new Date(event.created_at).toISOString().split('T')[0];
                        // Each PushEvent has payload.commits array with actual commits
                        const commitCount = event.payload?.commits?.length || 1;
                        commitMap.set(date, (commitMap.get(date) || 0) + commitCount);
                    }
                });

                // Generate last 20 weeks of data
                const today = new Date();
                const weeks = 20;
                const days = [];

                for (let w = weeks - 1; w >= 0; w--) {
                    for (let d = 0; d < 7; d++) {
                        const date = new Date(today);
                        date.setDate(date.getDate() - (w * 7 + (6 - d)));
                        const dateStr = date.toISOString().split('T')[0];
                        days.push({
                            date,
                            count: commitMap.get(dateStr) || 0,
                        });
                    }
                }

                setActivityData(days);
            } catch (error) {
                console.error('Failed to fetch commit activity:', error);
                // Empty fallback
                const today = new Date();
                const weeks = 20;
                const days = [];

                for (let w = weeks - 1; w >= 0; w--) {
                    for (let d = 0; d < 7; d++) {
                        const date = new Date(today);
                        date.setDate(date.getDate() - (w * 7 + (6 - d)));
                        days.push({
                            date,
                            count: 0,
                        });
                    }
                }
                setActivityData(days);
            } finally {
                setLoading(false);
            }
        };

        if (isDark) {
            fetchCommitActivity();
        }
    }, [isDark]);

    // Only render in dark mode
    if (!isDark) return null;

    if (loading) {
        return (
            <div className="glass-panel p-6 rounded-glass flex items-center justify-center gap-2 text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading commit activity...</span>
            </div>
        );
    }

    // Binary coloring: blank for 0, filled for >0
    const getColor = (count) => {
        return count === 0 ? 'bg-glass-bg' : 'bg-accent';
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    };

    const weeks = [];
    for (let i = 0; i < activityData.length; i += 7) {
        weeks.push(activityData.slice(i, i + 7));
    }

    // Calculate total commits
    const totalCommits = activityData.reduce((sum, day) => sum + day.count, 0);

    return (
        <div className="glass-panel p-6 rounded-glass">
            <h3 className="text-lg font-heading font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-fun-pink rounded-full animate-pulse" />
                Commit Activity
            </h3>
            <p className="text-xs text-muted mb-4">{totalCommits} commits in the last 20 weeks</p>

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
                                        delay: shouldReduceMotion ? 0 : (weekIndex * 7 + dayIndex) * 0.005,
                                        duration: 0.15,
                                    }}
                                    className={`w-3 h-3 rounded-sm ${getColor(day.count)} border border-glass-border transition-all hover:scale-150 hover:z-10 cursor-pointer`}
                                    title={`${formatDate(day.date)}: ${day.count} commit${day.count !== 1 ? 's' : ''}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                <span>No commits</span>
                <div className="w-3 h-3 rounded-sm bg-glass-bg border border-glass-border" />
                <div className="w-3 h-3 rounded-sm bg-accent border border-glass-border" />
                <span>Has commits</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
