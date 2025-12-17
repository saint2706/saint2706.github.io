import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Code, Award } from 'lucide-react';
import { resumeData } from '../../data/resume';
import SkillBar from '../shared/SkillBar';

const Section = ({ title, icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="mb-12"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-accent/10 rounded-lg text-accent">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
    </div>
    <div className="border-l-2 border-slate-800 ml-4 pl-8 space-y-10">
      {children}
    </div>
  </motion.div>
);

const TimelineItem = ({ title, subtitle, date, description, tags }) => (
  <div className="relative">
    <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-accent/50"></div>
    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
      <h3 className="text-xl font-bold text-primary">{title}</h3>
      <span className="font-mono text-sm text-accent">{date}</span>
    </div>
    <p className="text-lg text-secondary mb-2">{subtitle}</p>
    {description && (
      <div className="text-secondary text-sm leading-relaxed max-w-2xl mb-4">
        {/* Handle both string description and array of bullets */}
        {Array.isArray(description) ? (
          <ul className="list-disc list-inside space-y-1">
            {description.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        ) : (
          <p>{description}</p>
        )}
      </div>
    )}
    {tags && (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded bg-secondary text-secondary">
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

const Resume = () => {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">My Journey</h1>
        <p className="text-slate-400 text-lg">
          A timeline of my education, experience, and technical milestones.
        </p>
      </motion.div>

      <Section title="Experience" icon={<Briefcase size={24} />} delay={0.2}>
        {resumeData.experience.map((job, i) => (
          <TimelineItem
            key={i}
            title={job.company}
            subtitle={job.position}
            date={`${job.startDate} - ${job.endDate}`}
            description={job.highlights || job.summary}
          />
        ))}
      </Section>

      <Section title="Education" icon={<GraduationCap size={24} />} delay={0.4}>
        {resumeData.education.map((edu, i) => (
          <TimelineItem
            key={i}
            title={edu.institution}
            subtitle={edu.area}
            date={`${edu.startDate} - ${edu.endDate}`}
            description={edu.description}
          />
        ))}
      </Section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid md:grid-cols-2 gap-8"
      >
        <div className="bg-secondary/30 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Code size={24} className="text-fun-pink" />
            <h2 className="text-xl font-bold">Technical Skills</h2>
          </div>
          <div className="space-y-6">
            {resumeData.skills.map((skillGroup, groupIdx) => (
              <div key={groupIdx}>
                <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">{skillGroup.category}</h4>
                <div className="space-y-2">
                  {skillGroup.items.map((skill, skillIdx) => (
                    <SkillBar
                      key={skill.name}
                      name={skill.name}
                      proficiency={skill.proficiency}
                      delay={groupIdx * 0.1 + skillIdx * 0.05}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary/30 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Award size={24} className="text-fun-yellow" />
            <h2 className="text-xl font-bold">Certifications</h2>
          </div>
          <ul className="space-y-4">
            {resumeData.certifications.map((cert, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-fun-yellow flex-shrink-0" />
                <div>
                  <span className="text-primary block">{cert.name}</span>
                  <span className="text-secondary text-sm">{cert.issuer}{cert.date && ` • ${cert.date}`}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Languages Section */}
      {resumeData.basics.languages && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="bg-secondary/30 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🌐</span>
              <h2 className="text-xl font-bold">Languages</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {resumeData.basics.languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-xl border border-slate-700">
                  <span className="text-primary font-medium">{lang.name}</span>
                  <span className="text-accent text-sm">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Resume;
