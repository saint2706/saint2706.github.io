import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [snake, setSnake] = useState(getInitialSnake());
    const [food, setFood] = useState({ x: 15, y: 10 });
    const [direction, setDirection] = useState({ x: 1, y: 0 });
    const [gameState, setGameState] = useState('idle'); // 'idle', 'playing', 'paused', 'gameOver'
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

    // Update direction ref when direction changes
    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    // Save high score to localStorage
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

            // Wall collision
            if (newHead.x < 0 || newHead.x >= GRID_SIZE ||
                newHead.y < 0 || newHead.y >= GRID_SIZE) {
                setGameState('gameOver');
                return prevSnake;
            }

            // Self collision
            if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setGameState('gameOver');
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Food collision
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

    // Game loop
    useEffect(() => {
        if (gameState === 'playing') {
            gameLoopRef.current = setInterval(moveSnake, speed);
            return () => clearInterval(gameLoopRef.current);
        }
    }, [gameState, speed, moveSnake]);

    // Keyboard controls
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
                // Prevent 180-degree turns
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

    // Touch controls
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

    // Canvas rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = GRID_SIZE * CELL_SIZE;
        const height = GRID_SIZE * CELL_SIZE;

        // Clear canvas
        ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines (subtle)
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
        ctx.lineWidth = 0.5;
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

        // Draw snake with gradient
        snake.forEach((segment, index) => {
            const progress = index / snake.length;
            // Gradient from accent (#38bdf8) to fun-pink (#ec4899)
            const r = Math.round(56 + (236 - 56) * progress);
            const g = Math.round(189 + (72 - 189) * progress);
            const b = Math.round(248 + (153 - 248) * progress);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.beginPath();
            ctx.roundRect(
                segment.x * CELL_SIZE + 1,
                segment.y * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2,
                3
            );
            ctx.fill();

            // Head glow effect
            if (index === 0) {
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // Draw food with pulsing animation
        const pulse = 1 + Math.sin(Date.now() / 200) * 0.15;
        const foodSize = (CELL_SIZE - 4) * pulse;
        const offset = (CELL_SIZE - foodSize) / 2;

        ctx.fillStyle = '#eab308';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(
            food.x * CELL_SIZE + CELL_SIZE / 2,
            food.y * CELL_SIZE + CELL_SIZE / 2,
            foodSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

    }, [snake, food]);

    // Animation frame for food pulsing
    useEffect(() => {
        if (gameState !== 'playing') return;

        let animationId;
        const animate = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');

            // Redraw just the food for pulsing effect
            const pulse = 1 + Math.sin(Date.now() / 200) * 0.15;
            const foodSize = (CELL_SIZE - 4) * pulse;

            // Clear food area
            ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
            ctx.fillRect(
                food.x * CELL_SIZE,
                food.y * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
            );

            // Redraw food
            ctx.fillStyle = '#eab308';
            ctx.shadowColor = '#eab308';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(
                food.x * CELL_SIZE + CELL_SIZE / 2,
                food.y * CELL_SIZE + CELL_SIZE / 2,
                foodSize / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [gameState, food]);

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

    // Get game status for screen reader
    const getGameAnnouncement = () => {
        if (gameState === 'idle') return 'Snake game ready. Press Start Game to begin.';
        if (gameState === 'playing') return `Playing. Score: ${score}. Use arrow keys or WASD to control the snake.`;
        if (gameState === 'paused') return 'Game paused. Press Resume to continue.';
        if (gameState === 'gameOver') return `Game over! Final score: ${score}. ${score >= highScore && score > 0 ? 'New high score!' : ''}`;
        return '';
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Screen reader announcements */}
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {getGameAnnouncement()}
            </div>

            {/* Score Board */}
            <div className="flex gap-8 text-center">
                <div>
                    <div className="text-xs text-muted">Score</div>
                    <motion.div
                        key={score}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-accent"
                    >
                        {score}
                    </motion.div>
                </div>
                <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-fun-yellow" aria-hidden="true" />
                    <div>
                        <div className="text-xs text-muted">Best</div>
                        <div className="text-2xl font-bold text-fun-yellow">{highScore}</div>
                    </div>
                </div>
            </div>

            {/* Game Canvas */}
            <div
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 bg-secondary/30 backdrop-blur border border-slate-700 rounded-2xl"
                >
                    <canvas
                        ref={canvasRef}
                        width={GRID_SIZE * CELL_SIZE}
                        height={GRID_SIZE * CELL_SIZE}
                        className="rounded-lg"
                        role="img"
                        aria-label={`Snake game board. Score: ${score}. ${gameState === 'playing' ? 'Game in progress.' : gameState === 'paused' ? 'Game paused.' : gameState === 'gameOver' ? 'Game over.' : 'Press Start to play.'}`}
                    />
                </motion.div>

                {/* Overlay States */}
                <AnimatePresence>
                    {gameState === 'idle' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="snake-start-title"
                        >
                            <div id="snake-start-title" className="text-xl font-bold text-primary">Snake Game</div>
                            <div className="text-sm text-secondary text-center px-4">
                                Use arrow keys or swipe to control<br />
                                <span className="text-muted">Space to pause</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startGame}
                                className="px-6 py-3 bg-gradient-to-r from-accent to-fun-pink text-white font-bold rounded-lg flex items-center gap-2 shadow-lg"
                                autoFocus
                            >
                                <Play size={20} aria-hidden="true" />
                                Start Game
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === 'paused' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="snake-paused-title"
                        >
                            <Pause className="w-12 h-12 text-accent" aria-hidden="true" />
                            <div id="snake-paused-title" className="text-xl font-bold text-primary">Paused</div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={togglePause}
                                className="px-6 py-2 bg-accent text-primary font-bold rounded-lg flex items-center gap-2"
                                autoFocus
                            >
                                <Play size={18} aria-hidden="true" />
                                Resume
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === 'gameOver' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="snake-gameover-title"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', bounce: 0.5 }}
                                className="text-center"
                            >
                                <div id="snake-gameover-title" className="text-2xl font-bold text-fun-pink mb-2">Game Over!</div>
                                <div className="text-lg text-secondary">Score: <span className="text-accent font-bold">{score}</span></div>
                                {score >= highScore && score > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-center gap-2 mt-2 text-fun-yellow"
                                    >
                                        <Trophy size={18} aria-hidden="true" />
                                        <span className="font-bold">New High Score!</span>
                                    </motion.div>
                                )}
                            </motion.div>
                            <motion.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startGame}
                                className="px-6 py-2 bg-accent text-primary font-bold rounded-lg flex items-center gap-2"
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
            <div className="text-xs text-muted text-center md:hidden">
                Swipe to change direction
            </div>

            {/* Pause button for mobile */}
            {gameState === 'playing' && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={togglePause}
                    className="md:hidden px-4 py-2 bg-secondary/50 border border-slate-700 rounded-lg text-secondary flex items-center gap-2"
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
