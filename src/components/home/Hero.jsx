/**
 * @fileoverview Hero section for homepage with interactive elements and animations.
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Code2,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { resumeData } from '../../data/resume';
import { safeJSONStringify } from '../../utils/security';
import ThemedButton from '../shared/ThemedButton';
import ThemedCard from '../shared/ThemedCard';
import ThemedChip from '../shared/ThemedChip';
import { useTheme } from '../shared/theme-context';

/**
 * Hero section component for homepage
 */
const Hero = () => {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';

  // Easter egg state (click stack array to unlock games page)
  const [clickCount, setClickCount] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const CLICKS_REQUIRED = 3;

  // Reset click count after 2 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0 && clickCount < CLICKS_REQUIRED) {
      const timeout = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timeout);
    }
  }, [clickCount]);

  /**
   * Handle easter egg activation
   */
  const handleEasterEggClick = useCallback(() => {
    if (isGlitching) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= CLICKS_REQUIRED) {
      setIsGlitching(true);
      setTimeout(() => {
        navigate('/games');
      }, 1500);
    }
  }, [clickCount, isGlitching, navigate]);

  /**
   * Keyboard handler for easter egg accessibility
   */
  const handleEasterEggKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEasterEggClick();
      }
    },
    [handleEasterEggClick]
  );

  const canonicalUrl = resumeData.basics.website;
  const description = resumeData.basics.summary;
  const title = `${resumeData.basics.name} | ${resumeData.basics.title}`;

  // Helper to switch classes based on theme
  const themeClass = (neubClass, liquidClass) => (isLiquid ? liquidClass : neubClass);


  const jsonLd = useMemo(() => safeJSONStringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: resumeData.basics.name,
    url: resumeData.basics.website,
    sameAs: resumeData.basics.socials.map(s => s.url),
    jobTitle: resumeData.basics.title,
    description: description,
    image: `${resumeData.basics.website}/og-image.png`,
  }), [description]);
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={description} />
        <script type="application/ld+json">
          {jsonLd}
        </script>
      </Helmet>

      <div className="min-h-[80vh] relative flex flex-col justify-center items-center text-center max-w-5xl mx-auto py-12 px-4">
        {/* Decorative Shapes (Hidden in Liquid Mode to match cleaner aesthetic) */}
        {!isLiquid && (
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
              className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-fun-yellow border-nb border-[color:var(--color-border)] rounded-nb nb-float-bob"
              style={{ boxShadow: 'var(--nb-shadow)', '--sticker-rotate': '3deg' }}
            />
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.4 }}
              className="absolute bottom-20 left-20 w-24 h-24 md:w-32 md:h-32 bg-fun-pink border-nb border-[color:var(--color-border)] rounded-nb nb-float-bob"
              style={{
                boxShadow: 'var(--nb-shadow)',
                '--sticker-rotate': '-2deg',
                animationDelay: '1s',
              }}
            />
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
              className="absolute top-20 right-16 w-20 h-20 md:w-28 md:h-28 bg-accent border-nb border-[color:var(--color-border)] rounded-nb nb-float-bob"
              style={{
                boxShadow: 'var(--nb-shadow)',
                '--sticker-rotate': '5deg',
                animationDelay: '2s',
              }}
            />
          </div>
        )}

        {/* Status Badge */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.15, rotate: 3 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={
            shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 15 }
          }
          className="mb-8"
        >
          <ThemedChip
            variant="yellow"
            className={themeClass(
              "font-heading font-semibold px-5 py-2 nb-sticker",
              "font-heading font-semibold px-5 py-2 lg-surface-3 lg-pill"
            )}
            style={isLiquid ? undefined : { '--sticker-rotate': '-2deg' }}
          >
            <Sparkles size={18} className={themeClass("text-black", "text-fun-yellow")} />
            <span className={isLiquid ? "text-[color:var(--text-primary)]" : ""}>Available for hire & collaborations</span>
          </ThemedChip>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="block text-[color:var(--text-primary)] mb-2 relative">
            Data Storyteller
            {/* SVG squiggle only for Neubrutalism */}
            {!isLiquid && (
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 400 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 8C20 2 40 10 60 4C80 -2 100 10 120 4C140 -2 160 10 180 4C200 -2 220 10 240 4C260 -2 280 10 300 4C320 -2 340 10 360 4C380 -2 395 8 398 6"
                  stroke="var(--color-fun-yellow)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
          <span
            className={themeClass(
              "text-[color:var(--text-primary)] px-4 py-2 border-nb border-[color:var(--color-border)] inline-block bg-fun-yellow rounded-nb nb-sticker",
              "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 inline-block"
            )}
            style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)', '--sticker-rotate': '1deg' }}
          >
            & Creative Analyst
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}
          className="text-secondary text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-sans"
        >
          Turning{' '}
          <strong className={themeClass("text-primary font-bold border-b-[3px] border-fun-yellow", "text-blue-400 font-bold")}>
            messy data
          </strong>{' '}
          into
          <strong className={themeClass("text-primary font-bold border-b-[3px] border-accent mx-1", "text-purple-400 font-bold mx-1")}>
            clear strategies
          </strong>{' '}
          and
          <strong className={themeClass("text-primary font-bold border-b-[3px] border-fun-pink mx-1", "text-pink-400 font-bold mx-1")}>
            AI/ML solutions
          </strong>{' '}
          into real-world impact.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          <ThemedButton
            as={Link}
            to="/projects"
            variant="primary"
            size="lg"
            className={themeClass(
              "group relative nb-shadow-lift nb-color-invert",
              "group relative liquid-button-primary border border-[color:var(--border-soft)] shadow-[0_0_30px_rgba(141,162,255,0.35)] hover:-translate-y-0.5"
            )}
            style={isLiquid ? undefined : { '--invert-text': 'var(--color-fun-yellow)' }}
          >
            View Projects
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform motion-reduce:transform-none motion-reduce:transition-none"
            />
          </ThemedButton>
          <ThemedButton
            onClick={() => document.dispatchEvent(new CustomEvent('openChatbot'))}
            variant="secondary"
            size="lg"
            className={themeClass(
              "nb-shadow-lift nb-color-invert",
              "lg-surface-2 shadow-[0_0_24px_rgba(215,131,255,0.22)] hover:-translate-y-0.5 text-[color:var(--text-primary)]"
            )}
            style={isLiquid ? undefined : { '--invert-text': '#ffffff' }}
            aria-label="Open chat with Digital Rishabh"
          >
            <Bot size={18} className={isLiquid ? "text-purple-400" : "text-fun-pink"} aria-hidden="true" />
            Talk to Digital Rishabh
          </ThemedButton>
        </motion.div>

        {/* Code Snippet Card - Translucent in Liquid Mode */}
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 1.08, rotate: 2 }}
          animate={{ scale: 1, rotate: -1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 350, damping: 18, delay: 0.35 }
          }
          className="mt-16 w-full max-w-md"
        >
          <ThemedCard
            variant={isLiquid ? 'default' : 'highlighted'}
            className={themeClass(
              `p-6 text-left font-mono text-sm transition-all duration-300 nb-sticker ${isGlitching ? 'animate-glitch' : ''}`,
              `!bg-transparent !border-0 !shadow-none p-0 ${isGlitching ? 'animate-glitch' : ''}`
            )}
            style={isLiquid ? undefined : { '--sticker-rotate': '-1deg' }}
          >
            {isLiquid ? (
              <div className="lg-code-surface p-6 text-left font-mono text-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/15">
                  <span className="flex gap-1.5 mr-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F57] opacity-80" />
                    <span className="w-3 h-3 rounded-full bg-[#FEBC2E] opacity-80" />
                    <span className="w-3 h-3 rounded-full bg-[#28C840] opacity-80" />
                  </span>
                  <Code2 size={14} className="text-blue-400/70" />
                  <span className="font-heading font-semibold text-[13px] text-gray-300 tracking-wide">
                    {isGlitching ? 'game_mode.js' : 'developer.js'}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                  {isGlitching ? (
                    <>
                      <span className="text-[#c792ea]">const</span>{' '}
                      <span className="text-[#82aaff]">developer</span>{' = {\n'}
                      {'  mode: '}
                      <span className="text-[#c3e88d]">&lsquo;GAMER&rsquo;</span>
                      {',\n  status: '}
                      <span className="text-[#c3e88d]">&lsquo;Ready Player One&rsquo;</span>
                      {',\n  launching: '}
                      <span className="text-[#f78c6c]">true</span>
                      {'\n};'}
                      <span className="nb-blink text-blue-400">█</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#c792ea]">const</span>{' '}
                      <span className="text-[#82aaff]">developer</span>{' = {\n'}
                      {'  name: '}
                      <span className="text-[#c3e88d]">&lsquo;{resumeData.basics.name}&rsquo;</span>
                      {',\n  stack: ['}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={handleEasterEggClick}
                        onKeyDown={handleEasterEggKeyDown}
                        className="cursor-pointer text-[#c3e88d] hover:text-[#addb67] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
                        aria-label={`Click ${CLICKS_REQUIRED - clickCount} more time${CLICKS_REQUIRED - clickCount !== 1 ? 's' : ''} for a surprise`}
                      >
                        &lsquo;Python&rsquo;, &lsquo;Tableau&rsquo;, &lsquo;React&rsquo;
                      </span>
                      {'],\n  currentStatus: '}
                      <span className="text-[#c3e88d]">&lsquo;Building awesome things.&rsquo;</span>
                      {',\n  openToWork: '}
                      <span className="text-[#f78c6c]">true</span>
                      {'\n};'}
                      <span className="nb-blink text-blue-400">█</span>
                    </>
                  )}
                </pre>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-black/20">
                  <Code2 size={16} />
                  <span className="font-heading font-bold">
                    {isGlitching ? 'game_mode.js' : 'developer.js'}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap">
                  {isGlitching ? (
                    <>
                      {`const developer = {\n  mode: `}
                      <span className="text-fun-pink font-bold">&lsquo;GAMER&rsquo;</span>
                      {`,\n  status: `}
                      <span className="text-accent font-bold">&lsquo;Ready Player One&rsquo;</span>
                      {`,\n  launching: `}
                      <span className="text-green-500 font-bold">true</span>
                      {`\n};`}
                      <span className="nb-blink">█</span>
                    </>
                  ) : (
                    <>
                      {`const developer = {\n  name: '${resumeData.basics.name}',\n  stack: [`}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={handleEasterEggClick}
                        onKeyDown={handleEasterEggKeyDown}
                        className="cursor-pointer hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 hover:text-fun-pink focus:ring-fun-pink"
                        aria-label={`Click ${CLICKS_REQUIRED - clickCount} more time${CLICKS_REQUIRED - clickCount !== 1 ? 's' : ''} for a surprise`}
                      >
                        &lsquo;Python&rsquo;, &lsquo;Tableau&rsquo;, &lsquo;React&rsquo;
                      </span>
                      {`],\n  currentStatus: 'Building awesome things.',\n  openToWork: true\n};`}
                      <span className="nb-blink">█</span>
                    </>
                  )}
                </pre>
              </>
            )}
          </ThemedCard>
        </motion.div>
      </div>
    </>
  );
};

export default Hero;
