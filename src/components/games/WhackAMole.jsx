/**
 * @fileoverview Whack-a-Mole — Click on pop-up targets quickly.
 *
 * Features:
 * - 3×3 grid of "holes"
 * - Moles pop up randomly with timeout
 * - 30-second timed game with countdown
 * - Progressive difficulty (shorter pop-up times)
 * - Score tracking and high score in localStorage
 * - Keyboard support (numpad-style 1-9)
 * - Full accessibility
 *
 * @module components/games/WhackAMole
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, RotateCcw, Trophy, Timer } from 'lucide-react';
import { useTheme } from '../shared/theme-context';
import { getGameThemeStyles } from './gameThemeStyles';

const GRID_SIZE = 9; // 3×3
const GAME_DURATION = 30; // seconds
const INITIAL_MOLE_TIME = 1200; // ms mole stays visible
const MIN_MOLE_TIME = 400;
const SPAWN_INTERVAL = 800; // ms between spawns

const WhackAMole = () => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isAura = theme === 'aura';
  const ui = getGameThemeStyles(isAura);
  const [gameState, setGameState] = useState('idle'); // idle | playing | gameOver
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [activeMoles, setActiveMoles] = useState(new Set());
  const [whackedMoles, setWhackedMoles] = useState(new Set()); // brief "hit" feedback
  const [highScore, setHighScore] = useState(() => {
    const s = localStorage.getItem('whackHighScore');
    return s ? parseInt(s, 10) : 0;
  });
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const moleTimersRef = useRef({});
  const scoreRef = useRef(0);

  const clearAllTimers = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(spawnRef.current);
    Object.values(moleTimersRef.current).forEach(clearTimeout);
    moleTimersRef.current = {};
  }, []);

  const endGame = useCallback(() => {
    clearAllTimers();
    setActiveMoles(new Set());
    const finalScore = scoreRef.current;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('whackHighScore', finalScore.toString());
    }
    setGameState('gameOver');
  }, [clearAllTimers, highScore]);

  const spawnMole = useCallback(() => {
    const available = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      if (!activeMoles.has(i)) available.push(i);
    }
    if (available.length === 0) return;

    const hole = available[Math.floor(Math.random() * available.length)];
    const elapsed = GAME_DURATION - timeLeft;
    const moleTime = Math.max(MIN_MOLE_TIME, INITIAL_MOLE_TIME - elapsed * 25);

    setActiveMoles(prev => new Set([...prev, hole]));

    moleTimersRef.current[hole] = setTimeout(() => {
      setActiveMoles(prev => {
        const next = new Set(prev);
        next.delete(hole);
        return next;
      });
      delete moleTimersRef.current[hole];
    }, moleTime);
  }, [activeMoles, timeLeft]);

  const startGame = useCallback(() => {
    clearAllTimers();
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_DURATION);
    setActiveMoles(new Set());
    setWhackedMoles(new Set());
    setGameState('playing');
  }, [clearAllTimers]);

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameState, endGame]);

  // Mole spawning
  useEffect(() => {
    if (gameState === 'playing') {
      spawnRef.current = setInterval(spawnMole, SPAWN_INTERVAL);
      return () => clearInterval(spawnRef.current);
    }
  }, [gameState, spawnMole]);

  const whackMole = useCallback(
    hole => {
      if (gameState !== 'playing') return;
      if (!activeMoles.has(hole)) return;

      // Remove mole
      clearTimeout(moleTimersRef.current[hole]);
      delete moleTimersRef.current[hole];
      setActiveMoles(prev => {
        const next = new Set(prev);
        next.delete(hole);
        return next;
      });

      // Score
      setScore(prev => {
        const ns = prev + 1;
        scoreRef.current = ns;
        return ns;
      });

      // Brief hit feedback
      setWhackedMoles(prev => new Set([...prev, hole]));
      setTimeout(() => {
        setWhackedMoles(prev => {
          const next = new Set(prev);
          next.delete(hole);
          return next;
        });
      }, 200);
    },
    [gameState, activeMoles]
  );

  // Keyboard support (1-9 numpad-style)
  useEffect(() => {
    const handleKey = e => {
      if (gameState !== 'playing') return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        e.preventDefault();
        whackMole(num - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, whackMole]);

  // Cleanup on unmount
  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);

  const getAnnouncement = () => {
    if (gameState === 'idle') return 'Whack-a-Mole ready. Press Start to begin.';
    if (gameState === 'playing') return `Score: ${score}. Time left: ${timeLeft} seconds.`;
    if (gameState === 'gameOver')
      return `Time's up! Score: ${score}.${score >= highScore && score > 0 ? ' New high score!' : ''}`;
    return '';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {getAnnouncement()}
      </div>

      {/* Status bar */}
      <div
        className={ui.scoreboard}
        style={ui.style.raised}
      >
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
          <Timer size={16} className="text-fun-pink" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Time</div>
            <div
              className={`text-2xl font-heading font-bold ${timeLeft <= 5 ? 'text-fun-pink' : 'text-primary'}`}
            >
              {timeLeft}s
            </div>
          </div>
        </div>
        <div className={ui.separator} />
        <div className="flex items-center gap-2 px-4">
          <Trophy size={16} className="text-fun-yellow" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Best</div>
            <div className="text-2xl font-heading font-bold text-fun-yellow">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Game grid */}
      <div className="relative">
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className={`${ui.boardShell} p-5`}
          style={ui.style.board}
        >
          <div className="grid grid-cols-3 gap-4" role="grid" aria-label="Whack-a-Mole game board">
            {Array.from({ length: GRID_SIZE }, (_, i) => (
              <button
                key={i}
                onClick={() => whackMole(i)}
                disabled={gameState !== 'playing'}
                aria-label={`Hole ${i + 1}${activeMoles.has(i) ? ' — Mole! Click to whack!' : ''}`}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-full cursor-pointer flex items-center justify-center text-3xl transition-all motion-reduce:transition-none ${ui.tileBase}
                  ${
                    whackedMoles.has(i)
                      ? `${ui.tileWin} scale-90`
                      : activeMoles.has(i)
                        ? `bg-fun-pink hover:bg-fun-pink/80 ${isAura ? 'brightness-110' : '-translate-y-1'}`
                        : `${isAura ? 'bg-[color:var(--surface-muted)]/80 hover:brightness-110' : 'bg-secondary hover:bg-secondary/80'}`
                  }`}
                style={{
                  ...(activeMoles.has(i) ? ui.style.tileActive : ui.style.raised),
                }}
              >
                <AnimatePresence mode="wait">
                  {activeMoles.has(i) && (
                    <motion.span
                      key={`mole-${i}`}
                      initial={shouldReduceMotion ? false : { scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={shouldReduceMotion ? undefined : { scale: 0, y: 20 }}
                      transition={
                        shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: isAura ? 0.2 : 0.5 }
                      }
                      aria-hidden="true"
                    >
                      🐹
                    </motion.span>
                  )}
                  {whackedMoles.has(i) && (
                    <motion.span
                      key={`hit-${i}`}
                      initial={shouldReduceMotion ? false : { scale: 1.5 }}
                      animate={{ scale: 1 }}
                      transition={shouldReduceMotion ? { duration: 0 } : undefined}
                      aria-hidden="true"
                    >
                      💥
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
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
                Whack-a-Mole
              </div>
              <div className="text-sm text-secondary text-center px-4 font-sans">
                Click or tap the moles before they disappear!
                <br />
                <span className="text-muted">30 seconds — go fast!</span>
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

          {gameState === 'gameOver' && (
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
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: isAura ? 0.2 : 0.5 }}
                className="text-center"
              >
                <div
                  className={`${ui.banner} text-2xl text-white bg-fun-pink mb-4`}
                  style={ui.style.raised}
                >
                  Time's Up!
                </div>
                <div className="text-lg text-secondary font-sans">
                  You whacked <span className="font-heading font-bold text-accent">{score}</span>{' '}
                  moles!
                </div>
                {score >= highScore && score > 0 && (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : undefined}
                    className="flex items-center justify-center gap-2 mt-2"
                  >
                    <Trophy size={18} className="text-fun-yellow" aria-hidden="true" />
                    <span className="font-heading font-bold text-black bg-fun-yellow px-2 py-1 border-2 border-[color:var(--color-border)]">
                      New High Score!
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
                Play Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WhackAMole;
