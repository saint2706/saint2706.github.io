/**
 * Tic Tac Toe Game Component Module
 *
 * A fully-featured Tic Tac Toe game with AI opponent using the minimax algorithm.
 * Includes three difficulty levels, score tracking, and comprehensive accessibility support.
 *
 * AI Implementation:
 * - Uses minimax algorithm with alpha-beta pruning for optimal play
 * - Three difficulty levels: easy (random), medium (70% optimal), hard (100% optimal)
 * - Hard mode is unbeatable when AI goes first
 *
 * Features:
 * - Three AI difficulty levels with different strategies
 * - Score persistence across games
 * - Win detection with visual highlighting
 * - Keyboard shortcuts (Escape to restart)
 * - Full accessibility with ARIA labels and screen reader support
 * - Neubrutalism design system styling
 *
 * @module components/games/TicTacToe
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { RotateCcw, Trophy, Cpu, User } from 'lucide-react';
import { useTheme } from '../shared/theme-context';
import { getGameThemeStyles } from './gameThemeStyles';

// All possible winning combinations (rows, columns, diagonals)
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
];

/**
 * Minimax algorithm with alpha-beta pruning for optimal AI play.
 *
 * The minimax algorithm is a recursive decision-making algorithm used in game theory.
 * It explores all possible future game states to find the optimal move. Alpha-beta
 * pruning significantly improves performance by eliminating branches that cannot
 * possibly affect the final decision.
 *
 * How it works:
 * 1. Maximizing player (AI, 'O') tries to maximize the score
 * 2. Minimizing player (human, 'X') tries to minimize the score
 * 3. Algorithm recursively explores all possible moves
 * 4. Returns the best score achievable from current position
 * 5. Alpha-beta pruning cuts off branches that won't affect the outcome
 *
 * Scoring:
 * - AI win: +10 (adjusted by depth for faster wins)
 * - Player win: -10 (adjusted by depth)
 * - Draw: 0
 *
 * Alpha-Beta Pruning:
 * - Alpha: best score maximizer can guarantee
 * - Beta: best score minimizer can guarantee
 * - If beta <= alpha, remaining branches are pruned (won't affect outcome)
 *
 * @param {Array<string|null>} board - Current board state (9 cells: 'X', 'O', or null)
 * @param {number} depth - Current recursion depth (for scoring preference)
 * @param {boolean} isMaximizing - True if maximizing player's turn (AI), false for minimizing (human)
 * @param {number} alpha - Best score maximizer can guarantee
 * @param {number} beta - Best score minimizer can guarantee
 * @returns {number} Best score achievable from this position
 * @private
 */
const minimax = (board, depth, isMaximizing, alpha, beta) => {
  // Check terminal conditions (game over states)
  const winner = checkWinner(board);
  if (winner === 'O') return 10 - depth; // AI wins (prefer faster wins)
  if (winner === 'X') return depth - 10; // Player wins (prefer longer games if losing)
  if (board.every(cell => cell !== null)) return 0; // Draw

  if (isMaximizing) {
    // Maximizing player (AI) - try to get highest score
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const evalScore = minimax(board, depth + 1, false, alpha, beta);
        board[i] = null; // Undo move
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        // Beta cutoff: minimizer will avoid this branch
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    // Minimizing player (human) - try to get lowest score
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const evalScore = minimax(board, depth + 1, true, alpha, beta);
        board[i] = null; // Undo move
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        // Alpha cutoff: maximizer will avoid this branch
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
};

/**
 * Checks if there is a winner on the board.
 *
 * Iterates through all winning combinations and checks if any line
 * has three matching symbols ('X' or 'O').
 *
 * @param {Array<string|null>} board - Current board state
 * @returns {string|null} 'X' if player wins, 'O' if AI wins, null if no winner
 * @private
 */
const checkWinner = board => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

/**
 * Gets the winning line indices if there is a winner.
 * Used for highlighting the winning cells visually.
 *
 * @param {Array<string|null>} board - Current board state
 * @returns {Array<number>|null} Array of winning cell indices [a, b, c] or null
 * @private
 */
const getWinningLine = board => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return combo;
    }
  }
  return null;
};

