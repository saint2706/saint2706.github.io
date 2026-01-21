import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, Cpu, User } from 'lucide-react';

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Minimax algorithm for unbeatable AI
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
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [difficulty, setDifficulty] = useState('medium');
    const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost', 'draw'
    const [winningLine, setWinningLine] = useState(null);

    const getAIMove = useCallback((currentBoard) => {
        const emptyIndices = currentBoard
            .map((cell, idx) => cell === null ? idx : null)
            .filter(idx => idx !== null);

        if (emptyIndices.length === 0) return null;

        if (difficulty === 'easy') {
            // Random move
            return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }

        if (difficulty === 'medium') {
            // 70% optimal, 30% random
            if (Math.random() < 0.3) {
                return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            }
        }

        // Hard difficulty or 70% of medium: use minimax
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

    // AI move effect
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
        { id: 'easy', label: 'Easy', color: 'from-green-400 to-emerald-500' },
        { id: 'medium', label: 'Medium', color: 'from-yellow-400 to-orange-500' },
        { id: 'hard', label: 'Hard', color: 'from-red-400 to-rose-500' }
    ];

    // Helper to get cell position description for screen readers
    const getCellLabel = (index, cell) => {
        const row = Math.floor(index / 3) + 1;
        const col = (index % 3) + 1;
        const state = cell ? (cell === 'X' ? 'marked by you' : 'marked by AI') : 'empty';
        return `Row ${row}, Column ${col}, ${state}`;
    };

    // Get game status announcement for screen readers
    const getStatusAnnouncement = () => {
        if (gameStatus === 'won') return 'Congratulations! You won the game!';
        if (gameStatus === 'lost') return 'Game over. AI wins!';
        if (gameStatus === 'draw') return "Game over. It's a draw!";
        if (!isPlayerTurn) return 'AI is thinking...';
        return 'Your turn. Select an empty cell to place your X.';
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Screen reader announcements */}
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {getStatusAnnouncement()}
            </div>

            {/* Difficulty Selector */}
            <div
                className="flex gap-2 p-1 bg-secondary/30 rounded-xl border border-slate-700"
                role="group"
                aria-label="Select difficulty level"
            >
                {difficulties.map(diff => (
                    <button
                        key={diff.id}
                        onClick={() => changeDifficulty(diff.id)}
                        aria-pressed={difficulty === diff.id}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${difficulty === diff.id
                            ? `bg-gradient-to-r ${diff.color} text-white shadow-lg`
                            : 'text-secondary hover:text-primary hover:bg-secondary/50'
                            }`}
                    >
                        {diff.label}
                    </button>
                ))}
            </div>

            {/* Score Board */}
            <div className="flex gap-6 text-center">
                <div className="flex items-center gap-2">
                    <User size={18} className="text-accent" />
                    <div>
                        <div className="text-xs text-muted">You</div>
                        <div className="text-xl font-bold text-accent">{scores.player}</div>
                    </div>
                </div>
                <div className="w-px bg-slate-700" />
                <div>
                    <div className="text-xs text-muted">Draws</div>
                    <div className="text-xl font-bold text-secondary">{scores.draws}</div>
                </div>
                <div className="w-px bg-slate-700" />
                <div className="flex items-center gap-2">
                    <div>
                        <div className="text-xs text-muted">AI</div>
                        <div className="text-xl font-bold text-fun-pink">{scores.ai}</div>
                    </div>
                    <Cpu size={18} className="text-fun-pink" />
                </div>
            </div>

            {/* Game Board */}
            <div className="relative">
                <motion.div
                    className="grid grid-cols-3 gap-2 p-4 bg-secondary/30 backdrop-blur border border-slate-700 rounded-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    role="grid"
                    aria-label="Tic Tac Toe game board"
                >
                    {board.map((cell, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleCellClick(index)}
                            disabled={!!cell || !isPlayerTurn || gameStatus !== 'playing'}
                            aria-label={getCellLabel(index, cell)}
                            aria-describedby={winningLine?.includes(index) ? 'winning-cell' : undefined}
                            className={`w-20 h-20 md:w-24 md:h-24 rounded-xl text-4xl md:text-5xl font-bold flex items-center justify-center transition-all duration-200
                ${winningLine?.includes(index)
                                    ? 'bg-gradient-to-br from-accent/40 to-fun-pink/40 border-2 border-accent'
                                    : 'bg-secondary/50 border border-slate-600 hover:border-accent/50'}
                ${!cell && isPlayerTurn && gameStatus === 'playing' ? 'cursor-pointer hover:bg-secondary/70' : 'cursor-default'}
              `}
                            whileHover={!cell && isPlayerTurn && gameStatus === 'playing' ? { scale: 1.05 } : {}}
                            whileTap={!cell && isPlayerTurn && gameStatus === 'playing' ? { scale: 0.95 } : {}}
                        >
                            <AnimatePresence mode="wait">
                                {cell && (
                                    <motion.span
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0 }}
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
                <span id="winning-cell" className="sr-only">Part of the winning combination</span>

                {/* Game Over Overlay */}
                <AnimatePresence>
                    {gameStatus !== 'playing' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="game-result"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', bounce: 0.5 }}
                            >
                                {gameStatus === 'won' && (
                                    <>
                                        <Trophy className="w-16 h-16 text-fun-yellow mx-auto mb-2" aria-hidden="true" />
                                        <div id="game-result" className="text-2xl font-bold text-fun-yellow">You Won!</div>
                                    </>
                                )}
                                {gameStatus === 'lost' && (
                                    <div id="game-result" className="text-2xl font-bold text-fun-pink">AI Wins!</div>
                                )}
                                {gameStatus === 'draw' && (
                                    <div id="game-result" className="text-2xl font-bold text-secondary">It's a Draw!</div>
                                )}
                            </motion.div>
                            <motion.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={resetGame}
                                className="px-6 py-2 bg-accent text-primary font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2"
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-secondary"
                >
                    {isPlayerTurn ? (
                        <span className="text-accent">Your turn</span>
                    ) : (
                        <span className="text-fun-pink flex items-center gap-2">
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
