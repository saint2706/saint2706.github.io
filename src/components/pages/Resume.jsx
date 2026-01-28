import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Briefcase, GraduationCap, Code, Award, Globe, Calendar, MapPin, Printer } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { resumeData } from '../../data/resume';
import { safeJSONStringify } from '../../utils/security';

// Neubrutalism Section Component
const Section = ({ title, icon, color = 'bg-fun-yellow', children, delay = 0, shouldReduceMotion = false }) => (
  <motion.div
    initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={shouldReduceMotion ? { duration: 0 } : { delay }}
    className="mb-12"
  >
    <div
      className={`inline-flex items-center gap-3 ${color} text-black px-4 py-2 border-nb border-[color:var(--color-border)] mb-6 rounded-nb dark:bg-accent/20 dark:text-white dark:border-glass-border dark:shadow-glow-purple`}
      style={{ boxShadow: 'var(--nb-shadow)' }}
    >
      {icon}
      <h2 className="text-xl font-heading font-bold">{title}</h2>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </motion.div>
);

// Neubrutalism Timeline Card
const TimelineCard = ({ title, subtitle, date, location, description, tags, accentColor = 'bg-accent' }) => (
  <div
    className="bg-card border-nb border-[color:var(--color-border)] p-6 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none rounded-nb glass-panel dark:border-glass-border dark:hover:shadow-glow-purple"
    style={{ boxShadow: 'var(--nb-shadow)' }}
  >
    {/* Color accent bar */}
    <div className={`h-2 ${accentColor} -mx-6 -mt-6 mb-4 border-b-nb border-[color:var(--color-border)] rounded-t-nb dark:opacity-60 dark:border-glass-border`} />

    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
      <div>
        <h3 className="text-xl font-heading font-bold text-primary">{title}</h3>
        <p className="text-lg text-secondary font-sans">{subtitle}</p>
      </div>
      <div className="flex flex-col items-start md:items-end gap-1">
        <span
          className="inline-flex items-center gap-1 text-sm md:text-xs font-bold text-black bg-fun-yellow px-2 py-1 border-2 border-[color:var(--color-border)] rounded-nb dark:bg-accent dark:text-white dark:border-transparent"
        >
          <Calendar size={12} />
          {date}
        </span>
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
          <span
            key={i}
            className="text-sm md:text-xs font-sans px-2 py-1 bg-secondary text-primary border-2 border-[color:var(--color-border)] rounded-nb dark:bg-glass-bg dark:border-glass-border"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Neubrutalism Skill Badge
const SkillBadge = ({ name, proficiency }) => {
  const getColor = (p) => {
    if (p >= 90) return 'bg-fun-yellow';
    if (p >= 75) return 'bg-accent';
    if (p >= 60) return 'bg-fun-pink';
    return 'bg-secondary';
  };

  return (
    <div
      className={`inline-flex items-center gap-2 ${getColor(proficiency)} text-black px-3 py-2 border-2 border-[color:var(--color-border)] font-heading font-bold text-sm rounded-nb dark:text-white dark:border-transparent`}
      style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
    >
      {name}
      <span className="text-sm md:text-xs opacity-70">{proficiency}%</span>
    </div>
  );
};

const Resume = () => {
  const shouldReduceMotion = useReducedMotion();
  const canonicalUrl = `${resumeData.basics.website}/resume`;
  const description = 'Review my education, experience, and skills in analytics, AI, and product strategy.';
  const title = `Resume | ${resumeData.basics.name}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={description} />
        <script type="application/ld+json">
          {safeJSONStringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": resumeData.basics.website
            }, {
              "@type": "ListItem",
              "position": 2,
              "name": "Resume",
              "item": canonicalUrl
            }]
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

      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="mb-16 text-center"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            <span
              className="inline-block bg-accent text-white px-6 py-3 border-nb border-[color:var(--color-border)] rounded-nb dark:border-transparent dark:shadow-glow-purple"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              My Journey
            </span>
          </h1>
          <p className="text-secondary text-lg mt-6 font-sans max-w-2xl mx-auto">
            A timeline of my education, experience, and technical milestones.
          </p>

          <button
            onClick={handlePrint}
            className="mt-6 inline-flex items-center gap-2 bg-card text-primary px-5 py-2.5 border-nb border-[color:var(--color-border)] font-heading font-bold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none print:hidden rounded-nb glass-panel dark:border-glass-border dark:hover:shadow-glow-purple"
            style={{ boxShadow: 'var(--nb-shadow)' }}
            aria-label="Print resume"
          >
            <Printer size={20} aria-hidden="true" />
            <span>Print Resume</span>
          </button>
        </motion.div>

        {/* Experience Section */}
        <Section
          title="Experience"
          icon={<Briefcase size={24} />}
          color="bg-fun-pink"
          delay={0.2}
          shouldReduceMotion={shouldReduceMotion}
        >
          {resumeData.experience.map((job, i) => (
            <TimelineCard
              key={i}
              title={job.company}
              subtitle={job.position}
              date={`${job.startDate} - ${job.endDate}`}
              location={job.location}
              description={job.highlights || job.summary}
              accentColor="bg-fun-pink"
            />
          ))}
        </Section>

        {/* Education Section */}
        <Section
          title="Education"
          icon={<GraduationCap size={24} />}
          color="bg-accent"
          delay={0.4}
          shouldReduceMotion={shouldReduceMotion}
        >
          {resumeData.education.map((edu, i) => (
            <TimelineCard
              key={i}
              title={edu.institution}
              subtitle={edu.area}
              date={`${edu.startDate} - ${edu.endDate}`}
              description={edu.description}
              accentColor="bg-accent"
            />
          ))}
        </Section>

        {/* Skills & Certifications Grid */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {/* Technical Skills */}
          <div
            className="bg-card border-nb border-[color:var(--color-border)] p-6 rounded-nb glass-panel dark:border-glass-border"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          >
            <div
              className="inline-flex items-center gap-2 bg-fun-pink text-white px-3 py-2 border-2 border-[color:var(--color-border)] mb-6 rounded-nb dark:border-transparent dark:shadow-glow-pink"
              style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            >
              <Code size={20} />
              <h2 className="text-lg font-heading font-bold">Technical Skills</h2>
            </div>

            <div className="space-y-6">
              {resumeData.skills.map((skillGroup, groupIdx) => (
                <div key={groupIdx}>
                  <h4 className="text-sm font-heading font-bold text-primary uppercase tracking-wider mb-3 border-b-2 border-[color:var(--color-border)] pb-1">
                    {skillGroup.category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill) => (
                      <SkillBadge
                        key={skill.name}
                        name={skill.name}
                        proficiency={skill.proficiency}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div
            className="bg-card border-nb border-[color:var(--color-border)] p-6 rounded-nb glass-panel dark:border-glass-border"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          >
            <div
              className="inline-flex items-center gap-2 bg-fun-yellow text-black px-3 py-2 border-2 border-[color:var(--color-border)] mb-6 rounded-nb dark:bg-accent dark:text-white dark:border-transparent dark:shadow-glow-purple"
              style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            >
              <Award size={20} />
              <h2 className="text-lg font-heading font-bold">Certifications</h2>
            </div>

            <ul className="space-y-4">
              {resumeData.certifications.map((cert, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 bg-secondary border-2 border-[color:var(--color-border)]"
                >
                  <div className="w-3 h-3 bg-fun-yellow border-2 border-[color:var(--color-border)] flex-shrink-0 mt-1" />
                  <div>
                    <span className="text-primary font-heading font-bold block">{cert.name}</span>
                    <span className="text-secondary text-sm font-sans leading-relaxed">
                      {cert.issuer}{cert.date && ` • ${cert.date}`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Languages Section */}
        {resumeData.basics.languages && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.8 }}
          >
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
                    <span
                      className="text-sm md:text-xs px-2 py-1 bg-fun-yellow text-black border-2 border-[color:var(--color-border)] font-bold"
                    >
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Resume;
