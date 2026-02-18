/**
 * Chat Interface Component Module
 *
 * Provides an interactive chat interface powered by Google's Gemini AI.
 * This component manages message history, handles user input, renders markdown responses,
 * and implements accessibility features including focus trapping and keyboard navigation.
 *
 * Features:
 * - Persistent chat history stored in localStorage
 * - Markdown rendering with safe link handling (XSS prevention)
 * - Quick reply buttons for common questions
 * - Real-time typing indicators
 * - Message history limiting to prevent token exhaustion
 * - Focus trap for modal dialog behavior
 * - Auto-scrolling to latest messages
 * - Character counter for input validation
 *
 * @module components/shared/ChatInterface
 */

import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bot, X, Send, Copy, Check } from 'lucide-react';
import { chatWithGemini } from '../../services/ai';
import ReactMarkdown from 'react-markdown';
import { TypingIndicator } from './SkeletonLoader';
import { isSafeHref, isSafeImageSrc, isValidChatMessage } from '../../utils/security';
import { buildNextMessages, buildGeminiHistory } from './chatHistory';
import {
  safeGetLocalStorage,
  safeSetLocalStorage,
  safeRemoveLocalStorage,
} from '../../utils/storage';
import { useTheme } from './theme-context';
import { getOverlayShell, joinClasses } from './ThemedPrimitives.utils';

const SyntaxHighlighter = lazy(() => import('./SyntaxHighlighter'));

// localStorage key for persisting chat history across sessions
const STORAGE_KEY = 'portfolio_chat_history';

// Maximum number of messages to load from localStorage (DoS prevention)
// ReactMarkdown rendering is expensive; limit to most recent messages
const MAX_STORED_MESSAGES = 100;

const generateMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 11);
  return `${timestamp}-${randomPart}`;
};

const DEFAULT_MESSAGE_ID = 'default-message';

const createDefaultMessage = () => ({
  id: DEFAULT_MESSAGE_ID,
  role: 'model',
  text: "Hi! I'm Digital Rishabh. Ask me about my projects, skills, or experience!",
});

// Quick reply suggestions shown when chat history is empty
const QUICK_REPLIES = [
  'Tell me about your projects',
  'What are your top skills?',
  'How can I contact you?',
];

/**
 * Custom link renderer for ReactMarkdown that validates URLs for security.
 * Prevents XSS attacks by only allowing safe protocols (http, https, mailto).
 * Unsafe links are rendered as plain text instead of clickable anchors.
 *
 * @component
 * @param {object} props
 * @param {string} props.href - The URL to link to
 * @param {React.ReactNode} props.children - Link text content
 * @returns {JSX.Element} Either a safe anchor tag or plain text span
 */
