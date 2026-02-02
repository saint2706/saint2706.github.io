/**
 * @fileoverview Hero section for homepage with interactive elements and animations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bot, Code2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { resumeData } from '../../data/resume';
import { safeJSONStringify } from '../../utils/security';

/**
 * Hero section component for homepage
 *
 * Features:
 * - Bold typography with neubrutalist styling
 * - Availability status badge
 * - CTA buttons (View Projects, Talk to Bot)
 * - Interactive code snippet card with easter egg
 * - Click stack array 3 times to reveal /games page
 * - Decorative background shapes
 * - SEO optimization with structured data
 *
 * @component
 * @returns {JSX.Element} Hero section with heading, CTAs, and code snippet
 */
const Hero = () => {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();

  // Easter egg state (click stack array to unlock games page)
  const [clickCount, setClickCount] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const CLICKS_REQUIRED = 3;

  // Reset click count after 2 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0 && clickCount < CLICKS_REQUIRED) {
      const timeout = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timeout);
    }
  }, [clickCount]);

  /**
   * Handle easter egg activation
   * After 3 clicks, glitch animation plays and navigates to /games
   */
  const handleEasterEggClick = useCallback(() => {
    if (isGlitching) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= CLICKS_REQUIRED) {
      setIsGlitching(true);
      // Navigate after glitch animation plays
      setTimeout(() => {
        navigate('/games');
      }, 1500);
    }
  }, [clickCount, isGlitching, navigate]);

  /**
   * Keyboard handler for easter egg accessibility
   * Activates on Enter or Space key
   */
  const handleEasterEggKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEasterEggClick();
      }
    },
    [handleEasterEggClick]
  );

  const canonicalUrl = resumeData.basics.website;
  const description =
    'Portfolio of Rishabh Agrawal: data storyteller and analytics strategist building AI, product, and data experiences.';
  const title = `${resumeData.basics.name} | ${resumeData.basics.title}`;

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
        <script type="application/ld+json">
          {safeJSONStringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: resumeData.basics.name,
            url: resumeData.basics.website,
            sameAs: [
              'https://github.com/saint2706',
              'https://www.linkedin.com/in/rishabh-agrawal-1807321b9',
            ],
            jobTitle: resumeData.basics.title,
            description: description,
            image: `${resumeData.basics.website}/og-image.png`,
          })}
        </script>
        <script type="application/ld+json">
          {safeJSONStringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: `${resumeData.basics.name} Portfolio`,
            url: resumeData.basics.website,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${resumeData.basics.website}/blog?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-[80vh] relative flex flex-col justify-center items-center text-center max-w-5xl mx-auto py-12">
        {/* Neubrutalism Decorative Shapes */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Yellow block - top left */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
            className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-fun-yellow border-nb border-[color:var(--color-border)] rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          />
          {/* Red block - bottom left */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.4 }}
            className="absolute bottom-20 left-20 w-24 h-24 md:w-32 md:h-32 bg-fun-pink border-nb border-[color:var(--color-border)] rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          />
          {/* Blue block - top right */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
            className="absolute top-20 right-16 w-20 h-20 md:w-28 md:h-28 bg-accent border-nb border-[color:var(--color-border)] rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          />
        </div>

        {/* Status Badge - Neubrutalism style */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
          className="mb-8"
        >
          <div
            className="inline-flex items-center gap-2 bg-fun-yellow text-black font-heading font-semibold px-5 py-2 border-nb border-[color:var(--color-border)] rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          >
            <Sparkles size={18} className="text-black" />
            Available for hire & collaborations
          </div>
        </motion.div>

        {/* Main Heading - Bold Neubrutalism Typography */}
        <motion.h1
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="block text-primary mb-2">Data Storyteller</span>
          <span
            className="text-fun-yellow px-4 py-2 border-nb border-[color:var(--color-border)] inline-block bg-primary rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          >
            & Creative Analyst
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}
          className="text-secondary text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-sans"
        >
          Turning{' '}
          <strong className="text-primary font-bold border-b-[3px] border-fun-yellow">
            messy data
          </strong>{' '}
          into
          <strong className="text-primary font-bold border-b-[3px] border-accent mx-1">
            clear strategies
          </strong>{' '}
          and
          <strong className="text-primary font-bold border-b-[3px] border-fun-pink mx-1">
            AI/ML solutions
          </strong>{' '}
          into real-world impact.
        </motion.p>

        {/* CTA Buttons - Neubrutalism style */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          <Link
            to="/projects"
            className="group relative px-8 py-4 bg-fun-yellow text-black font-heading font-bold border-nb border-[color:var(--color-border)] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--nb-shadow-hover)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--nb-shadow)')}
          >
            View Projects
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform motion-reduce:transform-none motion-reduce:transition-none"
            />
          </Link>
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('openChatbot'))}
            className="px-8 py-4 bg-card text-primary font-heading font-bold border-nb border-[color:var(--color-border)] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--nb-shadow-hover)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--nb-shadow)')}
            aria-label="Open chat with Digital Rishabh"
          >
            <Bot size={18} className="text-fun-pink" aria-hidden="true" />
            Talk to Digital Rishabh
          </button>
        </motion.div>

        {/* Code Snippet Card - Neubrutalism style + Easter Egg */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.8 }}
          className="mt-16 w-full max-w-md"
        >
          <div
            className={`bg-fun-yellow text-black p-6 border-nb border-[color:var(--color-border)] text-left font-mono text-sm rounded-nb transition-all duration-300 ${isGlitching ? 'animate-glitch' : ''}`}
            style={{ boxShadow: 'var(--nb-shadow)' }}
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-black/20">
              <Code2 size={16} />
              <span className="font-heading font-bold">
                {isGlitching ? 'game_mode.js' : 'developer.js'}
              </span>
            </div>
            <pre className="whitespace-pre-wrap">
              {isGlitching ? (
                // Glitched "gamer mode" content
                <>
                  {`const developer = {
  mode: `}
                  <span className="text-fun-pink font-bold">&lsquo;GAMER&rsquo;</span>
                  {`,
  status: `}
                  <span className="text-accent font-bold">&lsquo;Ready Player One&rsquo;</span>
                  {`,
  launching: `}
                  <span className="text-green-600 font-bold">true</span>
                  {`
};`}
                </>
              ) : (
                // Normal content with clickable stack items
                <>
                  {`const developer = {
  name: 'Rishabh Agrawal',
  stack: [`}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleEasterEggClick}
                    onKeyDown={handleEasterEggKeyDown}
                    className="cursor-pointer hover:text-fun-pink hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-fun-pink focus:ring-offset-1"
                    aria-label={`Click ${CLICKS_REQUIRED - clickCount} more time${CLICKS_REQUIRED - clickCount !== 1 ? 's' : ''} for a surprise`}
                  >
                    &lsquo;React&rsquo;, &lsquo;Node.js&rsquo;, &lsquo;Python&rsquo;
                  </span>
                  {`],
  currentStatus: 'Building awesome things.',
  openToWork: true
};`}
                </>
              )}
            </pre>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Hero;
