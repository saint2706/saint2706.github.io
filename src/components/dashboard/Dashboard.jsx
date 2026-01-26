import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { StatsTicker, SkillRadar, ActivityHeatmap, ProjectMetrics } from './index';

const Dashboard = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
      className="mt-16 w-full max-w-4xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-heading font-bold text-primary flex items-center justify-center gap-2">
          <span className="w-3 h-3 bg-accent rounded-full animate-glow-pulse" />
          Live Analytics Dashboard
        </h2>
        <p className="text-sm text-muted mt-2">Real-time metrics and activity visualization</p>
      </div>

      <div className="mb-6">
        <StatsTicker />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SkillRadar />
        <div className="space-y-6">
          <ProjectMetrics />
          <ActivityHeatmap />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
