/**
 * Chatbot Component Module
 *
 * Provides a floating action button (FAB) that expands to reveal chat and roast options.
 * This component implements lazy loading for optimal performance, only loading the chat
 * and roast interfaces when needed. It also manages focus and accessibility for modals.
 *
 * Features:
 * - Expandable FAB with hover and focus interactions
 * - Lazy-loaded chat and roast interfaces with suspense fallbacks
 * - Programmatic open/close via explicit custom events
 * - Focus management and restoration when dialogs open/close
 * - Click-outside detection to close the FAB
 * - Custom event listeners for programmatic control
 * - ARIA attributes for screen reader accessibility
 *
 * @module components/shared/Chatbot
 */

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bot, MessageCircle, Flame } from 'lucide-react';
import { useTheme } from './theme-context';
import { getOverlayShell, joinClasses } from './ThemedPrimitives.utils';

// Lazy load chat and roast interfaces for code-splitting and performance
const ChatInterface = lazy(() => import('./ChatInterface'));
const RoastInterface = lazy(() => import('./RoastInterface'));

/**
 * Loading fallback component shown during Suspense lazy loading.
 * Displays a skeleton UI with loading animation while the chat/roast interface loads.
 *
 * @component
 * @param {object} props
 * @param {'chat'|'roast'} props.type - Type of dialog being loaded (affects styling)
 * @returns {JSX.Element} Loading skeleton with appropriate styling
 */
