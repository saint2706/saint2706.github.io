/**
 * @fileoverview GameInstructions — Collapsible "How to Play" panel for the Games page.
 *
 * Renders a themed disclosure button that expands to show the goal and
 * step-by-step instructions (including keyboard controls) for the currently
 * selected game. Instructions are data-driven via the GAME_INSTRUCTIONS map so
 * new games only need a new entry.
 *
 * Features:
 * - Accessible disclosure pattern (aria-expanded / aria-controls / region)
 * - Animated expand/collapse with reduced-motion support
 * - Neubrutalism and Liquid theme styling
 *
 * @module components/games/GameInstructions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useTheme } from '../shared/theme-context';
import { GAME_INSTRUCTIONS } from './gameInstructionsData';

/**
 * Collapsible "How to Play" panel showing instructions for the active game.
 *
 * @component
 * @param {object} props
 * @param {string} props.gameId - Id of the currently selected game (key of GAME_INSTRUCTIONS).
 * @returns {JSX.Element|null} The instructions disclosure, or null for unknown game ids.
 */
const GameInstructions = React.memo(({ gameId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';

  const instructions = GAME_INSTRUCTIONS[gameId];
  if (!instructions) return null;

  const themeClass = (neubClass, liquidClass) => (isLiquid ? liquidClass : neubClass);
  const panelId = `${gameId}-instructions`;

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={themeClass(
          `w-full flex items-center justify-between gap-2 px-4 py-3 font-heading font-bold text-sm cursor-pointer
            bg-secondary text-primary border-nb border-[color:var(--color-border)] rounded-nb
            transition-transform motion-reduce:transform-none hover:-translate-x-0.5 hover:-translate-y-0.5`,
          `w-full flex items-center justify-between gap-2 px-4 py-3 font-heading font-semibold text-sm cursor-pointer
            lg-surface-2 text-[color:var(--text-primary)] rounded-full transition-all hover:brightness-110`
        )}
        style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
      >
        <span className="flex items-center gap-2">
          <HelpCircle size={18} aria-hidden="true" />
          How to Play {instructions.title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
          className="flex"
          aria-hidden="true"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={gameId}
            id={panelId}
            role="region"
            aria-label={`How to play ${instructions.title}`}
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={themeClass(
                'mt-3 px-5 py-4 bg-card border-nb border-[color:var(--color-border)] rounded-nb',
                'mt-3 px-5 py-4 lg-surface-2 rounded-3xl'
              )}
              style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
            >
              <p className="font-sans text-sm text-primary mb-3">
                <span className="font-heading font-bold">Goal:</span> {instructions.goal}
              </p>
              <ol className="list-decimal list-inside space-y-2 font-sans text-sm text-secondary">
                {instructions.steps.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

GameInstructions.displayName = 'GameInstructions';

export default GameInstructions;
