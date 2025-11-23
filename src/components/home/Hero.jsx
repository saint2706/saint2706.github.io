import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Code2, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="min-h-[80vh] relative flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 relative inline-block"
      >
        <span className="absolute -inset-1 bg-gradient-to-r from-accent to-fun-pink rounded-full blur opacity-25 animate-pulse"></span>
        <div className="relative bg-secondary/50 backdrop-blur border border-slate-700 rounded-full px-4 py-1 text-sm font-mono text-accent">
          Available for hire & collaborations
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
      >
        <span className="block text-white mb-2">Data Storyteller</span>
        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-accent via-fun-pink to-fun-yellow">
          & Creative Analyst
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
      >
        I bridge the gap between
        <strong className="text-white mx-1">Computer Science</strong>
        and
        <strong className="text-white mx-1">Business Strategy</strong>.
        Currently decoding patterns at Goa Institute of Management.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col md:flex-row gap-4 justify-center"
      >
        <Link
          to="/projects"
          className="group relative px-8 py-3 bg-accent text-primary font-bold rounded-lg hover:bg-white transition-all duration-300 flex items-center gap-2"
        >
          View Projects
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <button
          onClick={() => document.getElementById('ai-chat-trigger')?.click()}
          className="px-8 py-3 border border-slate-700 text-white rounded-lg hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
        >
          <Bot size={18} className="text-fun-pink" />
          Talk to Digital Rishabh
        </button>
      </motion.div>

      {/* Floating Icons Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
        <FloatingIcon icon={<Database size={30} />} delay={0} x="10%" y="20%" />
        <FloatingIcon icon={<Code2 size={30} />} delay={2} x="85%" y="15%" />
        <FloatingIcon icon={<Bot size={30} />} delay={4} x="15%" y="80%" />
      </div>
    </div>
  );
};

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

export default Hero;
