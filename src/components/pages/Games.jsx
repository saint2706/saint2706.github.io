import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Grid3X3, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { resumeData } from '../../data/resume';
import TicTacToe from '../games/TicTacToe';
import SnakeGame from '../games/SnakeGame';

const Games = () => {
    const [activeGame, setActiveGame] = useState('tictactoe');
    const canonicalUrl = `${resumeData.basics.website}/games`;
    const description = 'A secret games easter egg! Play Tic Tac Toe against AI or challenge yourself with Snake.';
    const title = `Games | ${resumeData.basics.name}`;

    const games = [
        { id: 'tictactoe', label: 'Tic Tac Toe', icon: Grid3X3 },
        { id: 'snake', label: 'Snake', icon: Sparkles }
    ];

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <link rel="canonical" href={canonicalUrl} />
                <meta name="description" content={description} />
                <meta name="robots" content="noindex" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonicalUrl} />
            </Helmet>

            <div className="max-w-4xl mx-auto py-12 px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                        className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-secondary/50 backdrop-blur border border-slate-700 rounded-full"
                    >
                        <Gamepad2 className="w-5 h-5 text-fun-pink" />
                        <span className="text-sm font-mono text-accent">Easter Egg Found!</span>
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-fun-pink to-fun-yellow">
                            Game Zone
                        </span>
                    </h1>
                    <p className="text-secondary max-w-xl mx-auto">
                        You discovered the secret games page! Take a break and have some fun.
                    </p>
                </motion.div>

                {/* Game Selector Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-8"
                >
                    <div className="flex gap-2 p-1.5 bg-secondary/30 backdrop-blur border border-slate-700 rounded-xl">
                        {games.map(game => (
                            <button
                                key={game.id}
                                onClick={() => setActiveGame(game.id)}
                                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeGame === game.id
                                        ? 'text-primary'
                                        : 'text-secondary hover:text-primary'
                                    }`}
                            >
                                {activeGame === game.id && (
                                    <motion.div
                                        layoutId="activeGameTab"
                                        className="absolute inset-0 bg-gradient-to-r from-accent/20 to-fun-pink/20 border border-accent/30 rounded-lg"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                                <game.icon size={18} className={activeGame === game.id ? 'text-accent' : ''} />
                                <span className="relative z-10">{game.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Game Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeGame}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeGame === 'tictactoe' && <TicTacToe />}
                            {activeGame === 'snake' && <SnakeGame />}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Footer hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-muted text-xs mt-12"
                >
                    Psst... you found this page by going to /games. Keep it a secret! 🤫
                </motion.p>
            </div>
        </>
    );
};

export default Games;
