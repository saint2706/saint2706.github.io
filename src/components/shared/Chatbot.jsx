import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bot, X, Send, Flame, RefreshCw, MessageCircle } from 'lucide-react';
import { chatWithGemini, roastResume } from '../../services/ai';
import ReactMarkdown from 'react-markdown';
import { ChatSkeleton } from './SkeletonLoader';

const STORAGE_KEY = 'portfolio_chat_history';
const DEFAULT_MESSAGE = { role: 'model', text: "Hi! I'm Digital Rishabh. Ask me about my projects, skills, or experience!" };

// Security: Custom renderer for links
const LinkRenderer = ({ href, children, ...rest }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline font-bold"
      {...rest}
    >
      {children}
    </a>
  );
};

const Chatbot = () => {
  // FAB state
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([DEFAULT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Roast state
  const [isRoastOpen, setIsRoastOpen] = useState(false);
  const [roast, setRoast] = useState(null);
  const [roastLoading, setRoastLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fabRef = useRef(null);
  const chatDialogRef = useRef(null);
  const roastDialogRef = useRef(null);
  const roastCloseRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const titleId = 'chatbot-title';
  const dialogId = 'chatbot-dialog';
  const prefersReducedMotion = useReducedMotion();

  // Load chat history
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (isRoastOpen && roastCloseRef.current) {
      setTimeout(() => roastCloseRef.current?.focus(), 100);
    }
  }, [isChatOpen, isRoastOpen]);

  // Close FAB when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fabRef.current && !fabRef.current.contains(e.target) && !isChatOpen && !isRoastOpen) {
        setIsFabOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isChatOpen, isRoastOpen]);

  // Listen for events
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsChatOpen(true);
      setIsRoastOpen(false);
    };
    const handleCloseChatbot = () => setIsChatOpen(false);

    document.addEventListener('openChatbot', handleOpenChatbot);
    document.addEventListener('closeChatbot', handleCloseChatbot);
    return () => {
      document.removeEventListener('openChatbot', handleOpenChatbot);
      document.removeEventListener('closeChatbot', handleCloseChatbot);
    };
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsChatOpen(prev => !prev);
        setIsRoastOpen(false);
      }
      if (e.key === 'Escape') {
        setIsChatOpen(false);
        setIsRoastOpen(false);
        setIsFabOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const MAX_HISTORY_CONTEXT = 30;
    const history = messages.slice(-MAX_HISTORY_CONTEXT).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithGemini(userMsg.text, history);
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsTyping(false);
  };

  const clearHistory = useCallback(() => {
    setMessages([DEFAULT_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleRoast = async () => {
    setRoastLoading(true);
    const text = await roastResume();
    setRoast(text);
    setRoastLoading(false);
  };

  const openChat = () => {
    lastFocusedRef.current = document.activeElement;
    setIsChatOpen(true);
    setIsRoastOpen(false);
    setIsFabOpen(false);
  };

  const openRoast = () => {
    lastFocusedRef.current = document.activeElement;
    setIsRoastOpen(true);
    setIsChatOpen(false);
    setIsFabOpen(false);
    if (!roast) handleRoast();
  };

  const anyDialogOpen = isChatOpen || isRoastOpen;

  // Manage background inertness and focus return
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (anyDialogOpen) {
      if (!lastFocusedRef.current) {
        lastFocusedRef.current = document.activeElement;
      }
      if (main) main.setAttribute('aria-hidden', 'true');
    } else {
      if (main) main.removeAttribute('aria-hidden');
      lastFocusedRef.current?.focus?.();
      lastFocusedRef.current = null;
    }
  }, [anyDialogOpen]);

  // Focus trap and Escape handling for dialogs
  useEffect(() => {
    const focusSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event) => {
      if (!anyDialogOpen) return;
      const container = isChatOpen ? chatDialogRef.current : roastDialogRef.current;
      if (!container) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsChatOpen(false);
        setIsRoastOpen(false);
        setIsFabOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = container.querySelectorAll(focusSelectors);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [anyDialogOpen, isChatOpen]);

  return (
    <>
      {/* Expandable FAB */}
      <div
        ref={fabRef}
        className={`fixed bottom-6 right-6 z-40 ${anyDialogOpen ? 'hidden' : 'block'}`}
        onMouseEnter={() => setIsFabOpen(true)}
        onMouseLeave={() => setIsFabOpen(false)}
        onFocusCapture={() => setIsFabOpen(true)}
        onBlurCapture={(e) => {
          if (!fabRef.current?.contains(e.relatedTarget)) {
            setIsFabOpen(false);
          }
        }}
      >
        <div className="relative flex flex-col-reverse items-end gap-3">
          {/* Main FAB Button */}
          <button
            className="p-4 bg-fun-yellow text-black border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            style={{ boxShadow: 'var(--nb-shadow)' }}
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
                  className="p-3 bg-fun-pink text-white border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center gap-2 motion-reduce:transform-none motion-reduce:transition-none"
                  style={{ boxShadow: 'var(--nb-shadow)' }}
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
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, delay: 0.05 }}
                  onClick={openChat}
                  className="p-3 bg-accent text-white border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center gap-2 motion-reduce:transform-none motion-reduce:transition-none"
                  style={{ boxShadow: 'var(--nb-shadow)' }}
                  aria-label="Chat with Digital Rishabh (Ctrl+K)"
                >
                  <Bot size={20} />
                  <span className="text-sm font-heading font-bold hidden sm:inline">Chat</span>
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Interface - Neubrutalism Style */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 w-auto md:w-[420px] max-h-[70vh] md:max-h-[600px] h-[65vh] md:h-[70vh] bg-card border-[3px] border-[color:var(--color-border)] flex flex-col overflow-hidden"
            style={{ boxShadow: 'var(--nb-shadow-hover)' }}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby="chatbot-helper"
            ref={chatDialogRef}
          >
            {/* Header */}
            <div className="bg-accent p-4 flex justify-between items-center border-b-[3px] border-[color:var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border-2 border-[color:var(--color-border)]">
                  <Bot size={20} className="text-black" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white" id={titleId}>Digital Rishabh</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1 font-sans">
                    <span className="w-2 h-2 bg-fun-yellow rounded-full animate-pulse motion-reduce:animate-none"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 1 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-white/70 hover:text-white transition-colors font-heading font-bold px-2 py-1 border-2 border-white/30 hover:border-white"
                    aria-label="Clear chat history"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 text-white hover:bg-white/20 transition-colors"
                  aria-label="Close chat (Escape)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <p id="chatbot-helper" className="sr-only">Chat dialog. Press Escape to close. Tab cycles within the chat window.</p>

            {/* Messages Area */}
            <div
              className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 bg-primary"
              role="log"
              aria-live="polite"
              aria-busy={isTyping}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 text-sm leading-relaxed border-[3px] border-[color:var(--color-border)] ${msg.role === 'user'
                      ? 'bg-fun-yellow text-black'
                      : 'bg-card text-primary'
                      }`}
                    style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                  >
                    <ReactMarkdown components={{ a: LinkRenderer }}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isTyping && <ChatSkeleton />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-secondary border-t-[3px] border-[color:var(--color-border)]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  id="chatbot-input"
                  aria-label="Type a message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={500}
                  disabled={isTyping}
                  placeholder={isTyping ? "Thinking..." : "Ask about my skills..."}
                  className="flex-grow bg-card border-[3px] border-[color:var(--color-border)] px-4 py-3 text-sm text-primary font-sans focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-fun-yellow text-black border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transform-none motion-reduce:transition-none"
                  style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roast Interface - Neubrutalism Style */}
      <AnimatePresence>
        {isRoastOpen && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 w-auto md:w-[380px] bg-fun-pink border-[3px] border-[color:var(--color-border)] overflow-hidden"
            style={{ boxShadow: 'var(--nb-shadow-hover)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="roast-title"
            aria-describedby="roast-helper"
            ref={roastDialogRef}
          >
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b-[3px] border-[color:var(--color-border)] bg-fun-pink">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border-2 border-[color:var(--color-border)]">
                  <Flame size={20} className="text-fun-pink" />
                </div>
                <h3 className="font-heading font-bold text-white" id="roast-title">Resume Roasted 🔥</h3>
              </div>
              <button
                ref={roastCloseRef}
                onClick={() => setIsRoastOpen(false)}
                className="p-1 text-white hover:bg-white/20 transition-colors"
                aria-label="Close roast"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 bg-white">
              {roastLoading ? (
                <div className="flex items-center gap-3 text-fun-pink">
                  <RefreshCw size={20} className="animate-spin motion-reduce:animate-none" />
                  <span className="font-heading font-bold">Roasting your resume...</span>
                </div>
              ) : roast ? (
                <p className="text-black font-sans text-base italic leading-relaxed">
                  &quot;{roast}&quot;
                </p>
              ) : null}
            </div>

            <p id="roast-helper" className="sr-only">Resume roast dialog. Press Escape to close. Focus remains inside until closed.</p>

            {/* Actions */}
            <div className="p-4 bg-secondary border-t-[3px] border-[color:var(--color-border)] flex gap-2">
              <button
                onClick={handleRoast}
                disabled={roastLoading}
                className="flex-1 py-3 bg-fun-yellow text-black font-heading font-bold border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 motion-reduce:transform-none motion-reduce:transition-none"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                <RefreshCw size={16} className={roastLoading ? 'animate-spin motion-reduce:animate-none' : ''} />
                Roast Again
              </button>
              <button
                onClick={() => setIsRoastOpen(false)}
                className="py-3 px-6 bg-card text-primary font-heading font-bold border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
