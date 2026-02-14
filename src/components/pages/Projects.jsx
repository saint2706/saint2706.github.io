/**
 * @fileoverview Projects showcase page displaying portfolio projects with filtering.
 */

import React, { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Github, ExternalLink, Star, Folder } from 'lucide-react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { resumeData } from '../../data/resume';
import { safeJSONStringify } from '../../utils/security';
import ThemedCard from '../shared/ThemedCard';
import ThemedButton from '../shared/ThemedButton';
import ThemedChip from '../shared/ThemedChip';
import ThemedSectionHeading from '../shared/ThemedSectionHeading';
import { useTheme } from '../shared/theme-context';

/**
 * Projects showcase page component
 *
 * Features:
 * - Grid layout of project cards
 * - Project images with lazy loading
 * - Star counts and featured badges
 * - Tech stack tags
 * - Links to live demos and source code
 * - Rotating accent colors for visual interest
 *
 * @component
 * @returns {JSX.Element} Projects page with portfolio showcase
 */
const Projects = () => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isAura = theme === 'aura';
  const canonicalUrl = `${resumeData.basics.website}/projects`;
  const description =
    'Explore case studies and side projects spanning analytics, AI, and full-stack builds.';
  const title = `Projects | ${resumeData.basics.name}`;

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

  /** Rotating color classes for project card accent bars */
  const cardColors = ['bg-fun-yellow', 'bg-accent', 'bg-fun-pink'];
  const topTags = useMemo(() => {
    return [...new Set(resumeData.projects.flatMap(project => project.tags || []))].slice(0, 6);
  }, []);

  /**
   * Handle card click to open primary link.
   * Checks for text selection to avoid accidental navigation.
   */
  const handleCardClick = useCallback(project => {
    return () => {
      // Ignore if user is selecting text
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;

      // Prioritize Live Demo, fallback to GitHub
      const targetUrl = project.link || project.github;
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    };
  }, []);

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
                name: 'Projects',
                item: canonicalUrl,
              },
            ],
          })}
        </script>
      </Helmet>
      <div className="max-w-6xl mx-auto py-12 px-4">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="mb-12 text-center"
        >
          <ThemedSectionHeading
            as="h1"
            title="Creative Experiments"
            variant="yellow"
            className="font-heading text-4xl md:text-5xl font-bold mb-4"
            chipClassName="nb-stamp-in"
          />
          <p className="text-secondary max-w-2xl mx-auto mt-6 font-sans">
            From data science models to full-stack applications. Here is what I have been building.
          </p>
        </motion.div>

        {/* Screen reader summary (no live region since content is static) */}
        <div className="sr-only">{`${resumeData.projects.length} projects loaded`}</div>

        <motion.div
          variants={container}
          initial={shouldReduceMotion ? false : 'hidden'}
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isAura && (
            <div className="col-span-full flex flex-wrap items-center gap-2 mb-2">
              {topTags.map(tag => (
                <ThemedChip key={tag} variant="neutral" className="text-xs tracking-wide uppercase">
                  {tag}
                </ThemedChip>
              ))}
            </div>
          )}
          {resumeData.projects.map((project, idx) => (
            <ThemedCard
              as={motion.article}
              key={idx}
              variant="interactive"
              variants={item}
              onClick={handleCardClick(project)}
              role="link"
              tabIndex={0}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
              className={`overflow-hidden flex flex-col h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fun-yellow ${isAura ? 'rounded-3xl p-0' : 'nb-shadow-lift nb-sticker'}`}
              style={{
                '--sticker-rotate': idx % 2 === 0 ? '1deg' : '-1deg',
              }}
            >
              {/* Color accent bar */}
              {!isAura && <div className={`h-4 ${cardColors[idx % cardColors.length]} rounded-t-nb`} />}

              {/* Project Image */}
              {project.image && (
                <div className="relative h-40 overflow-hidden border-b-nb border-[color:var(--color-border)]">
                  <img
                    src={project.image}
                    alt={`Screenshot of ${project.title} project`}
                    className="w-full h-full object-cover"
                    loading={idx < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </div>
              )}

                <div className={`p-6 flex-grow flex flex-col ${isAura ? 'gap-1' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-2">
                    <Folder size={20} className="text-muted flex-shrink-0 mt-1" />
                    <h3 className="text-xl font-heading font-bold text-primary">{project.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {project.stars && (
                      <ThemedChip variant="yellow" className="font-bold">
                        <Star size={12} className="fill-black" />
                        {project.stars}
                      </ThemedChip>
                    )}
                    {project.featured && (
                      <ThemedChip
                        variant="accent"
                        className={`font-bold ${isAura ? '' : 'nb-sticker'}`}
                        style={{ '--sticker-rotate': '3deg' }}
                      >
                        Featured
                      </ThemedChip>
                    )}
                  </div>
                </div>

                <p className="text-secondary text-sm mb-6 flex-grow leading-relaxed line-clamp-3 font-sans">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map(tag => (
                    <ThemedChip
                      key={tag}
                      variant="neutral"
                      className="font-sans"
                    >
                      {tag}
                    </ThemedChip>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-auto">
                  {project.link && (
                    <ThemedButton
                      as="a"
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      variant="primary"
                      size="sm"
                      className="hover:-translate-y-0.5"
                      aria-label={`Live Demo for ${project.title} (opens in new tab)`}
                    >
                      <ExternalLink size={14} aria-hidden="true" /> Demo
                    </ThemedButton>
                  )}
                  {project.github && (
                    <ThemedButton
                      as="a"
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      variant="secondary"
                      size="sm"
                      className="hover:-translate-y-0.5"
                      aria-label={`View source code for ${project.title} on GitHub (opens in new tab)`}
                    >
                      <Github size={14} aria-hidden="true" /> Code
                    </ThemedButton>
                  )}
                </div>
              </div>
            </ThemedCard>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default Projects;