const LoadingDialog = ({ type }) => {
  const prefersReducedMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const isChat = type === 'chat';
  const shell = getOverlayShell({
    theme,
    depth: 'hover',
    tone: isChat ? 'card' : 'pink',
  });

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 w-auto ${isChat ? 'md:w-[420px]' : 'md:w-[380px]'} overflow-hidden ${shell.className}`}
      style={shell.style}
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={isChat ? 'Loading chat...' : 'Loading roast...'}
    >
      <div
        className={joinClasses(
          'p-4 flex items-center gap-3',
          isLiquid
            ? 'bg-[color:var(--surface-muted)] border-b border-[color:var(--border-soft)]'
            : `${isChat ? 'bg-accent' : 'bg-fun-pink'} border-b-nb border-[color:var(--color-border)]`
        )}
      >
        <div
          className={joinClasses(
            'p-2',
            isLiquid
              ? 'liquid-chip border border-[color:var(--border-soft)] rounded-full'
              : 'bg-white border-2 border-[color:var(--color-border)] rounded-nb'
          )}
        >
          {isChat ? (
            <Bot size={20} className="text-black" />
          ) : (
            <Flame size={20} className="text-fun-pink" />
          )}
        </div>
        <h3 className="font-heading font-bold text-white">
          {isChat ? 'Loading chat...' : 'Loading roast...'}
        </h3>
      </div>
      <div className={isLiquid ? 'p-6 bg-[color:var(--surface)]' : 'p-6 bg-white'}>
        <div className="animate-pulse motion-reduce:animate-none space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Chatbot component with expandable floating action button (FAB).
 *
 * This component provides a persistent UI element for accessing the chatbot and resume roast
 * features. It uses lazy loading to defer loading of the chat and roast interfaces until needed,
 * improving initial page load performance.
 *
 * The component manages three states:
 * 1. FAB closed - showing just the main button
 * 2. FAB open - showing the main button plus chat and roast options
 * 3. Dialog open - showing the full chat or roast interface
 *
 * Keyboard Integration:
 * - This component does not own global keyboard shortcuts
 * - It reacts to explicit custom events dispatched by higher-level shells
 * - Events: 'openChatbot', 'closeChatbot'
 *
 * Accessibility:
 * - Focus is trapped within open dialogs
 * - Focus is restored to the previously focused element when closing
 * - Main content is marked as aria-hidden when dialogs are open
 * - Proper ARIA labels and roles throughout
 *
 * @component
 * @returns {JSX.Element} The chatbot FAB and lazy-loaded interfaces
 */
const Chatbot = () => {
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  // FAB (Floating Action Button) expansion state
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Chat interface visibility state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Roast interface visibility and content state
  const [isRoastOpen, setIsRoastOpen] = useState(false);
  const [roastContent, setRoastContent] = useState(null);

  // Refs for DOM access and focus management
  const fabRef = useRef(null);
  const lastFocusedRef = useRef(null); // Stores element to restore focus to on close
  const prefersReducedMotion = useReducedMotion();

  /**
   * Close FAB when clicking outside of it.
   * Only closes if no dialog is currently open (chat or roast).
   */
  useEffect(() => {
    const handleClickOutside = e => {
      if (fabRef.current && !fabRef.current.contains(e.target) && !isChatOpen && !isRoastOpen) {
        setIsFabOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isChatOpen, isRoastOpen]);

  /**
   * Listen for custom events for programmatic control of the chatbot.
   * This allows other parts of the application to trigger the chatbot.
   * Events: 'openChatbot', 'closeChatbot'
   */
  useEffect(() => {
    const handleOpenChatbot = () => {
      lastFocusedRef.current = document.activeElement;
      setIsChatOpen(true);
      setIsRoastOpen(false);
      setIsFabOpen(false);
    };
    const handleCloseChatbot = () => {
      setIsChatOpen(false);
      setIsRoastOpen(false);
      setIsFabOpen(false);
    };

    document.addEventListener('openChatbot', handleOpenChatbot);
    document.addEventListener('closeChatbot', handleCloseChatbot);
    return () => {
      document.removeEventListener('openChatbot', handleOpenChatbot);
      document.removeEventListener('closeChatbot', handleCloseChatbot);
    };
  }, []);

  /**
   * Opens the chat interface and closes other dialogs.
   * Stores the currently focused element for restoration later.
   */
  const openChat = () => {
    lastFocusedRef.current = document.activeElement;
    setIsChatOpen(true);
    setIsRoastOpen(false);
    setIsFabOpen(false);
  };

  /**
   * Opens the roast interface and closes other dialogs.
   * Stores the currently focused element for restoration later.
   */
  const openRoast = () => {
    lastFocusedRef.current = document.activeElement;
    setIsRoastOpen(true);
    setIsChatOpen(false);
    setIsFabOpen(false);
  };

  // Track whether any dialog is currently open
  const anyDialogOpen = isChatOpen || isRoastOpen;
  const mainFabShell = getOverlayShell({ theme, tone: 'yellow' });
  const roastFabShell = getOverlayShell({ theme, tone: 'pink' });
  const chatFabShell = getOverlayShell({ theme, tone: 'accent' });

  /**
   * Manage accessibility when dialogs open/close.
   *
   * When a dialog opens:
   * - Store the currently focused element
   * - Mark main content as aria-hidden to hide it from screen readers
   *
   * When all dialogs close:
   * - Remove aria-hidden from main content
   * - Restore focus to the previously focused element
   *
   * This ensures proper screen reader experience and keyboard navigation.
   */
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (anyDialogOpen) {
      // Dialog is opening
      if (!lastFocusedRef.current) {
        lastFocusedRef.current = document.activeElement;
      }
      // Hide main content from screen readers while dialog is open
      if (main) main.setAttribute('aria-hidden', 'true');
    } else {
      // All dialogs are closed
      if (main) main.removeAttribute('aria-hidden');
      // Restore focus to element that was focused before dialog opened
      lastFocusedRef.current?.focus?.();
      lastFocusedRef.current = null;
    }
  }, [anyDialogOpen, isChatOpen, isRoastOpen]);

  return (
    <>
      {/* Expandable FAB */}
      <div
        ref={fabRef}
        className={`fixed bottom-6 right-6 z-40 ${anyDialogOpen ? 'hidden' : 'block'}`}
        onMouseEnter={() => setIsFabOpen(true)}
        onMouseLeave={() => setIsFabOpen(false)}
        onFocusCapture={() => setIsFabOpen(true)}
        onBlurCapture={e => {
          if (!fabRef.current?.contains(e.relatedTarget)) {
            setIsFabOpen(false);
          }
        }}
      >
        <div className="relative flex flex-col-reverse items-end gap-3">
          {/* Main FAB Button */}
          <button
            className={joinClasses(
              'p-4 cursor-pointer transition-transform motion-reduce:transform-none motion-reduce:transition-none',
              isLiquid
                ? 'liquid-chip liquid-interactive-surface border border-[color:var(--border-soft)] rounded-full hover:brightness-110 hover:scale-[1.01]'
                : `hover:-translate-x-0.5 hover:-translate-y-0.5 ${mainFabShell.className}`
            )}
            style={mainFabShell.style}
            aria-label="Open chat options"
            aria-haspopup="menu"
            aria-expanded={isFabOpen}
            onClick={() => setIsFabOpen(prev => !prev)}
          >
            <MessageCircle size={28} />
          </button>

          {/* Expandable Options */}
          <AnimatePresence>
            {isFabOpen && (
              <>
                {/* Roast Button */}
                <motion.button
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.8 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, delay: 0 }}
                  onClick={openRoast}
                  className={joinClasses(
                    'p-3 cursor-pointer transition-transform flex items-center gap-2 motion-reduce:transform-none motion-reduce:transition-none',
                    isLiquid
                      ? 'liquid-chip liquid-interactive-surface border border-[color:var(--border-soft)] rounded-full hover:brightness-110 hover:scale-[1.01]'
                      : `hover:-translate-x-0.5 hover:-translate-y-0.5 ${roastFabShell.className}`
                  )}
                  style={roastFabShell.style}
                  aria-label="Roast my resume"
                >
                  <Flame size={20} />
                  <span className="text-sm font-heading font-bold hidden sm:inline">Roast</span>
                </motion.button>

                {/* Chat Button */}
                <motion.button
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.8 }}
                  transition={
                    prefersReducedMotion ? { duration: 0 } : { duration: 0.15, delay: 0.05 }
                  }
                  onClick={openChat}
                  className={joinClasses(
                    'p-3 cursor-pointer transition-transform flex items-center gap-2 motion-reduce:transform-none motion-reduce:transition-none',
                    isLiquid
                      ? 'liquid-chip liquid-interactive-surface border border-[color:var(--border-soft)] rounded-full hover:brightness-110 hover:scale-[1.01]'
                      : `hover:-translate-x-0.5 hover:-translate-y-0.5 ${chatFabShell.className}`
                  )}
                  style={chatFabShell.style}
                  aria-label="Chat with Digital Rishabh"
                >
                  <Bot size={20} />
                  <span className="text-sm font-heading font-bold hidden sm:inline">Chat</span>
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <Suspense fallback={<LoadingDialog type="chat" />}>
            <ChatInterface key="chat-interface" onClose={() => setIsChatOpen(false)} />
          </Suspense>
        )}
        {isRoastOpen && (
          <Suspense fallback={<LoadingDialog type="roast" />}>
            <RoastInterface
              key="roast-interface"
              onClose={() => setIsRoastOpen(false)}
              roastContent={roastContent}
              onRoastComplete={setRoastContent}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
