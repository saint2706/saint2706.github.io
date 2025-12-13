import React from 'react';
import { motion } from 'framer-motion';

const FloatingIcon = ({ icon, delay, x, y }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0.2, 0.5, 0.2],
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
        }}
        transition={{
            duration: 5,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }}
        className="absolute text-slate-700"
        style={{ left: x, top: y }}
    >
        {icon}
    </motion.div>
);

export default FloatingIcon;
