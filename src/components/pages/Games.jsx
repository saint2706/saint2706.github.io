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
        { id: 'tictactoe', label: 'Tic Tac Toe', icon: Grid3X3, color: 'bg-accent' },
        { id: 'snake', label: 'Snake', icon: Sparkles, color: 'bg-fun-pink' }
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
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": resumeData.basics.website
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Games",
                                "item": canonicalUrl
                            }
                        ]
                    })}
                </script>
            </Helmet>

            <div className="max-w-4xl mx-auto py-12 px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    {/* Easter Egg Badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-fun-pink text-white font-heading font-bold border-[3px] border-[color:var(--color-border)]"
                        style={{ boxShadow: 'var(--nb-shadow)' }}
                    >
                        <Gamepad2 className="w-5 h-5" />
                        <span className="text-sm">Easter Egg Found!</span>
                    </motion.div>

                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                        <span
                            className="inline-block bg-fun-yellow text-black px-6 py-3 border-[3px] border-[color:var(--color-border)]"
                            style={{ boxShadow: 'var(--nb-shadow)' }}
                        >
                            Game Zone
                        </span>
                    </h1>
                    <p className="text-secondary max-w-xl mx-auto mt-6 font-sans">
                        You discovered the secret games page! Take a break and have some fun.
                    </p>
                </motion.div>

                {/* Game Selector Tabs - Neubrutalism Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-8"
                >
                    <div
                        className="flex gap-3"
                        role="tablist"
                        aria-label="Select a game to play"
                    >
                        {games.map(game => (
                            <button
                                key={game.id}
                                onClick={() => setActiveGame(game.id)}
                                role="tab"
                                aria-selected={activeGame === game.id}
                                aria-controls={`${game.id}-panel`}
                                id={`${game.id}-tab`}
                                className={`flex items-center gap-2 px-6 py-3 font-heading font-bold text-sm border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform
                                    ${activeGame === game.id
                                        ? `${game.color} text-white -translate-x-0.5 -translate-y-0.5`
                                        : 'bg-card text-primary hover:-translate-x-0.5 hover:-translate-y-0.5'
                                    }`}
                                style={{ boxShadow: activeGame === game.id ? 'var(--nb-shadow-hover)' : 'var(--nb-shadow)' }}
                            >
                                <game.icon size={18} aria-hidden="true" />
                                <span>{game.label}</span>
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
                    <div
                        className="bg-card border-[3px] border-[color:var(--color-border)] p-6 md:p-8"
                        style={{ boxShadow: 'var(--nb-shadow)' }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeGame}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                role="tabpanel"
                                id={`${activeGame}-panel`}
                                aria-labelledby={`${activeGame}-tab`}
                            >
                                {activeGame === 'tictactoe' && <TicTacToe />}
                                {activeGame === 'snake' && <SnakeGame />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Footer hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mt-12"
                >
                    <div
                        className="bg-secondary border-[3px] border-[color:var(--color-border)] px-6 py-3"
                        style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                    >
                        <p className="text-muted text-xs font-mono text-center">
                            Psst... you found this page by going to /games. Keep it a secret! 🤫
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default Games;
