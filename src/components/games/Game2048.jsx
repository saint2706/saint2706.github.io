/**
 * @fileoverview 2048 — Sliding tile merge puzzle.
 *
 * Features:
 * - 4×4 grid, tiles merge into powers of two
 * - Keyboard (arrow keys / WASD) and touch swipe controls
 * - Score tracking with localStorage best-score persistence
 * - Win overlay at 2048 with "Keep Playing" option, game-over detection
 * - Keyboard-accessible with aria-live status announcements
 *
 * @module components/games/Game2048
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { useTheme } from '../shared/theme-context';
import { getGameThemeStyles } from './gameThemeStyles';
import { safeGetLocalStorage, safeSetLocalStorage } from '../../utils/storage';

const SIZE = 4;
const WIN_VALUE = 2048;
const STORAGE_KEY = 'game2048Best';

/** Tile background/text colors keyed by value, mirroring the classic 2048 palette. */
const TILE_COLORS = {
  2: { bg: '#eee4da', text: '#776e65' },
  4: { bg: '#ede0c8', text: '#776e65' },
  8: { bg: '#f2b179', text: '#f9f6f2' },
  16: { bg: '#f59563', text: '#f9f6f2' },
  32: { bg: '#f67c5f', text: '#f9f6f2' },
  64: { bg: '#f65e3b', text: '#f9f6f2' },
  128: { bg: '#edcf72', text: '#f9f6f2' },
  256: { bg: '#edcc61', text: '#f9f6f2' },
  512: { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' },
};
const TILE_COLOR_FALLBACK = { bg: '#3c3a32', text: '#f9f6f2' };

const createEmptyBoard = () => Array.from({ length: SIZE * SIZE }, () => 0);

/** Returns indices of empty (zero) cells. */
const emptyCells = board => board.reduce((acc, v, i) => (v === 0 ? [...acc, i] : acc), []);

/** Spawns a new tile (90% chance of 2, 10% chance of 4) in a random empty cell. */
const spawnTile = board => {
  const empties = emptyCells(board);
  if (empties.length === 0) return board;
  const idx = empties[Math.floor(Math.random() * empties.length)];
  const next = [...board];
  next[idx] = Math.random() < 0.9 ? 2 : 4;
  return next;
};

const createStartingBoard = () => spawnTile(spawnTile(createEmptyBoard()));

/** Slides and merges a single line of 4 values towards the front (index 0). */
const slideLine = line => {
  const filtered = line.filter(v => v !== 0);
  const merged = [];
  let gained = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const value = filtered[i] * 2;
      merged.push(value);
      gained += value;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { line: merged, gained };
};

const getRow = (board, r) => board.slice(r * SIZE, r * SIZE + SIZE);
const getCol = (board, c) => Array.from({ length: SIZE }, (_, r) => board[r * SIZE + c]);

const setRow = (board, r, line) => {
  const next = [...board];
  line.forEach((v, c) => {
    next[r * SIZE + c] = v;
  });
  return next;
};
const setCol = (board, c, line) => {
  const next = [...board];
  line.forEach((v, r) => {
    next[r * SIZE + c] = v;
  });
  return next;
};

/**
 * Applies a move in the given direction. Returns the new board, score gained,
 * and whether the board actually changed (used to decide whether to spawn a tile).
 */
const applyMove = (board, direction) => {
  let next = [...board];
  let gained = 0;

  const processLine = (getLine, setLine, count, reverse) => {
    for (let i = 0; i < count; i++) {
      let line = getLine(next, i);
      if (reverse) line = [...line].reverse();
      const result = slideLine(line);
      gained += result.gained;
      const finalLine = reverse ? [...result.line].reverse() : result.line;
      next = setLine(next, i, finalLine);
    }
  };

  switch (direction) {
    case 'left':
      processLine(getRow, setRow, SIZE, false);
      break;
    case 'right':
      processLine(getRow, setRow, SIZE, true);
      break;
    case 'up':
      processLine(getCol, setCol, SIZE, false);
      break;
    case 'down':
      processLine(getCol, setCol, SIZE, true);
      break;
    default:
      break;
  }

  const moved = next.some((v, i) => v !== board[i]);
  return { board: next, gained, moved };
};

/** Checks whether any move is still possible (empty cell or adjacent equal pair). */
const hasMovesRemaining = board => {
  if (emptyCells(board).length > 0) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = board[r * SIZE + c];
      if (c < SIZE - 1 && board[r * SIZE + c + 1] === value) return true;
      if (r < SIZE - 1 && board[(r + 1) * SIZE + c] === value) return true;
    }
  }
  return false;
};

