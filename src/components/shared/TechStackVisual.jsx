/**
 * @fileoverview Skill Tree visualization component.
 * Displays skills in a hierarchical tree layout organized by category.
 */

import React, {
  useCallback,
  useRef,
  useContext,
  createContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { resumeData } from '../../data/resume';
import { useTheme } from './theme-context';

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
const SkillNode = React.memo(({ skill, color, shouldReduceMotion, isAura }) => {
  const { subscribe, getHoveredSkill, setHoveredSkill } = useContext(HoverContext);

  // Size based on proficiency: min 8px, max 16px
  const nodeSize = 8 + (skill.proficiency / 100) * 8;

  // Selector-based subscription: this node only re-renders when its own IS_HOVERED state changes.
  // This minimizes component re-renders on hover, though updates still notify all subscribers.
  const checkIsHovered = useCallback(() => {
    return getHoveredSkill() === skill.name;
  }, [getHoveredSkill, skill.name]);

  const isHovered = useSyncExternalStore(
    subscribe,
    checkIsHovered,
    checkIsHovered
  );

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
      {isAura ? (
        <div
          className="w-4 h-px rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}99 0%, ${color}33 100%)`,
          }}
        />
      ) : (
        <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: color }} />
      )}

      {/* Skill node */}
      <motion.button
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={`relative flex items-center gap-2 px-3 py-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isAura
            ? 'rounded-full border border-[color:var(--border-soft)] focus-visible:ring-accent/70 focus-visible:ring-offset-transparent'
            : 'border-2 focus-visible:ring-black'
        }`}
        style={{
          borderColor: isAura ? 'var(--border-soft)' : 'var(--color-border)',
          background: isAura
            ? `linear-gradient(135deg, ${color}${isHovered ? '2e' : '1f'} 0%, rgba(255,255,255,0.05) 100%)`
            : undefined,
          backgroundColor: isAura ? undefined : isHovered ? color : 'var(--color-secondary)',
          boxShadow: isAura
            ? isHovered
              ? `0 0 0 1px ${color}66, 0 8px 22px -14px ${color}cc`
              : '0 8px 16px -16px rgba(0,0,0,0.55)'
            : isHovered
              ? '3px 3px 0 var(--color-border)'
              : '2px 2px 0 var(--color-border)',
        }}
        whileHover={
          shouldReduceMotion ? {} : isAura ? { y: -1, scale: 1.01 } : { x: 2, y: -2 }
        }
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
            borderColor: isAura ? 'color-mix(in srgb, var(--border-soft) 55%, #fff 45%)' : 'var(--color-border)',
            boxShadow: isAura ? `0 0 10px -3px ${color}cc` : undefined,
          }}
        />

        {/* Skill name - always visible */}
        <span className={`text-sm font-heading font-bold whitespace-nowrap ${isAura ? 'text-primary' : 'text-black'}`}>
          {skill.name}
        </span>

        {/* Proficiency percentage on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className={`text-xs font-sans font-bold overflow-hidden ${isAura ? 'text-primary' : 'text-black'}`}
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
const CategoryBranch = React.memo(({ category, skills, color, shouldReduceMotion, delay, isAura }) => {
  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-2 sm:gap-4"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { delay }}
    >
      {/* Category label */}
      <div
        className={`flex items-center gap-2 px-3 py-2 font-heading font-bold text-sm sm:min-w-[180px] flex-shrink-0 ${isAura ? 'rounded-full border border-[color:var(--border-soft)]' : 'border-2'}`}
        style={{
          borderColor: isAura ? 'var(--border-soft)' : 'var(--color-border)',
          background: isAura
            ? `linear-gradient(135deg, ${color}40 0%, rgba(255,255,255,0.08) 100%)`
            : undefined,
          backgroundColor: isAura ? undefined : color,
          boxShadow: isAura ? '0 10px 24px -18px rgba(0,0,0,0.7)' : '3px 3px 0 var(--color-border)',
          color: isAura ? 'var(--text-primary)' : '#000',
        }}
      >
        <div
          className={`w-3 h-3 ${isAura ? 'rounded-full border' : 'border-2'}`}
          style={{
            borderColor: isAura ? 'var(--border-soft)' : 'var(--color-border)',
            backgroundColor: isAura ? color : '#fff',
            boxShadow: isAura ? `0 0 8px -2px ${color}` : undefined,
          }}
        />
        {category}
      </div>

      {/* Connecting line */}
      <div className="hidden sm:flex items-center" style={{ width: '20px' }}>
        {isAura ? (
          <div
            className="w-full h-px rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}aa 0%, ${color}22 100%)` }}
          />
        ) : (
          <div className="w-full h-0.5 border-t-2" style={{ borderColor: color }} />
        )}
      </div>

      {/* Skills container */}
      <div className="flex flex-wrap gap-1 pl-4 sm:pl-0">
        {skills.map(skill => (
          <SkillNode
            key={skill.name}
            skill={skill}
            color={color}
            shouldReduceMotion={shouldReduceMotion}
            isAura={isAura}
          />
        ))}
      </div>
    </motion.div>
  );
});

CategoryBranch.displayName = 'CategoryBranch';

/**
 * Announcement component for Screen Readers
 * Subscribes to hover changes independently to prevent full tree re-renders.
 */
const TechStackAnnouncer = () => {
  const { subscribe, getHoveredSkill, skillLookup } = useContext(HoverContext);

  const getSnapshot = useCallback(() => {
    const name = getHoveredSkill();
    return name ? skillLookup.get(name) : null;
  }, [getHoveredSkill, skillLookup]);

  const hoveredSkill = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <div className="sr-only" role="status" aria-live="polite">
      {hoveredSkill
        ? `${hoveredSkill.name}: ${hoveredSkill.proficiency}% proficiency`
        : 'Skill tree showing proficiency levels by category. Hover over skills for details.'}
    </div>
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
  const { theme } = useTheme();
  const isAura = theme === 'aura';

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
  const getHoveredSkill = useCallback(() => hoveredSkillRef.current, []);

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
      }
    },
    []
  );

  // Stable context value
  const contextValue = useMemo(
    () => ({ subscribe, getHoveredSkill, setHoveredSkill, skillLookup }),
    [subscribe, getHoveredSkill, setHoveredSkill, skillLookup]
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
              isAura={isAura}
            />
          ))}
        </div>

        {/* Screen reader description */}
        <TechStackAnnouncer />
      </div>
    </HoverContext.Provider>
  );
};

export default TechStackVisual;
