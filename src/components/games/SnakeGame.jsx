/**
 * Snake Game Component Module
 *
 * Classic Snake game implementation with canvas rendering and progressive difficulty.
 * The game features keyboard and touch controls, score tracking with localStorage persistence,
 * and a clean Neubrutalism design aesthetic.
 *
 * Game Mechanics:
 * - Snake starts with 3 segments moving right
 * - Food appears randomly on the grid
 * - Eating food grows the snake and increases speed
 * - Game ends on wall collision or self-collision
 * - Score increases by 10 per food eaten
 *
 * Controls:
 * - Arrow keys or WASD for direction
 * - Space or Escape to pause/resume
 * - Touch swipe gestures on mobile
 *
 * Features:
 * - Progressive speed increase (gets faster with each food)
 * - High score persistence in localStorage
 * - Touch-friendly mobile controls
 * - Pause functionality
 * - Canvas-based rendering with custom colors
 * - Full accessibility with ARIA labels
 *
 * @module components/games/SnakeGame
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, RotateCcw, Trophy, Pause } from 'lucide-react';

// Game configuration constants
const GRID_SIZE = 20; // 20x20 grid
const CELL_SIZE = 16; // Each cell is 16px
const INITIAL_SPEED = 150; // Starting game speed (ms per tick)
const SPEED_INCREMENT = 5; // Speed increase per food eaten
const MIN_SPEED = 60; // Maximum speed cap (faster = lower number)

/**
 * Creates initial snake at starting position (center, moving right).
 * Snake starts with 3 segments to give player immediate control feedback.
 *
 * @returns {Array<{x: number, y: number}>} Initial snake segments (head to tail)
 * @private
 */
const getInitialSnake = () => [
  { x: 10, y: 10 }, // Head
  { x: 9, y: 10 },
  { x: 8, y: 10 }, // Tail
];

/**
 * Generates random food position that doesn't overlap with snake.
 * Continuously generates random positions until finding one not occupied by snake.
 *
 * @param {Array<{x: number, y: number}>} snake - Current snake segments
 * @returns {{x: number, y: number}} Food position
 * @private
 */
