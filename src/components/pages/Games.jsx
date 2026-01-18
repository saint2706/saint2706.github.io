import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { resumeData } from '../../data/resume';

const sections = [
  {
    title: 'Now Playing',
    description: 'A rotating list of narrative-rich titles and cozy simulations I am currently exploring.',
    items: ['Tactical roguelikes', 'Story-driven indies', 'Strategy management sims']
  },
  {
    title: 'Forever Favorites',
    description: 'Games that keep me coming back for their atmosphere, mechanics, or community.',
    items: ['Pixel-art adventures', 'Co-op party games', 'Exploration-focused RPGs']
  },
  {
    title: 'Design Notes',
    description: 'What I am watching for when I play: pacing, feedback loops, and emotional arcs.',
    items: ['Onboarding clarity', 'Risk vs. reward balance', 'Memorable sound design']
  }
];

const Games = () => {
  const canonicalUrl = `${resumeData.basics.website}/games`;
  const description = 'A snapshot of the games inspiring my creative work and product thinking.';
  const title = `Games | ${resumeData.basics.name}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={description} />
        <meta name="author" content={resumeData.basics.name} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={resumeData.basics.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:site" content={resumeData.basics.name} />
        <meta name="twitter:creator" content={resumeData.basics.name} />
      </Helmet>
      <div className="max-w-6xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-fun-pink">
              Playful Worlds
            </span>
          </h2>
          <p className="text-secondary max-w-2xl mx-auto">
            A curated list of the games, genres, and design ideas that energize my creative process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/50 backdrop-blur border border-slate-700 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-primary mb-3">{section.title}</h3>
              <p className="text-secondary text-sm leading-relaxed mb-6">{section.description}</p>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-secondary text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-primary/90">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Games;
