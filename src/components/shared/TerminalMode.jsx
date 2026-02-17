/**
 * @fileoverview Terminal Mode component – navigate the portfolio via typed commands.
 * Provides a retro terminal UI with command history and real-time output.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { resumeData } from '../../data/resume';
import { useTheme } from './theme-context';

/** Map of page aliases to routes */
const PAGE_MAP = {
  home: '/',
  projects: '/projects',
  resume: '/resume',
  blog: '/blog',
  playground: '/playground',
  contact: '/contact',
  games: '/games',
};

/**
 * Terminal Mode overlay component
 *
 * Features:
 * - Type commands to navigate the site, view info, or trigger actions
 * - Scrollable output history
 * - Retro dark terminal aesthetic with green text
 * - Accessible: focus trap, keyboard close
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether terminal is visible
 * @param {Function} props.onClose - Callback to close terminal
 * @param {string} props.welcomeMessage - Optional welcome banner shown on open
 * @returns {JSX.Element} Terminal overlay
 */
const TerminalMode = ({ isOpen, onClose, welcomeMessage = '' }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [cmdIndex, setCmdIndex] = useState(-1);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';

  /** Initialize terminal with welcome message when opened */
  useEffect(() => {
    if (isOpen) {
      const initial = [
        {
          type: 'system',
          text: `╔══════════════════════════════════════════════╗
║  Rishabh's Portfolio Terminal v1.0           ║
║  Type 'help' for available commands          ║
╚══════════════════════════════════════════════╝`,
        },
      ];
      if (welcomeMessage) {
        initial.push({ type: 'system', text: welcomeMessage });
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory(initial);
      setInput('');
      setCmdHistory([]);
      setCmdIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, welcomeMessage]);

  /** Auto-scroll to bottom when new output is added */
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  /**
   * Push a line of output to the terminal history
   * @param {string} text - Output text
   * @param {'output'|'error'|'system'|'command'} type - Line type for styling
   */
  const pushOutput = useCallback((text, type = 'output') => {
    setHistory(prev => [...prev, { type, text }]);
  }, []);

  /**
   * Process a command entered by the user
   * @param {string} raw - Raw command string
   */
  const processCommand = useCallback(
    raw => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      // Record the command
      pushOutput(`$ ${trimmed}`, 'command');
      setCmdHistory(prev => [trimmed, ...prev]);
      setCmdIndex(-1);

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(' ').toLowerCase();

      switch (cmd) {
        case 'help':
          pushOutput(
            `Available commands:
  help              Show this help message
  ls                List available pages
  cd <page>         Navigate to a page
  goto <page>       Navigate to a page
  whoami            Display developer info
  skills            Display skill categories
  projects          List featured projects
  echo <text>       Echo text back
  clear             Clear terminal output
  exit / quit       Close terminal mode
  sudo hire rishabh → ???`
          );
          break;

        case 'ls':
          pushOutput(
            `Available pages:\n${Object.keys(PAGE_MAP)
              .map(p => `  📁 ${p}`)
              .join('\n')}`
          );
          break;

        case 'cd':
        case 'goto': {
          const page = args || 'home';
          const route = PAGE_MAP[page];
          if (route) {
            pushOutput(`Navigating to /${page}...`);
            setTimeout(() => {
              onClose();
              navigate(route);
            }, 400);
          } else {
            pushOutput(
              `Error: page '${page}' not found. Type 'ls' to see available pages.`,
              'error'
            );
          }
          break;
        }

        case 'whoami':
          pushOutput(
            `${resumeData.basics.name}
${resumeData.basics.title}
📍 ${resumeData.basics.location.city}, ${resumeData.basics.location.country}
📧 ${resumeData.basics.email}
🌐 ${resumeData.basics.website}`
          );
          break;

        case 'skills':
          pushOutput(
            resumeData.skills
              .map(
                cat =>
                  `${cat.category}:\n${cat.items.map(s => `  • ${s.name} (${s.proficiency}%)`).join('\n')}`
              )
              .join('\n\n')
          );
          break;

        case 'projects':
          pushOutput(
            resumeData.projects
              .filter(p => p.featured)
              .map(p => `★ ${p.title}\n  ${p.description.slice(0, 80)}...`)
              .join('\n\n')
          );
          break;

        case 'echo':
          pushOutput(args || '');
          break;

        case 'clear':
          setHistory([]);
          break;

        case 'exit':
        case 'quit':
          pushOutput('Goodbye! 👋');
          setTimeout(() => onClose(), 500);
          break;

        case 'sudo':
          if (args.includes('hire') && args.includes('rishabh')) {
            pushOutput(
              `🎉 EXCELLENT CHOICE! Rishabh has been hired!
Just kidding... but seriously, let's chat!
📧 ${resumeData.basics.email}
💼 linkedin.com/in/rishabh-agrawal-1807321b9`
            );
          } else {
            pushOutput(`sudo: command not recognized. Nice try though! 😄`, 'error');
          }
          break;

        default:
          pushOutput(`Command not found: '${cmd}'. Type 'help' for available commands.`, 'error');
      }
    },
    [navigate, onClose, pushOutput]
  );

  /**
   * Handle form submit and arrow key command history navigation
   */
  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        processCommand(input);
        setInput('');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdHistory.length > 0) {
          const next = Math.min(cmdIndex + 1, cmdHistory.length - 1);
          setCmdIndex(next);
          setInput(cmdHistory[next]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (cmdIndex > 0) {
          const next = cmdIndex - 1;
          setCmdIndex(next);
          setInput(cmdHistory[next]);
        } else {
          setCmdIndex(-1);
          setInput('');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [input, processCommand, cmdHistory, cmdIndex, onClose]
  );

  if (!isOpen) return null;

  /** Color map for different output types */
  const lineColor = {
    command: 'text-green-400',
    output: 'text-gray-300',
    error: 'text-red-400',
    system: 'text-cyan-400',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Terminal Window */}
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-[92vw] max-w-2xl max-h-[80vh] flex flex-col"
            role="dialog"
            aria-label="Terminal Mode"
            aria-modal="true"
          >
            <div
              className={
                isLiquid
                  ? 'flex flex-col liquid-glass border border-[color:var(--border-soft)] overflow-hidden rounded-2xl'
                  : 'flex flex-col bg-gray-950 border-nb border-[color:var(--color-border)] overflow-hidden rounded-nb'
              }
              style={isLiquid ? undefined : { boxShadow: '8px 8px 0 var(--color-border)' }}
            >
              {/* Title Bar */}
              <div
                className={
                  isLiquid
                    ? 'flex items-center justify-between px-4 py-2.5 bg-[color:var(--surface-strong)] border-b border-[color:var(--border-soft)]'
                    : 'flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b-2 border-gray-700'
                }
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <button
                      onClick={onClose}
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
                      aria-label="Close terminal"
                    />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className={isLiquid ? 'text-[color:var(--text-muted)] text-xs font-mono ml-3' : 'text-gray-400 text-xs font-mono ml-3'}>
                    rishabh@portfolio ~ %
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className={
                    isLiquid
                      ? 'text-[color:var(--text-muted)] hover:text-[color:var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] rounded'
                      : 'text-gray-500 hover:text-white transition-colors'
                  }
                  aria-label="Close terminal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Output Area */}
              <div
                ref={outputRef}
                className={
                  isLiquid
                    ? 'flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[60vh] font-mono text-sm leading-relaxed bg-[color:var(--surface)]'
                    : 'flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[60vh] font-mono text-sm leading-relaxed'
                }
                onClick={() => inputRef.current?.focus()}
              >
                {history.map((line, i) => (
                  <pre
                    key={i}
                    className={`whitespace-pre-wrap mb-1 ${lineColor[line.type] || 'text-gray-300'}`}
                  >
                    {line.text}
                  </pre>
                ))}

                {/* Input Line */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-400 flex-shrink-0">$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-green-400 font-mono text-sm outline-none caret-green-400"
                    aria-label="Terminal input"
                    autoComplete="off"
                    spellCheck="false"
                    autoCapitalize="off"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TerminalMode;
