import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GitCommit, GitPullRequest, Star, Users, Loader2 } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext';

const GITHUB_USERNAME = 'saint2706';
const GITHUB_PAT = import.meta.env.VITE_GITHUB_PAT;

/**
 * StatsTicker - A scrolling banner of real GitHub stats for dark mode only
 * Fetches live data from GitHub API with PAT authentication
 */
const StatsTicker = () => {
    const { isDark } = useTheme();
    const shouldReduceMotion = useReducedMotion();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGitHubStats = async () => {
            try {
                const headers = GITHUB_PAT
                    ? { 'Authorization': `Bearer ${GITHUB_PAT}` }
                    : {};

                // Fetch user data
                const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers });
                const userData = await userRes.json();

                // Fetch repos to calculate total stars
                const reposRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, { headers });
                const repos = await reposRes.json();

                const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

                setStats([
                    { label: 'Public Repos', value: userData.public_repos || 0, icon: GitCommit },
                    { label: 'Total Stars', value: totalStars, icon: Star },
                    { label: 'Followers', value: userData.followers || 0, icon: Users },
                    { label: 'Following', value: userData.following || 0, icon: GitPullRequest },
                ]);
            } catch (error) {
                console.error('Failed to fetch GitHub stats:', error);
                // Fallback to cached/estimated values
                setStats([
                    { label: 'Public Repos', value: 30, icon: GitCommit },
                    { label: 'Total Stars', value: 150, icon: Star },
                    { label: 'Followers', value: 50, icon: Users },
                    { label: 'Following', value: 25, icon: GitPullRequest },
                ]);
            } finally {
                setLoading(false);
            }
        };

        if (isDark) {
            fetchGitHubStats();
        }
    }, [isDark]);

    // Only render in dark mode
    if (!isDark) return null;

    if (loading) {
        return (
            <div className="w-full py-4 glass-panel flex items-center justify-center gap-2 text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading GitHub stats...</span>
            </div>
        );
    }

    // Duplicate stats for seamless loop
    const duplicatedStats = [...stats, ...stats];

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
                                {stat.value.toLocaleString()}
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