const LinkRenderer = ({ href, children, ...rest }) => {
  // Security: Only allow http, https, and mailto protocols to prevent XSS (e.g., javascript:)
  const isValidHref = isSafeHref(href);

  // If URL is unsafe, render as plain text to prevent execution
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

/**
 * Custom image renderer for ReactMarkdown that validates image sources for security.
 * Prevents XSS attacks by only allowing safe protocols (http, https) in src attributes.
 *
 * @component
 * @param {object} props
 * @param {string} props.src - The image source URL
 * @param {string} props.alt - The image alt text
 * @returns {JSX.Element} Either the image tag or a placeholder/warning
 */
const ImageRenderer = ({ src, alt, ...rest }) => {
  // Security: Validate image source to prevent dangerous protocols (e.g., javascript:)
  // Uses isSafeImageSrc which only allows http/https (not mailto: which doesn't make sense for images)
  const isValidSrc = isSafeImageSrc(src);

  if (!isValidSrc) {
    return <span className="text-muted italic text-xs">[Image blocked for security]</span>;
  }

  return (
    <img
      src={src}
      alt={alt || 'Chat image'}
      className="max-w-full h-auto rounded-lg my-2 border-2 border-[color:var(--color-border)]"
      loading="lazy"
      {...rest}
    />
  );
};

/**
 * Custom code block renderer with syntax highlighting and copy functionality.
 *
 * Features:
 * - Syntax highlighting via SyntaxHighlighter component
 * - Copy to clipboard button with visual feedback
 * - Handles both inline code and code blocks
 *
 * @component
 */
const CodeRenderer = ({ className, children, node, ...props }) => {
  const inline = !node?.position || node.position.start.line === node.position.end.line;
  const [isCopied, setIsCopied] = useState(false);
  const copyResetTimeoutRef = useRef(null);
  const match = /language-([\w+-]+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current !== null) {
        clearTimeout(copyResetTimeoutRef.current);
        copyResetTimeoutRef.current = null;
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);

      if (copyResetTimeoutRef.current !== null) {
        clearTimeout(copyResetTimeoutRef.current);
      }

      copyResetTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
        copyResetTimeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Render code blocks (non-inline) with syntax highlighting and copy button
  if (!inline) {
    const language = match ? match[1] : 'text';
    return (
      <div className="relative group my-4">
        <Suspense
          fallback={
            <pre className="!bg-gray-900 !p-4 !rounded-lg !overflow-x-auto !text-sm !font-mono !leading-relaxed !border-2 !border-[color:var(--color-border)] !m-0">
              <code className={className}>{code}</code>
            </pre>
          }
        >
          <SyntaxHighlighter language={language} code={code} {...props} />
        </Suspense>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={isCopied ? 'Copied code' : 'Copy code to clipboard'}
          title={isCopied ? 'Copied!' : 'Copy code'}
        >
          {isCopied ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }

  // Render inline code without syntax highlighting or copy button
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

// Stable markdown components object to prevent unnecessary re-renders
const MARKDOWN_COMPONENTS = {
  a: LinkRenderer,
  img: ImageRenderer,
  code: CodeRenderer,
};

/**
 * Individual message item component.
 * Memoized to prevent re-rendering of expensive Markdown content when parent list updates.
 */
const MessageItem = React.memo(({ msg }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[85%] p-3 text-sm leading-relaxed border-[3px] border-[color:var(--color-border)] ${msg.role === 'user' ? 'bg-fun-yellow text-black' : 'bg-card text-primary'
        }`}
      style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
    >
      <ReactMarkdown components={MARKDOWN_COMPONENTS}>{msg.text}</ReactMarkdown>
    </div>
  </div>
));
MessageItem.displayName = 'MessageItem';

/**
 * Memoized message list component that renders the chat history.
 *
 * Performance optimization: This component is wrapped in React.memo to prevent
 * re-rendering the entire message history (and expensive Markdown parsing) when
 * only the input field changes. Markdown parsing is computationally expensive,
 * so we only re-render when the messages array or typing state actually changes.
 *
 * @component
 * @param {object} props
 * @param {Array<{role: string, text: string}>} props.messages - Array of chat messages
 * @param {boolean} props.isTyping - Whether the AI is currently generating a response
 * @param {React.RefObject} props.messagesEndRef - Ref for auto-scrolling to bottom
 * @returns {JSX.Element} Scrollable message list with markdown rendering
 */
const MessageList = React.memo(({ messages, isTyping, messagesEndRef }) => (
  <div
    className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 bg-primary"
    role="log"
    aria-live="polite"
    aria-busy={isTyping}
  >
    {messages.map(msg => (
      <MessageItem key={msg.id} msg={msg} />
    ))}
    {isTyping && <TypingIndicator />}
    <div ref={messagesEndRef} />
  </div>
));
MessageList.displayName = 'MessageList';

/**
 * Main chat interface component.
 *
 * Provides a complete chat experience with message history persistence, AI responses,
 * and full accessibility support. Messages are stored in localStorage and restored
 * on subsequent visits. The interface includes quick reply buttons, typing indicators,
 * and a focus trap for modal behavior.
 *
 * Message Flow:
 * 1. User types message and submits
 * 2. Message is added to history and sent to AI service
 * 3. While waiting, typing indicator is shown
 * 4. AI response is received and added to history
 * 5. Messages are persisted to localStorage
 * 6. UI auto-scrolls to show latest message
 *
 * @component
 * @param {object} props
 * @param {Function} props.onClose - Callback to close the chat interface
 * @returns {JSX.Element} Animated chat dialog with full functionality
 */
const ChatInterface = ({ onClose }) => {
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  // Chat state: messages array with role ('user' | 'model') and text
  const [messages, setMessages] = useState([createDefaultMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false); // AI response loading state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Refs for DOM manipulation and lifecycle tracking
  const messagesEndRef = useRef(null); // For auto-scrolling to bottom
  const inputRef = useRef(null); // For auto-focusing input field
  const inputFocusTimeoutRef = useRef(null); // For delayed input focus timeout
  const chatDialogRef = useRef(null); // For focus trapping
  const confirmTimeoutRef = useRef(null); // For clearing confirmation state
  const isMountedRef = useRef(true); // Prevents state updates after unmount
  const prefersReducedMotion = useReducedMotion();

  // ARIA identifiers for accessibility
  const titleId = 'chatbot-title';
  const dialogId = 'chatbot-dialog';
  const shell = getOverlayShell({ theme, depth: 'hover' });

  /**
   * Track component mount status to prevent state updates after unmount.
   * This prevents memory leaks and React warnings when async operations complete
   * after the component has been unmounted.
   */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Load chat history from localStorage on component mount.
   * This provides continuity across page refreshes and return visits.
   * Gracefully handles JSON parsing errors and invalid data.
   */
  useEffect(() => {
    try {
      const saved = safeGetLocalStorage(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Security: Validate loaded messages to guard against malformed/oversized data from localStorage
          // Note: XSS mitigation is handled when rendering via ReactMarkdown and isSafeHref, not by this check
          const validMessages = parsed.filter(isValidChatMessage);

          // Limit number of messages to prevent rendering DoS (e.g., thousands of small messages)
          const recentMessages = validMessages.slice(-MAX_STORED_MESSAGES);

          if (recentMessages.length > 0) {
            setMessages(
              recentMessages.map(message => {
                const existingId = message.id;
                const isStringId = typeof existingId === 'string' && existingId.trim() !== '';
                const isNumberId = typeof existingId === 'number' && Number.isFinite(existingId);
                const safeId = isStringId || isNumberId ? existingId : generateMessageId();

                return {
                  ...message,
                  id: safeId,
                };
              })
            );
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
  }, []);

  /**
   * Persist chat history to localStorage whenever messages change.
   * Only saves if there's more than just the default greeting message.
   * Handles localStorage quota exceeded errors gracefully.
   */
  useEffect(() => {
    if (messages.length > 1) {
      try {
        safeSetLocalStorage(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  /**
   * Smoothly scrolls to the bottom of the message list.
   * Uses the messagesEndRef which is positioned at the end of the message list.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Auto-scroll to bottom whenever messages change (new message added).
   * This ensures users always see the latest message without manual scrolling.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Auto-focus the input field when the chat interface opens.
   * Short delay ensures the dialog animation has started before focusing.
   */
  useEffect(() => {
    if (inputRef.current) {
      inputFocusTimeoutRef.current = setTimeout(() => {
        inputRef.current?.focus();
        inputFocusTimeoutRef.current = null;
      }, 100);
    }

    return () => {
      if (inputFocusTimeoutRef.current !== null) {
        clearTimeout(inputFocusTimeoutRef.current);
        inputFocusTimeoutRef.current = null;
      }
    };
  }, []);

  /**
   * Sends a message to the AI and handles the response.
   *
   * This function:
   * 1. Adds the user message to the chat history
   * 2. Shows typing indicator
   * 3. Converts recent message history to AI API format
   * 4. Sends message to AI service with context
   * 5. Adds AI response to chat history
   * 6. Hides typing indicator
   *
   * Context Management: Only sends the last 30 messages to prevent exceeding
   * token limits and to keep API costs manageable. This still provides enough
   * context for coherent conversations.
   *
   * @async
   * @param {string} text - The message text to send
   */
  const handleSendMessage = async text => {
    if (!text.trim()) return;

    // Add user message to UI immediately for responsive feel
    const userMsg = { id: generateMessageId(), role: 'user', text: text };
    const nextMessages = buildNextMessages(messages, userMsg);
    setMessages(nextMessages);
    if (text === input) setInput(''); // Clear input if this is from the input field
    setIsTyping(true);

    // Limit context to last 30 messages to prevent token exhaustion
    const history = buildGeminiHistory(nextMessages);

    try {
      const responseText = await chatWithGemini(userMsg.text, history);
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setMessages(prev => [
          ...prev,
          { id: generateMessageId(), role: 'model', text: responseText },
        ]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsTyping(false);
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await handleSendMessage(input);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  /**
   * Clears the chat history and resets to default greeting message.
   * Also removes the saved history from localStorage.
   */
  const clearHistory = useCallback(() => {
    setMessages([createDefaultMessage()]);
    safeRemoveLocalStorage(STORAGE_KEY);
  }, []);

  /**
   * Handles the clear button click with a confirmation step.
   * First click shows "Confirm?", second click actually clears.
   * Confirmation state resets after 3 seconds.
   */
  const handleClearClick = () => {
    if (showClearConfirm) {
      clearHistory();
      setShowClearConfirm(false);
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
        confirmTimeoutRef.current = null;
      }
    } else {
      setShowClearConfirm(true);
      confirmTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShowClearConfirm(false);
        }
        confirmTimeoutRef.current = null;
      }, 3000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Implements focus trap and keyboard navigation for modal dialog accessibility.
   *
   * Focus Trap: When Tab is pressed on the last focusable element, focus wraps
   * to the first element. When Shift+Tab is pressed on the first element, focus
   * wraps to the last element. This keeps keyboard focus contained within the dialog.
   *
   * Escape Handling: Pressing Escape closes the dialog, a standard pattern for modals.
   *
   * This ensures keyboard-only users can navigate the dialog properly and matches
   * WAI-ARIA dialog best practices.
   */
  useEffect(() => {
    // Selector for all focusable elements (for focus trap)
    const focusSelectors =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = event => {
      // Close dialog on Escape key
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      // Focus trap: only handle Tab key
      if (event.key !== 'Tab') return;
      const container = chatDialogRef.current;
      if (!container) return;

      // Get all focusable elements within the dialog
      const focusable = container.querySelectorAll(focusSelectors);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Handle Shift+Tab on first element: wrap to last
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
      // Handle Tab on last element: wrap to first
      else if (document.activeElement === last) {
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
      className={`fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 w-auto md:w-[420px] max-h-[70vh] md:max-h-[600px] h-[65vh] md:h-[70vh] flex flex-col overflow-hidden ${shell.className}`}
      style={shell.style}
      id={dialogId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby="chatbot-helper"
      ref={chatDialogRef}
    >
      {/* Header */}
      <div
        className={joinClasses(
          'p-4 flex justify-between items-center',
          isLiquid
            ? 'bg-[color:var(--surface-muted)] border-b border-[color:var(--border-soft)]'
            : 'bg-accent border-b-nb border-[color:var(--color-border)]'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={joinClasses(
              'p-2',
              isLiquid
                ? 'lg-surface-3 lg-pill rounded-full'
                : 'bg-white border-2 border-[color:var(--color-border)] rounded-nb'
            )}
          >
            <Bot size={20} className="text-black" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white" id={titleId}>
              Digital Rishabh
            </h3>
            <p className="text-xs text-white/80 flex items-center gap-1 font-sans">
              <span className="w-2 h-2 bg-fun-yellow rounded-full animate-pulse motion-reduce:animate-none"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={handleClearClick}
              className={`text-xs transition-all duration-200 font-heading font-bold px-2 py-1 border-2 ${showClearConfirm
                  ? 'bg-red-500 text-white border-white hover:bg-red-600'
                  : 'text-white/70 hover:text-white border-white/30 hover:border-white'
                }`}
              aria-label={showClearConfirm ? 'Confirm clear chat history' : 'Clear chat history'}
            >
              {showClearConfirm ? 'Confirm?' : 'Clear'}
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

      <p id="chatbot-helper" className="sr-only">
        Chat dialog. Press Escape to close. Tab cycles within the chat window.
      </p>

      {/* Messages Area */}
      <MessageList messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef} />

      {/* Input Area */}
      <div
        className={
          isLiquid
            ? 'bg-[color:var(--surface-muted)] border-t border-[color:var(--border-soft)]'
            : 'bg-secondary border-t-nb border-[color:var(--color-border)]'
        }
      >
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
                className={isLiquid
                  ? 'lg-surface-3 lg-pill lg-spring-hover text-xs font-semibold whitespace-nowrap px-3 py-2 rounded-full text-[color:var(--text-primary)] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
                  : 'bg-card border-[2px] border-[color:var(--color-border)] text-xs font-bold font-heading whitespace-nowrap px-3 py-2 rounded-nb hover:bg-fun-yellow hover:-translate-y-0.5 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary'}
                style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
                aria-label={`Ask: ${reply}`}
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className={`p-4 ${messages.length === 1 && !isTyping ? 'pt-3' : ''}`}
        >
          <div className="flex gap-2 items-start">
            <div className="flex-grow relative">
              <input
                ref={inputRef}
                type="text"
                id="chatbot-input"
                aria-label="Type a message"
                value={input}
                onChange={e => setInput(e.target.value)}
                maxLength={500}
                disabled={isTyping}
                placeholder={isTyping ? 'Thinking...' : 'Ask about my skills...'}
                className={joinClasses(
                  'w-full px-4 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-secondary disabled:text-muted',
                  isLiquid
                    ? 'liquid-form-field bg-[color:var(--surface)] border border-[color:var(--border-soft)] text-[color:var(--text-primary)] rounded-xl'
                    : 'bg-card border-nb border-[color:var(--color-border)] text-primary rounded-nb'
                )}
                aria-describedby="chat-char-limit"
              />
              <div
                id="chat-char-limit"
                className={`text-[10px] text-right mt-1 font-sans transition-colors ${input.length >= 500
                    ? 'text-red-500 font-bold'
                    : input.length >= 450
                      ? 'text-orange-500'
                      : 'text-muted'
                  }`}
              >
                {input.length}/500
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={joinClasses(
                'group relative p-3 cursor-pointer disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed motion-reduce:transform-none motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transition-transform',
                isLiquid
                  ? 'liquid-overlay-action lg-spring-hover bg-[color:var(--surface-muted)] border border-[color:var(--border-soft)] text-[color:var(--text-primary)] rounded-full hover:brightness-110 hover:scale-[1.01]'
                  : 'bg-fun-yellow text-black border-nb border-[color:var(--color-border)] hover:-translate-y-0.5 rounded-nb'
              )}
              style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
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
