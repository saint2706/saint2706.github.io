/**
 * @fileoverview Lights Out — Toggle puzzle game.
 *
 * Features:
 * - 5×5 grid of toggleable lights
 * - Clicking a light toggles it AND adjacent lights (up/down/left/right)
 * - Goal: turn all lights off
 * - Random solvable initial state via reverse simulation
 * - Move counter, puzzle reset, win detection
 * - Keyboard navigation (arrow keys + Enter/Space)
 * - High score (fewest moves) in localStorage
 * - Neubrutalism styling
 *
 * @module components/games/LightsOut
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, RotateCcw, Trophy, Lightbulb } from 'lucide-react';

const SIZE = 5;

/**
 * Creates a solvable puzzle by starting from "all off" and applying random toggles.
 * This guarantees the puzzle is solvable.
 */
const createPuzzle = () => {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));

  // Apply 8-15 random toggles
  const toggles = 8 + Math.floor(Math.random() * 8);
  for (let t = 0; t < toggles; t++) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    // Toggle cell and neighbours
    grid[r][c] = !grid[r][c];
    if (r > 0) grid[r - 1][c] = !grid[r - 1][c];
    if (r < SIZE - 1) grid[r + 1][c] = !grid[r + 1][c];
    if (c > 0) grid[r][c - 1] = !grid[r][c - 1];
    if (c < SIZE - 1) grid[r][c + 1] = !grid[r][c + 1];
  }

  // Ensure at least some lights are on
  if (grid.every(row => row.every(cell => !cell))) {
    // All off already — toggle center
    const mid = Math.floor(SIZE / 2);
    grid[mid][mid] = true;
    if (mid > 0) grid[mid - 1][mid] = true;
    if (mid < SIZE - 1) grid[mid + 1][mid] = true;
    if (mid > 0) grid[mid][mid - 1] = true;
    if (mid < SIZE - 1) grid[mid][mid + 1] = true;
  }

  return grid;
};

