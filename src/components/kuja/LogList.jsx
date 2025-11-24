import React from 'react';
import { motion } from 'framer-motion';

const LogList = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center text-text-secondary py-8">
        No losses recorded yet. A miracle!
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <span>📜</span> The Archives of Loss
      </h3>

      <div className="space-y-4">
        {logs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-bg-secondary border border-border rounded-lg p-4 relative overflow-hidden group hover:border-accent/50 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="text-text-primary font-medium text-lg mb-1">
                  {log.reason}
                </p>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>Witnessed by <span className="text-accent">{log.name}</span></span>
                </div>
              </div>
              <div className="text-xs text-text-tertiary font-mono whitespace-nowrap bg-bg-primary px-2 py-1 rounded">
                {log.timestamp.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LogList;
