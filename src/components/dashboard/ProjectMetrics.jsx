import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, GitFork, Eye, TrendingUp, Loader2 } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext';
import { resumeData } from '../../data/resume';

const GITHUB_USERNAME = 'saint2706';
const GITHUB_PAT = import.meta.env.VITE_GITHUB_PAT;

/**
 * ProjectMetrics - Animated counters for real project stats
 * Fetches live data from GitHub API with PAT authentication
 */
const ProjectMetrics = () => {
    const { isDark } = useTheme();
    const shouldReduceMotion = useReducedMotion();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const headers = GITHUB_PAT
                    ? { 'Authorization': `Bearer ${GITHUB_PAT}` }
                    : {};

                // Fetch repos to get real stats
                const reposRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, { headers });
                const repos = await reposRes.json();

                const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
                const totalForks = repos.reduce((acc, repo) => acc + (repo.forks_count || 0), 0);
                const totalWatchers = repos.reduce((acc, repo) => acc + (repo.watchers_count || 0), 0);

                // Calculate growth (repos created this year)
                const thisYear = new Date().getFullYear();
                const reposThisYear = repos.filter(repo => {
                    const createdYear = new Date(repo.created_at).getFullYear();
                    return createdYear === thisYear;
                }).length;

                setMetrics([
                    { label: 'Total Stars', value: totalStars, icon: Star, color: 'text-fun-yellow' },
                    { label: 'Total Forks', value: totalForks, icon: GitFork, color: 'text-accent' },
                    { label: 'Watchers', value: totalWatchers, icon: Eye, color: 'text-fun-pink' },
                    { label: 'New Repos', value: reposThisYear, suffix: ` in ${thisYear}`, icon: TrendingUp, color: 'text-green-400' },
                ]);
            } catch (error) {
                console.error('Failed to fetch project metrics:', error);
                // Use data from resumeData projects as fallback
                const totalStars = resumeData.projects.reduce((acc, p) => acc + (p.stars || 0), 0);
                setMetrics([
                    { label: 'Project Stars', value: totalStars, icon: Star, color: 'text-fun-yellow' },
                    { label: 'Featured Projects', value: resumeData.projects.filter(p => p.featured).length, icon: GitFork, color: 'text-accent' },
                    { label: 'Total Projects', value: resumeData.projects.length, icon: Eye, color: 'text-fun-pink' },
                    { label: 'Certifications', value: resumeData.certifications.length, icon: TrendingUp, color: 'text-green-400' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        if (isDark) {
            fetchMetrics();
        }
    }, [isDark]);

    // Only render in dark mode
    if (!isDark) return null;

    if (loading) {
        return (
            <div className="glass-panel p-6 rounded-glass flex items-center justify-center gap-2 text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading metrics...</span>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 rounded-glass">
            <h3 className="text-lg font-heading font-bold text-primary mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-fun-yellow rounded-full animate-pulse" />
                Project Metrics
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
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

        const duration = 2000;
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
