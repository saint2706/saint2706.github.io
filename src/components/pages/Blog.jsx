import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Tag, Calendar, User, Search } from 'lucide-react';
import blogs from '../../data/blogs.json';

const Blog = () => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique sources for filter
  const sources = ['All', ...new Set(blogs.map(blog => blog.source))];

  const filteredBlogs = blogs.filter(blog => {
    const matchesSource = filter === 'All' || blog.source === filter;
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          blog.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesSearch;
  });

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
            Written Thoughts
          </span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Musings on code, life, and everything in between. Synced from Dev.to, Medium, and Substack.
        </p>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4"
      >
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setFilter(source)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-slate-700
                ${filter === source
                  ? 'bg-accent text-primary font-bold shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                  : 'bg-secondary/50 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {source}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-slate-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredBlogs.map((blog, idx) => (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ y: -5 }}
            className="bg-secondary/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden hover:border-accent/50 transition-colors group flex flex-col h-full"
          >
            {/* Header / Cover */}
            <div className="h-2 bg-gradient-to-r from-accent to-fun-pink opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs px-2 py-1 rounded border font-mono
                  ${blog.source === 'Dev.to' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' :
                    blog.source === 'Medium' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
                    'border-orange-500 text-orange-400 bg-orange-500/10'
                  }`}>
                  {blog.source}
                </span>
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(blog.date).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors line-clamp-2">
                {blog.title}
              </h3>

              <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
                {blog.summary}
              </p>

              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {blog.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto">
                <a
                  href={blog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-white transition-colors"
                >
                  Read on {blog.source} <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredBlogs.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-500">
            No blogs found matching your criteria.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Blog;