const getRandomFood = snake => {
  let food;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

/**
 * Snake game component with canvas rendering.
 *
 * Game States:
 * - 'idle': Initial state, showing start screen
 * - 'playing': Game in progress
 * - 'paused': Game paused by user
 * - 'gameOver': Snake collided with wall or itself
 *
 * Game Loop:
 * 1. Move snake head in current direction
 * 2. Check for collisions (walls, self)
 * 3. Check if food is eaten
 * 4. Update snake (grow if food eaten, otherwise remove tail)
 * 5. Render new frame on canvas
 * 6. Repeat after speed interval
 *
 * @component
 * @returns {JSX.Element} Complete Snake game interface
 */
const SnakeGame = () => {
  const shouldReduceMotion = useReducedMotion();

  // Game state
  const [snake, setSnake] = useState(getInitialSnake());
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [direction, setDirection] = useState({ x: 1, y: 0 }); // Moving right initially
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'paused' | 'gameOver'
  const [score, setScore] = useState(0);

  // High score with localStorage persistence
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [speed, setSpeed] = useState(INITIAL_SPEED); // Game speed (ms per frame)

  // Refs for game loop and input handling
  const gameLoopRef = useRef(null); // Stores interval ID for game loop
  const directionRef = useRef(direction); // Ref to prevent stale closure in game loop
  const canvasRef = useRef(null); // Canvas element for rendering
  const touchStartRef = useRef(null); // Touch start position for swipe detection

  /**
   * Sync directionRef with direction state.
   * Ref is used in game loop to avoid stale closures.
   */
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  /**
   * Main game logic: moves snake and handles collisions/food.
   *
   * Process:
   * 1. Calculate new head position based on current direction
   * 2. Check for wall collision (out of bounds)
   * 3. Check for self-collision (head hits body)
   * 4. Check if food is eaten (head position = food position)
   * 5. If food eaten: grow snake, update score, spawn new food, increase speed
   * 6. If no food: move snake (remove tail segment)
   *
   * Collision Detection:
   * - Wall collision: head x or y is outside [0, GRID_SIZE)
   * - Self collision: head position matches any body segment position
   */
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      // Calculate new head position
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Wall collision detection
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameState('gameOver');
        return prevSnake;
      }

      // Self-collision detection
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameState('gameOver');
        return prevSnake;
      }

      // Add new head to snake
      const newSnake = [newHead, ...prevSnake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          // Update high score if needed
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(getRandomFood(newSnake)); // Spawn new food
        // Increase speed (decrease interval) but cap at MIN_SPEED
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
        // Don't remove tail (snake grows)
      } else {
        // Remove tail (snake moves without growing)
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, highScore, setHighScore]);

  /**
   * Game loop: runs moveSnake at intervals based on current speed.
   * Only active when gameState is 'playing'.
   * Speed increases as player scores, making game progressively harder.
   */
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(moveSnake, speed);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [gameState, speed, moveSnake]);

  /**
   * Keyboard controls for snake direction and pause.
   *
   * Direction Controls:
   * - Arrow keys or WASD
   * - Cannot reverse direction (prevents instant death)
   *
   * Pause Controls:
   * - Space or Escape toggles pause
   *
   * Input Validation:
   * - Prevents 180-degree turns (e.g., left when moving right)
   * - Only processes input when game is playing or paused
   */
  useEffect(() => {
    const handleKeyDown = e => {
      if (gameState !== 'playing' && gameState !== 'paused') return;

      // Map keys to direction vectors
      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };

      const newDir = keyMap[e.key];
      if (newDir) {
        e.preventDefault();
        const current = directionRef.current;
        // Prevent 180-degree turns (e.g., can't go left if moving right)
        if (newDir.x !== -current.x || newDir.y !== -current.y) {
          setDirection(newDir);
        }
      }

      // Pause/resume with Space or Escape
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        setGameState(prev => (prev === 'playing' ? 'paused' : 'playing'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  /**
   * Records touch start position for swipe gesture detection.
   *
   * @param {TouchEvent} e - Touch start event
   */
  const handleTouchStart = e => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  /**
   * Detects swipe direction from touch gestures.
   *
   * Swipe Detection:
   * - Calculates delta between touch start and end
   * - Larger delta (horizontal or vertical) determines direction
   * - Prevents 180-degree turns like keyboard controls
   *
   * @param {TouchEvent} e - Touch end event
   */
  const handleTouchEnd = e => {
    if (!touchStartRef.current || gameState !== 'playing') return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;

    // Determine swipe direction based on larger delta
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      const newDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      if (newDir.x !== -directionRef.current.x) {
        setDirection(newDir);
      }
    } else {
      // Vertical swipe
      const newDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      if (newDir.y !== -directionRef.current.y) {
        setDirection(newDir);
      }
    }

    touchStartRef.current = null;
  };

  /**
   * Canvas rendering with Neubrutalism design styling.
   *
   * Renders game state onto HTML5 canvas:
   * 1. Parse CSS custom properties for theme colors
   * 2. Clear canvas with light background
   * 3. Draw grid lines for visual structure
   * 4. Draw snake with gradient from accent to fun-pink
   * 5. Draw food in fun-yellow
   *
   * Color Parsing:
   * - Extracts colors from CSS variables (--color-accent, etc.)
   * - Supports both hex (#RRGGBB) and rgb(r, g, b) formats
   * - Falls back to defaults if parsing fails
   *
   * Visual Design:
   * - Sharp rectangles (no rounded corners) for Neubrutalism aesthetic
   * - Black borders on all elements
   * - Gradient snake from head to tail
   * - Grid lines for retro feel
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = GRID_SIZE * CELL_SIZE;
    const height = GRID_SIZE * CELL_SIZE;

    // Extract theme colors from CSS variables
    // Extract theme colors from CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const borderColor = rootStyles.getPropertyValue('--color-border').trim() || '#000000';
    const accentColor = rootStyles.getPropertyValue('--color-accent').trim() || '#0052CC';
    const funPinkColor = rootStyles.getPropertyValue('--color-fun-pink').trim() || '#9C0E4B';
    const funYellowColor = rootStyles.getPropertyValue('--color-fun-yellow').trim() || '#FFEB3B';

    /**
     * Parses CSS color value to RGB object.
     * Handles both hex (#RRGGBB) and rgb(r, g, b) formats.
     */
    const parseColor = (value, fallback) => {
      if (!value) return fallback;
      const trimmed = value.trim();

      // Parse hex color (#RRGGBB or #RGB)
      if (trimmed.startsWith('#')) {
        const hex = trimmed.replace('#', '');
        const normalized =
          hex.length === 3
            ? hex
                .split('')
                .map(char => char + char)
                .join('')
            : hex;
        if (normalized.length !== 6) return fallback;
        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        return { r, g, b };
      }

      // Parse rgb(r, g, b) format
      if (trimmed.startsWith('rgb')) {
        const matches = trimmed.match(/\d+(\.\d+)?/g);
        if (!matches || matches.length < 3) return fallback;
        const [r, g, b] = matches.map(Number);
        return { r, g, b };
      }

      return fallback;
    };

    const accentRgb = parseColor(accentColor, { r: 33, g: 150, b: 243 });
    const funPinkRgb = parseColor(funPinkColor, { r: 255, g: 82, b: 82 });

    // Clear canvas with light mode background
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines for structure
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, height);

      // Horizontal lines
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(width, i * CELL_SIZE);
    }
    ctx.stroke();

    // Draw snake with gradient from head (accent) to tail (fun-pink)
    snake.forEach((segment, index) => {
      // Calculate color gradient based on position in snake
      const progress = index / snake.length;
      const r = Math.round(accentRgb.r + (funPinkRgb.r - accentRgb.r) * progress);
      const g = Math.round(accentRgb.g + (funPinkRgb.g - accentRgb.g) * progress);
      const b = Math.round(accentRgb.b + (funPinkRgb.b - accentRgb.b) * progress);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;

      // Draw sharp rectangles (Neubrutalism style)
      ctx.fillRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
      );
      ctx.strokeRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
      );
    });

    // Draw food as yellow square
    ctx.fillStyle = funYellowColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.strokeRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
  }, [snake, food]);

  /**
   * Starts a new game, resetting all state to initial values.
   */
  const startGame = () => {
    setSnake(getInitialSnake());
    setFood({ x: 15, y: 10 });
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameState('playing');
  };

  /**
   * Toggles between playing and paused states.
   */
  const togglePause = () => {
    setGameState(prev => (prev === 'playing' ? 'paused' : 'playing'));
  };

  const getGameAnnouncement = () => {
    if (gameState === 'idle') return 'Snake game ready. Press Start Game to begin.';
    if (gameState === 'playing')
      return `Playing. Score: ${score}. Use arrow keys or WASD to control the snake.`;
    if (gameState === 'paused') return 'Game paused. Press Resume to continue.';
    if (gameState === 'gameOver')
      return `Game over! Final score: ${score}. ${score >= highScore && score > 0 ? 'New high score!' : ''}`;
    return '';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {getGameAnnouncement()}
      </div>

      {/* Score Board - Neubrutalism */}
      <div
        className="flex gap-6 bg-secondary border-[3px] border-[color:var(--color-border)] p-4"
        style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
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
        <div className="w-[3px] bg-[color:var(--color-border)]" />
        <div className="flex items-center gap-2 px-4">
          <Trophy size={18} className="text-fun-yellow" aria-hidden="true" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">Best</div>
            <div className="text-2xl font-heading font-bold text-fun-yellow">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Game Canvas - Neubrutalism */}
      <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="p-3 bg-card border-[3px] border-[color:var(--color-border)]"
          style={{ boxShadow: 'var(--nb-shadow)' }}
        >
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            role="img"
            aria-label={`Snake game board. Score: ${score}.`}
          />
        </motion.div>

        {/* Overlay States */}
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
              aria-labelledby="snake-start-title"
              aria-describedby="snake-start-desc"
            >
              <div
                id="snake-start-title"
                className="text-xl font-heading font-bold text-black bg-fun-yellow px-4 py-2 border-[3px] border-[color:var(--color-border)]"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                Snake Game
              </div>
              <div
                id="snake-start-desc"
                className="text-sm text-secondary text-center px-4 font-sans"
              >
                Use arrow keys or swipe to control
                <br />
                <span className="text-muted">Space to pause</span>
              </div>
              <motion.button
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                onClick={startGame}
                className="px-6 py-3 bg-accent text-white font-heading font-bold border-[3px] border-[color:var(--color-border)] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                autoFocus
              >
                <Play size={20} aria-hidden="true" />
                Start Game
              </motion.button>
            </motion.div>
          )}

          {gameState === 'paused' && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center gap-4 border-[3px] border-[color:var(--color-border)]"
              style={{ boxShadow: 'var(--nb-shadow)' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="snake-pause-title"
            >
              <Pause className="w-12 h-12 text-accent" aria-hidden="true" />
              <div
                id="snake-pause-title"
                className="text-xl font-heading font-bold text-white bg-accent px-4 py-2 border-[3px] border-[color:var(--color-border)]"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                Paused
              </div>
              <motion.button
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                onClick={togglePause}
                className="px-6 py-2 bg-fun-yellow text-black font-heading font-bold border-[3px] border-[color:var(--color-border)] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                autoFocus
              >
                <Play size={18} aria-hidden="true" />
                Resume
              </motion.button>
            </motion.div>
          )}

          {gameState === 'gameOver' && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center gap-4 border-[3px] border-[color:var(--color-border)]"
              style={{ boxShadow: 'var(--nb-shadow)' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="snake-gameover-title"
              aria-describedby="snake-gameover-desc"
            >
              <motion.div
                initial={shouldReduceMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.5 }}
                className="text-center"
              >
                <div
                  id="snake-gameover-title"
                  className="text-2xl font-heading font-bold text-white bg-fun-pink px-4 py-2 border-[3px] border-[color:var(--color-border)] mb-4"
                  style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                >
                  Game Over!
                </div>
                <div id="snake-gameover-desc" className="text-lg text-secondary font-sans">
                  Score: <span className="font-heading font-bold text-accent">{score}</span>
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
                initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
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
        </AnimatePresence>
      </div>

      {/* Controls hint for mobile */}
      <div
        className="text-sm md:text-xs text-secondary text-center md:hidden px-4 py-2 bg-secondary border-[3px] border-[color:var(--color-border)] font-sans leading-relaxed"
        style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
      >
        Swipe to change direction
      </div>

      {/* Pause button for mobile */}
      {gameState === 'playing' && (
        <motion.button
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          onClick={togglePause}
          className="md:hidden px-4 py-2 bg-card border-[3px] border-[color:var(--color-border)] text-primary font-heading font-bold flex items-center gap-2 cursor-pointer"
          style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
          aria-label="Pause game"
        >
          <Pause size={16} aria-hidden="true" />
          Pause
        </motion.button>
      )}
    </div>
  );
};

export default SnakeGame;