/**
 * Tic Tac Toe game component with AI opponent.
 *
 * Game States:
 * - 'playing': game is in progress
 * - 'won': player has won
 * - 'lost': AI has won
 * - 'draw': no winner, board full
 *
 * Difficulty Levels:
 * - Easy: AI makes random moves (no strategy)
 * - Medium: AI makes random moves 30% of time, optimal moves 70% of time
 * - Hard: AI always makes optimal moves using minimax (unbeatable)
 *
 * @component
 * @returns {JSX.Element} Complete Tic Tac Toe game interface
 */
const TicTacToe = () => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isAura = theme === 'aura';
  const ui = getGameThemeStyles(isAura);

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null)); // 9 cells: 'X', 'O', or null
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [difficulty, setDifficulty] = useState('medium');
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 }); // Score tracking
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'won' | 'lost' | 'draw'
  const [winningLine, setWinningLine] = useState(null); // Indices of winning cells for highlighting
  const overlayRef = useRef(null);

  /**
   * Calculates the best move for the AI based on difficulty level.
   *
   * Difficulty Strategies:
   * - Easy: Always makes random moves (no intelligence)
   * - Medium: 30% random, 70% optimal (makes game challenging but winnable)
   * - Hard: Always optimal using minimax (unbeatable with perfect play)
   *
   * For hard mode, evaluates all empty cells using minimax and selects
   * the move with the highest score.
   *
   * @param {Array<string|null>} currentBoard - Current board state
   * @returns {number|null} Index of best move (0-8), or null if board is full
   */
  const getAIMove = useCallback(
    currentBoard => {
      const emptyIndices = currentBoard
        .map((cell, idx) => (cell === null ? idx : null))
        .filter(idx => idx !== null);

      if (emptyIndices.length === 0) return null;

      // Easy mode: always random
      if (difficulty === 'easy') {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }

      // Medium mode: 30% random, 70% optimal
      if (difficulty === 'medium') {
        if (Math.random() < 0.3) {
          return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
      }

      // Hard mode (or medium's optimal moves): use minimax
      let bestMove = emptyIndices[0];
      let bestScore = -Infinity;

      // Try each possible move and evaluate with minimax
      for (const idx of emptyIndices) {
        const newBoard = [...currentBoard];
        newBoard[idx] = 'O';
        const score = minimax(newBoard, 0, false, -Infinity, Infinity);
        if (score > bestScore) {
          bestScore = score;
          bestMove = idx;
        }
      }

      return bestMove;
    },
    [difficulty]
  );

  /**
   * Handles player's move when a cell is clicked.
   *
   * Process:
   * 1. Validate move (cell empty, player's turn, game in progress)
   * 2. Place player's mark ('X')
   * 3. Check for win or draw
   * 4. If game continues, trigger AI's turn
   *
   * @param {number} index - Board index (0-8) of clicked cell
   */
  const handleCellClick = useCallback(
    index => {
      // Ignore clicks on occupied cells, during AI turn, or when game is over
      if (board[index] || !isPlayerTurn || gameStatus !== 'playing') return;

      // Place player's mark
      const newBoard = [...board];
      newBoard[index] = 'X';
      setBoard(newBoard);

      // Check for player win
      const winner = checkWinner(newBoard);
      if (winner === 'X') {
        setWinningLine(getWinningLine(newBoard));
        setGameStatus('won');
        setScores(prev => ({ ...prev, player: prev.player + 1 }));
        return;
      }

      // Check for draw (board full, no winner)
      if (newBoard.every(cell => cell !== null)) {
        setGameStatus('draw');
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        return;
      }

      // Game continues: trigger AI turn
      setIsPlayerTurn(false);
    },
    [board, isPlayerTurn, gameStatus]
  );

  /**
   * AI turn: calculates and executes AI's move after a short delay.
   *
   * The 500ms delay makes the AI feel more natural (like it's "thinking")
   * and gives the player time to see their move before the AI responds.
   *
   * Process identical to player's turn but uses getAIMove for intelligence.
   */
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        if (aiMove !== null) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);

          // Check for AI win
          const winner = checkWinner(newBoard);
          if (winner === 'O') {
            setWinningLine(getWinningLine(newBoard));
            setGameStatus('lost');
            setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
            return;
          }

          // Check for draw
          if (newBoard.every(cell => cell !== null)) {
            setGameStatus('draw');
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
            return;
          }

          // Game continues: return control to player
          setIsPlayerTurn(true);
        }
      }, 500); // Delay makes AI feel more natural

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, board, getAIMove]);

  /**
   * Keyboard shortcut: Escape key resets game when game is over.
   * Only active when game is in terminal state (won/lost/draw).
   */
  /**
   * Resets the game board for a new round.
   * Preserves scores and difficulty setting.
   */
  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameStatus('playing');
    setWinningLine(null);
  }, []);

  useEffect(() => {
    if (gameStatus === 'playing') return;
    const handler = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        resetGame();
        return;
      }

      // Trap focus within overlay
      if (event.key === 'Tab' && overlayRef.current) {
        const focusables = overlayRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [gameStatus, resetGame]);

  /**
   * Changes difficulty level and resets both game and scores.
   * Scores are reset because different difficulties are not comparable.
   *
   * @param {string} newDifficulty - 'easy' | 'medium' | 'hard'
   */
  const changeDifficulty = newDifficulty => {
    setDifficulty(newDifficulty);
    setScores({ player: 0, ai: 0, draws: 0 });
    resetGame();
  };

  const difficulties = [
    { id: 'easy', label: 'Easy', color: 'bg-fun-yellow' },
    { id: 'medium', label: 'Medium', color: 'bg-accent' },
    { id: 'hard', label: 'Hard', color: 'bg-fun-pink' },
  ];

  const getCellLabel = (index, cell) => {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    const state = cell ? (cell === 'X' ? 'marked by you' : 'marked by AI') : 'empty';
    return `Row ${row}, Column ${col}, ${state}`;
  };

  const getStatusAnnouncement = () => {
    if (gameStatus === 'won') return 'Congratulations! You won the game!';
    if (gameStatus === 'lost') return 'Game over. AI wins!';
    if (gameStatus === 'draw') return "Game over. It's a draw!";
    if (!isPlayerTurn) return 'AI is thinking...';
    return 'Your turn. Select an empty cell to place your X.';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {getStatusAnnouncement()}
      </div>

      {/* Difficulty Selector - Neubrutalism */}
      <div className="flex gap-2" role="group" aria-label="Select difficulty level">
        {difficulties.map(diff => (
          <button
            key={diff.id}
            onClick={() => changeDifficulty(diff.id)}
            aria-pressed={difficulty === diff.id}
            className={`px-4 py-2 font-heading font-bold text-sm border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform motion-reduce:transform-none motion-reduce:transition-none
                            ${
                              difficulty === diff.id
                                ? `${diff.color} ${diff.id === 'easy' ? 'text-black' : 'text-white'} ${isAura ? 'scale-[1.01] border border-[color:var(--border-soft)] rounded-xl' : '-translate-x-0.5 -translate-y-0.5'}`
                                : `${isAura ? 'aura-glass border border-[color:var(--border-soft)] rounded-xl text-primary hover:brightness-110' : 'bg-card text-primary hover:-translate-x-0.5 hover:-translate-y-0.5'}`
                            }`}
            style={{
              boxShadow: isAura
                ? undefined
                : difficulty === diff.id
                  ? 'var(--nb-shadow-hover)'
                  : '2px 2px 0 var(--color-border)',
            }}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {/* Score Board - Neubrutalism */}
      <div
        className={ui.scoreboard}
        style={ui.style.raised}
      >
        <div className="flex items-center gap-2 px-3">
          <User size={18} className="text-accent" />
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">You</div>
            <div className="text-xl font-heading font-bold text-accent">{scores.player}</div>
          </div>
        </div>
        <div className={ui.separator} />
        <div className="px-3">
          <div className="text-sm md:text-xs text-secondary font-heading">Draws</div>
          <div className="text-xl font-heading font-bold text-secondary">{scores.draws}</div>
        </div>
        <div className={ui.separator} />
        <div className="flex items-center gap-2 px-3">
          <div>
            <div className="text-sm md:text-xs text-secondary font-heading">AI</div>
            <div className="text-xl font-heading font-bold text-fun-pink">{scores.ai}</div>
          </div>
          <Cpu size={18} className="text-fun-pink" />
        </div>
      </div>

      {/* Game Board - Neubrutalism */}
      <div className="relative">
        <motion.div
          className={`grid grid-cols-3 gap-2 ${ui.boardPadding} ${ui.boardShell}`}
          style={ui.style.board}
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          role="grid"
          aria-label="Tic Tac Toe game board"
        >
          {board.map((cell, index) => (
            <motion.button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !isPlayerTurn || gameStatus !== 'playing'}
              aria-label={getCellLabel(index, cell)}
              className={`w-20 h-20 md:w-24 md:h-24 text-4xl md:text-5xl flex items-center justify-center transition-transform motion-reduce:transform-none motion-reduce:transition-none ${ui.tileBase}
                                ${winningLine?.includes(index) ? ui.tileWin : ui.tileIdle}
                                ${!cell && isPlayerTurn && gameStatus === 'playing' ? `cursor-pointer ${isAura ? 'hover:brightness-110' : 'hover:-translate-x-0.5 hover:-translate-y-0.5'}` : 'cursor-default'}
                            `}
              style={ui.style.raised}
              whileTap={
                !cell && isPlayerTurn && gameStatus === 'playing' && !shouldReduceMotion
                  ? { scale: 0.95 }
                  : undefined
              }
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    initial={shouldReduceMotion ? false : { scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={shouldReduceMotion ? undefined : { scale: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : undefined}
                    className={cell === 'X' ? 'text-accent' : 'text-fun-pink'}
                    aria-hidden="true"
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameStatus !== 'playing' && (
            <motion.div
              ref={overlayRef}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className={ui.overlay}
              style={ui.style.board}
              role="dialog"
              aria-modal="true"
              aria-labelledby="game-result"
              aria-describedby="game-result-desc"
            >
              <motion.div
                initial={shouldReduceMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: isAura ? 0.2 : 0.5 }}
                className="text-center"
              >
                {gameStatus === 'won' && (
                  <>
                    <Trophy className="w-16 h-16 text-fun-yellow mx-auto mb-2" aria-hidden="true" />
                    <div
                      id="game-result"
                      className={`inline-block text-2xl text-black bg-fun-yellow ${ui.banner}`}
                      style={ui.style.raised}
                    >
                      You Won!
                    </div>
                  </>
                )}
                {gameStatus === 'lost' && (
                  <div
                    id="game-result"
                    className={`inline-block text-2xl text-white bg-fun-pink ${ui.banner}`}
                    style={ui.style.raised}
                  >
                    AI Wins!
                  </div>
                )}
                {gameStatus === 'draw' && (
                  <div
                    id="game-result"
                    className={`inline-block text-2xl text-primary bg-secondary ${ui.banner}`}
                    style={ui.style.raised}
                  >
                    It&apos;s a Draw!
                  </div>
                )}
              </motion.div>
              <p id="game-result-desc" className="sr-only">
                Game over dialog. Press Tab to stay inside and Escape to reset.
              </p>
              <motion.button
                initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: isAura ? 0.1 : 0.2 }}
                onClick={resetGame}
                className={ui.buttonPrimary}
                style={ui.style.raised}
                autoFocus
              >
                <RotateCcw size={18} aria-hidden="true" />
                Play Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Turn Indicator */}
      {gameStatus === 'playing' && (
        <motion.div
          key={isPlayerTurn ? 'player' : 'ai'}
          initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className={ui.statusBanner}
          style={ui.style.raised}
        >
          {isPlayerTurn ? (
            <span className="text-accent">Your turn</span>
          ) : (
            <span className="text-fun-pink flex items-center gap-2">
              <motion.span
                animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: shouldReduceMotion ? 0 : Infinity,
                  ease: 'linear',
                }}
              >
                <Cpu size={14} />
              </motion.span>
              AI is thinking...
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TicTacToe;
