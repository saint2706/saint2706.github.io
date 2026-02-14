/**
 * @fileoverview Games page - Easter egg feature with Tic Tac Toe and Snake games.
 */

import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  Gamepad2,
  Grid3X3,
  Sparkles,
  Loader2,
  Layers,
  Bomb,
  Disc,
  Target,
  Lightbulb,
} from 'lucide-react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { resumeData } from '../../data/resume';
import { safeJSONStringify } from '../../utils/security';
import ThemedButton from '../shared/ThemedButton';
import ThemedCard from '../shared/ThemedCard';
import ThemedChip from '../shared/ThemedChip';
import { useTheme } from '../shared/theme-context';

// Lazy load game components to reduce initial bundle size
const TicTacToe = lazy(() => import('../games/TicTacToe'));
const SnakeGame = lazy(() => import('../games/SnakeGame'));
const MemoryMatch = lazy(() => import('../games/MemoryMatch'));
const Minesweeper = lazy(() => import('../games/Minesweeper'));
const SimonSays = lazy(() => import('../games/SimonSays'));
const WhackAMole = lazy(() => import('../games/WhackAMole'));
const LightsOut = lazy(() => import('../games/LightsOut'));

/**
 * Loading spinner for game components
 * Matches approximate height of games to minimize layout shift
 */
const GameLoader = () => (
  <div
    className="flex items-center justify-center min-h-[350px]"
    role="status"
    aria-label="Loading game"
  >
    <Loader2 className="w-10 h-10 animate-spin text-fun-yellow motion-reduce:animate-none" />
  </div>
);

/**
 * Games page component (easter egg feature)
 *
 * Features:
 * - Hidden games page (noindex in SEO)
 * - Tab interface to switch between games
 * - Tic Tac Toe with AI opponent
 * - Classic Snake game
 * - Easter egg badge and messaging
 *
 * @component
 * @returns {JSX.Element} Games page with playable games
 */