const LightsOut = () => {
  const shouldReduceMotion = useReducedMotion();
  const [gameState, setGameState] = useState('idle'); // idle | playing | won
  const [grid, setGrid] = useState(createPuzzle);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const s = localStorage.getItem('lightsOutBest');
    return s ? parseInt(s, 10) : null;
  });
  const [focusR, setFocusR] = useState(0);
  const [focusC, setFocusC] = useState(0);

  const toggleCell = useCallback(
    (r, c) => {
      if (gameState !== 'playing') return;

      setGrid(prev => {
        const next = prev.map(row => [...row]);
        // Toggle cell and adjacent
        next[r][c] = !next[r][c];
        if (r > 0) next[r - 1][c] = !next[r - 1][c];
        if (r < SIZE - 1) next[r + 1][c] = !next[r + 1][c];
        if (c > 0) next[r][c - 1] = !next[r][c - 1];
        if (c < SIZE - 1) next[r][c + 1] = !next[r][c + 1];

        // Check win
        const newMoves = moves + 1;
        if (next.every(row => row.every(cell => !cell))) {
          if (!bestScore || newMoves < bestScore) {
            setBestScore(newMoves);
            localStorage.setItem('lightsOutBest', newMoves.toString());
          }
          setGameState('won');
        }

        return next;
      });
      setMoves(m => m + 1);
    },
    [gameState, moves, bestScore]
  );

  const startGame = useCallback(() => {
    setGrid(createPuzzle());
    setMoves(0);
    setFocusR(0);
    setFocusC(0);
    setGameState('playing');
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = e => {
      if (gameState !== 'playing') return;
      let r = focusR;
      let c = focusC;

      switch (e.key) {
        case 'ArrowRight':
          c = Math.min(SIZE - 1, c + 1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          c = Math.max(0, c - 1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          r = Math.min(SIZE - 1, r + 1);
          e.preventDefault();
          break;
        case 'ArrowUp':
          r = Math.max(0, r - 1);
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          toggleCell(focusR, focusC);
          return;
        default:
          return;
      }
      setFocusR(r);
      setFocusC(c);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, focusR, focusC, toggleCell]);

  const lightsOn = grid.flat().filter(Boolean).length;

  const getAnnouncement = () => {
    if (gameState === 'idle') return 'Lights Out puzzle ready. Press Start to begin.';
    if (gameState === 'won')
      return `Congratulations! All lights off in ${moves} moves!${bestScore === moves ? ' New best!' : ''}`;
    return `Playing Lights Out. ${lightsOn} lights remaining. Moves: ${moves}.`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {getAnnouncement()}
      </div>

      {/* Score board */}
      <div
        className="flex gap-6 bg-secondary border-[3px] border-[color:var(--color-border)] p-4"
        style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
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
        <div className="w-[3px] bg-[color:var(--color-border)]" />
        <div className="flex items-center gap-2 px-4">
          <Lightbulb size={16} className="text-fun-yellow" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Lights</div>
            <div className="text-2xl font-heading font-bold text-fun-yellow">{lightsOn}</div>
          </div>
        </div>
        <div className="w-[3px] bg-[color:var(--color-border)]" />
        <div className="flex items-center gap-2 px-4">
          <Trophy size={16} className="text-fun-pink" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Best</div>
            <div className="text-2xl font-heading font-bold text-fun-pink">{bestScore ?? '—'}</div>
          </div>
        </div>
      </div>

      {/* Puzzle grid */}
      <div className="relative">
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="p-4 bg-card border-[3px] border-[color:var(--color-border)]"
          style={{ boxShadow: 'var(--nb-shadow)' }}
        >
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
            role="grid"
            aria-label="Lights Out puzzle grid"
          >
            {grid.map((row, r) =>
              row.map((isOn, c) => (
                <motion.button
                  key={`${r}-${c}`}
                  onClick={() => toggleCell(r, c)}
                  disabled={gameState !== 'playing'}
                  tabIndex={focusR === r && focusC === c ? 0 : -1}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                  aria-label={`Row ${r + 1}, Column ${c + 1}: light ${isOn ? 'on' : 'off'}`}
                  aria-pressed={isOn}
                  className={`w-12 h-12 md:w-14 md:h-14 border-[3px] border-[color:var(--color-border)] rounded-nb cursor-pointer select-none transition-all motion-reduce:transition-none
                    ${isOn ? 'bg-fun-yellow -translate-x-0.5 -translate-y-0.5' : 'bg-secondary'}
                    ${focusR === r && focusC === c && gameState === 'playing' ? 'ring-2 ring-accent' : ''}`}
                  style={{
                    boxShadow: isOn ? 'var(--nb-shadow-hover)' : '2px 2px 0 var(--color-border)',
                  }}
                >
                  <span className="text-lg" aria-hidden="true">
                    {isOn ? '💡' : ''}
                  </span>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>

        {/* Overlays */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center gap-4 border-[3px] border-[color:var(--color-border)]"
              style={{ boxShadow: 'var(--nb-shadow)' }}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="text-xl font-heading font-bold text-black bg-fun-yellow px-4 py-2 border-[3px] border-[color:var(--color-border)]"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                Lights Out
              </div>
              <div className="text-sm text-secondary text-center px-4 font-sans">
                Turn off all the lights!
                <br />
                <span className="text-muted">Clicking toggles adjacent lights too</span>
              </div>
              <motion.button
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                onClick={startGame}
                className="px-6 py-3 bg-accent text-white font-heading font-bold border-[3px] border-[color:var(--color-border)] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                autoFocus
              >
                <Play size={20} aria-hidden="true" />
                Start Puzzle
              </motion.button>
            </motion.div>
          )}

          {gameState === 'won' && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center gap-4 border-[3px] border-[color:var(--color-border)]"
              style={{ boxShadow: 'var(--nb-shadow)' }}
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={shouldReduceMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.5 }}
                className="text-center"
              >
                <div
                  className="text-2xl font-heading font-bold text-white bg-fun-pink px-4 py-2 border-[3px] border-[color:var(--color-border)] mb-4"
                  style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                >
                  Lights Out! 🎉
                </div>
                <div className="text-lg text-secondary font-sans">
                  Solved in <span className="font-heading font-bold text-accent">{moves}</span>{' '}
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
                    <span className="font-heading font-bold text-black bg-fun-yellow px-2 py-1 border-2 border-[color:var(--color-border)]">
                      New Best!
                    </span>
                  </motion.div>
                )}
              </motion.div>
              <motion.button
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                onClick={startGame}
                className="px-6 py-2 bg-accent text-white font-heading font-bold border-[3px] border-[color:var(--color-border)] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                autoFocus
              >
                <RotateCcw size={18} aria-hidden="true" />
                New Puzzle
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div
        className="text-sm md:text-xs text-secondary text-center px-4 py-2 bg-secondary border-[3px] border-[color:var(--color-border)] font-sans leading-relaxed"
        style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
      >
        Arrow keys to navigate · Enter to toggle
      </div>
    </div>
  );
};

export default LightsOut;
