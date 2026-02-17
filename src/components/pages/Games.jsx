/**
 * @fileoverview Games page - Easter egg feature with Tic Tac Toe and Snake games.
 */

import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  Gamepad2,
  Grid3X3,
  Sparkles,
  Loader2,
  Layers,
  Bomb,
  Disc,
  Target,
  Lightbulb,
  ChevronRight,
  X
} from 'lucide-react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { resumeData } from '../../data/resume';
import { safeJSONStringify } from '../../utils/security';
import ThemedButton from '../shared/ThemedButton';
import ThemedCard from '../shared/ThemedCard';
import ThemedChip from '../shared/ThemedChip';
import { useTheme } from '../shared/theme-context';

// Lazy load game components to reduce initial bundle size
const TicTacToe = lazy(() => import('../games/TicTacToe'));
const SnakeGame = lazy(() => import('../games/SnakeGame'));
const MemoryMatch = lazy(() => import('../games/MemoryMatch'));
const Minesweeper = lazy(() => import('../games/Minesweeper'));
const SimonSays = lazy(() => import('../games/SimonSays'));
const WhackAMole = lazy(() => import('../games/WhackAMole'));
const LightsOut = lazy(() => import('../games/LightsOut'));

/**
 * Loading spinner for game components
 */
const GameLoader = () => (
  <div
    className="flex items-center justify-center min-h-[350px]"
    role="status"
    aria-label="Loading game"
  >
    <Loader2 className="w-10 h-10 animate-spin text-fun-yellow motion-reduce:animate-none" />
  </div>
);