const Games = () => {
  const [activeGame, setActiveGame] = useState('tictactoe');
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isAura = theme === 'aura';
  const canonicalUrl = `${resumeData.basics.website}/games`;
  const description =
    'A secret games easter egg! Play Tic Tac Toe, Snake, Memory Match, Minesweeper, Simon Says, Whack-a-Mole, and Lights Out.';
  const title = `Games | ${resumeData.basics.name}`;

  /** Available games configuration */
  const games = [
    { id: 'tictactoe', label: 'Tic Tac Toe', icon: Grid3X3, color: 'bg-accent' },
    { id: 'snake', label: 'Snake', icon: Sparkles, color: 'bg-fun-pink' },
    { id: 'memory', label: 'Memory', icon: Layers, color: 'bg-fun-yellow' },
    { id: 'minesweeper', label: 'Mines', icon: Bomb, color: 'bg-emerald-500' },
    { id: 'simon', label: 'Simon', icon: Disc, color: 'bg-violet-500' },
    { id: 'whack', label: 'Whack', icon: Target, color: 'bg-orange-500' },
    { id: 'lightsout', label: 'Lights', icon: Lightbulb, color: 'bg-cyan-500' },
  ];

  const themeClass = (neubClass, auraClass) => (isAura ? auraClass : neubClass);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={description} />
        <meta name="robots" content="noindex" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
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
                name: 'Games',
                item: canonicalUrl,
              },
            ],
          })}
        </script>
      </Helmet>

      <div
        className={themeClass(
          'max-w-4xl mx-auto py-12 px-4',
          'max-w-4xl mx-auto py-12 px-4 text-[color:var(--color-text-primary)]'
        )}
      >
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="mb-12 text-center"
        >
          {/* Easter Egg Badge — sticker rotation stamp-in */}
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0, rotate: 5 }}
            animate={{ scale: 1, rotate: -2 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.5, delay: 0.1 }
            }
            className={themeClass(
              '',
              'hover:brightness-110 hover:scale-[1.015] transition-[filter,transform] motion-reduce:transform-none'
            )}
            style={isAura ? undefined : { '--sticker-rotate': '-2deg' }}
          >
            <ThemedChip
              variant="pink"
              className={themeClass(
                'mb-6 px-4 py-2 font-heading font-bold nb-sticker rounded-nb text-white',
                'mb-6 px-4 py-2 font-heading font-semibold rounded-full aura-chip border border-[color:var(--border-soft)]'
              )}
              style={isAura ? undefined : { boxShadow: 'var(--nb-shadow)' }}
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="text-sm">Easter Egg Found!</span>
            </ThemedChip>
          </motion.div>

          <h1
            className={themeClass(
              'font-heading text-4xl md:text-5xl font-bold mb-4',
              'font-heading text-4xl md:text-5xl font-semibold mb-4'
            )}
          >
            <ThemedCard
              as="span"
              variant={isAura ? 'default' : 'highlighted'}
              className={themeClass(
                'inline-block px-6 py-3 rounded-nb nb-stamp-in',
                'inline-block px-6 py-3 rounded-3xl aura-glass border border-[color:var(--border-soft)]'
              )}
              style={isAura ? undefined : { boxShadow: 'var(--nb-shadow)' }}
            >
              Game Zone
            </ThemedCard>
          </h1>
          <p className="text-secondary max-w-xl mx-auto mt-6 font-sans">
            You discovered the secret games page! Take a break and have some fun.
          </p>
        </motion.div>

        {/* Game Selector Tabs - Neubrutalism Style */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div
            className="flex gap-3 flex-wrap justify-center"
            role="tablist"
            aria-label="Select a game to play"
          >
            {games.map(game => (
              <ThemedButton
                as="button"
                variant="secondary"
                size="md"
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                role="tab"
                aria-selected={activeGame === game.id}
                aria-controls={`${game.id}-panel`}
                id={`${game.id}-tab`}
                className={`flex items-center gap-2 px-6 py-3 font-heading font-bold text-sm rounded-nb
                                    ${
                                      activeGame === game.id
                                        ? isAura
                                          ? 'aura-chip border border-[color:var(--border-soft)] rounded-full text-[color:var(--color-text-primary)] brightness-110 scale-[1.015]'
                                          : `${game.color} text-white`
                                        : themeClass(
                                            'bg-card text-[color:var(--color-text-primary)]',
                                            'aura-glass border border-[color:var(--border-soft)] rounded-full text-[color:var(--color-text-secondary)] hover:brightness-110 hover:scale-[1.015]'
                                          )
                                    }`}
                style={{
                  boxShadow:
                    !isAura && activeGame === game.id
                      ? 'var(--nb-shadow-hover)'
                      : !isAura
                        ? 'var(--nb-shadow)'
                        : undefined,
                }}
              >
                <game.icon size={18} aria-hidden="true" />
                <span className="flex items-center gap-2">
                  <span>{game.label}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide transition-opacity ${themeClass(
                      'border-[2px] border-[color:var(--color-border)] bg-card text-primary',
                      'aura-chip border border-[color:var(--border-soft)] text-[color:var(--color-text-secondary)]'
                    )} ${activeGame === game.id ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden={activeGame !== game.id}
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Selected
                  </span>
                </span>
              </ThemedButton>
            ))}
          </div>
        </motion.div>

        {/* Game Container */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3 }}
          className="flex justify-center"
        >
          <ThemedCard
            variant="default"
            className={themeClass(
              'bg-card border-nb border-[color:var(--color-border)] p-6 md:p-8 rounded-nb',
              'aura-glass border border-[color:var(--border-soft)] p-6 md:p-8 rounded-3xl'
            )}
            style={isAura ? undefined : { boxShadow: 'var(--nb-shadow)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGame}
                initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                role="tabpanel"
                id={`${activeGame}-panel`}
                aria-labelledby={`${activeGame}-tab`}
              >
                <Suspense fallback={<GameLoader />}>
                  {activeGame === 'tictactoe' && <TicTacToe />}
                  {activeGame === 'snake' && <SnakeGame />}
                  {activeGame === 'memory' && <MemoryMatch />}
                  {activeGame === 'minesweeper' && <Minesweeper />}
                  {activeGame === 'simon' && <SimonSays />}
                  {activeGame === 'whack' && <WhackAMole />}
                  {activeGame === 'lightsout' && <LightsOut />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </ThemedCard>
        </motion.div>

        {/* Footer hint */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <div
            className="bg-secondary border-nb border-[color:var(--color-border)] px-6 py-3 rounded-nb"
            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
          >
            <p className="text-secondary text-sm md:text-xs font-sans text-center leading-relaxed">
              Psst... you found this page by going to /games. Keep it a secret! 🤫
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Games;
