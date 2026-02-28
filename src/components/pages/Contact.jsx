/**
 * @fileoverview Contact page with email/location information and social links.
 * Features call-to-action and availability status.
 */

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, MapPin, Linkedin, Github, Send, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { resumeData } from '../../data/resume';
import SEOHead from '../shared/SEOHead';
import { breadcrumbSchema, contactPageSchema, SITE_URL } from '../../utils/seo';
import { sanitizeInput } from '../../utils/security';
import ThemedCard from '../shared/ThemedCard';
import ThemedButton from '../shared/ThemedButton';
import ThemedSectionHeading from '../shared/ThemedSectionHeading';
import { useTheme } from '../shared/theme-context';
import { useSafeTimeout } from '../shared/useSafeTimeout';

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
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { setSafeTimeout, clearAll } = useSafeTimeout();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsSubmitting(true);

    // Sanitize inputs to prevent control character injection or bidi spoofing
    const safeName = sanitizeInput(formData.name || 'Portfolio');
    const safeMessage = sanitizeInput(formData.message || '');
    const safeEmail = sanitizeInput(formData.email || '');

    // Generate mailto URL with form data
    const mailtoUrl = `mailto:${resumeData.basics.email}?subject=${encodeURIComponent(
      `Contact from ${safeName}`
    )}&body=${encodeURIComponent(`${safeMessage}\n\nFrom: ${safeName} (${safeEmail})`)}`;

    // Simulate network delay for better UX before opening email client
    clearAll();

    setSafeTimeout(() => {
      window.location.href = mailtoUrl;
      setIsSubmitting(false);
      setSuccess(true);
      setSafeTimeout(() => setSuccess(false), 5000); // Reset after 5s
    }, 1500);
  };

  const description =
    'Get in touch for collaborations, analytics consulting, or data storytelling projects.';
  const title = `Contact | ${resumeData.basics.name}`;
  const contactSchemas = [
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Contact', url: `${SITE_URL}/contact` },
    ]),
    contactPageSchema(),
  ];
  return (
    <>
      <SEOHead title={title} description={description} path="/contact" schemas={contactSchemas} />

      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="mb-12 text-center"
        >
          <ThemedSectionHeading
            as="h1"
            title="Let's Connect"
            variant="accent"
            className="font-heading text-4xl md:text-5xl font-bold mb-4"
            chipClassName={isLiquid ? 'px-6 py-3' : 'px-6 py-3 nb-stamp-in'}
          />
          <p className="text-secondary text-lg max-w-xl mx-auto mt-6 font-sans">
            Interested in building data-driven solutions that make an impact? Let&apos;s connect!
          </p>
        </motion.div>

        {isLiquid ? (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.15 }}
            className="max-w-2xl mx-auto"
          >
            <ThemedCard className="p-8 md:p-10 rounded-3xl">
              <h2 className="font-heading text-2xl font-bold text-primary mb-2">Send a message</h2>
              <p className="text-secondary liquid-helper-text mb-6 font-sans">
                Tell me what you&apos;re building and I&apos;ll get back via{' '}
                {resumeData.basics.email}.
              </p>

              {success ? (
                <div className="bg-green-100 border border-green-300 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-300">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-2" />
                  <h3 className="text-lg font-bold text-green-800">Draft Opened!</h3>
                  <p className="text-green-700">
                    Please check your email client to send the message.
                  </p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit} aria-busy={isSubmitting}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    aria-label="Your name"
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                    className="w-full lg-surface-2 rounded-2xl px-4 py-3 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    aria-label="Your email"
                    required
                    maxLength={320}
                    disabled={isSubmitting}
                    className="w-full lg-surface-2 rounded-2xl px-4 py-3 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  />
                  <textarea
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Project details"
                    aria-label="Project details"
                    required
                    maxLength={2000}
                    disabled={isSubmitting}
                    className="w-full lg-surface-2 rounded-2xl px-4 py-3 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-y disabled:opacity-50"
                  />

                  <ThemedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full justify-center shadow-[0_0_30px_rgba(141,162,255,0.28)]"
                  >
                    {!isSubmitting ? (
                      <Send size={20} />
                    ) : (
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    )}
                    {isSubmitting ? 'Opening...' : 'Send via Email'}
                  </ThemedButton>
                </form>
              )}

              <div className="mt-6 pt-5 border-t border-[color:var(--border-soft)] flex flex-wrap items-center justify-between gap-3 text-sm text-secondary">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} />
                  {resumeData.basics.location.city}, {resumeData.basics.location.country}
                </span>
                <div className="flex items-center gap-2">
                  {resumeData.basics.socials.map(social => (
                    <ThemedButton
                      as="a"
                      key={social.network}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                      className="p-2.5"
                      aria-label={`${social.network} (opens in new tab)`}
                    >
                      {social.network === 'GitHub' ? <Github size={20} /> : <Linkedin size={20} />}
                    </ThemedButton>
                  ))}
                </div>
              </div>
            </ThemedCard>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
              className="space-y-6"
            >
              {/* Get in Touch Card */}
              <ThemedCard className="p-6">
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
                      <p className="text-primary font-sans font-medium">
                        {resumeData.basics.email}
                      </p>
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
                      <p className="text-sm text-muted font-heading font-bold uppercase">
                        Location
                      </p>
                      <p className="text-primary font-sans font-medium">
                        {resumeData.basics.location.city}, {resumeData.basics.location.country}
                      </p>
                    </div>
                  </a>
                </div>
              </ThemedCard>

              {/* Follow Me */}
              <ThemedCard className="p-6">
                <h3
                  className="inline-block font-heading text-lg font-bold bg-fun-pink px-4 py-2 border-nb border-[color:var(--color-border)] mb-6 text-white rounded-nb"
                  style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                >
                  Follow Me
                </h3>
                <div className="flex gap-4">
                  {resumeData.basics.socials.map(social => (
                    <ThemedButton
                      as="a"
                      key={social.network}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                      className={`group relative p-4 ${social.network === 'GitHub' ? 'hover:bg-fun-yellow' : 'hover:bg-accent'}`}
                      aria-label={`${social.network} (opens in new tab)`}
                    >
                      {social.network === 'GitHub' ? <Github size={24} /> : <Linkedin size={24} />}
                      <span
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
                        aria-hidden="true"
                      >
                        {social.network}
                      </span>
                    </ThemedButton>
                  ))}
                </div>
              </ThemedCard>

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
              <ThemedCard className="p-8 text-center">
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
                  Whether it&apos;s making sense of messy data, designing AI/ML solutions, or
                  bridging technical depth with business impact - let&apos;s create something
                  amazing together!
                </p>

                <ThemedButton
                  as="a"
                  href={`mailto:${resumeData.basics.email}?subject=Hello from your portfolio!`}
                  variant="primary"
                  size="lg"
                >
                  <Send size={20} />
                  Send me an Email
                </ThemedButton>

                <div
                  className="mt-8 p-4 bg-secondary border-[3px] border-[color:var(--color-border)]"
                  style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                >
                  <p className="text-muted text-sm font-sans flex items-center justify-center gap-2">
                    <Sparkles size={16} className="text-fun-yellow" />
                    Or use the chatbot (Ctrl+K) to learn more about me first!
                  </p>
                </div>
              </ThemedCard>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default Contact;
