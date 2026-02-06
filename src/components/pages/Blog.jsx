/**
 * @fileoverview Blog listing page with filtering, search, and pagination.
 * Displays blog posts from multiple sources (Dev.to, Medium, Substack).
 */

import React, { useState, useMemo, useDeferredValue } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ExternalLink,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  FileQuestion,
  BookOpen,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import blogs from '../../data/blogs.json';
import { resumeData } from '../../data/resume';
import { safeJSONStringify } from '../../utils/security';

/** Number of blog posts to display per page */
const POSTS_PER_PAGE = 6;

/**
 * Blog listing page component
 *
 * Features:
 * - Filter by source (Dev.to, Medium, Substack, All)
 * - Real-time search with deferred value for performance
 * - Pagination with keyboard navigation
 * - Responsive card grid layout
 * - Pre-computed search strings for O(1) filtering
 * - Dynamic color coding by source
 *
 * @component
 * @returns {JSX.Element} Blog listing page with filters and posts
 */
const Blog = () => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm); // Deferred for better UX during typing
  const [currentPage, setCurrentPage] = useState(1);
  const shouldReduceMotion = useReducedMotion();
  const canonicalUrl = `${resumeData.basics.website}/blog`;
  const description =
    'Read articles on analytics, product thinking, and the intersection of data and creativity.';
  const title = `Blog | ${resumeData.basics.name}`;

  /**
   * Pre-process blogs once on mount for performance optimization
   * - Pre-computes lowercase search strings to avoid repeated toLowerCase() calls
   * - Pre-parses dates for efficient sorting
   * - Sorts by date descending
   */
  const processedBlogs = useMemo(() => {
    return blogs
      .map(blog => ({
        ...blog,
        // Pre-compute lowercase search string to avoid O(N) .toLowerCase() calls during filtering
        searchStr: `${blog.title} ${blog.summary}`.toLowerCase(),
        // Pre-parse date for sorting
        parsedDate: new Date(blog.date),
      }))
      .sort((a, b) => b.parsedDate - a.parsedDate);
  }, []);

  /** Extract unique blog sources for filter buttons */
  const sources = ['All', ...new Set(processedBlogs.map(blog => blog.source))];

  /**
   * Format date string to DD/MM/YYYY format
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Filter and search blogs based on current filter and search term
   * Uses pre-computed search strings for optimal performance
   */
  const filteredBlogs = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.toLowerCase();

    // Use pre-processed list which is already sorted
    return processedBlogs.filter(blog => {
      const matchesSource = filter === 'All' || blog.source === filter;

      // Early return to skip string search if source doesn't match
      if (!matchesSource) return false;

      // Use pre-computed search string
      if (!normalizedSearch) return true;
      return blog.searchStr.includes(normalizedSearch);
    });
  }, [filter, deferredSearchTerm, processedBlogs]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  // Animation variants for stagger effect
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        duration: shouldReduceMotion ? 0 : undefined,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion ? { duration: 0 } : undefined,
    },
  };

  /**
   * Get background color class for blog source badge
   * @param {string} source - Blog source name
   * @returns {string} Tailwind background color class
   */
  const getSourceColor = source => {
    switch (source) {
      case 'Dev.to':
        return 'bg-accent';
      case 'Medium':
        return 'bg-fun-yellow';
      case 'Substack':
        return 'bg-fun-pink';
      default:
        return 'bg-secondary';
    }
  };

  /**
   * Get text color class for blog source badge
   * @param {string} source - Blog source name
   * @returns {string} Tailwind text color class
   */
  const getSourceTextColor = source => {
    switch (source) {
      case 'Medium':
        return 'text-black';
      default:
        return 'text-white';
    }
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={description} />
        <script type="application/ld+json">
          {safeJSONStringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: resumeData.basics.website,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: canonicalUrl,
              },
            ],
          })}
        </script>
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
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="mb-12 text-center"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            <span
              className="inline-block bg-fun-pink text-white px-6 py-3 border-[3px] border-[color:var(--color-border)]"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              Written Thoughts
            </span>
          </h1>
          <p className="text-secondary max-w-2xl mx-auto mt-6 font-sans">
            Musings on code, life, and everything in between. Synced from Dev.to, Medium, and
            Substack.
          </p>
        </motion.div>

        {/* Filters and Search - Neubrutalism Style */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
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
                onClick={() => {
                  setFilter(source);
                  setCurrentPage(1);
                }}
                aria-pressed={filter === source}
                className={`px-4 py-2 font-heading font-bold text-sm transition-transform border-[3px] border-[color:var(--color-border)] cursor-pointer motion-reduce:transform-none motion-reduce:transition-none
                  ${
                    filter === source
                      ? 'bg-fun-yellow text-black -translate-x-0.5 -translate-y-0.5'
                      : 'bg-card text-primary hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                style={{
                  boxShadow: filter === source ? 'var(--nb-shadow-hover)' : 'var(--nb-shadow)',
                }}
              >
                {source}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted"
              size={18}
              aria-hidden="true"
            />
            <label htmlFor="blog-search" className="sr-only">
              Search blogs
            </label>
            <input
              id="blog-search"
              type="text"
              aria-label="Search blogs"
              placeholder="Search blogs..."
              value={searchTerm}
              maxLength={100}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-card border-[3px] border-[color:var(--color-border)] py-3 pl-12 pr-12 text-primary font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ boxShadow: 'var(--nb-shadow)' }}
              aria-describedby="blog-search-limit"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="group absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary transition-colors p-1 motion-reduce:transition-none"
                aria-label="Clear search"
              >
                <X size={16} />
                <span
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
                  aria-hidden="true"
                >
                  Clear search
                </span>
              </button>
            )}
            <div
              id="blog-search-limit"
              className={`text-[10px] text-right mt-1 font-sans transition-colors ${
                searchTerm.length >= 100
                  ? 'text-red-500 font-bold'
                  : searchTerm.length >= 90
                    ? 'text-orange-500'
                    : 'text-muted'
              }`}
            >
              {searchTerm.length}/100
            </div>
          </div>
        </motion.div>

        {/* Screen reader loading announcement */}
        <div className="sr-only" role="status" aria-live="polite">
          {`${filteredBlogs.length} articles found`}
        </div>

        {/* Blog Cards Grid */}
        <motion.div
          key={currentPage}
          variants={container}
          initial={shouldReduceMotion ? false : 'hidden'}
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paginatedBlogs.map((blog, idx) => (
            <motion.article
              key={`${blog.title}-${idx}`}
              variants={item}
              className="bg-card border-[3px] border-[color:var(--color-border)] overflow-hidden flex flex-col h-full transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              {/* Color accent bar based on source */}
              <div className={`h-3 ${getSourceColor(blog.source)}`} />

              <div className="p-6 flex-grow flex flex-col">
                {/* Source and Date */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`text-sm md:text-xs font-heading font-bold px-3 py-1 border-2 border-[color:var(--color-border)] ${getSourceColor(blog.source)} ${getSourceTextColor(blog.source)}`}
                    style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                  >
                    {blog.source}
                  </span>
                  <span className="text-secondary text-sm md:text-xs font-sans flex items-center gap-1 bg-secondary px-2 py-1 border-2 border-[color:var(--color-border)]">
                    <Calendar size={12} />
                    {formatDate(blog.date)}
                  </span>
                </div>

                {/* Title */}
                <div className="flex items-start gap-2 mb-3">
                  <BookOpen size={18} className="text-muted flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-heading font-bold text-primary line-clamp-2">
                    {blog.title}
                  </h3>
                </div>

                {/* Summary */}
                <p className="text-secondary text-sm mb-4 line-clamp-3 flex-grow font-sans leading-relaxed">
                  {blog.summary}
                </p>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-sm md:text-xs font-sans px-2 py-1 bg-secondary text-primary border-2 border-[color:var(--color-border)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Read Link */}
                <div className="mt-auto">
                  <a
                    href={blog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read "${blog.title}" on ${blog.source} (opens in new tab)`}
                    className="inline-flex items-center gap-2 text-sm font-heading font-bold px-4 py-2 bg-fun-yellow text-black border-[3px] border-[color:var(--color-border)] transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                    style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                  >
                    Read on {blog.source} <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}

          {/* Empty State */}
          {filteredBlogs.length === 0 && (
            <div
              className="col-span-full flex flex-col items-center justify-center py-20 text-center"
              role="status"
              aria-live="polite"
            >
              <div
                className="bg-secondary p-6 border-[3px] border-[color:var(--color-border)] mb-6"
                style={{ boxShadow: 'var(--nb-shadow)' }}
              >
                <FileQuestion size={48} className="text-muted" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-heading font-bold text-primary mb-2">
                No articles found
              </h3>
              <p className="text-secondary mb-6 max-w-md font-sans">
                We couldn&apos;t find any posts
                {searchTerm && <> matching &quot;{searchTerm}&quot;</>}
                {filter !== 'All' && (
                  <span>
                    {' '}
                    in <strong>{filter}</strong>
                  </span>
                )}
                .
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('All');
                }}
                className="px-6 py-3 bg-fun-yellow text-black font-heading font-bold border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                style={{ boxShadow: 'var(--nb-shadow)' }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Pagination - Neubrutalism Style */}
        {totalPages > 1 && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3 }}
            className="flex justify-center items-center gap-3 mt-12"
            role="navigation"
            aria-label="Pagination"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
              className="flex items-center gap-1 px-4 py-2 bg-card font-heading font-bold border-[3px] border-[color:var(--color-border)] text-primary transition-transform hover:-translate-y-0.5 disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed disabled:hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
              style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            >
              <ChevronLeft size={18} /> Prev
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`w-10 h-10 font-heading font-bold border-[3px] border-[color:var(--color-border)] transition-transform motion-reduce:transform-none motion-reduce:transition-none
                    ${
                      page === currentPage
                        ? 'bg-fun-yellow text-black -translate-x-0.5 -translate-y-0.5'
                        : 'bg-card text-primary hover:-translate-y-0.5'
                    }`}
                  style={{
                    boxShadow:
                      page === currentPage
                        ? 'var(--nb-shadow-hover)'
                        : '2px 2px 0 var(--color-border)',
                  }}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
              className="flex items-center gap-1 px-4 py-2 bg-card font-heading font-bold border-[3px] border-[color:var(--color-border)] text-primary transition-transform hover:-translate-y-0.5 disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed disabled:hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
              style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            >
              Next <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Results info */}
        {filteredBlogs.length > 0 && (
          <p className="text-center text-muted text-sm mt-6 font-mono">
            Showing {(currentPage - 1) * POSTS_PER_PAGE + 1}-
            {Math.min(currentPage * POSTS_PER_PAGE, filteredBlogs.length)} of {filteredBlogs.length}{' '}
            posts
          </p>
        )}
      </div>
    </>
  );
};

export default Blog;
