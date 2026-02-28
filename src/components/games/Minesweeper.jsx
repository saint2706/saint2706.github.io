/**
 * @fileoverview Minesweeper — Classic grid-based puzzle game.
 *
 * Features:
 * - 9×9 grid with 10 mines (beginner difficulty)
 * - First-click safety (mines placed after first reveal)
 * - Flood-fill for empty cells
 * - Right-click / long-press to flag
 * - Mine counter, timer, win/loss detection
 * - Keyboard accessible grid
 * - Neubrutalism aesthetic
 *
 * @module components/games/Minesweeper
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { RotateCcw, Trophy, Flag, Bomb, Timer } from 'lucide-react';
import { useTheme } from '../shared/theme-context';
import { getGameThemeStyles } from './gameThemeStyles';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

/**
 * Creates an empty board.
 * Each cell: { mine, revealed, flagged, adjacent }
 */
const createEmptyBoard = () =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );

/**
 * Places mines randomly, avoiding the first-click cell and its neighbours.
 */
const placeMines = (board, safeR, safeC) => {
  const b = board.map(row => row.map(cell => ({ ...cell })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (b[r][c].mine) continue;
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    b[r][c].mine = true;
    placed++;
  }
  // Compute adjacency counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (b[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc].mine) count++;
        }
      }
      b[r][c].adjacent = count;
    }
  }
  return b;
};

/**
 * Flood-fill reveal for empty cells.
 */
const floodReveal = (board, r, c) => {
  const b = board.map(row => row.map(cell => ({ ...cell })));
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
    if (b[cr][cc].revealed || b[cr][cc].flagged || b[cr][cc].mine) continue;
    b[cr][cc].revealed = true;
    if (b[cr][cc].adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          stack.push([cr + dr, cc + dc]);
        }
      }
    }
  }
  return b;
};

const ADJACENT_COLORS = [
  '',
  'text-blue-600',
  'text-green-600',
  'text-red-600',
  'text-purple-700',
  'text-yellow-700',
  'text-cyan-600',
  'text-black',
  'text-gray-500',
];

const MinesweeperCell = React.memo(
  ({
    r,
    c,
    mine,
    revealed,
    flagged,
    adjacent,
    ui,
    onReveal,
    onFlag,
    onFocus,
    isGameOver,
    isFocused,
    isLiquid,
  }) => {
    const longPressRef = useRef(null);

    const handleTouchStart = useCallback(() => {
      longPressRef.current = setTimeout(() => onFlag(r, c), 500);
    }, [onFlag, r, c]);

    const handleTouchEnd = useCallback(() => {
      clearTimeout(longPressRef.current);
    }, []);

    const cellContent = (() => {
      if (!revealed && flagged) return '🚩';
      if (!revealed) return '';
      if (mine) return '💣';
      if (adjacent === 0) return '';
      return adjacent;
    })();

    return (
      <button
        id={`minesweeper-cell-${r}-${c}`}
        onClick={() => onReveal(r, c)}
        onContextMenu={e => onFlag(r, c, e)}
        onFocus={() => onFocus(r, c)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        disabled={isGameOver}
        tabIndex={isFocused ? 0 : -1}
        aria-label={`Row ${r + 1}, Column ${c + 1}${revealed ? (mine ? ', mine' : adjacent > 0 ? `, ${adjacent} adjacent mines` : ', empty') : flagged ? ', flagged' : ', hidden'}. Press F to flag.`}
        className={`w-7 h-7 md:w-8 md:h-8 text-xs md:text-sm cursor-pointer flex items-center justify-center transition-colors motion-reduce:transition-none ${ui.tileBase}
        ${
          revealed
            ? mine
              ? 'bg-fun-pink/40'
              : 'bg-secondary'
            : `${ui.tileIdle} ${isLiquid ? 'hover:brightness-110' : 'hover:bg-accent/10'} ${isFocused ? 'ring-2 ring-accent' : ''}`
        }`}
      >
        <span className={adjacent > 0 && revealed ? ADJACENT_COLORS[adjacent] : ''}>
          {cellContent}
        </span>
      </button>
    );
  }
);
MinesweeperCell.displayName = 'MinesweeperCell';

/**
 * TimerDisplay component to isolate timer re-renders.
 * Only this component re-renders every second, not the entire grid.
 */
const TimerDisplay = React.memo(({ startTime, finalTime, gameState }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Active timer
    if (gameState === 'playing' && startTime) {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, startTime]);

  let displayTime = 0;
  if (gameState === 'idle') {
    displayTime = 0;
  } else if (gameState === 'won' || gameState === 'lost') {
    displayTime = finalTime !== null ? finalTime : 0;
  } else {
    displayTime = elapsed;
  }

  return <div className="text-2xl font-heading font-bold text-accent">{displayTime}s</div>;
});
TimerDisplay.displayName = 'TimerDisplay';

