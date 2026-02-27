/**
 * @fileoverview Code playground page showcasing Python one-liners and CSS snippets.
 * Features live previews, code copying, and interactive Python execution.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Code2, Palette, Copy, Check, Play, Terminal } from 'lucide-react';
import { resumeData } from '../../data/resume';
import SEOHead from '../shared/SEOHead';
import { breadcrumbSchema, playgroundSchema, SITE_URL } from '../../utils/seo';
import { getSnippetsByLanguage } from '../../data/snippets';
import { loadPyodide } from '../shared/pyodideLoader';
import PythonRunner from '../shared/PythonRunner';
import SyntaxHighlighter from '../shared/SyntaxHighlighter';
import Modal from '../shared/Modal';
import ThemedButton from '../shared/ThemedButton';
import ThemedCard from '../shared/ThemedCard';
import ThemedChip from '../shared/ThemedChip';
import { useTheme } from '../shared/theme-context';

/**
 * Playground page for code snippets and interactive demos
 *
 * Features:
 * - Filter by language (Python, CSS, All)
 * - Copy code to clipboard with visual feedback
 * - Live CSS preview in modal
 * - Interactive Python code runner
 * - Syntax highlighting for all snippets
 * - Tag-based categorization
 *
 * @component
 * @returns {JSX.Element} Playground page with filterable code snippets
 */
const Playground = () => {
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [modalSnippet, setModalSnippet] = useState(null);
  const [modalType, setModalType] = useState(null); // 'preview' or 'runner'
  const shouldReduceMotion = useReducedMotion();

  const description =
    'Explore powerful Python one-liners and creative CSS snippets. Copy, learn, and experiment with advanced code techniques.';
  const title = `Code Playground | ${resumeData.basics.name}`;
  const playgroundSchemas = [
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Playground', url: `${SITE_URL}/playground` },
    ]),
    playgroundSchema(),
  ];

  const filteredSnippets = getSnippetsByLanguage(activeFilter);

  /** Filter tabs configuration */
  const filters = [
    { id: 'all', label: 'All', icon: Code2, color: 'bg-fun-yellow' },
    { id: 'python', label: 'Python', icon: Terminal, color: 'bg-accent' },
    { id: 'css', label: 'CSS', icon: Palette, color: 'bg-fun-pink' },
  ];

  /** Color classes for snippet card accent bars */
  const cardColors = ['bg-fun-yellow', 'bg-accent', 'bg-fun-pink'];

  /**
   * Copy code to clipboard and show visual feedback
   * @param {string} code - Code string to copy
   * @param {string} id - Snippet ID for tracking copied state
   */
  const handleCopy = useCallback(async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  /** Open CSS live preview modal */
  const openPreviewModal = useCallback(snippet => {
    setModalSnippet(snippet);
    setModalType('preview');
  }, []);

  /** Open Python runner modal */
  const openRunnerModal = useCallback(snippet => {
    setModalSnippet(snippet);
    setModalType('runner');
  }, []);

  /** Close modal */
  const closeModal = useCallback(() => {
    setModalSnippet(null);
    setModalType(null);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        duration: shouldReduceMotion ? 0 : undefined,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion ? { duration: 0 } : undefined,
    },
  };

  const themeClass = (neubClass, liquidClass) => (isLiquid ? liquidClass : neubClass);

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        path="/playground"
        schemas={playgroundSchemas}
      />

      <div
        className={themeClass(
          'max-w-6xl mx-auto py-12 px-4',
          'max-w-6xl mx-auto py-12 px-4 text-[color:var(--text-primary)]'
        )}
      >
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className="mb-12 text-center"
        >
          <h1
            className={themeClass(
              'font-heading text-4xl md:text-5xl font-bold mb-4',
              'font-heading text-4xl md:text-5xl font-semibold mb-4'
            )}
          >
            <ThemedCard
              as="span"
              variant={isLiquid ? 'default' : 'highlighted'}
              className={themeClass(
                'inline-block bg-accent text-white px-6 py-3 rounded-nb nb-stamp-in',
                'inline-block px-8 py-4 rounded-3xl lg-surface-2'
              )}
              style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
            >
              Code Playground
            </ThemedCard>
          </h1>
          <p className="text-secondary max-w-2xl mx-auto mt-6 font-sans">
            Powerful Python one-liners and creative CSS snippets. Copy, learn, and make them your
            own.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div
            className={themeClass('flex gap-3', 'flex gap-3 rounded-3xl lg-surface-2 p-2')}
            role="tablist"
            aria-label="Filter snippets by language"
          >
            {filters.map(filter => (
              <ThemedButton
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                role="tab"
                aria-selected={activeFilter === filter.id}
                aria-controls="snippets-grid"
                variant="secondary"
                className={`flex items-center gap-2 px-5 py-2.5 font-heading font-bold text-sm rounded-nb
                  ${
                    activeFilter === filter.id
                      ? themeClass(
                          `${filter.color} text-white -translate-x-0.5 -translate-y-0.5`,
                          'lg-surface-3 lg-pill rounded-full text-[color:var(--text-primary)] brightness-110 scale-[1.015]'
                        )
                      : themeClass(
                          'bg-card text-primary hover:-translate-x-0.5 hover:-translate-y-0.5',
                          'lg-surface-2 rounded-full text-[color:var(--text-secondary)] hover:brightness-110 hover:scale-[1.015]'
                        )
                  }`}
                style={{
                  boxShadow:
                    !isLiquid && activeFilter === filter.id
                      ? 'var(--nb-shadow-hover)'
                      : !isLiquid
                        ? 'var(--nb-shadow)'
                        : undefined,
                }}
              >
                <filter.icon size={16} aria-hidden="true" />
                <span>{filter.label}</span>
                {activeFilter === filter.id && (
                  <span
                    className={themeClass(
                      'bg-white/20 px-2 py-0.5 rounded text-xs',
                      'px-2 py-0.5 rounded-full text-xs bg-[color:var(--surface-muted)] text-[color:var(--text-primary)] border border-[color:var(--border-soft)]'
                    )}
                  >
                    {filteredSnippets.length}
                  </span>
                )}
              </ThemedButton>
            ))}
          </div>
        </motion.div>

        {/* Screen reader summary */}
        <div className="sr-only" aria-live="polite">
          {`Showing ${filteredSnippets.length} ${activeFilter === 'all' ? '' : activeFilter} snippets`}
        </div>

        {/* Snippets Grid */}
        <motion.div
          id="snippets-grid"
          role="tabpanel"
          variants={container}
          initial={shouldReduceMotion ? false : 'hidden'}
          animate="show"
          key={activeFilter}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSnippets.map((snippet, idx) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                colorClass={cardColors[idx % cardColors.length]}
                variants={item}
                copiedId={copiedId}
                onCopy={handleCopy}
                onOpenPreview={() => openPreviewModal(snippet)}
                onOpenRunner={() => openRunnerModal(snippet)}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Footer hint */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.5 }}
          className={themeClass('flex justify-center mt-12', 'flex justify-center mt-14')}
        >
          <ThemedCard
            className={themeClass(
              'bg-secondary border-nb border-[color:var(--color-border)] px-6 py-3 rounded-nb',
              'lg-surface-2 px-7 py-4 rounded-3xl max-w-2xl'
            )}
            style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
          >
            <p className="text-secondary text-sm md:text-xs font-sans text-center leading-relaxed">
              💡 Click the copy button to grab any snippet. Some snippets have live output previews!
            </p>
          </ThemedCard>
        </motion.div>
      </div>

      {/* Modal for CSS Preview */}
      <Modal
        isOpen={!!modalSnippet && modalType === 'preview'}
        onClose={closeModal}
        title={modalSnippet?.title || 'Live Preview'}
      >
        {modalSnippet?.preview && <LivePreview preview={modalSnippet.preview} />}
      </Modal>

      {/* Modal for Python Runner */}
      <Modal
        isOpen={!!modalSnippet && modalType === 'runner'}
        onClose={closeModal}
        title={modalSnippet?.title || 'Python Runner'}
      >
        {modalSnippet?.interactive && (
          <PythonRunner snippet={modalSnippet} shouldReduceMotion={shouldReduceMotion} />
        )}
      </Modal>
    </>
  );
};

