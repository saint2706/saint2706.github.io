/**
 * @fileoverview Connect Four — Drop-piece grid game with an AI opponent.
 *
 * Features:
 * - 7×6 board, gravity-based piece dropping
 * - AI opponent using depth-limited minimax with alpha-beta pruning and a
 *   windowed heuristic evaluation (three difficulty levels)
 * - Win detection across horizontal, vertical, and both diagonals
 * - Keyboard support (arrow keys + Enter/Space, or number keys 1-7)
 * - Score persistence across rounds within a session
 * - Full accessibility with ARIA labels and screen reader support
 *
 * @module components/games/ConnectFour
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { RotateCcw, Trophy, Cpu, User } from 'lucide-react';
import { useFocusTrap } from '../shared/useFocusTrap';
import { useTheme } from '../shared/theme-context';
import { getGameThemeStyles } from './gameThemeStyles';

const ROWS = 6;
const COLS = 7;
const PLAYER = 'R';
const AI = 'Y';
const DEPTH_BY_DIFFICULTY = { easy: 2, medium: 4, hard: 5 };
const CENTER_ORDER = [3, 2, 4, 1, 5, 0, 6];

const createEmptyBoard = () => Array(ROWS * COLS).fill(null);

const getValidColumns = board => {
  const cols = [];
  for (let c = 0; c < COLS; c++) {
    if (board[c] === null) cols.push(c);
  }
  return cols;
};

/** Drops a piece into the given column, returning the new board and landing row, or null if the column is full. */
const dropPiece = (board, col, piece) => {
  for (let r = ROWS - 1; r >= 0; r--) {
    const idx = r * COLS + col;
    if (board[idx] === null) {
      const next = [...board];
      next[idx] = piece;
      return { board: next, row: r };
    }
  }
  return null;
};

/** Builds the four cell indices for a window starting at (row, col) moving by (dr, dc). */
const buildWindow = (row, col, dr, dc) =>
  Array.from({ length: 4 }, (_, i) => (row + dr * i) * COLS + (col + dc * i));

/** Checks the whole board for four-in-a-row; returns { winner, line } or null. */
const checkWinner = board => {
  const directions = [
    { dr: 0, dc: 1 }, // horizontal
    { dr: 1, dc: 0 }, // vertical
    { dr: 1, dc: 1 }, // diagonal down-right
    { dr: 1, dc: -1 }, // diagonal down-left
  ];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = board[row * COLS + col];
      if (!cell) continue;

      for (const { dr, dc } of directions) {
        const endRow = row + dr * 3;
        const endCol = col + dc * 3;
        if (endRow < 0 || endRow >= ROWS || endCol < 0 || endCol >= COLS) continue;

        const line = buildWindow(row, col, dr, dc);
        if (line.every(idx => board[idx] === cell)) {
          return { winner: cell, line };
        }
      }
    }
  }
  return null;
};

const isBoardFull = board => board.every(cell => cell !== null);

/** Scores a single 4-cell window from the perspective of `player`. */
const evaluateWindow = (cells, player, opponent) => {
  const playerCount = cells.filter(c => c === player).length;
  const opponentCount = cells.filter(c => c === opponent).length;
  const emptyCount = cells.filter(c => c === null).length;

  if (playerCount === 4) return 100000;
  if (playerCount === 3 && emptyCount === 1) return 50;
  if (playerCount === 2 && emptyCount === 2) return 10;
  if (opponentCount === 3 && emptyCount === 1) return -80;
  return 0;
};

/** Heuristic evaluation of the whole board from `player`'s perspective. */
const scorePosition = (board, player) => {
  const opponent = player === AI ? PLAYER : AI;
  let score = 0;

  // Center column control is strategically valuable.
  for (let row = 0; row < ROWS; row++) {
    if (board[row * COLS + 3] === player) score += 3;
  }

  // Horizontal windows
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const cells = buildWindow(row, col, 0, 1).map(idx => board[idx]);
      score += evaluateWindow(cells, player, opponent);
    }
  }
  // Vertical windows
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row <= ROWS - 4; row++) {
      const cells = buildWindow(row, col, 1, 0).map(idx => board[idx]);
      score += evaluateWindow(cells, player, opponent);
    }
  }
  // Diagonal down-right windows
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const cells = buildWindow(row, col, 1, 1).map(idx => board[idx]);
      score += evaluateWindow(cells, player, opponent);
    }
  }
  // Diagonal down-left windows
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 3; col < COLS; col++) {
      const cells = buildWindow(row, col, 1, -1).map(idx => board[idx]);
      score += evaluateWindow(cells, player, opponent);
    }
  }

  return score;
};