const Minesweeper = () => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const ui = React.useMemo(() => getGameThemeStyles(isLiquid), [isLiquid]);
  const [gameState, setGameState] = useState('idle'); // idle | playing | won | lost
  const [board, setBoard] = useState(createEmptyBoard);
  const [firstClick, setFirstClick] = useState(true);
  const [flagCount, setFlagCount] = useState(0);

  // Performance Optimization: Moved timer state to TimerDisplay component
  // to prevent re-rendering the entire 9x9 grid every second.
  const [startTime, setStartTime] = useState(null);
  const [finalTime, setFinalTime] = useState(null);
  const startTimeRef = useRef(null);

  const [bestTime, setBestTime] = useState(() => {
    const s = localStorage.getItem('minesweeperBest');
    return s ? parseInt(s, 10) : null;
  });
  const [focusR, setFocusR] = useState(0);
  const [focusC, setFocusC] = useState(0);

  const checkWin = useCallback(
    b => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!b[r][c].mine && !b[r][c].revealed) return false;
        }
      }
      // Won!
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setFinalTime(duration);

      if (!bestTime || duration < bestTime) {
        setBestTime(duration);
        localStorage.setItem('minesweeperBest', duration.toString());
      }
      return true;
    },
    [bestTime]
  );

  const revealCell = useCallback(
    (r, c) => {
      if (gameState !== 'playing' && gameState !== 'idle') return;

      // Start timer on first interaction
      if (firstClick) {
        const now = Date.now();
        setStartTime(now);
        startTimeRef.current = now;
      }

      setBoard(prev => {
        let b = prev;
        if (firstClick) {
          b = placeMines(prev, r, c);
          setFirstClick(false);
          setGameState('playing');
        }
        if (b[r][c].flagged || b[r][c].revealed) return b;

        if (b[r][c].mine) {
          // Reveal all mines
          const lost = b.map(row =>
            row.map(cell => (cell.mine ? { ...cell, revealed: true } : cell))
          );
          setGameState('lost');
          setFinalTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
          return lost;
        }

        const newBoard = floodReveal(b, r, c);
        if (checkWin(newBoard)) {
          setGameState('won');
        }
        return newBoard;
      });
    },
    [gameState, firstClick, checkWin]
  );

  const toggleFlag = useCallback(
    (r, c, e) => {
      if (e) e.preventDefault();
      if (gameState !== 'playing' && !firstClick) return;
      setBoard(prev => {
        if (prev[r][c].revealed) return prev;
        const b = prev.map(row => row.map(cell => ({ ...cell })));
        b[r][c].flagged = !b[r][c].flagged;
        setFlagCount(fc => fc + (b[r][c].flagged ? 1 : -1));
        return b;
      });
    },
    [gameState, firstClick]
  );

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setFirstClick(true);
    setFlagCount(0);

    // Reset timer
    setStartTime(null);
    setFinalTime(null);
    startTimeRef.current = null;

    setGameState('idle');
    setFocusR(0);
    setFocusC(0);
    // Transition to a "ready" idle — first click will start
    setTimeout(() => setGameState('idle'), 0);
  }, []);

  // Update focus state when a cell is focused via mouse/tab
  const handleCellFocus = useCallback((r, c) => {
    setFocusR(r);
    setFocusC(c);
  }, []);

  // Revised keyboard nav: scoped to the grid container
  const handleKeyDown = useCallback(
    e => {
      if (gameState === 'won' || gameState === 'lost') return;

      let r = focusR;
      let c = focusC;
      let handled = false;

      switch (e.key) {
        case 'ArrowRight':
          c = Math.min(COLS - 1, c + 1);
          handled = true;
          break;
        case 'ArrowLeft':
          c = Math.max(0, c - 1);
          handled = true;
          break;
        case 'ArrowDown':
          r = Math.min(ROWS - 1, r + 1);
          handled = true;
          break;
        case 'ArrowUp':
          r = Math.max(0, r - 1);
          handled = true;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault(); // always prevent default for activation keys
          revealCell(r, c);
          return;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFlag(r, c);
          return;
        default:
          return;
      }

      if (handled) {
        e.preventDefault(); // Stop scroll hijacking
        e.stopPropagation(); // Stop bubbling
        setFocusR(r);
        setFocusC(c);
        const nextCell = document.getElementById(`minesweeper-cell-${r}-${c}`);
        if (nextCell) nextCell.focus();
      }
    },
    [gameState, focusR, focusC, revealCell, toggleFlag]
  );

  const getAnnouncement = () => {
    if (gameState === 'idle') return 'Minesweeper ready. Click any cell to begin.';
    // Use finalTime or default to 0 if not set, for announcement
    const timeToAnnounce = finalTime !== null ? finalTime : 0;
    if (gameState === 'won') return `You won in ${timeToAnnounce} seconds!`;
    if (gameState === 'lost') return 'Game over! You hit a mine.';
    return `Playing Minesweeper. Flags: ${flagCount}/${MINES}.`;
  };

  const isGameOver = gameState === 'won' || gameState === 'lost';

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {getAnnouncement()}
      </div>

      {/* Status bar */}
      <div className={ui.scoreboard} style={ui.style.raised}>
        <div className="flex items-center gap-2 px-4">
          <Flag size={16} className="text-fun-pink" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Mines</div>
            <div className="text-2xl font-heading font-bold text-fun-pink">{MINES - flagCount}</div>
          </div>
        </div>
        <div className={ui.separator} />
        <div className="flex items-center gap-2 px-4">
          <Timer size={16} className="text-accent" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Time</div>
            <TimerDisplay startTime={startTime} finalTime={finalTime} gameState={gameState} />
          </div>
        </div>
        <div className={ui.separator} />
        <div className="flex items-center gap-2 px-4">
          <Trophy size={16} className="text-fun-yellow" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Best</div>
            <div className="text-2xl font-heading font-bold text-fun-yellow">
              {bestTime ? `${bestTime}s` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="relative">
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className={`${ui.boardShell} p-3`}
          style={ui.style.board}
        >
          <div
            className="grid gap-[2px] outline-none"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            role="grid"
            aria-label="Minesweeper game board"
            onKeyDown={handleKeyDown}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <MinesweeperCell
                  key={`${r}-${c}`}
                  r={r}
                  c={c}
                  mine={cell.mine}
                  revealed={cell.revealed}
                  flagged={cell.flagged}
                  adjacent={cell.adjacent}
                  ui={ui}
                  onReveal={revealCell}
                  onFlag={toggleFlag}
                  onFocus={handleCellFocus}
                  isGameOver={isGameOver}
                  isFocused={focusR === r && focusC === c}
                  isLiquid={isLiquid}
                />
              ))
            )}
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
                  You Win! 🎉
                </div>
                <div className="text-lg text-secondary font-sans">
                  Cleared in{' '}
                  <span className="font-heading font-bold text-accent">{finalTime}s</span>
                </div>
                {bestTime === finalTime && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Trophy size={18} className="text-fun-yellow" aria-hidden="true" />
                    <span className="font-heading font-bold text-black bg-fun-yellow px-2 py-1 border-2 border-[color:var(--color-border)]">
                      New Best Time!
                    </span>
                  </div>
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
                Play Again
              </motion.button>
            </motion.div>
          )}

          {gameState === 'lost' && (
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
                <Bomb className="w-10 h-10 text-fun-pink mx-auto mb-2" aria-hidden="true" />
                <div
                  className={`${ui.banner} text-2xl text-white bg-fun-pink mb-4`}
                  style={ui.style.raised}
                >
                  Game Over!
                </div>
                <div className="text-lg text-secondary font-sans">You hit a mine! 💥</div>
              </motion.div>
              <motion.button
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                onClick={startGame}
                className={ui.buttonPrimary}
                style={ui.style.raised}
                autoFocus
              >
                <RotateCcw size={18} aria-hidden="true" />
                Try Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls hint */}
      <div
        className={`${ui.statusBanner} text-sm md:text-xs text-secondary text-center font-sans leading-relaxed`}
        style={ui.style.raised}
      >
        Right-click or long-press to flag · Press{' '}
        <kbd className="font-mono bg-card px-1 border border-[color:var(--color-border)]">F</kbd>{' '}
        with keyboard
      </div>
    </div>
  );
};

export default Minesweeper;
