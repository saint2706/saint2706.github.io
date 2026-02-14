/**
 * @fileoverview Memory Match Game — Flip cards to find matching tech icon pairs.
 *
 * Features:
 * - 4×4 grid with 8 pairs of tech-themed emoji icons
 * - Card flip animation with Framer Motion
 * - Move counter and best-score persistence (localStorage)
 * - Win state with celebration
 * - Keyboard navigation (arrow keys + Enter/Space to flip)
 * - Full accessibility (ARIA roles, live regions, reduced motion)
 *
 * @module components/games/MemoryMatch
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { useTheme } from '../shared/theme-context';
import { getGameThemeStyles } from './gameThemeStyles';

/** Icon set representing tech brands/concepts */
const ICONS = ['⚛️', '🐍', '🟨', '🌐', '🎨', '🐙', '🐳', '📦'];

/**
 * Shuffles an array using Fisher-Yates algorithm.
 * @param {Array} arr
 * @returns {Array}
 */
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Creates a shuffled deck of paired cards */
const createDeck = () =>
  shuffle([...ICONS, ...ICONS].map((icon, i) => ({ id: i, icon, matched: false })));

const MemoryMatch = () => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isAura = theme === 'aura';
  const ui = getGameThemeStyles(isAura);
  const [gameState, setGameState] = useState('idle'); // idle | playing | won
  const [cards, setCards] = useState(createDeck);
  const [flipped, setFlipped] = useState([]); // indices of currently flipped cards
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const s = localStorage.getItem('memoryBestScore');
    return s ? parseInt(s, 10) : null;
  });
  const [focusIndex, setFocusIndex] = useState(0);
  const gridRef = useRef(null);
  const lockRef = useRef(false); // prevent clicks during match check

  /** Start / restart the game */
  const startGame = useCallback(() => {
    setCards(createDeck());
    setFlipped([]);
    setMoves(0);
    setGameState('playing');
    lockRef.current = false;
  }, []);

  /** Handle card click */
  const flipCard = useCallback(
    index => {
      if (lockRef.current) return;
      if (gameState !== 'playing') return;
      if (flipped.includes(index)) return;
      if (cards[index].matched) return;

      const next = [...flipped, index];
      setFlipped(next);

      if (next.length === 2) {
        setMoves(m => m + 1);
        lockRef.current = true;

        const [a, b] = next;
        if (cards[a].icon === cards[b].icon) {
          // Match found
          setTimeout(() => {
            setCards(prev => {
              const updated = prev.map((c, i) =>
                i === a || i === b ? { ...c, matched: true } : c
              );
              // Check win
              if (updated.every(c => c.matched)) {
                const finalMoves = moves + 1;
                if (!bestScore || finalMoves < bestScore) {
                  setBestScore(finalMoves);
                  localStorage.setItem('memoryBestScore', finalMoves.toString());
                }
                setGameState('won');
              }
              return updated;
            });
            setFlipped([]);
            lockRef.current = false;
          }, 500);
        } else {
          // No match — flip back
          setTimeout(() => {
            setFlipped([]);
            lockRef.current = false;
          }, 800);
        }
      }
    },
    [gameState, flipped, cards, moves, bestScore]
  );

  /** Keyboard navigation */
  useEffect(() => {
    const handleKey = e => {
      if (gameState !== 'playing') return;
      const cols = 4;
      let idx = focusIndex;

      switch (e.key) {
        case 'ArrowRight':
          idx = Math.min(15, idx + 1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          idx = Math.max(0, idx - 1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          idx = Math.min(15, idx + cols);
          e.preventDefault();
          break;
        case 'ArrowUp':
          idx = Math.max(0, idx - cols);
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          flipCard(focusIndex);
          return;
        default:
          return;
      }
      setFocusIndex(idx);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, focusIndex, flipCard]);

  const isFlipped = i => flipped.includes(i) || cards[i].matched;

  const getAnnouncement = () => {
    if (gameState === 'idle') return 'Memory Match ready. Press Start to begin.';
    if (gameState === 'won')
      return `You won in ${moves} moves!${bestScore === moves ? ' New best score!' : ''}`;
    return `Playing Memory Match. Moves: ${moves}.`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {getAnnouncement()}
      </div>

      {/* Score board */}
      <div
        className={ui.scoreboard}
        style={ui.style.raised}
      >
        <div className="px-4">
          <div className="text-sm md:text-xs text-secondary font-heading">Moves</div>
          <motion.div
            key={moves}
            initial={shouldReduceMotion ? false : { scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className="text-2xl font-heading font-bold text-accent"
          >
            {moves}
          </motion.div>
        </div>
        <div className={ui.separator} />
        <div className="flex items-center gap-2 px-4">
          <Trophy size={18} className="text-fun-yellow" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Best</div>
            <div className="text-2xl font-heading font-bold text-fun-yellow">
              {bestScore ?? '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Game grid */}
      <div className="relative">
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className={`${ui.boardShell} ${ui.boardPadding}`}
          style={ui.style.board}
        >
          <div
            ref={gridRef}
            className="grid grid-cols-4 gap-3"
            role="grid"
            aria-label="Memory Match game board"
          >
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => flipCard(i)}
                aria-label={
                  isFlipped(i) ? `Card ${i + 1}: ${card.icon}` : `Card ${i + 1}: face down`
                }
                aria-pressed={isFlipped(i)}
                tabIndex={gameState === 'playing' && focusIndex === i ? 0 : -1}
                className={`relative w-16 h-16 md:w-[72px] md:h-[72px] ${ui.tileBase} text-2xl cursor-pointer
                  transition-all motion-reduce:transition-none
                  ${
                    card.matched
                      ? ui.tileWin
                      : isFlipped(i)
                        ? `${ui.tileActive} ${isAura ? 'scale-[0.985]' : ''}`
                        : `${ui.tileIdle} text-transparent ${isAura ? 'hover:brightness-110' : 'hover:-translate-x-0.5 hover:-translate-y-0.5'} ${focusIndex === i && gameState === 'playing' ? 'ring-2 ring-accent' : ''}`
                  }`}
                style={{
                  ...(isFlipped(i) ? ui.style.tileActive : ui.style.tile),
                }}
              >
                <AnimatePresence mode="wait">
                  {isFlipped(i) ? (
                    <motion.span
                      key="face"
                      initial={shouldReduceMotion ? false : { rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { rotateY: -90, opacity: 0 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: isAura ? 0.15 : 0.2 }}
                      className="absolute inset-0 flex items-center justify-center text-2xl"
                      aria-hidden="true"
                    >
                      {card.icon}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="back"
                      initial={shouldReduceMotion ? false : { rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { rotateY: 90, opacity: 0 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: isAura ? 0.15 : 0.2 }}
                      className="absolute inset-0 flex items-center justify-center text-xl text-secondary"
                      aria-hidden="true"
                    >
                      ?
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Idle overlay */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className={ui.overlay}
              style={ui.style.board}
              role="dialog"
              aria-modal="true"
              aria-labelledby="memory-start-title"
              aria-describedby="memory-start-desc"
            >
              <div
                id="memory-start-title"
                className={`${ui.banner} text-xl text-black bg-fun-yellow`}
                style={ui.style.raised}
              >
                Memory Match
              </div>
              <div
                id="memory-start-desc"
                className="text-sm text-secondary text-center px-4 font-sans"
              >
                Find all matching pairs
                <br />
                <span className="text-muted">Arrow keys to navigate, Enter to flip</span>
              </div>
              <motion.button
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                onClick={startGame}
                className={ui.buttonPrimary}
                style={ui.style.raised}
                autoFocus
              >
                <Play size={20} aria-hidden="true" />
                Start Game
              </motion.button>
            </motion.div>
          )}

          {gameState === 'won' && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className={ui.overlay}
              style={ui.style.board}
              role="dialog"
              aria-modal="true"
              aria-labelledby="memory-win-title"
              aria-describedby="memory-win-desc"
            >
              <motion.div
                initial={shouldReduceMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: isAura ? 0.2 : 0.5 }}
                className="text-center"
              >
                <Sparkles className="w-10 h-10 text-fun-yellow mx-auto mb-2" aria-hidden="true" />
                <div
                  id="memory-win-title"
                  className={`${ui.banner} text-2xl text-white bg-fun-pink mb-4`}
                  style={ui.style.raised}
                >
                  You Win!
                </div>
                <div id="memory-win-desc" className="text-lg text-secondary font-sans">
                  Completed in <span className="font-heading font-bold text-accent">{moves}</span>{' '}
                  moves
                </div>
                {bestScore === moves && (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : undefined}
                    className="flex items-center justify-center gap-2 mt-2"
                  >
                    <Trophy size={18} className="text-fun-yellow" aria-hidden="true" />
                    <span className={`${ui.banner} text-black bg-fun-yellow px-2 py-1 text-sm`}>
                      New Best Score!
                    </span>
                  </motion.div>
                )}
              </motion.div>
              <motion.button
                initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: isAura ? 0.1 : 0.2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                onClick={startGame}
                className={ui.buttonPrimary}
                style={ui.style.raised}
                autoFocus
              >
                <RotateCcw size={18} aria-hidden="true" />
                Play Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemoryMatch;
