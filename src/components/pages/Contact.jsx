/**
 * @fileoverview Contact page with email/location information and social links.
 * Features call-to-action and availability status.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, MapPin, Linkedin, Github, Send, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { resumeData } from '../../data/resume';
import { safeJSONStringify } from '../../utils/security';

/**
 * Contact page component
 *
 * Features:
 * - Email and location display with interactive cards
 * - Social media links (GitHub, LinkedIn)
 * - Availability status badge with pulse animation
 * - CTA section with email prompt
 * - Neubrutalist card designs with hover effects
 *
 * @component
 * @returns {JSX.Element} Contact page with information and links
 */
const Contact = () => {
  const shouldReduceMotion = useReducedMotion();

  /** Social media links configuration */
  const socialLinks = [
    {
      icon: <Github size={24} />,
      url: 'https://github.com/saint2706',
      label: 'GitHub',
      color: 'hover:bg-fun-yellow',
    },
    {
      icon: <Linkedin size={24} />,
      url: 'https://www.linkedin.com/in/rishabh-agrawal-1807321b9',
      label: 'LinkedIn',
      color: 'hover:bg-accent',
    },
  ];
  const canonicalUrl = `${resumeData.basics.website}/contact`;
  const description =
    'Get in touch for collaborations, analytics consulting, or data storytelling projects.';
  const title = `Contact | ${resumeData.basics.name}`;

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
                name: 'Contact',
                item: canonicalUrl,
              },
            ],
          })}
        </script>
      </Helmet>

      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="mb-12 text-center"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            <span
              className="inline-block bg-accent text-white px-6 py-3 border-nb border-[color:var(--color-border)] rounded-nb"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              Let&apos;s Connect
            </span>
          </h1>
          <p className="text-secondary text-lg max-w-xl mx-auto mt-6 font-sans">
            Interested in building data-driven solutions that make an impact? Let&apos;s connect!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
            className="space-y-6"
          >
            {/* Get in Touch Card */}
            <div
              className="bg-card border-nb border-[color:var(--color-border)] p-6 rounded-nb"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              <h2
                className="inline-block font-heading text-xl font-bold text-black bg-fun-yellow px-4 py-2 border-nb border-[color:var(--color-border)] mb-6 rounded-nb"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                Get in Touch
              </h2>

              <div className="space-y-4">
                {/* Email */}
                <a
                  href={`mailto:${resumeData.basics.email}`}
                  className="flex items-center gap-4 p-4 bg-secondary border-[3px] border-[color:var(--color-border)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 group motion-reduce:transform-none motion-reduce:transition-none"
                  style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                  aria-label={`Send email to ${resumeData.basics.email}`}
                >
                  <div className="p-3 bg-accent text-white border-2 border-[color:var(--color-border)] group-hover:bg-fun-yellow group-hover:text-black transition-colors">
                    <Mail size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-muted font-heading font-bold uppercase">Email</p>
                    <p className="text-primary font-sans font-medium">{resumeData.basics.email}</p>
                  </div>
                </a>

                {/* Location */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${resumeData.basics.location.city}, ${resumeData.basics.location.country}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-secondary border-[3px] border-[color:var(--color-border)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 group motion-reduce:transform-none motion-reduce:transition-none"
                  style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                  aria-label={`View location ${resumeData.basics.location.city}, ${resumeData.basics.location.country} on Google Maps (opens in new tab)`}
                >
                  <div className="p-3 bg-fun-pink text-white border-2 border-[color:var(--color-border)] group-hover:bg-fun-yellow group-hover:text-black transition-colors">
                    <MapPin size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-muted font-heading font-bold uppercase">Location</p>
                    <p className="text-primary font-sans font-medium">
                      {resumeData.basics.location.city}, {resumeData.basics.location.country}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Follow Me */}
            <div
              className="bg-card border-nb border-[color:var(--color-border)] p-6 rounded-nb"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              <h3
                className="inline-block font-heading text-lg font-bold bg-fun-pink px-4 py-2 border-nb border-[color:var(--color-border)] mb-6 text-white rounded-nb"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                Follow Me
              </h3>
              <div className="flex gap-4">
                {socialLinks.map(social => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative p-4 bg-card border-nb border-[color:var(--color-border)] text-primary transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none rounded-nb ${social.color}`}
                    style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                    aria-label={`${social.label} (opens in new tab)`}
                  >
                    {social.icon}
                    <span
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
                      aria-hidden="true"
                    >
                      {social.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Availability Badge */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}
              className="bg-fun-yellow border-nb border-[color:var(--color-border)] p-4 rounded-nb"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 bg-green-500 border-2 border-[color:var(--color-border)] animate-pulse motion-reduce:animate-none rounded-nb"></span>
                <span className="text-black font-heading font-bold">
                  Available for freelance & collaborations
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3 }}
            className="flex flex-col justify-center"
          >
            <div
              className="bg-card border-nb border-[color:var(--color-border)] p-8 text-center rounded-nb"
              style={{ boxShadow: 'var(--nb-shadow)' }}
            >
              {/* Icon */}
              <div
                className="w-24 h-24 mx-auto mb-6 bg-accent border-nb border-[color:var(--color-border)] flex items-center justify-center rounded-nb"
                style={{ boxShadow: 'var(--nb-shadow)' }}
              >
                <Mail size={40} className="text-white" />
              </div>

              <h3 className="font-heading text-2xl font-bold text-primary mb-4">
                Ready to start a conversation?
              </h3>

              <p className="text-secondary mb-8 font-sans">
                Whether it&apos;s making sense of messy data, designing AI/ML solutions, or bridging
                technical depth with business impact - let&apos;s create something amazing together!
              </p>

              <a
                href={`mailto:${resumeData.basics.email}?subject=Hello from your portfolio!`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-fun-yellow text-black font-heading font-bold border-nb border-[color:var(--color-border)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none rounded-nb"
                style={{ boxShadow: 'var(--nb-shadow)' }}
              >
                <Send size={20} />
                Send me an Email
              </a>

              <div
                className="mt-8 p-4 bg-secondary border-[3px] border-[color:var(--color-border)]"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                <p className="text-muted text-sm font-sans flex items-center justify-center gap-2">
                  <Sparkles size={16} className="text-fun-yellow" />
                  Or use the chatbot (Ctrl+K) to learn more about me first!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Contact;
