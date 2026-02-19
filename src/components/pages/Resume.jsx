/**
 * @fileoverview Resume page displaying professional experience, education, and skills.
 * Features interactive section filters and scroll-triggered reveal animations.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Calendar,
  MapPin,
  Printer,
  Sparkles,
  Filter,
} from 'lucide-react';
import { resumeData } from '../../data/resume';
import SEOHead from '../shared/SEOHead';
import { breadcrumbSchema, resumePersonSchema, SITE_URL } from '../../utils/seo';
import TechStackVisual from '../shared/TechStackVisual';
import ScrollReveal from '../shared/ScrollReveal';
import ThemedCard from '../shared/ThemedCard';
import ThemedButton from '../shared/ThemedButton';
import ThemedChip from '../shared/ThemedChip';
import ThemedSectionHeading from '../shared/ThemedSectionHeading';
import { useTheme } from '../shared/theme-context';

/**
 * Reusable section component with neubrutalist styling
 *
 * @component
 * @param {Object} props
 * @param {string} props.title - Section heading
 * @param {React.ReactNode} props.icon - Icon element
 * @param {string} props.color - Tailwind background color class
 * @param {React.ReactNode} props.children - Section content
 * @returns {JSX.Element} Styled section with header and content
 */
const SECTION_VARIANTS = {
  'bg-fun-yellow': 'yellow',
  'bg-fun-pink': 'pink',
  'bg-accent': 'accent',
};

const Section = ({ title, icon, color = 'bg-fun-yellow', children }) => (
  <div className="mb-12">
    <ThemedSectionHeading
      title={title}
      icon={icon}
      variant={SECTION_VARIANTS[color] ?? 'yellow'}
      className="mb-6"
      chipClassName="gap-3"
    />
    <div className="space-y-6">{children}</div>
  </div>
);

/**
 * Timeline card for experience/education entries
 *
 * @component
 * @param {Object} props
 * @param {string} props.title - Job title or institution name
 * @param {string} props.subtitle - Company or degree
 * @param {string} props.date - Date range
 * @param {string} props.location - Location
 * @param {string|string[]} props.description - Description or highlights
 * @param {string[]} props.tags - Tech stack or skills
 * @param {string} props.accentColor - Tailwind color class for accent bar
 * @returns {JSX.Element} Timeline card with details
 */
const TimelineCard = ({
  title,
  subtitle,
  date,
  location,
  description,
  tags,
  accentColor = 'bg-accent',
  isLiquid = false,
}) => (
  <ThemedCard
    variant="interactive"
    className={`p-6 ${isLiquid ? 'relative rounded-3xl border border-[color:var(--border-soft)]' : ''}`}
  >
    {/* Color accent bar */}
    {isLiquid ? (
      <span className="absolute -left-[1.45rem] top-8 w-3 h-3 rounded-full bg-[color:var(--accent)] border border-[color:var(--border-soft)] shadow-[0_0_12px_rgba(141,162,255,0.45)]" />
    ) : (
      <div
        className={`h-2 ${accentColor} -mx-6 -mt-6 mb-4 border-b-nb border-[color:var(--color-border)] rounded-t-nb`}
      />
    )}

    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
      <div>
        <h3 className="text-xl font-heading font-bold text-primary">{title}</h3>
        <p className="text-lg text-secondary font-sans">{subtitle}</p>
      </div>
      <div className="flex flex-col items-start md:items-end gap-1">
        <ThemedChip variant="yellow" className="font-bold">
          <Calendar size={12} />
          {date}
        </ThemedChip>
        {location && (
          <span className="text-sm md:text-xs text-secondary flex items-center gap-1">
            <MapPin size={12} />
            {location}
          </span>
        )}
      </div>
    </div>

    {description && (
      <div className="text-secondary text-sm leading-relaxed mb-4 font-sans">
        {Array.isArray(description) ? (
          <ul className="space-y-2">
            {description.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-accent mt-1.5 flex-shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{description}</p>
        )}
      </div>
    )}

    {tags && tags.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <ThemedChip
            key={i}
            variant="neutral"
            className="font-sans"
          >
            {tag}
          </ThemedChip>
        ))}
      </div>
    )}
  </ThemedCard>
);

