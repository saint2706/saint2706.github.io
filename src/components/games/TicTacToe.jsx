import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { RotateCcw, Trophy, Cpu, User } from 'lucide-react';

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

const minimax = (board, depth, isMaximizing, alpha, beta) => {
    const winner = checkWinner(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                const evalScore = minimax(board, depth + 1, false, alpha, beta);
                board[i] = null;
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                const evalScore = minimax(board, depth + 1, true, alpha, beta);
                board[i] = null;
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
        }
        return minEval;
    }
};

const checkWinner = (board) => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

const getWinningLine = (board) => {
    for (const combo of WINNING_COMBINATIONS) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return combo;
        }
    }
    return null;
};

const TicTacToe = () => {
    const shouldReduceMotion = useReducedMotion();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [difficulty, setDifficulty] = useState('medium');
    const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
    const [gameStatus, setGameStatus] = useState('playing');
    const [winningLine, setWinningLine] = useState(null);

    const getAIMove = useCallback((currentBoard) => {
        const emptyIndices = currentBoard
            .map((cell, idx) => cell === null ? idx : null)
            .filter(idx => idx !== null);

        if (emptyIndices.length === 0) return null;

        if (difficulty === 'easy') {
            return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }

        if (difficulty === 'medium') {
            if (Math.random() < 0.3) {
                return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            }
        }

        let bestMove = emptyIndices[0];
        let bestScore = -Infinity;

        for (const idx of emptyIndices) {
            const newBoard = [...currentBoard];
            newBoard[idx] = 'O';
            const score = minimax(newBoard, 0, false, -Infinity, Infinity);
            if (score > bestScore) {
                bestScore = score;
                bestMove = idx;
            }
        }

        return bestMove;
    }, [difficulty]);

    const handleCellClick = useCallback((index) => {
        if (board[index] || !isPlayerTurn || gameStatus !== 'playing') return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);

        const winner = checkWinner(newBoard);
        if (winner === 'X') {
            setWinningLine(getWinningLine(newBoard));
            setGameStatus('won');
            setScores(prev => ({ ...prev, player: prev.player + 1 }));
            return;
        }

        if (newBoard.every(cell => cell !== null)) {
            setGameStatus('draw');
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
            return;
        }

        setIsPlayerTurn(false);
    }, [board, isPlayerTurn, gameStatus]);

    useEffect(() => {
        if (!isPlayerTurn && gameStatus === 'playing') {
            const timer = setTimeout(() => {
                const aiMove = getAIMove(board);
                if (aiMove !== null) {
                    const newBoard = [...board];
                    newBoard[aiMove] = 'O';
                    setBoard(newBoard);

                    const winner = checkWinner(newBoard);
                    if (winner === 'O') {
                        setWinningLine(getWinningLine(newBoard));
                        setGameStatus('lost');
                        setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
                        return;
                    }

                    if (newBoard.every(cell => cell !== null)) {
                        setGameStatus('draw');
                        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
                        return;
                    }

                    setIsPlayerTurn(true);
                }
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, gameStatus, board, getAIMove]);

    // Allow Escape to restart when a dialog is open
    useEffect(() => {
        if (gameStatus === 'playing') return;
        const handler = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                resetGame();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [gameStatus]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsPlayerTurn(true);
        setGameStatus('playing');
        setWinningLine(null);
    };

    const changeDifficulty = (newDifficulty) => {
        setDifficulty(newDifficulty);
        setScores({ player: 0, ai: 0, draws: 0 });
        resetGame();
    };

    const difficulties = [
        { id: 'easy', label: 'Easy', color: 'bg-fun-yellow' },
        { id: 'medium', label: 'Medium', color: 'bg-accent' },
        { id: 'hard', label: 'Hard', color: 'bg-fun-pink' }
    ];

    const getCellLabel = (index, cell) => {
        const row = Math.floor(index / 3) + 1;
        const col = (index % 3) + 1;
        const state = cell ? (cell === 'X' ? 'marked by you' : 'marked by AI') : 'empty';
        return `Row ${row}, Column ${col}, ${state}`;
    };

    const getStatusAnnouncement = () => {
        if (gameStatus === 'won') return 'Congratulations! You won the game!';
        if (gameStatus === 'lost') return 'Game over. AI wins!';
        if (gameStatus === 'draw') return "Game over. It's a draw!";
        if (!isPlayerTurn) return 'AI is thinking...';
        return 'Your turn. Select an empty cell to place your X.';
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {getStatusAnnouncement()}
            </div>

            {/* Difficulty Selector - Neubrutalism */}
            <div
                className="flex gap-2"
                role="group"
                aria-label="Select difficulty level"
            >
                {difficulties.map(diff => (
                    <button
                        key={diff.id}
                        onClick={() => changeDifficulty(diff.id)}
                        aria-pressed={difficulty === diff.id}
                        className={`px-4 py-2 font-heading font-bold text-sm border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform motion-reduce:transform-none motion-reduce:transition-none
                            ${difficulty === diff.id
                                ? `${diff.color} ${diff.id === 'easy' ? 'text-black' : 'text-white'} -translate-x-0.5 -translate-y-0.5`
                                : 'bg-card text-primary hover:-translate-x-0.5 hover:-translate-y-0.5'
                            }`}
                        style={{ boxShadow: difficulty === diff.id ? 'var(--nb-shadow-hover)' : '2px 2px 0 var(--color-border)' }}
                    >
                        {diff.label}
                    </button>
                ))}
            </div>

            {/* Score Board - Neubrutalism */}
            <div
                className="flex gap-4 bg-secondary border-[3px] border-[color:var(--color-border)] p-4"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            >
                <div className="flex items-center gap-2 px-3">
                    <User size={18} className="text-accent" />
                    <div>
                        <div className="text-xs text-muted font-heading">You</div>
                        <div className="text-xl font-heading font-bold text-accent">{scores.player}</div>
                    </div>
                </div>
                <div className="w-[3px] bg-[color:var(--color-border)]" />
                <div className="px-3">
                    <div className="text-xs text-muted font-heading">Draws</div>
                    <div className="text-xl font-heading font-bold text-muted">{scores.draws}</div>
                </div>
                <div className="w-[3px] bg-[color:var(--color-border)]" />
                <div className="flex items-center gap-2 px-3">
                    <div>
                        <div className="text-xs text-muted font-heading">AI</div>
                        <div className="text-xl font-heading font-bold text-fun-pink">{scores.ai}</div>
                    </div>
                    <Cpu size={18} className="text-fun-pink" />
                </div>
            </div>

            {/* Game Board - Neubrutalism */}
            <div className="relative">
                <motion.div
                    className="grid grid-cols-3 gap-2 p-4 bg-secondary border-[3px] border-[color:var(--color-border)]"
                    style={{ boxShadow: 'var(--nb-shadow)' }}
                    initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={shouldReduceMotion ? { duration: 0 } : undefined}
                    role="grid"
                    aria-label="Tic Tac Toe game board"
                >
                    {board.map((cell, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleCellClick(index)}
                            disabled={!!cell || !isPlayerTurn || gameStatus !== 'playing'}
                            aria-label={getCellLabel(index, cell)}
                            className={`w-20 h-20 md:w-24 md:h-24 text-4xl md:text-5xl font-heading font-bold flex items-center justify-center transition-transform border-[3px] border-[color:var(--color-border)] motion-reduce:transform-none motion-reduce:transition-none
                                ${winningLine?.includes(index)
                                    ? 'bg-fun-yellow'
                                    : 'bg-card'
                                }
                                ${!cell && isPlayerTurn && gameStatus === 'playing' ? 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5' : 'cursor-default'}
                            `}
                            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                            whileTap={!cell && isPlayerTurn && gameStatus === 'playing' && !shouldReduceMotion ? { scale: 0.95 } : undefined}
                        >
                            <AnimatePresence mode="wait">
                                {cell && (
                                    <motion.span
                                        initial={shouldReduceMotion ? false : { scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={shouldReduceMotion ? undefined : { scale: 0 }}
                                        transition={shouldReduceMotion ? { duration: 0 } : undefined}
                                        className={cell === 'X' ? 'text-accent' : 'text-fun-pink'}
                                        aria-hidden="true"
                                    >
                                        {cell}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Game Over Overlay */}
                <AnimatePresence>
                    {gameStatus !== 'playing' && (
                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                            transition={shouldReduceMotion ? { duration: 0 } : undefined}
                            className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center gap-4 border-[3px] border-[color:var(--color-border)]"
                            style={{ boxShadow: 'var(--nb-shadow)' }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="game-result"
                            aria-describedby="game-result-desc"
                        >
                            <motion.div
                                initial={shouldReduceMotion ? false : { scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.5 }}
                                className="text-center"
                            >
                                {gameStatus === 'won' && (
                                    <>
                                        <Trophy className="w-16 h-16 text-fun-yellow mx-auto mb-2" aria-hidden="true" />
                                        <div
                                            id="game-result"
                                            className="inline-block text-2xl font-heading font-bold text-black bg-fun-yellow px-4 py-2 border-[3px] border-[color:var(--color-border)]"
                                            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                                        >
                                            You Won!
                                        </div>
                                    </>
                                )}
                                {gameStatus === 'lost' && (
                                    <div
                                        id="game-result"
                                        className="inline-block text-2xl font-heading font-bold text-white bg-fun-pink px-4 py-2 border-[3px] border-[color:var(--color-border)]"
                                        style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                                    >
                                        AI Wins!
                                    </div>
                                )}
                                {gameStatus === 'draw' && (
                                    <div
                                        id="game-result"
                                        className="inline-block text-2xl font-heading font-bold text-primary bg-secondary px-4 py-2 border-[3px] border-[color:var(--color-border)]"
                                        style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                                    >
                                        It&apos;s a Draw!
                                    </div>
                                )}
                            </motion.div>
                            <p id="game-result-desc" className="sr-only">Game over dialog. Press Tab to stay inside and Escape to reset.</p>
                            <motion.button
                                initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
                                onClick={resetGame}
                                className="px-6 py-3 bg-accent text-white font-heading font-bold border-[3px] border-[color:var(--color-border)] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
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

            {/* Turn Indicator */}
            {gameStatus === 'playing' && (
                <motion.div
                    key={isPlayerTurn ? 'player' : 'ai'}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : undefined}
                    className="px-4 py-2 bg-secondary border-[3px] border-[color:var(--color-border)] font-heading font-bold"
                    style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                >
                    {isPlayerTurn ? (
                        <span className="text-accent">Your turn</span>
                    ) : (
                        <span className="text-fun-pink flex items-center gap-2">
                            <motion.span
                                animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
                                transition={{ duration: 1, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'linear' }}
                            >
                                <Cpu size={14} />
                            </motion.span>
                            AI is thinking...
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default TicTacToe;
