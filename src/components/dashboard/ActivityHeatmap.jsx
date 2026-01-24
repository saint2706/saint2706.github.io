import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext';

const GITHUB_USERNAME = 'saint2706';

/**
 * ActivityHeatmap - GitHub-style contribution grid
 * Uses GitHub contributions API to fetch actual contribution data
 */
const ActivityHeatmap = () => {
    const { isDark } = useTheme();
    const shouldReduceMotion = useReducedMotion();
    const [activityData, setActivityData] = useState(null);
    const [totalContributions, setTotalContributions] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContributions = async () => {
            try {
                // Use the GitHub contributions API (public, no auth required)
                const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`);
                const data = await response.json();

                if (data && data.contributions) {
                    // Get the last 140 days (20 weeks)
                    const contributions = data.contributions;
                    const recentContributions = contributions.slice(-140);

                    const days = recentContributions.map(contrib => ({
                        date: new Date(contrib.date),
                        count: contrib.count || 0,
                    }));

                    setActivityData(days);
                    setTotalContributions(data.total?.lastYear || contributions.reduce((sum, c) => sum + c.count, 0));
                } else {
                    throw new Error('No contribution data');
                }
            } catch (error) {
                console.error('Failed to fetch contributions:', error);

                // Fallback: Try alternative API
                try {
                    const altResponse = await fetch(`https://github-contributions.vercel.app/api/v1/${GITHUB_USERNAME}`);
                    const altData = await altResponse.json();

                    if (altData && altData.contributions) {
                        const flatContribs = altData.contributions.flat().slice(-140);
                        const days = flatContribs.map(contrib => ({
                            date: new Date(contrib.date),
                            count: contrib.count || 0,
                        }));
                        setActivityData(days);
                        setTotalContributions(altData.total || 0);
                    } else {
                        throw new Error('Alt API failed');
                    }
                } catch (altError) {
                    console.error('Alt API also failed:', altError);
                    // Generate empty grid as last resort
                    const today = new Date();
                    const weeks = 20;
                    const days = [];

                    for (let w = weeks - 1; w >= 0; w--) {
                        for (let d = 0; d < 7; d++) {
                            const date = new Date(today);
                            date.setDate(date.getDate() - (w * 7 + (6 - d)));
                            days.push({ date, count: 0 });
                        }
                    }
                    setActivityData(days);
                    setTotalContributions(0);
                }
            } finally {
                setLoading(false);
            }
        };

        if (isDark) {
            fetchContributions();
        }
    }, [isDark]);

    // Only render in dark mode
    if (!isDark) return null;

    if (loading) {
        return (
            <div className="glass-panel p-6 rounded-glass flex items-center justify-center gap-2 text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading contributions...</span>
            </div>
        );
    }

    // Graduated coloring based on contribution count - using purple accent scheme
    const getColor = (count) => {
        if (count === 0) return 'bg-glass-bg';
        if (count <= 3) return 'bg-accent/30';
        if (count <= 6) return 'bg-accent/50';
        if (count <= 9) return 'bg-accent/70';
        return 'bg-accent';
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

    return (
        <div className="glass-panel p-6 rounded-glass">
            <h3 className="text-lg font-heading font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Contribution Activity
            </h3>
            <p className="text-xs text-muted mb-4">{totalContributions.toLocaleString()} contributions in the last year</p>

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
                                        delay: shouldReduceMotion ? 0 : (weekIndex * 7 + dayIndex) * 0.003,
                                        duration: 0.1,
                                    }}
                                    className={`w-3 h-3 rounded-sm ${getColor(day.count)} border border-glass-border transition-all hover:scale-150 hover:z-10 cursor-pointer`}
                                    title={`${formatDate(day.date)}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
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
