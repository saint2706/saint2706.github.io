/**
 * @fileoverview LightsOut — Toggle puzzle game.
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

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, RotateCcw, Trophy, Lightbulb } from 'lucide-react';
import { useTheme } from '../shared/theme-context';
import { getGameThemeStyles } from './gameThemeStyles';

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

/**
 * Individual cell component for the grid.
 * Memoized to prevent re-renders of unaffected cells.
 */
const LightsOutCell = React.memo(
  ({ r, c, isOn, isFocused, isDisabled, onToggle, shouldReduceMotion }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
      if (isFocused && !isDisabled) {
        buttonRef.current?.focus();
      }
    }, [isFocused, isDisabled]);

    return (
      <motion.button
        ref={buttonRef}
        onClick={() => onToggle(r, c)}
        disabled={isDisabled}
        tabIndex={isFocused ? 0 : -1}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
        aria-label={`Row ${r + 1}, Column ${c + 1}: light ${isOn ? 'on' : 'off'}`}
        aria-pressed={isOn}
        className={`w-12 h-12 md:w-14 md:h-14 border-[3px] border-[color:var(--color-border)] rounded-nb cursor-pointer select-none transition-all motion-reduce:transition-none
        ${isOn ? 'bg-fun-yellow -translate-x-0.5 -translate-y-0.5' : 'bg-secondary'}
        ${isFocused && !isDisabled ? 'ring-2 ring-accent' : ''}`}
        style={{
          boxShadow: isOn ? 'var(--nb-shadow-hover)' : '2px 2px 0 var(--color-border)',
        }}
      >
        <span className="text-lg" aria-hidden="true">
          {isOn ? '💡' : ''}
        </span>
      </motion.button>
    );
  }
);
LightsOutCell.displayName = 'LightsOutCell';

const LightsOut = () => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const ui = getGameThemeStyles(isLiquid);
  const [gameState, setGameState] = useState('idle'); // idle | playing | won
  const [grid, setGrid] = useState(createPuzzle);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const s = localStorage.getItem('lightsOutBest');
    return s ? parseInt(s, 10) : null;
  });
  const [focusR, setFocusR] = useState(0);
  const [focusC, setFocusC] = useState(0);

  // Check for win condition whenever grid updates
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Check if all lights are off
    const allOff = grid.every(row => row.every(cell => !cell));

    if (allOff) {
      // eslint-disable-next-line
      setGameState('won');
      if (!bestScore || moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem('lightsOutBest', moves.toString());
      }
    }
  }, [grid, moves, gameState, bestScore]);

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
        return next;
      });
      setMoves(m => m + 1);
    },
    [gameState]
  );

  const startGame = useCallback(() => {
    setGrid(createPuzzle());
    setMoves(0);
    setFocusR(0);
    setFocusC(0);
    setGameState('playing');
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    e => {
      if (gameState !== 'playing') return;
      let r = focusR;
      let c = focusC;
      let handled = false;

      switch (e.key) {
        case 'ArrowRight':
          c = Math.min(SIZE - 1, c + 1);
          handled = true;
          break;
        case 'ArrowLeft':
          c = Math.max(0, c - 1);
          handled = true;
          break;
        case 'ArrowDown':
          r = Math.min(SIZE - 1, r + 1);
          handled = true;
          break;
        case 'ArrowUp':
          r = Math.max(0, r - 1);
          handled = true;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          toggleCell(focusR, focusC);
          return;
        default:
          return;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
        setFocusR(r);
        setFocusC(c);
      }
    },
    [gameState, focusR, focusC, toggleCell]
  );

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
      <div className={ui.scoreboard} style={ui.style.raised}>
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
          <Lightbulb size={16} className="text-fun-yellow" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Lights</div>
            <div className="text-2xl font-heading font-bold text-fun-yellow">{lightsOn}</div>
          </div>
        </div>
        <div className={ui.separator} />
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
          className={`${ui.boardShell} ${ui.boardPadding}`}
          style={ui.style.board}
        >
          <div
            className="grid gap-2 outline-none"
            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
            role="grid"
            aria-label="Lights Out puzzle grid"
            onKeyDown={handleKeyDown}
          >
            {grid.map((row, r) =>
              row.map((isOn, c) => (
                <LightsOutCell
                  key={`${r}-${c}`}
                  r={r}
                  c={c}
                  isOn={isOn}
                  isFocused={focusR === r && focusC === c}
                  isDisabled={gameState !== 'playing'}
                  onToggle={toggleCell}
                  shouldReduceMotion={shouldReduceMotion}
                />
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
              className={ui.overlay}
              style={ui.style.board}
              role="dialog"
              aria-modal="true"
            >
              <div
                className={`${ui.banner} text-xl text-black bg-fun-yellow`}
                style={ui.style.raised}
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
                className={ui.buttonPrimary}
                style={ui.style.raised}
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
              className={ui.overlay}
              style={ui.style.board}
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={shouldReduceMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', bounce: isLiquid ? 0.2 : 0.5 }
                }
                className="text-center"
              >
                <div
                  className={`${ui.banner} text-2xl text-white bg-fun-pink mb-4`}
                  style={ui.style.raised}
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
                className={ui.buttonPrimary}
                style={ui.style.raised}
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
        className={`${ui.statusBanner} text-sm md:text-xs text-secondary text-center font-sans leading-relaxed`}
        style={ui.style.raised}
      >
        Arrow keys to navigate · Enter to toggle
      </div>
    </div>
  );
};

export default LightsOut;
