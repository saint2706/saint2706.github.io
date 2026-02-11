/**
 * @fileoverview Skill Tree visualization component.
 * Displays skills in a hierarchical tree layout organized by category.
 */

import React, {
  useState,
  useCallback,
  useRef,
  useContext,
  createContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
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
 * Context for managing hover state subscriptions.
 * Prevents prop drilling and unnecessary re-renders of intermediate components.
 */
const HoverContext = createContext(null);

/**
 * Single Skill Node in the tree
 * Uses useSyncExternalStore to subscribe to hover changes for React 18 compatibility.
 */
const SkillNode = React.memo(({ skill, color, shouldReduceMotion }) => {
  const { subscribe, getSnapshot, setHoveredSkill } = useContext(HoverContext);

  // Size based on proficiency: min 8px, max 16px
  const nodeSize = 8 + (skill.proficiency / 100) * 8;

  // Subscribe to hover store using useSyncExternalStore for React 18 compatibility
  const hoveredSkillName = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot // Server snapshot (same as client for this use case)
  );

  const isHovered = hoveredSkillName === skill.name;

  const handleMouseEnter = useCallback(
    () => setHoveredSkill(skill.name),
    [setHoveredSkill, skill.name]
  );
  const handleMouseLeave = useCallback(() => setHoveredSkill(null), [setHoveredSkill]);

  return (
    <motion.div
      className="relative flex items-center gap-2 py-1"
      initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Branch line */}
      <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: color }} />

      {/* Skill node */}
      <motion.button
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="relative flex items-center gap-2 px-3 py-1.5 border-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: isHovered ? color : 'var(--color-secondary)',
          boxShadow: isHovered ? '3px 3px 0 var(--color-border)' : '2px 2px 0 var(--color-border)',
        }}
        whileHover={shouldReduceMotion ? {} : { x: 2, y: -2 }}
        transition={{ duration: 0.1 }}
        aria-label={`View proficiency details for ${skill.name}`}
        aria-pressed={isHovered}
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
      </motion.button>
    </motion.div>
  );
});

// Display name for debugging
SkillNode.displayName = 'SkillNode';

/**
 * Category Branch with its skills
 * Memoized to prevent re-renders when other categories are interacted with.
 */
const CategoryBranch = React.memo(({ category, skills, color, shouldReduceMotion, delay }) => {
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
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </div>
    </motion.div>
  );
});

CategoryBranch.displayName = 'CategoryBranch';

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
  // State only for Screen Reader updates (decoupled from visual updates)
  const [hoveredSkillForSR, setHoveredSkillForSR] = useState(null);

  // Hover store for useSyncExternalStore
  const hoveredSkillRef = useRef(null);
  const subscribersRef = useRef(new Set());

  // Memoize skill lookup map to avoid repeated array traversals on hover
  const skillLookup = useMemo(() => {
    const map = new Map();
    resumeData.skills.forEach(group => {
      group.items.forEach(skill => {
        map.set(skill.name, skill);
      });
    });
    return map;
  }, []);

  // Get current snapshot of hovered skill name
  const getSnapshot = useCallback(() => hoveredSkillRef.current, []);

  // Subscribe function for useSyncExternalStore
  const subscribe = useCallback(callback => {
    subscribersRef.current.add(callback);
    return () => subscribersRef.current.delete(callback);
  }, []);

  // Set hovered skill and notify only if changed
  const setHoveredSkill = useCallback(
    skillName => {
      const prevSkillName = hoveredSkillRef.current;
      if (prevSkillName !== skillName) {
        hoveredSkillRef.current = skillName;
        // Notify all subscribers (useSyncExternalStore requires notifying all)
        subscribersRef.current.forEach(callback => callback());

        // Update SR state for accessibility using memoized lookup
        const skillObj = skillName ? skillLookup.get(skillName) : null;
        setHoveredSkillForSR(skillObj);
      }
    },
    [skillLookup]
  );

  // Stable context value
  const contextValue = useMemo(
    () => ({ subscribe, getSnapshot, setHoveredSkill }),
    [subscribe, getSnapshot, setHoveredSkill]
  );

  return (
    <HoverContext.Provider value={contextValue}>
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
              shouldReduceMotion={shouldReduceMotion}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* Screen reader description */}
        <div className="sr-only" role="status" aria-live="polite">
          {hoveredSkillForSR
            ? `${hoveredSkillForSR.name}: ${hoveredSkillForSR.proficiency}% proficiency`
            : 'Skill tree showing proficiency levels by category. Hover over skills for details.'}
        </div>
      </div>
    </HoverContext.Provider>
  );
};

export default TechStackVisual;
