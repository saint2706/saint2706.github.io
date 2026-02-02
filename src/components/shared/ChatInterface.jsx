import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';
import { chatWithGemini } from '../../services/ai';
import ReactMarkdown from 'react-markdown';
import { ChatSkeleton } from './SkeletonLoader';
import { isSafeHref } from '../../utils/security';

const STORAGE_KEY = 'portfolio_chat_history';
const DEFAULT_MESSAGE = { role: 'model', text: "Hi! I'm Digital Rishabh. Ask me about my projects, skills, or experience!" };

const QUICK_REPLIES = [
  "Tell me about your projects",
  "What are your top skills?",
  "How can I contact you?"
];

const LinkRenderer = ({ href, children, ...rest }) => {
  // Security: Only allow http, https, and mailto protocols to prevent XSS (e.g., javascript:)
  const isValidHref = isSafeHref(href);

  if (!isValidHref) {
    return <span {...rest}>{children}</span>;
  }

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

// Optimization: Extract message list and use React.memo to prevent re-rendering
// the entire chat history (and expensive Markdown parsing) on every keystroke.
const MessageList = React.memo(({ messages, isTyping, messagesEndRef }) => (
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
));
MessageList.displayName = 'MessageList';

const ChatInterface = ({ onClose }) => {
  const [messages, setMessages] = useState([DEFAULT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatDialogRef = useRef(null);
  const isMountedRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();
  const titleId = 'chatbot-title';
  const dialogId = 'chatbot-dialog';

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', text: text };
    setMessages(prev => [...prev, userMsg]);
    if (text === input) setInput('');
    setIsTyping(true);

    const MAX_HISTORY_CONTEXT = 30;
    const history = messages.slice(-MAX_HISTORY_CONTEXT).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const responseText = await chatWithGemini(userMsg.text, history);
      if (isMountedRef.current) {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsTyping(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSendMessage(input);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const clearHistory = useCallback(() => {
    setMessages([DEFAULT_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Focus trap and Escape handling
  useEffect(() => {
    const focusSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const container = chatDialogRef.current;
      if (!container) return;

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
  }, [onClose]);

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 100, scale: 0.9 }}
      className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 w-auto md:w-[420px] max-h-[70vh] md:max-h-[600px] h-[65vh] md:h-[70vh] bg-card border-nb border-[color:var(--color-border)] flex flex-col overflow-hidden rounded-nb"
      style={{ boxShadow: 'var(--nb-shadow-hover)' }}
      id={dialogId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby="chatbot-helper"
      ref={chatDialogRef}
    >
      {/* Header */}
      <div className="bg-accent p-4 flex justify-between items-center border-b-nb border-[color:var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border-2 border-[color:var(--color-border)] rounded-nb">
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
            onClick={onClose}
            className="group relative p-1 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent rounded-sm"
            aria-label="Close chat (Escape)"
          >
            <X size={20} />
            <span
              className="absolute top-full mt-2 right-0 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
              aria-hidden="true"
            >
              Close
            </span>
          </button>
        </div>
      </div>

      <p id="chatbot-helper" className="sr-only">Chat dialog. Press Escape to close. Tab cycles within the chat window.</p>

      {/* Messages Area */}
      <MessageList messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef} />

      {/* Input Area */}
      <div className="bg-secondary border-t-nb border-[color:var(--color-border)]">
        {messages.length === 1 && !isTyping && (
          <div className="px-4 pt-4 pb-0 flex gap-2 overflow-x-auto scrollbar-thin">
            {QUICK_REPLIES.map((reply, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  handleSendMessage(reply);
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                className="bg-card border-[2px] border-[color:var(--color-border)] text-xs font-bold font-heading whitespace-nowrap px-3 py-2 rounded-nb hover:bg-fun-yellow hover:-translate-y-0.5 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                aria-label={`Ask: ${reply}`}
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className={`p-4 ${messages.length === 1 && !isTyping ? 'pt-3' : ''}`}>
          <div className="flex gap-2 items-start">
            <div className="flex-grow relative">
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
              className="w-full bg-card border-nb border-[color:var(--color-border)] px-4 py-3 text-sm text-primary font-sans focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-secondary disabled:text-muted rounded-nb"
            />
              <div className="text-[10px] text-right mt-1 text-muted font-sans" aria-hidden="true">
                {input.length}/500
              </div>
            </div>
            <button
              type="submit"
            disabled={!input.trim() || isTyping}
            className="group relative p-3 bg-fun-yellow text-black border-nb border-[color:var(--color-border)] cursor-pointer transition-transform hover:-translate-y-0.5 disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed motion-reduce:transform-none motion-reduce:transition-none rounded-nb focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
            aria-label="Send message"
            >
              <Send size={20} />
              <span
                className="absolute bottom-full mb-2 right-0 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
                aria-hidden="true"
              >
                Send
              </span>
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatInterface;
