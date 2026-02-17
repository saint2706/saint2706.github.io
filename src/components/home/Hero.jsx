/**
 * @fileoverview Hero section for homepage with interactive elements and animations.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Code2,
  Sparkles,
  BadgeCheck,
  MapPin,
  History,
  LayoutGrid,
  Globe,
  Award
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

  // Calculate years of experience dynamically
  const yearsExperience = useMemo(() => {
    // Start year from first education entry (2020) as a proxy for start of journey
    // or from first experience if preferred. Using 2020 based on B.Tech start.
    const startYear = 2020;
    const currentYear = new Date().getFullYear();
    return (currentYear - startYear).toString().padStart(2, '0');
  }, []);

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

  // Liquid Theme Render
  if (isLiquid) {
    return (
      <>
        <Helmet>
          <title>{title}</title>
          <link rel="canonical" href={canonicalUrl} />
          <meta name="description" content={description} />
           <script type="application/ld+json">
          {safeJSONStringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: resumeData.basics.name,
            url: resumeData.basics.website,
            sameAs: resumeData.basics.socials.map(s => s.url),
            jobTitle: resumeData.basics.title,
            description: description,
            image: `${resumeData.basics.website}/og-image.png`,
          })}
        </script>
        </Helmet>

        <section aria-labelledby="hero-heading" className="max-w-[1200px] mx-auto px-4 md:px-8 pb-32 pt-10">
          <div className="flex flex-col items-start max-w-[960px]">
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <div className="info-chip">
                <BadgeCheck className="text-primary w-[22px] h-[22px]" />
                <span className="text-ios-dark">{resumeData.basics.title.split(' & ')[0]}</span>
              </div>
              <div className="info-chip">
                <MapPin className="text-ios-gray w-[22px] h-[22px]" />
                <span className="text-ios-dark">{`${resumeData.basics.location.city}, ${resumeData.basics.location.country}`}</span>
              </div>
            </div>

            <h1 className="large-title text-ios-dark mb-10" id="hero-heading">
              Data Storyteller &<br/>Analytics Strategist.
            </h1>

            <p className="headline text-ios-gray max-w-[760px] mb-12 font-medium">
              {resumeData.basics.summary}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <Link to="/projects" className="pill-button touch-target w-full sm:w-auto bg-ios-dark text-white text-[17px] hover:translate-y-[-1px] active:scale-95 shadow-lg">
                View Portfolio
              </Link>
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('openChatbot'))}
                className="pill-button touch-target w-full sm:w-auto glass-surface text-ios-dark text-[17px] font-bold hover:bg-white/95 hover:translate-y-[-1px] active:scale-95"
              >
                Talk to Digital Rishabh
              </button>
            </div>
          </div>
        </section>

        <section aria-labelledby="metrics-heading" className="max-w-[1200px] mx-auto px-4 md:px-8 mb-32">
          <h2 className="section-label" id="metrics-heading">Core Competencies & Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Scale', value: yearsExperience, sub: 'Years Experience', icon: <History className="text-3xl text-primary" /> },
              { label: 'Portfolio', value: resumeData.projects.length.toString().padStart(2, '0'), sub: 'Live Projects', icon: <LayoutGrid className="text-3xl text-primary" /> },
              { label: 'Reach', value: resumeData.basics.languages.length.toString().padStart(2, '0'), sub: 'Languages', icon: <Globe className="text-3xl text-primary" /> },
              { label: 'Status', value: resumeData.certifications.length.toString().padStart(2, '0'), sub: 'Certifications', icon: <Award className="text-3xl text-primary" /> }
            ].map((metric, i) => (
               <div key={i} className="metric-widget group hover:translate-y-[-4px]">
                  <div className="flex justify-between items-start">
                    <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      {metric.icon}
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-widest text-ios-gray">{metric.label}</span>
                  </div>
                  <div>
                    <span className="text-6xl font-semibold tracking-tighter text-ios-dark mb-2 block">{metric.value}</span>
                    <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">{metric.sub}</p>
                  </div>
               </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="narrative-heading" className="max-w-[1200px] mx-auto px-4 md:px-8 mb-32">
          <h2 className="section-label" id="narrative-heading">Spatial Narrative</h2>
          <div className="relative ios-sheet overflow-hidden bg-ios-bg-2 aspect-[21/9] border-[0.5px] border-black/10 group">
             <img
               alt="Luxury minimalist workspace with architectural lighting"
               className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmcx4Y4dcAi7p_eC_q0GKpZMTiY2VlFMCDumD7XOarOAT4RhMiWscPAHZ8dcYHDnj3yxsdm65t0WFdq6Lmk4XHykWbhZrRfpLTQCtnQem__L95QHQ6FvC9C0jBPQR_a84dQoVlPzbeBbERTFqBoGTQUIzAU2zuNYfZUc2HZIOiJg_VCCSlqnbp7mV3ZEtLkogYjS-r9981ryohLoTuasdfyKF5a_uIeIiiWaUZE_BeAVDkiElOaRzOP73PxaKrQ00oVP2MIztxgOlt"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
             <div className="absolute bottom-10 left-10">
                <div className="liquid-glass px-8 h-[52px] rounded-2xl flex items-center gap-3 text-ios-dark shadow-xl bg-white/40 backdrop-blur-md border border-white/30">
                   <span className="text-[12px] font-bold tracking-widest uppercase">Studio Environment 01</span>
                </div>
             </div>
          </div>
        </section>
      </>
    );
  }

  // Original Neubrutalism Render
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={description} />
      </Helmet>

      <div className="min-h-[80vh] relative flex flex-col justify-center items-center text-center max-w-5xl mx-auto py-12 px-4">
        {/* Neubrutalism Decorative Shapes */}
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
            className="font-heading font-semibold px-5 py-2 nb-sticker"
            style={{ '--sticker-rotate': '-2deg' }}
          >
            <Sparkles size={18} className="text-black" />
            Available for hire & collaborations
          </ThemedChip>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="block text-[color:var(--color-text-primary)] mb-2 relative">
            Data Storyteller
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
          </span>
          <span
            className="text-[color:var(--color-text-primary)] px-4 py-2 border-nb border-[color:var(--color-border)] inline-block bg-fun-yellow rounded-nb nb-sticker"
            style={{ boxShadow: 'var(--nb-shadow)', '--sticker-rotate': '1deg' }}
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
          <strong className="text-primary font-bold border-b-[3px] border-fun-yellow">
            messy data
          </strong>{' '}
          into
          <strong className="text-primary font-bold border-b-[3px] border-accent mx-1">
            clear strategies
          </strong>{' '}
          and
          <strong className="text-primary font-bold border-b-[3px] border-fun-pink mx-1">
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
            className="group relative nb-shadow-lift nb-color-invert"
            style={{ '--invert-text': 'var(--color-fun-yellow)' }}
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
            className="nb-shadow-lift nb-color-invert"
            style={{ '--invert-text': '#ffffff' }}
            aria-label="Open chat with Digital Rishabh"
          >
            <Bot size={18} className="text-fun-pink" aria-hidden="true" />
            Talk to Digital Rishabh
          </ThemedButton>
        </motion.div>

        {/* Code Snippet Card */}
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
            variant="highlighted"
            className={`p-6 text-left font-mono text-sm transition-all duration-300 nb-sticker ${isGlitching ? 'animate-glitch' : ''}`}
            style={{ '--sticker-rotate': '-1deg' }}
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-black/20">
              <Code2 size={16} />
              <span className="font-heading font-bold">
                {isGlitching ? 'game_mode.js' : 'developer.js'}
              </span>
            </div>
            <pre className="whitespace-pre-wrap">
              {isGlitching ? (
                <>
                  {`const developer = {
  mode: `}
                  <span className="text-fun-pink font-bold">&lsquo;GAMER&rsquo;</span>
                  {`,
  status: `}
                  <span className="text-accent font-bold">&lsquo;Ready Player One&rsquo;</span>
                  {`,
  launching: `}
                  <span className="text-green-600 font-bold">true</span>
                  {`
};`}
                  <span className="nb-blink">█</span>
                </>
              ) : (
                <>
                  {`const developer = {
  name: '${resumeData.basics.name}',
  stack: [`}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleEasterEggClick}
                    onKeyDown={handleEasterEggKeyDown}
                    className="cursor-pointer hover:text-fun-pink hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-fun-pink focus:ring-offset-1"
                    aria-label={`Click ${CLICKS_REQUIRED - clickCount} more time${CLICKS_REQUIRED - clickCount !== 1 ? 's' : ''} for a surprise`}
                  >
                    &lsquo;Python&rsquo;, &lsquo;Tableau&rsquo;, &lsquo;React&rsquo;
                  </span>
                  {`],
  currentStatus: 'Building awesome things.',
  openToWork: true
};`}
                  <span className="nb-blink">█</span>
                </>
              )}
            </pre>
          </ThemedCard>
        </motion.div>
      </div>
    </>
  );
};

export default Hero;
