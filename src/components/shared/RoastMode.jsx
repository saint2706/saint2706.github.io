import React, { useState } from 'react';
import { roastResume } from '../../services/ai';
import { Flame, RefreshCw, X } from 'lucide-react';
import { motion } from 'framer-motion';

const RoastMode = () => {
  const [roast, setRoast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoast = async () => {
    setLoading(true);
    const text = await roastResume();
    setRoast(text);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <div className="relative group">
        <button
          onClick={() => {
            if (roast) setRoast(null);
            else handleRoast();
          }}
          className="p-4 bg-fun-pink text-white rounded-full shadow-lg hover:shadow-fun-pink/50 transition-all duration-300"
          aria-label={roast ? "Close roast" : "Roast my resume"}
        >
          {loading ? (
            <RefreshCw size={28} className="animate-spin" />
          ) : (
            <Flame size={28} />
          )}
        </button>

        {/* Tooltip */}
        {!roast && (
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Roast My Resume
          </span>
        )}

        {/* Roast Popup */}
        {roast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-full right-0 mb-4 w-64 md:w-80 bg-white text-slate-900 p-4 rounded-xl shadow-2xl origin-bottom-right"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-fun-pink flex items-center gap-1">
                <Flame size={16} /> Resume Roasted
              </h4>
              <button
                onClick={() => setRoast(null)}
                className="text-slate-400 hover:text-slate-900 transition-colors"
                aria-label="Close roast"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm italic font-medium leading-relaxed">
              &quot;{roast}&quot;
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoastMode;