/**
 * Depth-limited minimax with alpha-beta pruning.
 * Returns { col, score } — the best column to play and its heuristic score.
 */
const minimax = (board, depth, alpha, beta, isMaximizing) => {
  const validCols = getValidColumns(board).sort(
    (a, b) => CENTER_ORDER.indexOf(a) - CENTER_ORDER.indexOf(b)
  );
  const winnerInfo = checkWinner(board);

  if (winnerInfo || validCols.length === 0 || depth === 0) {
    if (winnerInfo?.winner === AI) return { col: null, score: 100000000 };
    if (winnerInfo?.winner === PLAYER) return { col: null, score: -100000000 };
    if (validCols.length === 0) return { col: null, score: 0 };
    return { col: null, score: scorePosition(board, AI) };
  }

  let bestCol = validCols[0];

  if (isMaximizing) {
    let value = -Infinity;
    for (const col of validCols) {
      const { board: nextBoard } = dropPiece(board, col, AI);
      const { score } = minimax(nextBoard, depth - 1, alpha, beta, false);
      if (score > value) {
        value = score;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: value };
  }

  let value = Infinity;
  for (const col of validCols) {
    const { board: nextBoard } = dropPiece(board, col, PLAYER);
    const { score } = minimax(nextBoard, depth - 1, alpha, beta, true);
    if (score < value) {
      value = score;
      bestCol = col;
    }
    beta = Math.min(beta, value);
    if (beta <= alpha) break;
  }
  return { col: bestCol, score: value };
};

/**
 * Picks the AI's move for the given difficulty.
 * Easy mode occasionally plays a random valid column to stay beatable.
 */
const getAIMove = (board, difficulty) => {
  const validCols = getValidColumns(board);
  if (validCols.length === 0) return null;

  if (difficulty === 'easy' && Math.random() < 0.5) {
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  const depth = DEPTH_BY_DIFFICULTY[difficulty] ?? DEPTH_BY_DIFFICULTY.medium;
  const { col } = minimax(board, depth, -Infinity, Infinity, true);
  return col ?? validCols[0];
};

const getCellLabel = (row, col, cell) => {
  const state = cell ? (cell === PLAYER ? 'your piece' : 'AI piece') : 'empty';
  return `Row ${row + 1}, Column ${col + 1}, ${state}`;
};

const ConnectFourCell = React.memo(
  ({
    row,
    col,
    cell,
    isFocusedCol,
    isDisabled,
    isWinningCell,
    ui,
    isLiquid,
    shouldReduceMotion,
    onDrop,
  }) => {
    const pieceColor = cell === PLAYER ? 'bg-accent' : cell === AI ? 'bg-fun-pink' : undefined;

    return (
      <button
        onClick={() => onDrop(col)}
        disabled={isDisabled}
        tabIndex={isFocusedCol && row === 0 ? 0 : -1}
        aria-label={getCellLabel(row, col, cell)}
        className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-[3px] border-[color:var(--color-border)] transition-transform motion-reduce:transform-none motion-reduce:transition-none flex items-center justify-center
          ${cell ? pieceColor : isLiquid ? 'bg-[color:var(--surface-muted)]/80' : 'bg-card'}
          ${isWinningCell ? 'ring-4 ring-fun-yellow' : ''}
          ${!isDisabled ? `cursor-pointer ${isLiquid ? 'hover:brightness-110' : 'hover:-translate-y-0.5'}` : 'cursor-default'}`}
        style={ui.style.tile}
      >
        <AnimatePresence>
          {cell && (
            <motion.span
              initial={shouldReduceMotion ? false : { scale: 0, y: -30 }}
              animate={{ scale: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.5 }}
              className="sr-only"
            >
              {cell === PLAYER ? 'You' : 'AI'}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  }
);
ConnectFourCell.displayName = 'ConnectFourCell';

/**
 * Connect Four game component with a minimax-driven AI opponent.
 *
 * @component
 * @returns {React.ReactElement} The Connect Four game.
 */
const ConnectFour = React.memo(() => {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const ui = getGameThemeStyles(isLiquid);

  const [board, setBoard] = useState(createEmptyBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [difficulty, setDifficulty] = useState('medium');
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [gameStatus, setGameStatus] = useState('playing'); // playing | won | lost | draw
  const [winningLine, setWinningLine] = useState(null);
  const [focusedCol, setFocusedCol] = useState(3);
  const overlayRef = useRef(null);

  const dropIntoColumn = useCallback(
    col => {
      if (!isPlayerTurn || gameStatus !== 'playing') return;
      const result = dropPiece(board, col, PLAYER);
      if (!result) return;

      const { board: nextBoard } = result;
      setBoard(nextBoard);

      const winnerInfo = checkWinner(nextBoard);
      if (winnerInfo) {
        setWinningLine(winnerInfo.line);
        setGameStatus('won');
        setScores(prev => ({ ...prev, player: prev.player + 1 }));
        return;
      }
      if (isBoardFull(nextBoard)) {
        setGameStatus('draw');
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        return;
      }
      setIsPlayerTurn(false);
    },
    [board, isPlayerTurn, gameStatus]
  );

  // AI turn
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const aiCol = getAIMove(board, difficulty);
        if (aiCol === null) return;
        const result = dropPiece(board, aiCol, AI);
        if (!result) return;

        const { board: nextBoard } = result;
        setBoard(nextBoard);

        const winnerInfo = checkWinner(nextBoard);
        if (winnerInfo) {
          setWinningLine(winnerInfo.line);
          setGameStatus('lost');
          setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
          return;
        }
        if (isBoardFull(nextBoard)) {
          setGameStatus('draw');
          setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
          return;
        }
        setIsPlayerTurn(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, board, difficulty]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setGameStatus('playing');
    setWinningLine(null);
    setFocusedCol(3);
  }, []);

  useFocusTrap({
    isOpen: gameStatus !== 'playing',
    containerRef: overlayRef,
    onClose: resetGame,
    preventScroll: false,
  });

  const changeDifficulty = newDifficulty => {
    setDifficulty(newDifficulty);
    setScores({ player: 0, ai: 0, draws: 0 });
    resetGame();
  };

  const handleKeyDown = useCallback(
    e => {
      if (gameStatus !== 'playing' || !isPlayerTurn) return;

      const digit = parseInt(e.key, 10);
      if (digit >= 1 && digit <= COLS) {
        e.preventDefault();
        setFocusedCol(digit - 1);
        dropIntoColumn(digit - 1);
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedCol(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedCol(prev => Math.min(COLS - 1, prev + 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          dropIntoColumn(focusedCol);
          break;
        default:
          break;
      }
    },
    [gameStatus, isPlayerTurn, focusedCol, dropIntoColumn]
  );

  const difficulties = [
    { id: 'easy', label: 'Easy', color: 'bg-fun-yellow' },
    { id: 'medium', label: 'Medium', color: 'bg-accent' },
    { id: 'hard', label: 'Hard', color: 'bg-fun-pink' },
  ];

  const getStatusAnnouncement = () => {
    if (gameStatus === 'won') return 'Congratulations! You connected four!';
    if (gameStatus === 'lost') return 'Game over. AI connected four!';
    if (gameStatus === 'draw') return "Game over. It's a draw!";
    if (!isPlayerTurn) return 'AI is thinking...';
    return `Your turn. Column ${focusedCol + 1} selected. Use arrow keys or number keys 1-7, Enter to drop.`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {getStatusAnnouncement()}
      </div>

      {/* Difficulty Selector */}
      <div className="flex gap-2" role="group" aria-label="Select difficulty level">
        {difficulties.map(diff => (
          <button
            key={diff.id}
            onClick={() => changeDifficulty(diff.id)}
            aria-pressed={difficulty === diff.id}
            aria-label={`Set difficulty to ${diff.label}`}
            className={`px-4 py-2 font-heading font-bold text-sm border-[3px] border-[color:var(--color-border)] cursor-pointer transition-transform motion-reduce:transform-none motion-reduce:transition-none
              ${
                difficulty === diff.id
                  ? `${diff.color} ${diff.id === 'easy' ? 'text-black' : 'text-white'} ${isLiquid ? 'scale-[1.01] border border-[color:var(--border-soft)] rounded-xl' : '-translate-x-0.5 -translate-y-0.5'}`
                  : `${isLiquid ? 'lg-surface-2 rounded-xl text-primary hover:brightness-110' : 'bg-card text-primary hover:-translate-x-0.5 hover:-translate-y-0.5'}`
              }`}
            style={{
              boxShadow: isLiquid
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

      {/* Score Board */}
      <div className={ui.scoreboard} style={ui.style.raised}>
        <div className="flex items-center gap-2 px-3">
          <User size={18} className="text-accent" aria-hidden="true" />
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
          <Cpu size={18} className="text-fun-pink" aria-hidden="true" />
        </div>
      </div>

      {/* Board */}
      <div className="relative">
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          className={`${ui.boardShell} ${ui.boardPadding}`}
          style={ui.style.board}
        >
          <div
            className="grid gap-1.5 md:gap-2 outline-none"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            role="grid"
            aria-label="Connect Four game board"
            onKeyDown={handleKeyDown}
          >
            {board.map((cell, idx) => {
              const row = Math.floor(idx / COLS);
              const col = idx % COLS;
              return (
                <ConnectFourCell
                  key={idx}
                  row={row}
                  col={col}
                  cell={cell}
                  isFocusedCol={focusedCol === col}
                  isDisabled={!isPlayerTurn || gameStatus !== 'playing'}
                  isWinningCell={winningLine?.includes(idx)}
                  ui={ui}
                  isLiquid={isLiquid}
                  shouldReduceMotion={shouldReduceMotion}
                  onDrop={dropIntoColumn}
                />
              );
            })}
          </div>
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
              aria-labelledby="c4-result"
            >
              <motion.div
                initial={shouldReduceMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', bounce: isLiquid ? 0.2 : 0.5 }
                }
                className="text-center"
              >
                {gameStatus === 'won' && (
                  <>
                    <Trophy className="w-16 h-16 text-fun-yellow mx-auto mb-2" aria-hidden="true" />
                    <div
                      id="c4-result"
                      className={`inline-block text-2xl text-black bg-fun-yellow ${ui.banner}`}
                      style={ui.style.raised}
                    >
                      You Won!
                    </div>
                  </>
                )}
                {gameStatus === 'lost' && (
                  <div
                    id="c4-result"
                    className={`inline-block text-2xl text-white bg-fun-pink ${ui.banner}`}
                    style={ui.style.raised}
                  >
                    AI Wins!
                  </div>
                )}
                {gameStatus === 'draw' && (
                  <div
                    id="c4-result"
                    className={`inline-block text-2xl text-primary bg-secondary ${ui.banner}`}
                    style={ui.style.raised}
                  >
                    It&apos;s a Draw!
                  </div>
                )}
              </motion.div>
              <motion.button
                initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: isLiquid ? 0.1 : 0.2 }}
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
                <Cpu size={14} aria-hidden="true" />
              </motion.span>
              AI is thinking...
            </span>
          )}
        </motion.div>
      )}

      {/* Instructions */}
      <div
        className={`${ui.statusBanner} text-sm md:text-xs text-secondary text-center font-sans leading-relaxed`}
        style={ui.style.raised}
      >
        Click a column, or use number keys 1-7 / arrow keys + Enter
      </div>
    </div>
  );
});

ConnectFour.displayName = 'ConnectFour';

export default ConnectFour;
