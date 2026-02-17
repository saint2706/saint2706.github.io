/**
 * @fileoverview Simon Says — Color/sound memory pattern game.
 *
 * Features:
 * - 4 colored buttons in neubrutalism palette
 * - Progressive pattern display with flash animations
 * - Player input tracking and validation
 * - Score = max pattern length reached
 * - High score persistence in localStorage
 * - Keyboard support (1-4 keys)
 * - Full accessibility
 *
 * @module components/games/SimonSays
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { useTheme } from '../shared/theme-context';
import { getGameThemeStyles } from './gameThemeStyles';

const COLORS = [
  { id: 0, name: 'Yellow', bg: 'bg-fun-yellow', active: 'bg-fun-yellow/60', key: '1' },
  { id: 1, name: 'Pink', bg: 'bg-fun-pink', active: 'bg-fun-pink/60', key: '2' },
  { id: 2, name: 'Blue', bg: 'bg-accent', active: 'bg-accent/60', key: '3' },
  { id: 3, name: 'Green', bg: 'bg-emerald-500', active: 'bg-emerald-500/60', key: '4' },
];

const SimonSays = () => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const ui = getGameThemeStyles(isLiquid);
  const [gameState, setGameState] = useState('idle'); // idle | watching | input | gameOver
  const [sequence, setSequence] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeButton, setActiveButton] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const s = localStorage.getItem('simonHighScore');
    return s ? parseInt(s, 10) : 0;
  });
  const timeoutRef = useRef(null);
  const sequenceRef = useRef([]);

  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const flashButton = useCallback(
    (id, duration = 400) => {
      return new Promise(resolve => {
        setActiveButton(id);
        timeoutRef.current = setTimeout(
          () => {
            setActiveButton(null);
            timeoutRef.current = setTimeout(resolve, shouldReduceMotion ? 50 : 150);
          },
          shouldReduceMotion ? 100 : duration
        );
      });
    },
    [shouldReduceMotion]
  );

  const playSequence = useCallback(
    async seq => {
      setGameState('watching');
      await new Promise(r => {
        timeoutRef.current = setTimeout(r, 500);
      });
      for (const id of seq) {
        await flashButton(id);
      }
      setGameState('input');
      setPlayerIndex(0);
    },
    [flashButton]
  );

  const addToSequence = useCallback(() => {
    const next = Math.floor(Math.random() * 4);
    const newSeq = [...sequenceRef.current, next];
    setSequence(newSeq);
    setScore(newSeq.length - 1);
    playSequence(newSeq);
  }, [playSequence]);

  const startGame = useCallback(() => {
    setSequence([]);
    setPlayerIndex(0);
    setScore(0);
    setActiveButton(null);
    sequenceRef.current = [];
    // Small delay then add first item
    setTimeout(() => {
      const first = Math.floor(Math.random() * 4);
      const newSeq = [first];
      setSequence(newSeq);
      sequenceRef.current = newSeq;
      playSequence(newSeq);
    }, 100);
  }, [playSequence]);

  const handlePress = useCallback(
    id => {
      if (gameState !== 'input') return;

      flashButton(id, 200);

      if (id !== sequence[playerIndex]) {
        // Wrong!
        const finalScore = sequence.length - 1;
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem('simonHighScore', finalScore.toString());
        }
        setScore(finalScore);
        setGameState('gameOver');
        return;
      }

      const nextIndex = playerIndex + 1;
      if (nextIndex >= sequence.length) {
        // Completed the sequence — add more
        setScore(sequence.length);
        timeoutRef.current = setTimeout(addToSequence, 600);
      } else {
        setPlayerIndex(nextIndex);
      }
    },
    [gameState, sequence, playerIndex, highScore, flashButton, addToSequence]
  );

  // Keyboard support
  useEffect(() => {
    const handleKey = e => {
      if (gameState !== 'input') return;
      const color = COLORS.find(c => c.key === e.key);
      if (color) {
        e.preventDefault();
        handlePress(color.id);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, handlePress]);

  const getAnnouncement = () => {
    if (gameState === 'idle') return 'Simon Says ready. Press Start to begin.';
    if (gameState === 'watching') return 'Watch the pattern...';
    if (gameState === 'input') return `Your turn! Repeat the pattern. Round ${sequence.length}.`;
    if (gameState === 'gameOver')
      return `Game over! You reached round ${score}.${score >= highScore && score > 0 ? ' New high score!' : ''}`;
    return '';
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
          <div className="text-sm md:text-xs text-secondary font-heading">Round</div>
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
          <Trophy size={18} className="text-fun-yellow" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Best</div>
            <div className="text-2xl font-heading font-bold text-fun-yellow">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Game board */}
      <div className="relative">
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className={`${ui.boardShell} p-6`}
          style={ui.style.board}
        >
          {/* Status indicator */}
          <div className="text-center mb-4">
            <span
              className={`inline-block px-3 py-1 text-sm ${ui.banner} ${
                gameState === 'watching'
                  ? 'bg-fun-yellow text-black'
                  : gameState === 'input'
                    ? 'bg-accent text-white'
                    : 'bg-card text-secondary'
              }`}
              style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            >
              {gameState === 'watching'
                ? '👀 Watch...'
                : gameState === 'input'
                  ? '🎯 Your Turn!'
                  : 'Ready'}
            </span>
          </div>

          {/* 2×2 button grid */}
          <div className="grid grid-cols-2 gap-4" role="group" aria-label="Simon Says buttons">
            {COLORS.map(color => (
              <motion.button
                key={color.id}
                onClick={() => handlePress(color.id)}
                disabled={gameState !== 'input'}
                whileTap={shouldReduceMotion || gameState !== 'input' ? undefined : { scale: 0.9 }}
                aria-label={`${color.name} button (key ${color.key})`}
                className={`w-24 h-24 md:w-28 md:h-28 cursor-pointer transition-all motion-reduce:transition-none ${ui.tileBase}
                  ${activeButton === color.id ? `${color.active} ${isLiquid ? 'brightness-125 scale-[0.98]' : 'scale-95 brightness-150'}` : `${color.bg} ${gameState === 'input' ? (isLiquid ? 'hover:brightness-110' : 'hover:-translate-y-1') : 'opacity-70'}`}`}
                style={{
                  ...(activeButton === color.id ? ui.style.tileActive : ui.style.tile),
                }}
              >
                <span className="text-lg font-heading font-bold text-white drop-shadow-md">
                  {color.key}
                </span>
              </motion.button>
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
            >
              <div
                className={`${ui.banner} text-xl text-black bg-fun-yellow`}
                style={ui.style.raised}
              >
                Simon Says
              </div>
              <div className="text-sm text-secondary text-center px-4 font-sans">
                Watch the pattern, then repeat it
                <br />
                <span className="text-muted">Keys 1-4 or click the buttons</span>
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
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: isLiquid ? 0.2 : 0.5 }}
                className="text-center"
              >
                <div
                  className={`${ui.banner} text-2xl text-white bg-fun-pink mb-4`}
                  style={ui.style.raised}
                >
                  Game Over!
                </div>
                <div className="text-lg text-secondary font-sans">
                  You reached round{' '}
                  <span className="font-heading font-bold text-accent">{score}</span>
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

export default SimonSays;
