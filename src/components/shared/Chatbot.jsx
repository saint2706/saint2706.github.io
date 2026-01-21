import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Command } from 'lucide-react';
import { chatWithGemini } from '../../services/ai';
import ReactMarkdown from 'react-markdown';
import { ChatSkeleton } from './SkeletonLoader';

const STORAGE_KEY = 'portfolio_chat_history';
const DEFAULT_MESSAGE = { role: 'model', text: "Hi! I'm Digital Rishabh. Ask me about my projects, skills, or experience!" };

// Security: Custom renderer for links to prevent tabnabbing and ensure new tab opening
const LinkRenderer = ({ href, children, ...rest }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline break-all"
      {...rest}
    >
      {children}
    </a>
  );
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([DEFAULT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const clearButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const titleId = 'chatbot-title';
  const dialogId = 'chatbot-dialog';

  // Load chat history from localStorage
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

  // Save chat history to localStorage
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
  }, [messages, isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (!isOpen && triggerRef.current) {
      // Return focus to trigger when chat closes
      triggerRef.current.focus();
    }
  }, [isOpen]);

  const handleTrapFocus = (event) => {
    if (event.key !== 'Tab') return;

    const focusableElements = [clearButtonRef.current, closeButtonRef.current, inputRef.current]
      .filter(Boolean);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const isShiftPressed = event.shiftKey;

    if (isShiftPressed && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!isShiftPressed && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  // Listen for close event from mobile menu
  useEffect(() => {
    const handleCloseChatbot = () => setIsOpen(false);
    document.addEventListener('closeChatbot', handleCloseChatbot);
    return () => document.removeEventListener('closeChatbot', handleCloseChatbot);
  }, []);

  // Listen for open event from other components (e.g., Hero button)
  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    document.addEventListener('openChatbot', handleOpenChatbot);
    return () => document.removeEventListener('openChatbot', handleOpenChatbot);
  }, []);

  // Close mobile menu when chatbot opens
  useEffect(() => {
    if (isOpen) {
      document.dispatchEvent(new CustomEvent('closeMobileMenu'));
    }
  }, [isOpen]);

  // Keyboard shortcut: Cmd/Ctrl + K to toggle chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Security/Performance: Limit context window to prevent token exhaustion and DoS
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

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id="ai-chat-trigger"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 bg-accent text-primary rounded-full shadow-lg hover:shadow-accent/50 transition-all duration-300 group ${isOpen ? 'hidden' : 'block'}`}
        aria-label="Open chat (Ctrl+K)"
        aria-controls={dialogId}
        aria-expanded={isOpen}
      >
        <Bot size={28} />
        {/* Keyboard hint */}
        <span className="absolute -top-8 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap flex items-center gap-1">
          <Command size={12} /> K
        </span>
      </button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 w-auto md:w-[400px] max-h-[60vh] md:max-h-[600px] h-[60vh] md:h-[70vh] bg-secondary border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onKeyDown={handleTrapFocus}
          >
            {/* Header */}
            <div className="bg-primary/50 p-4 flex justify-between items-center border-b border-slate-700 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Bot size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-white" id={titleId}>Digital Rishabh</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 1 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="Clear chat history"
                    ref={clearButtonRef}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                  aria-label="Close chat (Escape)"
                  ref={closeButtonRef}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700"
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-busy={isTyping}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-accent text-primary rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                      }`}
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
            <form onSubmit={handleSubmit} className="p-4 bg-primary/50 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  id="chatbot-input"
                  aria-label="Type a message to chat with Digital Rishabh"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={500}
                  disabled={isTyping}
                  placeholder={isTyping ? "Thinking..." : "Ask about my skills..."}
                  className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-accent text-primary rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