const Games = () => {
  const [activeGame, setActiveGame] = useState('tictactoe');
  const [isGameOpen, setIsGameOpen] = useState(false); // For Liquid theme modal
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';

  const canonicalUrl = `${resumeData.basics.website}/games`;
  const description =
    'A secret games easter egg! Play Tic Tac Toe, Snake, Memory Match, Minesweeper, Simon Says, Whack-a-Mole, and Lights Out.';
  const title = `Games | ${resumeData.basics.name}`;

  /** Available games configuration */
  const games = [
    { id: 'tictactoe', label: 'Tic Tac Toe', icon: Grid3X3, color: 'bg-accent',
      liquidTitle: 'Circuit Runner', liquidDesc: 'High-speed precision racing through a procedurally generated motherboard world.',
      liquidImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPEp24twJuNvBDlFbXiNkeuj_ZRRLdp8HOJUni02C6qhMDQSunTgIHmY-_QQSPWzXUxPiY7XFp6tbb-_iYQc6jhajeIzNFQedapJsjFnz1PlSPGQ8uddSX58OkhoHpa61l4JWxoDjqkgX7i3aIqXboSj9GLEVkFVw6Fz4CgtC-kjKptBOEUFGI4Ng9096bBzEZTs8UIdXo_2C2IqoNNcmxymbRxHLYxkZa-WlEqVP-2ZBfyrJJvrS7dM5pUgHSu3hHPf0JnDTlhtOD',
      tag: 'Unity Engine', fps: '120 FPS'
    },
    { id: 'snake', label: 'Snake', icon: Sparkles, color: 'bg-fun-pink',
      liquidTitle: 'Particle Zen', liquidDesc: 'A meditative playground featuring 10 million particles reacting to cursor proximity.',
      liquidImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfujHB-JmVSrQvCpz9MPZKtQYt5yIlimW_KbeRCLkccqJRhd9_vZ5s3imLCRYRwfNQFrQdjxl32Xr7VuoxcpZ4m3zdpSCJBBT1j-yIJJYPL7AaEgeC3blanhoxlCLcx6WlKCOlMOnL5JkbKzbqn7hTStc4BkjdzSAhFjly4EBk_7zgsSaz4TWelANwJOg-AbbkcVEHYLAT11MqDCvk4mSWsyILEN93QU83U5gc_9Tj49GuxL89wREqst0xMRXoqkRgJcByLpVwdXuy',
      tag: 'Experimental', badge: 'Touch Ready', badgeColor: 'text-blue-600 bg-blue-50'
    },
    { id: 'memory', label: 'Memory', icon: Layers, color: 'bg-fun-yellow',
      liquidTitle: 'Mono Space', liquidDesc: 'Architecture-driven puzzle design set in an infinite brutalist museum.',
      liquidImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDReoGCZ8OUcwTAHraJoKaY2iEuheQVshQW7j_lPHsuGaFpPiJhFwjkZXhJnCf0V-iIpwu2n9RWUdL2IptNSYIWS2CEy2vOyIUF_APKO-kl-yw4cArA63y1IbqndkV1hwpzk1tVXoDBzH-34f75OFWVBh0-DzUWHrITuAHSjiX6iXFMvJ7o7d3pZIjWRDvEMwMkQ8Efr6gq4iTTaU8SWjbxzk1ymcx6JkJwYzVE1vHSsuuG4eiseT4JzgAtqlqQy7UQegXKuItX-ebo',
      tag: 'Mobile Lab', badge: 'Best of 2024', badgeColor: 'text-black bg-black/5'
    },
    { id: 'minesweeper', label: 'Mines', icon: Bomb, color: 'bg-emerald-500',
      liquidTitle: 'Paper Fold', liquidDesc: 'Complex origami simulations with hyper-realistic paper physics and lighting.',
      liquidImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_LoQmSvVUyWaJC-OZOqRIi51zTOAKAkhbetMGXIGYeVMiJ-RkZ0pAcPepWnMituqXDbZG_A1opTWtKq03jSzOspWoVINyhlmf61PRtyqmxaDweZuQpznM5iJRaLvwJiX6XUD2S7f5k9mya2ZeYyV_P9nYDm3J4YNRiB9kyIKETNi9mLIEHdpTzfHlyJKSdYQWe6RJzmFXthkxNZRDxNPjVgkb046B1vb4xDEe8tR_28VYC6Jqu2Af9BQA2BdVEwpBoYPyrsJ3b8u7',
      tag: 'Web Canvas'
    },
    { id: 'simon', label: 'Simon', icon: Disc, color: 'bg-violet-500',
      liquidTitle: 'Ethereal Map', liquidDesc: 'Real-time global data mapped onto a crystalline globe with bloom effects.',
      liquidImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCpJ1ucMtRnSL7SsrR-rErW_BcyWwlQytjJuqVP0kNqe9MVoQeFjzWBFopIRYv1oeSGVWoMs0x8pjTAyy7NLQT9xfyirkJEN17py3vKvAGuFIjrkTojqYC5iTWBSvOOjuxID4rN0XLRVl4F9qSNDtti3UhyEXv4bDHmBr9Wiwmq_Nwff2DcM_iKObM6rQ8RbWjZ0l7QwayLjzqwfY185CFfsaeTt6bVIAyVSuPBCclNtVE-LBJ8XzRXNhWiI-o5F6aksTrxzSBGHKL',
      tag: 'Three.js'
    },
    { id: 'whack', label: 'Whack', icon: Target, color: 'bg-orange-500',
      liquidTitle: 'Nebula Dreams', liquidDesc: 'Generative space exploration using neural networks to create unique galaxies.',
      liquidImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9WvBQbSOeewpZmfRPZAnIMLkLkW6KNyLkx9K6NzU9o-bgh-KWlyFJ_IG8BNqUddFtLEG1M39k1JImAJqWp9L9_2xTcdlMKjK-NhYeCKGM66o6PEuHBA7Cwa3e5C8QOPDiAVHOt99M3YLmSjr95pL_EQbOatgwmSwoKZOI6Bkjde5PmpIE_Nzdtn9n6JMIW66_Qp_fNXE1-VB6TNDLY6zwEgsMNmw67ZhKk0IGSCsRWnbLGxfnmI9ABaIlmmVEv5Cs1rbI1Qo4jRYd',
      tag: 'Neural Studio'
    },
    { id: 'lightsout', label: 'Lights', icon: Lightbulb, color: 'bg-cyan-500' },
  ];

  const handleGameSelect = (gameId) => {
    setActiveGame(gameId);
    if (isLiquid) {
        setIsGameOpen(true);
    }
  };

  const activeGameObj = games.find(g => g.id === activeGame);

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
          {safeJSONStringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: resumeData.basics.website,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Games',
                item: canonicalUrl,
              },
            ],
          })}
        </script>
      </Helmet>

      {/* LIQUID THEME RENDER */}
      {isLiquid ? (
         <div className="min-h-screen">
             {/* Header Section */}
             <section className="pt-[180px] pb-[120px] px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="editorial-title text-[64px] md:text-[80px] font-bold leading-[1.05] mb-8 text-ios-dark">Games & Playground</h1>
                    <p className="text-[21px] font-medium text-ios-gray max-w-2xl mx-auto leading-[1.6]">
                        A premium interactive gallery exploring the intersection of fluid dynamics, experimental shaders, and iOS-inspired luxury interfaces.
                    </p>
                </div>
            </section>

            {/* Segmented Control */}
            <div className="flex justify-center mb-[120px] sticky top-24 z-40 px-6">
                <div className="segmented-control glass-blur rounded-full flex w-full max-w-md">
                    <button className="flex-1 py-1.5 text-[13px] font-medium segmented-item-active rounded-full touch-target text-ios-dark shadow-sm">All Experiments</button>
                    <button className="flex-1 py-1.5 text-[13px] font-medium text-ios-gray hover:text-ios-dark transition-colors touch-target">Games</button>
                    <button className="flex-1 py-1.5 text-[13px] font-medium text-ios-gray hover:text-ios-dark transition-colors touch-target">Lab</button>
                    <button className="flex-1 py-1.5 text-[13px] font-medium text-ios-gray hover:text-ios-dark transition-colors touch-target">VR</button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {/* Featured Section */}
                <section className="mb-[120px]">
                    <div className="glass-sheet glass-blur rounded-sheet p-8 md:p-12 overflow-hidden">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">
                            <div className="w-full lg:w-3/5">
                                <div className="aspect-video w-full rounded-widget bg-cover bg-center shadow-ios-stack" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqLRS2JBt3-ZuNvmiX7ZGW_QChzDKW2eu6m3Qzb8Re_0fpAOgQMIGe2dx6GrkYq_2_6JXv7p6aP8IzLeErjhrhRWoYrm9mciUTk-BaBnBwMD68Tt_n4s3-iiLil1VJ6ElKPD-XMefygHU9oU20tl9hbp2_mgiH4mTCJyOL7_cnn-mX9IJckL1Xoim27qsbVOqwSCH17m1ETVBSJeKBkDpj-bxHM0-E1S2EgBUr3BjVWuT89wvrwy3W_BkBL0IYAC4Gt6R9eeS6U943')" }}></div>
                            </div>
                            <div className="w-full lg:w-2/5 flex flex-col gap-8">
                                <div className="space-y-3">
                                    <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-black/40">Featured Playground</span>
                                    <h2 className="text-[40px] font-bold tracking-tight leading-tight text-ios-dark">Liquid Glass Studio</h2>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[14px] font-semibold text-black/40 uppercase tracking-wider">Simulation Intensity</p>
                                    <div className="segmented-control rounded-full flex w-full max-w-[300px]">
                                        <button className="flex-1 py-1.5 text-[11px] font-bold text-black/40 touch-target">RELAX</button>
                                        <button className="flex-1 py-1.5 text-[11px] font-bold segmented-item-active rounded-full touch-target text-ios-dark shadow-sm">DYNAMIC</button>
                                        <button className="flex-1 py-1.5 text-[11px] font-bold text-black/40 touch-target">ULTRA</button>
                                    </div>
                                </div>
                                <p className="text-ios-dark text-[17px] leading-[1.6] font-medium">
                                    An experimental study in real-time refraction and fluid simulation. Reimagining modern interfaces through physical material properties and glass aesthetics.
                                </p>
                                <div className="flex gap-4 items-center pt-2">
                                    <button onClick={() => handleGameSelect('tictactoe')} className="bg-ios-dark text-white text-[15px] font-semibold px-8 py-3 rounded-full hover:bg-black/80 transition-all touch-target">
                                        Launch Project
                                    </button>
                                    <button className="bg-black/5 text-ios-dark text-[15px] font-semibold px-8 py-3 rounded-full hover:bg-black/10 transition-colors touch-target">
                                        View Case Study
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Grid Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-[120px]">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            onClick={() => handleGameSelect(game.id)}
                            className="glass-sheet glass-blur rounded-widget p-6 flex flex-col gap-5 group hover:-translate-y-2 transition-transform duration-[200ms] ease-out cursor-pointer"
                        >
                            <div className="aspect-square w-full rounded-[16px] bg-cover bg-center" style={{ backgroundImage: `url('${game.liquidImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPEp24twJuNvBDlFbXiNkeuj_ZRRLdp8HOJUni02C6qhMDQSunTgIHmY-_QQSPWzXUxPiY7XFp6tbb-_iYQc6jhajeIzNFQedapJsjFnz1PlSPGQ8uddSX58OkhoHpa61l4JWxoDjqkgX7i3aIqXboSj9GLEVkFVw6Fz4CgtC-kjKptBOEUFGI4Ng9096bBzEZTs8UIdXo_2C2IqoNNcmxymbRxHLYxkZa-WlEqVP-2ZBfyrJJvrS7dM5pUgHSu3hHPf0JnDTlhtOD'}')` }}></div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-black/40">{game.tag || 'Game'}</span>
                                    {game.badge && (
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${game.badgeColor || 'text-green-600 bg-green-50'}`}>
                                            {game.badge}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-[20px] font-bold tracking-tight text-ios-dark">{game.liquidTitle || game.label}</h3>
                                <p className="text-[15px] text-black/60 line-clamp-2 leading-[1.6]">{game.liquidDesc || 'Interactive experience.'}</p>
                            </div>
                            <div className="mt-auto pt-2 flex justify-end">
                                <span className="touch-target flex items-center justify-center">
                                    <ChevronRight className="text-black/20 group-hover:text-black transition-colors" />
                                </span>
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {/* Modal for Active Game */}
            <AnimatePresence>
                {isGameOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="p-4 flex justify-between items-center border-b border-gray-100">
                                <h3 className="font-bold text-lg text-ios-dark">{activeGameObj?.liquidTitle || activeGameObj?.label}</h3>
                                <button onClick={() => setIsGameOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-ios-gray" />
                                </button>
                            </div>
                            <div className="p-8 bg-gray-50 flex-1 overflow-auto flex items-center justify-center">
                                <Suspense fallback={<GameLoader />}>
                                    {activeGame === 'tictactoe' && <TicTacToe />}
                                    {activeGame === 'snake' && <SnakeGame />}
                                    {activeGame === 'memory' && <MemoryMatch />}
                                    {activeGame === 'minesweeper' && <Minesweeper />}
                                    {activeGame === 'simon' && <SimonSays />}
                                    {activeGame === 'whack' && <WhackAMole />}
                                    {activeGame === 'lightsout' && <LightsOut />}
                                </Suspense>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      ) : (
      /* NEUBRUTALISM RENDER */
      <div className="max-w-4xl mx-auto py-12 px-4 text-[color:var(--color-text-primary)]">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="mb-12 text-center"
        >
          {/* Easter Egg Badge */}
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0, rotate: 5 }}
            animate={{ scale: 1, rotate: -2 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.5, delay: 0.1 }
            }
            className="hover:brightness-110 hover:scale-[1.015] transition-[filter,transform] motion-reduce:transform-none"
            style={{ '--sticker-rotate': '-2deg' }}
          >
            <ThemedChip
              variant="pink"
              className="mb-6 px-4 py-2 font-heading font-bold nb-sticker rounded-nb text-white"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="text-sm">Easter Egg Found!</span>
            </ThemedChip>
          </motion.div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            <ThemedCard
              as="span"
              variant="highlighted"
              className="inline-block px-6 py-3 rounded-nb nb-stamp-in"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              Game Zone
            </ThemedCard>
          </h1>
          <p className="text-secondary max-w-xl mx-auto mt-6 font-sans">
            You discovered the secret games page! Take a break and have some fun.
          </p>
        </motion.div>

        {/* Game Selector Tabs */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div
            className="flex gap-3 flex-wrap justify-center"
            role="tablist"
            aria-label="Select a game to play"
          >
            {games.map(game => (
              <ThemedButton
                as="button"
                variant="secondary"
                size="md"
                key={game.id}
                onClick={() => handleGameSelect(game.id)}
                role="tab"
                aria-selected={activeGame === game.id}
                aria-controls={`${game.id}-panel`}
                id={`${game.id}-tab`}
                className={`flex items-center gap-2 px-6 py-3 font-heading font-bold text-sm rounded-nb
                                    ${
                                      activeGame === game.id
                                        ? `${game.color} text-white`
                                        : 'bg-card text-[color:var(--color-text-primary)]'
                                    }`}
                style={{
                  boxShadow:
                    activeGame === game.id
                      ? 'var(--nb-shadow-hover)'
                      : 'var(--nb-shadow)',
                }}
              >
                <game.icon size={18} aria-hidden="true" />
                <span className="flex items-center gap-2">
                  <span>{game.label}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide transition-opacity border-[2px] border-[color:var(--color-border)] bg-card text-primary ${activeGame === game.id ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden={activeGame !== game.id}
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Selected
                  </span>
                </span>
              </ThemedButton>
            ))}
          </div>
        </motion.div>

        {/* Game Container */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3 }}
          className="flex justify-center"
        >
          <ThemedCard
            variant="default"
            className="bg-card border-nb border-[color:var(--color-border)] p-6 md:p-8 rounded-nb"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGame}
                initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                role="tabpanel"
                id={`${activeGame}-panel`}
                aria-labelledby={`${activeGame}-tab`}
              >
                <Suspense fallback={<GameLoader />}>
                  {activeGame === 'tictactoe' && <TicTacToe />}
                  {activeGame === 'snake' && <SnakeGame />}
                  {activeGame === 'memory' && <MemoryMatch />}
                  {activeGame === 'minesweeper' && <Minesweeper />}
                  {activeGame === 'simon' && <SimonSays />}
                  {activeGame === 'whack' && <WhackAMole />}
                  {activeGame === 'lightsout' && <LightsOut />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </ThemedCard>
        </motion.div>

        {/* Footer hint */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <div
            className="bg-secondary border-nb border-[color:var(--color-border)] px-6 py-3 rounded-nb"
            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
          >
            <p className="text-secondary text-sm md:text-xs font-sans text-center leading-relaxed">
              Psst... you found this page by going to /games. Keep it a secret! 🤫
            </p>
          </div>
        </motion.div>
      </div>
      )}
    </>
  );
};

export default Games;
