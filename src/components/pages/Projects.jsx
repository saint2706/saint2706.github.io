import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Star } from 'lucide-react';
import { resumeData } from '../../data/resume';

const Projects = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-fun-pink">
            Creative Experiments
          </span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          From data science models to full-stack applications. Here is what I have been building.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {resumeData.projects.map((project, idx) => (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ y: -5 }}
            className="bg-secondary/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden hover:border-accent/50 transition-colors group flex flex-col h-full"
          >
            {/* Project Header (could be an image placeholder if no image) */}
            <div className="h-3 bg-gradient-to-r from-accent to-fun-pink opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                {project.featured && (
                   <Star size={16} className="text-fun-yellow fill-fun-yellow" />
                )}
              </div>

              <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-auto">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-white hover:text-accent transition-colors"
                  >
                    <ExternalLink size={16} /> Live Demo
                  </a>
                )}
                {/* Assuming all might have a github link derived or explicit */}
                {/* <a href="#" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <Github size={16} /> Code
                </a> */}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Projects;
