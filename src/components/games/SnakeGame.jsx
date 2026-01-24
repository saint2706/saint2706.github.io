import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, RotateCcw, Trophy, Pause } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 60;

const getInitialSnake = () => [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];

const getRandomFood = (snake) => {
    let food;
    do {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    return food;
};

const SnakeGame = () => {
    const shouldReduceMotion = useReducedMotion();
    const [snake, setSnake] = useState(getInitialSnake());
    const [food, setFood] = useState({ x: 15, y: 10 });
    const [direction, setDirection] = useState({ x: 1, y: 0 });
    const [gameState, setGameState] = useState('idle');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
    });
    const [speed, setSpeed] = useState(INITIAL_SPEED);

    const gameLoopRef = useRef(null);
    const directionRef = useRef(direction);
    const canvasRef = useRef(null);
    const touchStartRef = useRef(null);

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score.toString());
        }
    }, [score, highScore]);

    const moveSnake = useCallback(() => {
        setSnake(prevSnake => {
            const head = prevSnake[0];
            const newHead = {
                x: head.x + directionRef.current.x,
                y: head.y + directionRef.current.y
            };

            if (newHead.x < 0 || newHead.x >= GRID_SIZE ||
                newHead.y < 0 || newHead.y >= GRID_SIZE) {
                setGameState('gameOver');
                return prevSnake;
            }

            if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setGameState('gameOver');
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(prev => prev + 10);
                setFood(getRandomFood(newSnake));
                setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [food]);

    useEffect(() => {
        if (gameState === 'playing') {
            gameLoopRef.current = setInterval(moveSnake, speed);
            return () => clearInterval(gameLoopRef.current);
        }
    }, [gameState, speed, moveSnake]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing' && gameState !== 'paused') return;

            const keyMap = {
                ArrowUp: { x: 0, y: -1 },
                ArrowDown: { x: 0, y: 1 },
                ArrowLeft: { x: -1, y: 0 },
                ArrowRight: { x: 1, y: 0 },
                w: { x: 0, y: -1 },
                s: { x: 0, y: 1 },
                a: { x: -1, y: 0 },
                d: { x: 1, y: 0 }
            };

            const newDir = keyMap[e.key];
            if (newDir) {
                e.preventDefault();
                const current = directionRef.current;
                if (newDir.x !== -current.x || newDir.y !== -current.y) {
                    setDirection(newDir);
                }
            }

            if (e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    const handleTouchStart = (e) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const handleTouchEnd = (e) => {
        if (!touchStartRef.current || gameState !== 'playing') return;

        const touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };

        const dx = touchEnd.x - touchStartRef.current.x;
        const dy = touchEnd.y - touchStartRef.current.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            const newDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
            if (newDir.x !== -directionRef.current.x) {
                setDirection(newDir);
            }
        } else {
            const newDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
            if (newDir.y !== -directionRef.current.y) {
                setDirection(newDir);
            }
        }

        touchStartRef.current = null;
    };

    // Canvas rendering with Neubrutalism colors
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = GRID_SIZE * CELL_SIZE;
        const height = GRID_SIZE * CELL_SIZE;

        // Clear canvas - use CSS variable compatible color
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(width, i * CELL_SIZE);
            ctx.stroke();
        }

        // Draw snake with Neubrutalism style (sharp corners)
        snake.forEach((segment, index) => {
            // Gradient from accent to fun-pink
            const progress = index / snake.length;
            const r = Math.round(33 + (255 - 33) * progress);
            const g = Math.round(150 + (82 - 150) * progress);
            const b = Math.round(243 + (82 - 243) * progress);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;

            // Sharp rectangles for Neubrutalism
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

        // Draw food - Yellow square for Neubrutalism
        ctx.fillStyle = '#FFEB3B';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(
            food.x * CELL_SIZE + 2,
            food.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4
        );
        ctx.strokeRect(
            food.x * CELL_SIZE + 2,
            food.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4
        );

    }, [snake, food]);

    const startGame = () => {
        setSnake(getInitialSnake());
        setFood({ x: 15, y: 10 });
        setDirection({ x: 1, y: 0 });
        setScore(0);
        setSpeed(INITIAL_SPEED);
        setGameState('playing');
    };

    const togglePause = () => {
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
    };

    const getGameAnnouncement = () => {
        if (gameState === 'idle') return 'Snake game ready. Press Start Game to begin.';
        if (gameState === 'playing') return `Playing. Score: ${score}. Use arrow keys or WASD to control the snake.`;
        if (gameState === 'paused') return 'Game paused. Press Resume to continue.';
        if (gameState === 'gameOver') return `Game over! Final score: ${score}. ${score >= highScore && score > 0 ? 'New high score!' : ''}`;
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
                    <div className="text-xs text-muted font-heading">Score</div>
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
                        <div className="text-xs text-muted font-heading">Best</div>
                        <div className="text-2xl font-heading font-bold text-fun-yellow">{highScore}</div>
                    </div>
                </div>
            </div>

            {/* Game Canvas - Neubrutalism */}
            <div
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
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
                            <div id="snake-start-desc" className="text-sm text-secondary text-center px-4 font-sans">
                                Use arrow keys or swipe to control<br />
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
                                        <span
                                            className="font-heading font-bold text-black bg-fun-yellow px-2 py-1 border-2 border-[color:var(--color-border)]"
                                        >
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
                className="text-xs text-muted text-center md:hidden px-4 py-2 bg-secondary border-[3px] border-[color:var(--color-border)] font-mono"
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
