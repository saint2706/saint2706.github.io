import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Star } from 'lucide-react';
import { resumeData } from '../../data/resume';
import { ProjectSkeleton } from '../shared/SkeletonLoader';

const Projects = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for initial mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="max-w-6xl mx-auto py-12 px-4">
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
        <p className="text-secondary max-w-2xl mx-auto">
          From data science models to full-stack applications. Here is what I have been building.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="status"
        aria-busy={isLoading}
      >
        {/* Skeleton loaders during initial load */}
        {isLoading ? (
          <>
            {[...Array(6)].map((_, idx) => (
              <ProjectSkeleton key={`skeleton-${idx}`} />
            ))}
          </>
        ) : resumeData.projects.map((project, idx) => (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ y: -5 }}
            className="bg-secondary/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden hover:border-accent/50 transition-colors group flex flex-col h-full"
          >
            {/* Project Image or Gradient Placeholder */}
            {project.image ? (
              <div className="relative h-40 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />
              </div>
            ) : (
              <div className="h-3 bg-gradient-to-r from-accent to-fun-pink opacity-50 group-hover:opacity-100 transition-opacity" />
            )}

            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {project.stars && (
                    <span className="flex items-center gap-1 text-xs text-fun-yellow">
                      <Star size={12} className="fill-fun-yellow" />
                      {project.stars}
                    </span>
                  )}
                  {project.featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <p className="text-secondary text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-primary border border-secondary">
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
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors"
                    aria-label={`Live Demo for ${project.title}`}
                  >
                    <ExternalLink size={16} /> Live Demo
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-secondary hover:text-accent transition-colors"
                    aria-label={`View source code for ${project.title}`}
                  >
                    <Github size={16} /> Code
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Projects;