/** Filter section identifiers */
const SECTIONS = ['Experience', 'Education', 'Tech Stack', 'Certifications', 'Languages'];

/**
 * Resume page component
 *
 * Features:
 * - Interactive filter bar to show/hide sections
 * - Timeline-based experience and education display
 * - Skill categorization with proficiency levels
 * - Certifications list
 * - Language proficiency
 * - Print-friendly layout
 * - Neubrutalist card designs
 * - Scroll-triggered reveal animations
 *
 * @component
 * @returns {JSX.Element} Resume page with professional information
 */
const Resume = () => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const description =
    'Review my education, experience, and skills in analytics, AI, and product strategy.';
  const title = `Resume | ${resumeData.basics.name}`;
  const resumeSchemas = [
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Resume', url: `${SITE_URL}/resume` },
    ]),
    resumePersonSchema(),
  ];

  // Interactive filter state — all sections visible by default
  const [visibleSections, setVisibleSections] = useState(() => new Set(SECTIONS));

  /** Toggle a section's visibility */
  const toggleSection = useCallback(section => {
    setVisibleSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  /** Trigger browser print dialog */
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        path="/resume"
        schemas={resumeSchemas}
      />

      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="mb-10 text-center"
        >
          <ThemedSectionHeading
            as="h1"
            title="My Journey"
            variant="accent"
            className="font-heading text-4xl md:text-5xl font-bold mb-4"
            chipClassName={isLiquid ? 'px-6 py-3' : 'px-6 py-3 nb-stamp-in'}
          />
          <p className="text-secondary text-lg mt-6 font-sans max-w-2xl mx-auto">
            A timeline of my education, experience, and technical milestones.
          </p>

          <ThemedButton
            onClick={handlePrint}
            variant="secondary"
            className="mt-6 print:hidden"
            aria-label="Print resume"
          >
            <Printer size={20} aria-hidden="true" />
            <span>Print Resume</span>
          </ThemedButton>
        </motion.div>

        {/* ── Interactive Filter Bar ── */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.1 }}
          className="mb-12 print:hidden"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-secondary" />
            <span className="text-sm font-heading font-bold text-secondary">Filter Sections</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map(section => {
              const isActive = visibleSections.has(section);
              return (
                <ThemedButton
                  key={section}
                  onClick={() => toggleSection(section)}
                  variant="secondary"
                  isActive={isActive}
                  size="md"
                  className="text-sm"
                  aria-pressed={isActive}
                >
                  {section}
                </ThemedButton>
              );
            })}
          </div>
        </motion.div>

        {/* ── Resume Sections with AnimatePresence ── */}
        <AnimatePresence mode="sync">
          {/* Experience Section */}
          {visibleSections.has('Experience') && (
            <motion.div
              key="experience"
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollReveal variant="fade-up" delay={0.1}>
                <Section title="Experience" icon={<Briefcase size={24} />} color="bg-fun-pink">
                  <div className={isLiquid ? 'relative space-y-5 pl-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-[color:var(--border-soft)]' : 'space-y-6'}>
                    {resumeData.experience.map((job, i) => (
                      <TimelineCard
                        key={i}
                        title={job.company}
                        subtitle={job.position}
                        date={`${job.startDate} - ${job.endDate}`}
                        location={job.location}
                        description={job.highlights || job.summary}
                        accentColor="bg-fun-pink"
                        isLiquid={isLiquid}
                      />
                    ))}
                  </div>
                </Section>
              </ScrollReveal>
            </motion.div>
          )}

          {/* Education Section */}
          {visibleSections.has('Education') && (
            <motion.div
              key="education"
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollReveal variant="fade-up" delay={0.2}>
                <Section title="Education" icon={<GraduationCap size={24} />} color="bg-accent">
                  <div className={isLiquid ? 'relative space-y-5 pl-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-[color:var(--border-soft)]' : 'space-y-6'}>
                    {resumeData.education.map((edu, i) => (
                      <TimelineCard
                        key={i}
                        title={edu.institution}
                        subtitle={edu.area}
                        date={`${edu.startDate} - ${edu.endDate}`}
                        description={edu.description}
                        accentColor="bg-accent"
                        isLiquid={isLiquid}
                      />
                    ))}
                  </div>
                </Section>
              </ScrollReveal>
            </motion.div>
          )}

          {/* Tech Stack Visualization */}
          {visibleSections.has('Tech Stack') && (
            <motion.div
              key="techstack"
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollReveal variant="scale-in" delay={0.1}>
                <div className="mb-12">
                  <div
                    className={`p-6 ${isLiquid
                        ? 'lg-surface-2 rounded-3xl'
                        : 'bg-card border-nb border-[color:var(--color-border)] rounded-nb'
                      }`}
                    style={{ boxShadow: isLiquid ? '0 14px 34px -28px rgba(25, 35, 84, 0.75)' : 'var(--nb-shadow)' }}
                  >
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 mb-6 ${isLiquid
                          ? 'lg-surface-2 text-[color:var(--text-primary)] border border-[color:var(--border-soft)] rounded-full'
                          : 'bg-fun-pink text-white border-2 border-[color:var(--color-border)] rounded-nb'
                        }`}
                      style={{ boxShadow: isLiquid ? '0 8px 24px -20px rgba(139, 92, 246, 0.85)' : '2px 2px 0 var(--color-border)' }}
                    >
                      <Sparkles size={20} />
                      <h2 className="text-lg font-heading font-bold">Tech Stack</h2>
                    </div>

                    <p className="text-secondary text-sm mb-6 font-sans">
                      Hover over a skill to see its proficiency level.
                    </p>

                    <TechStackVisual />
                  </div>
                </div>
              </ScrollReveal>
            </motion.div>
          )}

          {/* Certifications */}
          {visibleSections.has('Certifications') && (
            <motion.div
              key="certifications"
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollReveal variant="fade-left" delay={0.1}>
                <div className="mb-12">
                  <div
                    className="bg-card border-nb border-[color:var(--color-border)] p-6 rounded-nb"
                    style={{ boxShadow: 'var(--nb-shadow)' }}
                  >
                    <div
                      className="inline-flex items-center gap-2 bg-fun-yellow text-black px-3 py-2 border-2 border-[color:var(--color-border)] rounded-nb mb-6"
                      style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                    >
                      <Award size={20} />
                      <h2 className="text-lg font-heading font-bold">Certifications</h2>
                    </div>

                    <ul className="space-y-4">
                      {resumeData.certifications.map((cert, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 p-3 border-2 border-[color:var(--color-border)] bg-secondary"
                        >
                          <div className="w-3 h-3 bg-fun-yellow border-2 border-[color:var(--color-border)] flex-shrink-0 mt-1" />
                          <div>
                            <span className="text-primary font-heading font-bold block">
                              {cert.name}
                            </span>
                            <span className="text-secondary text-sm font-sans leading-relaxed">
                              {cert.issuer}
                              {cert.date && ` • ${cert.date}`}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            </motion.div>
          )}

          {/* Languages Section */}
          {visibleSections.has('Languages') && resumeData.basics.languages && (
            <motion.div
              key="languages"
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollReveal variant="fade-right" delay={0.1}>
                <div
                  className="bg-card border-[3px] border-[color:var(--color-border)] p-6"
                  style={{ boxShadow: 'var(--nb-shadow)' }}
                >
                  <div
                    className="inline-flex items-center gap-2 bg-accent text-white px-3 py-2 border-2 border-[color:var(--color-border)] mb-6"
                    style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                  >
                    <Globe size={20} />
                    <h2 className="text-lg font-heading font-bold">Languages</h2>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {resumeData.basics.languages.map((lang, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 bg-secondary border-[3px] border-[color:var(--color-border)]"
                        style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                      >
                        <span className="text-primary font-heading font-bold">{lang.name}</span>
                        <span className="text-sm md:text-xs px-2 py-1 bg-fun-yellow text-black border-2 border-[color:var(--color-border)] font-bold">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Resume;
