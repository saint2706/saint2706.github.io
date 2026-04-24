/**
 * @fileoverview Projects showcase page displaying portfolio projects with filtering.
 */

import React, { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Github, ExternalLink, Star, Folder } from 'lucide-react';
import { resumeData } from '../../data/resume';
import SEOHead from '../shared/SEOHead';
import { isSafeHref, isSafeImageSrc } from '../../utils/security';
import {
  breadcrumbSchema,
  projectsCollectionSchema,
  projectCreativeWorkSchema,
  productSchema,
  SITE_URL,
} from '../../utils/seo';
import ThemedCard from '../shared/ThemedCard';
import ThemedButton from '../shared/ThemedButton';
import ThemedChip from '../shared/ThemedChip';
import ThemedSectionHeading from '../shared/ThemedSectionHeading';
import { useTheme } from '../shared/theme-context';

const projectSlugFromData = project =>
  `${project?.title || ''}-${project?.link || project?.github || ''}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const stickerStyles = [{ '--sticker-rotate': '1deg' }, { '--sticker-rotate': '-1deg' }];

const featuredStickerStyle = { '--sticker-rotate': '3deg' };

/**
 * ProjectCard Component
 */
// ⚡ Bolt: Wrapped card in React.memo to prevent unnecessary re-renders in list
const ProjectCard = React.memo(
  ({ project, idx, isLiquid, shadowColors, cardColors, item, onClick }) => {
    const projectSlug = useMemo(() => projectSlugFromData(project), [project]);
    const thumbStyle = useMemo(
      () => ({ viewTransitionName: `project-thumb-${projectSlug}` }),
      [projectSlug]
    );
    const titleStyle = useMemo(
      () => ({ viewTransitionName: `project-title-${projectSlug}` }),
      [projectSlug]
    );

    const handleClick = useCallback(() => {
      if (onClick) onClick(project);
    }, [onClick, project]);

    return (
      <ThemedCard
        as={motion.article}
        variant="interactive"
        shadowColor={isLiquid ? undefined : shadowColors[idx % shadowColors.length]}
        variants={item}
        onClick={handleClick}
        role="link"
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        className={`overflow-hidden flex flex-col h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fun-yellow ${isLiquid ? 'rounded-3xl p-0' : 'nb-shadow-lift nb-sticker'}`}
        style={stickerStyles[idx % 2]}
      >
        {/* Color accent bar */}
        {!isLiquid && <div className={`h-4 ${cardColors[idx % cardColors.length]} rounded-t-nb`} />}

        {/* Project Image */}
        {project.image && isSafeImageSrc(project.image) && (
          <div className="relative h-40 overflow-hidden border-b-nb border-[color:var(--color-border)]">
            <img
              src={project.image}
              alt={`Screenshot of ${project.title} project`}
              className="w-full h-full object-cover"
              style={thumbStyle}
              loading={idx < 3 ? 'eager' : 'lazy'}
              fetchPriority={idx < 3 ? 'high' : undefined}
              decoding="async"
              width={600}
              height={400}
            />
          </div>
        )}

        <div className={`p-6 flex-grow flex flex-col ${isLiquid ? 'gap-1' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start gap-2">
              <Folder size={20} className="text-muted flex-shrink-0 mt-1" aria-hidden="true" />
              <h2 className="text-xl font-heading font-bold text-primary" style={titleStyle}>
                {project.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {project.stars && (
                <ThemedChip variant="yellow" className="font-bold">
                  <Star size={12} className="fill-black" aria-hidden="true" />
                  {project.stars}
                </ThemedChip>
              )}
              {project.featured && (
                <ThemedChip
                  variant="accent"
                  className={`font-bold ${isLiquid ? '' : 'nb-sticker'}`}
                  style={featuredStickerStyle}
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
              <ThemedChip key={tag} variant="neutral" className="font-sans">
                {tag}
              </ThemedChip>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-auto">
            {project.link && isSafeHref(project.link) && (
              <ThemedButton
                as="a"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                variant="primary"
                size="sm"
                className={isLiquid ? undefined : 'hover:-translate-y-0.5'}
                aria-label={`Live Demo for ${project.title} (opens in new tab)`}
                title={`View live demo for ${project.title}`}
              >
                <ExternalLink size={14} aria-hidden="true" /> Demo
              </ThemedButton>
            )}
            {project.github && isSafeHref(project.github) && (
              <ThemedButton
                as="a"
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                variant="secondary"
                size="sm"
                className={isLiquid ? undefined : 'hover:-translate-y-0.5'}
                aria-label={`View source code for ${project.title} on GitHub (opens in new tab)`}
                title={`View source code for ${project.title} on GitHub`}
              >
                <Github size={14} aria-hidden="true" /> Code
              </ThemedButton>
            )}
          </div>
        </div>
      </ThemedCard>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

/**
 * Projects Page Component
 *
 * Showcases the portfolio projects with interactive filtering and animated grid layout.
 * Pulls project data from the centralized `resumeData` source. Uses `React.memo`
 * to prevent unnecessary re-renders when parent layout state changes.
 *
 * Features:
 * - Filterable project grid (All, React, Data, Python, Backend)
 * - Animated entrance and layout transitions for cards
 * - Detailed project information including descriptions and tags
 * - Support for featured badges and metrics
 * - Tech stack chip components
 * - Direct links to live demos and source code repositories
 * - Rotating accent colors for visual interest
 *
 * @component
 * @returns {JSX.Element} The Projects page.
 */
// ⚡ Bolt: Wrapped `Projects` component in `React.memo` to prevent unnecessary re-renders when parent layout state changes.
const Projects = React.memo(() => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const description =
    'Explore case studies and side projects spanning analytics, AI, and full-stack builds.';
  const title = `Projects | ${resumeData.basics.name}`;
  const projectSchemas = [
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Projects', url: `${SITE_URL}/projects` },
    ]),
    projectsCollectionSchema(),
    ...resumeData.projects.map(project => projectCreativeWorkSchema(project)),
    ...resumeData.projects.filter(p => p.featured).map(project => productSchema(project)),
  ];

  // Animation variants for stagger effect
  const container = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : 0.1,
          duration: shouldReduceMotion ? 0 : undefined,
        },
      },
    }),
    [shouldReduceMotion]
  );

  const item = useMemo(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: shouldReduceMotion ? { duration: 0 } : undefined,
      },
    }),
    [shouldReduceMotion]
  );

  /** Rotating color classes for project card accent bars */
  const cardColors = useMemo(() => ['bg-fun-yellow', 'bg-accent', 'bg-fun-pink'], []);
  /** NB 2.0: Cycle colored shadow accents per card */
  const shadowColors = useMemo(() => ['yellow', 'pink', 'blue', 'coral', 'violet'], []);
  const topTags = useMemo(() => {
    return [...new Set(resumeData.projects.flatMap(project => project.tags || []))].slice(0, 6);
  }, []);

  /**
   * Handle card click to open primary link.
   * Checks for text selection to avoid accidental navigation.
   */
  const handleCardClick = useCallback(project => {
    // Ignore if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;

    // Prioritize Live Demo, fallback to GitHub
    const targetUrl = project.link || project.github;
    // 🛡️ Sentinel: Validate URL before opening to prevent malicious protocol execution (e.g., javascript:)
    if (targetUrl && isSafeHref(targetUrl)) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return (
    <>
      <SEOHead title={title} description={description} path="/projects" schemas={projectSchemas} />
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
            chipClassName={isLiquid ? undefined : 'nb-stamp-in'}
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
          {isLiquid && (
            <div className="col-span-full flex flex-wrap items-center gap-2 mb-2">
              {topTags.map(tag => (
                <ThemedChip key={tag} variant="neutral" className="text-xs tracking-wide uppercase">
                  {tag}
                </ThemedChip>
              ))}
            </div>
          )}
          {resumeData.projects.map((project, idx) => (
            <ProjectCard
              key={idx}
              project={project}
              idx={idx}
              isLiquid={isLiquid}
              shadowColors={shadowColors}
              cardColors={cardColors}
              item={item}
              onClick={handleCardClick}
            />
          ))}
        </motion.div>
      </div>
    </>
  );
});

Projects.displayName = 'Projects';

/** @type {React.NamedExoticComponent} */
export default Projects;