const Tile = React.memo(({ value, ui, shouldReduceMotion }) => {
  const colors = TILE_COLORS[value] || TILE_COLOR_FALLBACK;
  const digits = String(value).length;
  const fontSizeClass =
    digits >= 4
      ? 'text-lg md:text-xl'
      : digits === 3
        ? 'text-xl md:text-2xl'
        : 'text-2xl md:text-3xl';

  return (
    <div
      className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center ${ui.tileBase}`}
      style={{
        backgroundColor: value ? colors.bg : undefined,
        boxShadow: value ? ui.style.tile?.boxShadow : undefined,
      }}
    >
      <AnimatePresence mode="wait">
        {value > 0 && (
          <motion.span
            key={value}
            initial={shouldReduceMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.4 }}
            className={`font-heading font-bold ${fontSizeClass}`}
            style={{ color: colors.text }}
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
});
Tile.displayName = 'Tile';

/**
 * 2048 sliding tile puzzle game component.
 *
 * @component
 * @returns {React.ReactElement} The 2048 game.
 */
const Game2048 = React.memo(() => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const ui = getGameThemeStyles(isLiquid);

  const [board, setBoard] = useState(createStartingBoard);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const stored = safeGetLocalStorage(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [gameState, setGameState] = useState('playing'); // playing | won | over
  const [hasWon, setHasWon] = useState(false); // whether the win overlay has already been dismissed
  const touchStartRef = useRef(null);

  const highestTile = board.reduce((max, v) => Math.max(max, v), 0);

  const move = useCallback(
    direction => {
      if (gameState === 'over') return;
      const result = applyMove(board, direction);
      if (!result.moved) return;

      const withNewTile = spawnTile(result.board);
      const newScore = score + result.gained;
      setBoard(withNewTile);
      setScore(newScore);

      if (newScore > bestScore) {
        setBestScore(newScore);
        safeSetLocalStorage(STORAGE_KEY, newScore.toString());
      }

      if (!hasWon && withNewTile.includes(WIN_VALUE)) {
        setGameState('won');
        return;
      }

      if (!hasMovesRemaining(withNewTile)) {
        setGameState('over');
      }
    },
    [board, gameState, score, bestScore, hasWon]
  );

  const startGame = useCallback(() => {
    setBoard(createStartingBoard());
    setScore(0);
    setGameState('playing');
    setHasWon(false);
  }, []);

  const keepPlaying = useCallback(() => {
    setHasWon(true);
    setGameState('playing');
  }, []);

  const handleKeyDown = useCallback(
    e => {
      const keyMap = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
        a: 'left',
        d: 'right',
        w: 'up',
        s: 'down',
      };
      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        move(direction);
      }
    },
    [move]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = useCallback(e => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(
    e => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      const threshold = 20;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    },
    [move]
  );

  const getAnnouncement = () => {
    if (gameState === 'won') return `You reached 2048! Score: ${score}.`;
    if (gameState === 'over') return `Game over. Final score: ${score}.`;
    return `Score: ${score}. Highest tile: ${highestTile}.`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {getAnnouncement()}
      </div>

      {/* Score board */}
      <div className={ui.scoreboard} style={ui.style.raised}>
        <div className="px-4">
          <div className="text-sm md:text-xs text-secondary font-heading">Score</div>
          <motion.div
            key={score}
            initial={shouldReduceMotion ? false : { scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className="text-2xl font-heading font-bold text-accent"
          >
            {score}
          </motion.div>
        </div>
        <div className={ui.separator} />
        <div className="flex items-center gap-2 px-4">
          <Trophy size={16} className="text-fun-pink" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Best</div>
            <div className="text-2xl font-heading font-bold text-fun-pink">{bestScore}</div>
          </div>
        </div>
        <div className={ui.separator} />
        <div className="flex items-center gap-2 px-4">
          <Sparkles size={16} className="text-fun-yellow" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Highest</div>
            <div className="text-2xl font-heading font-bold text-fun-yellow">{highestTile}</div>
          </div>
        </div>
      </div>

      <button
        onClick={startGame}
        className={`${ui.buttonSecondary} text-xs py-1.5 px-3`}
        style={ui.style.raised}
        aria-label="Start a new game"
      >
        <RotateCcw size={14} aria-hidden="true" />
        New Game
      </button>

      {/* Board */}
      <div className="relative">
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className={`${ui.boardShell} ${ui.boardPadding}`}
          style={ui.style.board}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
            role="grid"
            aria-label="2048 puzzle grid"
          >
            {board.map((value, idx) => (
              <Tile key={idx} value={value} ui={ui} shouldReduceMotion={shouldReduceMotion} />
            ))}
          </div>
        </motion.div>

        {/* Overlays */}
        <AnimatePresence>
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
              <div
                className={`${ui.banner} text-2xl text-white bg-fun-pink`}
                style={ui.style.raised}
              >
                You reached 2048! 🎉
              </div>
              <div className="text-lg text-secondary font-sans">
                Score: <span className="font-heading font-bold text-accent">{score}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={keepPlaying}
                  className={ui.buttonSecondary}
                  style={ui.style.raised}
                  autoFocus
                >
                  Keep Playing
                </button>
                <button onClick={startGame} className={ui.buttonPrimary} style={ui.style.raised}>
                  <RotateCcw size={18} aria-hidden="true" />
                  New Game
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'over' && (
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
                className={`${ui.banner} text-2xl text-primary bg-secondary`}
                style={ui.style.raised}
              >
                Game Over
              </div>
              <div className="text-lg text-secondary font-sans">
                Final score: <span className="font-heading font-bold text-accent">{score}</span>
              </div>
              <button
                onClick={startGame}
                className={ui.buttonPrimary}
                style={ui.style.raised}
                autoFocus
              >
                <RotateCcw size={18} aria-hidden="true" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div
        className={`${ui.statusBanner} text-sm md:text-xs text-secondary text-center font-sans leading-relaxed`}
        style={ui.style.raised}
      >
        Arrow keys or swipe to slide tiles · Merge matching numbers to reach 2048
      </div>
    </div>
  );
});

Game2048.displayName = 'Game2048';

export default Game2048;
