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
        })),
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

const Minesweeper = () => {
    const shouldReduceMotion = useReducedMotion();
    const [gameState, setGameState] = useState('idle'); // idle | playing | won | lost
    const [board, setBoard] = useState(createEmptyBoard);
    const [firstClick, setFirstClick] = useState(true);
    const [flagCount, setFlagCount] = useState(0);
    const [timer, setTimer] = useState(0);
    const [bestTime, setBestTime] = useState(() => {
        const s = localStorage.getItem('minesweeperBest');
        return s ? parseInt(s, 10) : null;
    });
    const [focusR, setFocusR] = useState(0);
    const [focusC, setFocusC] = useState(0);
    const timerRef = useRef(null);
    const longPressRef = useRef(null);

    // Timer effect
    useEffect(() => {
        if (gameState === 'playing') {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
            return () => clearInterval(timerRef.current);
        }
        clearInterval(timerRef.current);
    }, [gameState]);

    const checkWin = useCallback(
        b => {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (!b[r][c].mine && !b[r][c].revealed) return false;
                }
            }
            // Won!
            if (!bestTime || timer < bestTime) {
                setBestTime(timer);
                localStorage.setItem('minesweeperBest', timer.toString());
            }
            return true;
        },
        [timer, bestTime],
    );

    const revealCell = useCallback(
        (r, c) => {
            if (gameState !== 'playing' && gameState !== 'idle') return;

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
                        row.map(cell => (cell.mine ? { ...cell, revealed: true } : cell)),
                    );
                    setGameState('lost');
                    return lost;
                }

                const newBoard = floodReveal(b, r, c);
                if (checkWin(newBoard)) {
                    setGameState('won');
                }
                return newBoard;
            });
        },
        [gameState, firstClick, checkWin],
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
        [gameState, firstClick],
    );

    const startGame = useCallback(() => {
        setBoard(createEmptyBoard());
        setFirstClick(true);
        setFlagCount(0);
        setTimer(0);
        setGameState('idle');
        setFocusR(0);
        setFocusC(0);
        // Transition to a "ready" idle — first click will start
        setTimeout(() => setGameState('idle'), 0);
    }, []);

    // Keyboard nav
    useEffect(() => {
        const handleKey = e => {
            if (gameState === 'won' || gameState === 'lost') return;
            let r = focusR;
            let c = focusC;
            switch (e.key) {
                case 'ArrowRight':
                    c = Math.min(COLS - 1, c + 1);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    c = Math.max(0, c - 1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    r = Math.min(ROWS - 1, r + 1);
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    r = Math.max(0, r - 1);
                    e.preventDefault();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
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
            setFocusR(r);
            setFocusC(c);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, focusR, focusC, revealCell, toggleFlag]);

    const getCellDisplay = cell => {
        if (!cell.revealed && cell.flagged) return '🚩';
        if (!cell.revealed) return '';
        if (cell.mine) return '💣';
        if (cell.adjacent === 0) return '';
        return cell.adjacent;
    };

    const getAnnouncement = () => {
        if (gameState === 'idle') return 'Minesweeper ready. Click any cell to begin.';
        if (gameState === 'won') return `You won in ${timer} seconds!`;
        if (gameState === 'lost') return 'Game over! You hit a mine.';
        return `Playing Minesweeper. Flags: ${flagCount}/${MINES}. Time: ${timer}s.`;
    };

    const isGameOver = gameState === 'won' || gameState === 'lost';

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {getAnnouncement()}
            </div>

            {/* Status bar */}
            <div
                className="flex gap-6 bg-secondary border-[3px] border-[color:var(--color-border)] p-4"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            >
                <div className="flex items-center gap-2 px-4">
                    <Flag size={16} className="text-fun-pink" aria-hidden="true" />
                    <div>
                        <div className="text-sm md:text-xs text-secondary font-heading">Mines</div>
                        <div className="text-2xl font-heading font-bold text-fun-pink">
                            {MINES - flagCount}
                        </div>
                    </div>
                </div>
                <div className="w-[3px] bg-[color:var(--color-border)]" />
                <div className="flex items-center gap-2 px-4">
                    <Timer size={16} className="text-accent" aria-hidden="true" />
                    <div>
                        <div className="text-sm md:text-xs text-secondary font-heading">Time</div>
                        <div className="text-2xl font-heading font-bold text-accent">{timer}s</div>
                    </div>
                </div>
                <div className="w-[3px] bg-[color:var(--color-border)]" />
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
                    className="p-3 bg-card border-[3px] border-[color:var(--color-border)]"
                    style={{ boxShadow: 'var(--nb-shadow)' }}
                >
                    <div
                        className="grid gap-[2px]"
                        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
                        role="grid"
                        aria-label="Minesweeper game board"
                    >
                        {board.map((row, r) =>
                            row.map((cell, c) => (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => revealCell(r, c)}
                                    onContextMenu={e => toggleFlag(r, c, e)}
                                    onTouchStart={() => {
                                        longPressRef.current = setTimeout(() => toggleFlag(r, c), 500);
                                    }}
                                    onTouchEnd={() => clearTimeout(longPressRef.current)}
                                    onTouchMove={() => clearTimeout(longPressRef.current)}
                                    disabled={isGameOver}
                                    tabIndex={focusR === r && focusC === c ? 0 : -1}
                                    aria-label={`Row ${r + 1}, Column ${c + 1}${cell.revealed ? (cell.mine ? ', mine' : cell.adjacent > 0 ? `, ${cell.adjacent} adjacent mines` : ', empty') : cell.flagged ? ', flagged' : ', hidden'}. Press F to flag.`}
                                    className={`w-7 h-7 md:w-8 md:h-8 text-xs md:text-sm font-heading font-bold border-[2px] border-[color:var(--color-border)] cursor-pointer select-none flex items-center justify-center transition-colors motion-reduce:transition-none
                    ${cell.revealed
                                            ? cell.mine
                                                ? 'bg-fun-pink/40'
                                                : 'bg-secondary'
                                            : `bg-card hover:bg-accent/10 ${focusR === r && focusC === c ? 'ring-2 ring-accent' : ''}`
                                        }`}
                                >
                                    <span className={cell.adjacent > 0 && cell.revealed ? ADJACENT_COLORS[cell.adjacent] : ''}>
                                        {getCellDisplay(cell)}
                                    </span>
                                </button>
                            )),
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
                            className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center gap-4 border-[3px] border-[color:var(--color-border)]"
                            style={{ boxShadow: 'var(--nb-shadow)' }}
                            role="dialog"
                            aria-modal="true"
                        >
                            <motion.div
                                initial={shouldReduceMotion ? false : { scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={
                                    shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.5 }
                                }
                                className="text-center"
                            >
                                <div
                                    className="text-2xl font-heading font-bold text-white bg-fun-pink px-4 py-2 border-[3px] border-[color:var(--color-border)] mb-4"
                                    style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                                >
                                    You Win! 🎉
                                </div>
                                <div className="text-lg text-secondary font-sans">
                                    Cleared in{' '}
                                    <span className="font-heading font-bold text-accent">{timer}s</span>
                                </div>
                                {bestTime === timer && (
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
                                className="px-6 py-2 bg-accent text-white font-heading font-bold border-[3px] border-[color:var(--color-border)] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
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
                            className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center gap-4 border-[3px] border-[color:var(--color-border)]"
                            style={{ boxShadow: 'var(--nb-shadow)' }}
                            role="dialog"
                            aria-modal="true"
                        >
                            <motion.div
                                initial={shouldReduceMotion ? false : { scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={
                                    shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.5 }
                                }
                                className="text-center"
                            >
                                <Bomb className="w-10 h-10 text-fun-pink mx-auto mb-2" aria-hidden="true" />
                                <div
                                    className="text-2xl font-heading font-bold text-white bg-fun-pink px-4 py-2 border-[3px] border-[color:var(--color-border)] mb-4"
                                    style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                                >
                                    Game Over!
                                </div>
                                <div className="text-lg text-secondary font-sans">You hit a mine! 💥</div>
                            </motion.div>
                            <motion.button
                                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                                onClick={startGame}
                                className="px-6 py-2 bg-accent text-white font-heading font-bold border-[3px] border-[color:var(--color-border)] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
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
                className="text-sm md:text-xs text-secondary text-center px-4 py-2 bg-secondary border-[3px] border-[color:var(--color-border)] font-sans leading-relaxed"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            >
                Right-click or long-press to flag · Press <kbd className="font-mono bg-card px-1 border border-[color:var(--color-border)]">F</kbd> with keyboard
            </div>
        </div>
    );
};

export default Minesweeper;
