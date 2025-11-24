import React from 'react';
import { motion } from 'framer-motion';

const KujaCounter = ({ days }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="text-center"
      >
        <div className="text-9xl font-bold text-accent font-mono mb-4">
          {days}
        </div>
        <div className="text-2xl md:text-3xl text-text-primary font-bold">
          Days Since Kuja Lost Something
        </div>
      </motion.div>
    </div>
  );
};

export default KujaCounter;
