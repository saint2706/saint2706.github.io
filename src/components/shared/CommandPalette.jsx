/**
 * @fileoverview Command Palette component for keyboard-driven site navigation.
 * Triggered via Ctrl+K / Cmd+K, provides fuzzy search over site commands.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useFocusTrap } from './useFocusTrap';
import {
  Search,
  Terminal,
  Briefcase,
  User,
  FileText,
  Mail,
  Code2,
  Gamepad2,
  MousePointer2,
  Bot,
  Printer,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { useTheme } from './theme-context';
import { getOverlayShell, joinClasses } from './ThemedPrimitives.utils';

/**
 * Command Palette overlay for keyboard-driven navigation
 *
 * Features:
 * - Fuzzy search over all available commands
 * - Full keyboard navigation (arrows, Enter, Escape)
 * - Grouped commands by category
 * - Neubrutalist styled overlay with bold borders and shadows
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the palette is currently visible
 * @param {Function} props.onClose - Callback to close the palette
 * @param {Function} props.onOpenTerminal - Callback to open Terminal Mode
 * @returns {JSX.Element} Command palette overlay
 */
const CommandPalette = ({ isOpen, onClose, onOpenTerminal }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const shell = getOverlayShell({ theme, depth: 'hover' });

  /** All available commands grouped by category */
  const commands = useMemo(
    () => [
      // Navigation commands
      {
        id: 'nav-home',
        label: 'Go to Home',
        category: 'Navigation',
        icon: <Terminal size={18} />,
        action: () => navigate('/'),
      },
      {
        id: 'nav-projects',
        label: 'Go to Projects',
        category: 'Navigation',
        icon: <Briefcase size={18} />,
        action: () => navigate('/projects'),
      },
      {
        id: 'nav-resume',
        label: 'Go to Resume',
        category: 'Navigation',
        icon: <User size={18} />,
        action: () => navigate('/resume'),
      },
      {
        id: 'nav-blog',
        label: 'Go to Blog',
        category: 'Navigation',
        icon: <FileText size={18} />,
        action: () => navigate('/blog'),
      },
      {
        id: 'nav-playground',
        label: 'Go to Playground',
        category: 'Navigation',
        icon: <Code2 size={18} />,
        action: () => navigate('/playground'),
      },
      {
        id: 'nav-contact',
        label: 'Go to Contact',
        category: 'Navigation',
        icon: <Mail size={18} />,
        action: () => navigate('/contact'),
      },
      {
        id: 'nav-games',
        label: 'Go to Games',
        category: 'Navigation',
        icon: <Gamepad2 size={18} />,
        action: () => navigate('/games'),
      },
      // Actions
      {
        id: 'action-chatbot',
        label: 'Open Chatbot',
        category: 'Actions',
        icon: <Bot size={18} />,
        action: () => document.dispatchEvent(new CustomEvent('openChatbot')),
      },
      {
        id: 'action-cursor',
        label: 'Toggle Custom Cursor',
        category: 'Actions',
        icon: <MousePointer2 size={18} />,
        action: () => document.dispatchEvent(new CustomEvent('toggleCursor')),
      },
      {
        id: 'action-print',
        label: 'Print Resume',
        category: 'Actions',
        icon: <Printer size={18} />,
        action: () => {
          navigate('/resume');
          setTimeout(() => window.print(), 500);
        },
      },
      {
        id: 'action-terminal',
        label: 'Open Terminal Mode',
        category: 'Actions',
        icon: <Terminal size={18} />,
        action: () => onOpenTerminal?.(),
      },
    ],
    [navigate, onOpenTerminal]
  );

  /**
   * Filter commands based on search query (case-insensitive substring match)
   */
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      cmd => cmd.label.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q)
    );
  }, [query, commands]);

  // Reset selected index when filtered results change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [filteredCommands.length, query]);

  // Initialize focus trap and modal behavior
  useFocusTrap({
    isOpen,
    containerRef,
    onClose,
    initialFocusRef: inputRef,
  });

  // Reset state when palette opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  /**
   * Execute the selected command and close the palette
   */
  const executeCommand = useCallback(
    index => {
      const cmd = filteredCommands[index];
      if (cmd) {
        onClose();
        // Delay action slightly so the close animation plays first
        setTimeout(() => cmd.action(), 100);
      }
    },
    [filteredCommands, onClose]
  );

  /**
   * Handle keyboard navigation within the palette
   */
  const handleKeyDown = useCallback(
    e => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev <= 0 ? filteredCommands.length - 1 : prev - 1));
          break;
        case 'Enter':
          e.preventDefault();
          executeCommand(selectedIndex);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands.length, selectedIndex, executeCommand, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Palette Container */}
          <motion.div
            ref={containerRef}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90vw] max-w-xl z-[201]"
            role="dialog"
            aria-label="Command Palette"
            aria-modal="true"
          >
            <div className={joinClasses('overflow-hidden', shell.className)} style={shell.style}>
              {/* Search Input */}
              <div
                className={joinClasses(
                  'flex items-center gap-3 px-4 py-3',
                  isLiquid
                    ? 'border-b border-[color:var(--border-soft)]'
                    : 'border-b-nb border-[color:var(--color-border)]'
                )}
              >
                <Search size={20} className="text-secondary flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-primary font-sans text-base outline-none placeholder:text-muted"
                  aria-label="Search commands"
                  autoComplete="off"
                  spellCheck="false"
                  role="combobox"
                  aria-expanded={filteredCommands.length > 0}
                  aria-autocomplete="list"
                  aria-controls="command-list"
                  aria-activedescendant={
                    filteredCommands.length > 0 && filteredCommands[selectedIndex]
                      ? filteredCommands[selectedIndex].id
                      : undefined
                  }
                />
                <button
                  onClick={onClose}
                  className={joinClasses(
                    'group relative p-1.5 text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    isLiquid
                      ? 'lg-surface-3 lg-pill lg-spring-hover rounded-full hover:brightness-110'
                      : 'bg-secondary border-2 border-[color:var(--color-border)] hover:bg-fun-yellow rounded-nb'
                  )}
                  aria-label="Close command palette"
                >
                  <X size={14} />
                  <span
                    className="absolute top-full mt-2 right-0 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
                    aria-hidden="true"
                  >
                    Close
                  </span>
                </button>
              </div>

              {/* Command List */}
              <div
                id="command-list"
                ref={listRef}
                className="max-h-[50vh] overflow-y-auto py-2"
                role="listbox"
                aria-label="Commands"
              >
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-secondary font-sans">
                    No commands found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <>
                    {/* Group commands by category */}
                    {['Navigation', 'Actions'].map(category => {
                      const categoryCommands = filteredCommands.filter(
                        cmd => cmd.category === category
                      );
                      if (categoryCommands.length === 0) return null;

                      return (
                        <div key={category}>
                          <div className="px-4 py-1.5 text-xs font-heading font-bold text-muted uppercase tracking-wider">
                            {category}
                          </div>
                          {categoryCommands.map(cmd => {
                            const globalIndex = filteredCommands.indexOf(cmd);
                            const isSelected = globalIndex === selectedIndex;
                            return (
                              <div
                                key={cmd.id}
                                id={cmd.id}
                                data-selected={isSelected}
                                onClick={() => executeCommand(globalIndex)}
                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 cursor-pointer ${
                                  isSelected
                                    ? 'bg-fun-yellow text-black'
                                    : 'text-primary hover:bg-secondary'
                                }`}
                                role="option"
                                aria-selected={isSelected}
                              >
                                <span className={isSelected ? 'text-black' : 'text-secondary'}>
                                  {cmd.icon}
                                </span>
                                <span className="font-sans text-sm font-medium">{cmd.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer with keyboard hints */}
              <div
                className={joinClasses(
                  'flex items-center gap-4 px-4 py-2.5',
                  isLiquid
                    ? 'border-t border-[color:var(--border-soft)] bg-[color:var(--surface-muted)]'
                    : 'border-t-nb border-[color:var(--color-border)] bg-secondary'
                )}
              >
                <span className="flex items-center gap-1 text-xs text-muted font-sans">
                  <ArrowUp size={12} />
                  <ArrowDown size={12} />
                  navigate
                </span>
                <span className="flex items-center gap-1 text-xs text-muted font-sans">
                  <CornerDownLeft size={12} />
                  select
                </span>
                <span className="flex items-center gap-1 text-xs text-muted font-sans">
                  <span className="px-1 py-0.5 bg-card border border-[color:var(--color-border)] text-[10px] font-mono rounded">
                    esc
                  </span>
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
