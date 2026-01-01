import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import blogs from '../../data/blogs.json';
import { resumeData } from '../../data/resume';
import { BlogSkeleton } from '../shared/SkeletonLoader';

const POSTS_PER_PAGE = 6;

const Blog = () => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const canonicalUrl = `${resumeData.basics.website}/blog`;
  const description = 'Read articles on analytics, product thinking, and the intersection of data and creativity.';
  const title = `Blog | ${resumeData.basics.name}`;

  // Extract unique sources for filter
  const sources = ['All', ...new Set(blogs.map(blog => blog.source))];

  // Helper function to format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredBlogs = useMemo(() => {
    return blogs
      .filter(blog => {
        const matchesSource = filter === 'All' || blog.source === filter;
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.summary.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSource && matchesSearch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort newest first
  }, [filter, searchTerm]);

  // Reset to page 1 and show loading when filters change
  useEffect(() => {
    setCurrentPage(1);
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [filter, searchTerm]);

  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

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

  // Source color helper
  const getSourceStyles = (source) => {
    switch (source) {
      case 'Dev.to':
        return 'border-indigo-500 text-indigo-400 bg-indigo-500/10';
      case 'Medium':
        return 'border-yellow-500 text-yellow-400 bg-yellow-500/10';
      case 'Substack':
        return 'border-orange-500 text-orange-400 bg-orange-500/10';
      default:
        return 'border-slate-500 text-slate-400 bg-slate-500/10';
    }
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={description} />
        <meta name="author" content={resumeData.basics.name} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={resumeData.basics.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:site" content={resumeData.basics.name} />
        <meta name="twitter:creator" content={resumeData.basics.name} />
      </Helmet>
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
          <p className="text-secondary max-w-2xl mx-auto">
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
          <div
            className="flex flex-wrap gap-2 justify-center md:justify-start"
            role="group"
            aria-label="Filter blogs by source"
          >
            {sources.map(source => (
              <button
                key={source}
                onClick={() => setFilter(source)}
                aria-pressed={filter === source}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                  ${filter === source
                    ? 'bg-accent text-primary font-bold shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                    : 'bg-secondary/50 text-secondary hover:text-primary hover:bg-secondary'
                  }`}
              >
                {source}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
            <label htmlFor="blog-search" className="sr-only">Search blogs</label>
            <input
              id="blog-search"
              type="text"
              aria-label="Search blogs"
              placeholder="Search blogs..."
              value={searchTerm}
              maxLength={100}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary border border-slate-700 dark:border-slate-600 rounded-full py-2 pl-10 pr-4 text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50 transition-colors"
            />
          </div>
        </motion.div>

        <motion.div
          key={currentPage} // Re-animate on page change
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="status"
          aria-busy={isLoading}
        >
          {/* Skeleton loaders during filtering */}
          {isLoading ? (
            <>
              {[...Array(6)].map((_, idx) => (
                <BlogSkeleton key={`skeleton-${idx}`} />
              ))}
            </>
          ) : paginatedBlogs.map((blog, idx) => (
            <motion.div
              key={`${blog.title}-${idx}`}
              variants={item}
              whileHover={{ y: -5 }}
              className="bg-secondary/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden hover:border-accent/50 transition-colors group flex flex-col h-full"
            >
              {/* Header / Cover */}
              {blog.coverImage ? (
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  loading="lazy"
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-2 bg-gradient-to-r from-accent to-fun-pink opacity-50 group-hover:opacity-100 transition-opacity" />
              )}

              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs px-2 py-1 rounded border font-mono ${getSourceStyles(blog.source)}`}>
                    {blog.source}
                  </span>
                  <span className="text-muted text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(blog.date)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-secondary text-sm mb-4 line-clamp-3 flex-grow">
                  {blog.summary}
                </p>

                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {blog.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-secondary">
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
            <div
              className="col-span-full text-center py-20 text-slate-500"
              role="status"
            >
              No blogs found matching your criteria.
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center gap-4 mt-12"
            role="navigation"
            aria-label="Pagination"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
              className="flex items-center gap-1 px-4 py-2 bg-secondary/50 border border-secondary rounded-lg text-secondary hover:text-accent hover:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-300
                    ${page === currentPage
                      ? 'bg-accent text-primary'
                      : 'bg-secondary/50 text-secondary hover:text-accent border border-secondary hover:border-accent/50'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
              className="flex items-center gap-1 px-4 py-2 bg-secondary/50 border border-secondary rounded-lg text-secondary hover:text-accent hover:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Results info */}
        {filteredBlogs.length > 0 && (
          <p className="text-center text-muted text-sm mt-6">
            Showing {(currentPage - 1) * POSTS_PER_PAGE + 1}-{Math.min(currentPage * POSTS_PER_PAGE, filteredBlogs.length)} of {filteredBlogs.length} posts
          </p>
        )}
      </div>
    </>
  );
};

export default Blog;
