/**
 * @fileoverview Skill Tree visualization component.
 * Displays skills in a hierarchical tree layout organized by category.
 */

import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { resumeData } from '../../data/resume';

/**
 * Category colors matching neubrutalist theme
 */
const CATEGORY_COLORS = {
  Programming: '#facc15', // yellow
  'Data Science & AI': '#60a5fa', // blue
  'Frameworks & Cloud': '#f472b6', // pink
  'Soft Skills': '#84cc16', // lime green
};

/**
 * Single Skill Node in the tree
 */
const SkillNode = ({ skill, color, isHovered, onHover, shouldReduceMotion }) => {
  // Size based on proficiency: min 8px, max 16px
  const nodeSize = 8 + (skill.proficiency / 100) * 8;

  return (
    <motion.div
      className="relative flex items-center gap-2 py-1"
      onMouseEnter={() => onHover(skill)}
      onMouseLeave={() => onHover(null)}
      initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Branch line */}
      <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: color }} />

      {/* Skill node */}
      <motion.div
        className="relative flex items-center gap-2 px-3 py-1.5 border-2 cursor-default"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: isHovered ? color : 'var(--color-secondary)',
          boxShadow: isHovered ? '3px 3px 0 var(--color-border)' : '2px 2px 0 var(--color-border)',
        }}
        whileHover={shouldReduceMotion ? {} : { x: 2, y: -2 }}
        transition={{ duration: 0.1 }}
      >
        {/* Proficiency indicator dot */}
        <div
          className="rounded-full border-2 flex-shrink-0"
          style={{
            width: nodeSize,
            height: nodeSize,
            backgroundColor: color,
            borderColor: 'var(--color-border)',
          }}
        />

        {/* Skill name - always visible */}
        <span className="text-sm font-heading font-bold whitespace-nowrap text-black">
          {skill.name}
        </span>

        {/* Proficiency percentage on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xs font-sans font-bold text-black overflow-hidden"
            >
              {skill.proficiency}%
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/**
 * Category Branch with its skills
 */
const CategoryBranch = ({
  category,
  skills,
  color,
  hoveredSkill,
  setHoveredSkill,
  shouldReduceMotion,
  delay,
}) => {
  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-2 sm:gap-4"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { delay }}
    >
      {/* Category label */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-2 font-heading font-bold text-sm sm:min-w-[180px] flex-shrink-0"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: color,
          boxShadow: '3px 3px 0 var(--color-border)',
          color: '#000',
        }}
      >
        <div
          className="w-3 h-3 border-2"
          style={{ borderColor: 'var(--color-border)', backgroundColor: '#fff' }}
        />
        {category}
      </div>

      {/* Connecting line */}
      <div className="hidden sm:flex items-center" style={{ width: '20px' }}>
        <div className="w-full h-0.5 border-t-2" style={{ borderColor: color }} />
      </div>

      {/* Skills container */}
      <div className="flex flex-wrap gap-1 pl-4 sm:pl-0">
        {skills.map(skill => (
          <SkillNode
            key={skill.name}
            skill={skill}
            color={color}
            isHovered={hoveredSkill?.name === skill.name}
            onHover={setHoveredSkill}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </div>
    </motion.div>
  );
};

/**
 * TechStackVisual Component
 *
 * Renders skills in a hierarchical tree layout.
 * Hover on a skill to see proficiency percentage.
 *
 * @component
 * @returns {JSX.Element} Tree-based skill visualization
 */
const TechStackVisual = () => {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredSkill, setHoveredSkill] = useState(null);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <span className="text-secondary font-sans">
          <span className="font-bold">Node size</span> = proficiency level
        </span>
      </div>

      {/* Skill tree */}
      <div className="space-y-6">
        {resumeData.skills.map((group, i) => (
          <CategoryBranch
            key={group.category}
            category={group.category}
            skills={group.items}
            color={CATEGORY_COLORS[group.category] || '#e5e5e5'}
            hoveredSkill={hoveredSkill}
            setHoveredSkill={setHoveredSkill}
            shouldReduceMotion={shouldReduceMotion}
            delay={i * 0.1}
          />
        ))}
      </div>

      {/* Screen reader description */}
      <div className="sr-only" role="status" aria-live="polite">
        {hoveredSkill
          ? `${hoveredSkill.name}: ${hoveredSkill.proficiency}% proficiency`
          : 'Skill tree showing proficiency levels by category. Hover over skills for details.'}
      </div>
    </div>
  );
};

export default TechStackVisual;