/**
 * Individual snippet card component
 *
 * @component
 * @param {Object} props
 * @param {Object} props.snippet - Snippet data object
 * @param {string} props.colorClass - Tailwind color class for accent bar
 * @param {Object} props.variants - Framer Motion variants for animation
 * @param {string|null} props.copiedId - ID of currently copied snippet
 * @param {Function} props.onCopy - Callback to copy code
 * @param {Function} props.onOpenPreview - Callback to open preview modal
 * @param {Function} props.onOpenRunner - Callback to open runner modal
 * @param {boolean} props.shouldReduceMotion - Whether to reduce motion
 * @returns {JSX.Element} Snippet card with code and actions
 */
const SnippetCard = ({
  snippet,
  colorClass,
  variants,
  copiedId,
  onCopy,
  onOpenPreview,
  onOpenRunner,
  shouldReduceMotion,
}) => {
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const hasPreview = !!snippet.preview;
  const hasInteractive = !!snippet.interactive;
  const isCopied = copiedId === snippet.id;
  const themeClass = (neubClass, liquidClass) => (isLiquid ? liquidClass : neubClass);

  return (
    <motion.article
      variants={variants}
      layout={!shouldReduceMotion}
      className={themeClass(
        'bg-card border-nb border-[color:var(--color-border)] overflow-hidden flex flex-col rounded-nb',
        'lg-surface-2 overflow-hidden flex flex-col rounded-3xl'
      )}
      style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
    >
      <div className={`h-3 ${colorClass}`} />

      <div className="p-5 flex-grow flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {snippet.language === 'python' ? (
              <Terminal size={18} className="text-accent" aria-hidden="true" />
            ) : (
              <Palette size={18} className="text-fun-pink" aria-hidden="true" />
            )}
            <h3 className="text-lg font-heading font-bold text-[color:var(--text-primary)]">
              {snippet.title}
            </h3>
          </div>
          <ThemedChip
            variant={snippet.language === 'python' ? 'accent' : 'pink'}
            className={themeClass(
              'text-xs font-bold px-2 py-1 rounded-nb nb-sticker text-white',
              'text-xs font-semibold px-2.5 py-1 rounded-full'
            )}
            style={isLiquid ? undefined : { '--sticker-rotate': '3deg' }}
          >
            {snippet.language.toUpperCase()}
          </ThemedChip>
        </div>

        {/* Description */}
        <p className="text-secondary text-sm mb-4 font-sans leading-relaxed">
          {snippet.description}
        </p>

        {/* Code Block */}
        <div className="relative mb-4 flex-grow nb-scrollbar overflow-auto max-h-64">
          <SyntaxHighlighter code={snippet.code} language={snippet.language} />

          {/* Copy Button */}
          <button
            onClick={() => onCopy(snippet.code, snippet.id)}
            className={`group absolute top-2 right-2 p-2 rounded-md border-2 border-[color:var(--color-border)] transition-all ${
              isCopied ? 'bg-green-500 text-white' : 'bg-card text-primary hover:bg-fun-yellow'
            }`}
            aria-label={isCopied ? 'Copied!' : `Copy ${snippet.title} code`}
          >
            {isCopied ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            <span
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
              aria-hidden="true"
            >
              {isCopied ? 'Copied!' : 'Copy code'}
            </span>
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {snippet.tags.map(tag => (
            <ThemedChip
              key={tag}
              variant="neutral"
              className={themeClass(
                'text-xs font-bold font-heading px-2.5 py-1 rounded-nb',
                'text-xs font-semibold px-2.5 py-1 rounded-full'
              )}
            >
              {tag}
            </ThemedChip>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          {/* Live Preview Button (CSS) */}
          {hasPreview && (
            <ThemedButton
              onClick={onOpenPreview}
              variant="secondary"
              className={themeClass(
                'flex items-center gap-2 flex-1 justify-center px-4 py-2 font-heading font-bold text-sm rounded-nb bg-fun-pink text-white hover:-translate-x-0.5 hover:-translate-y-0.5',
                'flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-full lg-surface-3 lg-pill text-[color:var(--text-primary)] focus-visible:ring-[color:var(--accent-soft)] focus-visible:ring-offset-0'
              )}
              style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
            >
              <Play size={14} aria-hidden="true" />
              Live Preview
            </ThemedButton>
          )}

          {/* Python Runner Button */}
          {hasInteractive && snippet.interactive.type === 'python-runner' && (
            <ThemedButton
              onClick={onOpenRunner}
              onMouseEnter={() => loadPyodide().catch(() => {})}
              onFocus={() => loadPyodide().catch(() => {})}
              variant="secondary"
              className={themeClass(
                'flex items-center gap-2 flex-1 justify-center px-4 py-2 font-heading font-bold text-sm rounded-nb bg-accent text-white hover:-translate-x-0.5 hover:-translate-y-0.5',
                'flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-full liquid-button-primary border border-[color:var(--border-soft)] text-[color:var(--text-primary)] focus-visible:ring-[color:var(--accent-soft)] focus-visible:ring-offset-0'
              )}
              style={isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' }}
            >
              <Play size={14} aria-hidden="true" />
              Try It Live! 🐍
            </ThemedButton>
          )}
        </div>
      </div>
    </motion.article>
  );
};

/**
 * Live CSS preview component using iframe for isolation
 *
 * @component
 * @param {Object} props
 * @param {Object} props.preview - Preview configuration with html and css
 * @returns {JSX.Element} Isolated CSS preview in iframe
 */
const LivePreview = ({ preview }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100%; 
                padding: 20px;
                background: #f5f5f5;
                font-family: system-ui, -apple-system, sans-serif;
              }
              ${preview.css}
            </style>
          </head>
          <body>
            ${preview.html}
          </body>
        </html>
      `);
      doc.close();
    }
  }, [preview]);

  return (
    <div className="border-2 border-[color:var(--color-border)] rounded-lg overflow-hidden bg-gray-100">
      <div className="bg-gray-200 px-3 py-1.5 border-b-2 border-[color:var(--color-border)] flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-gray-600 font-mono ml-2">Live Preview</span>
      </div>
      <iframe
        ref={iframeRef}
        title="CSS Preview"
        className="w-full h-48 bg-white"
        sandbox="allow-same-origin"
      />
    </div>
  );
};

export default Playground;
