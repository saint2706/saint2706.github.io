/**
 * @fileoverview Instruction content for the Games page "How to Play" panels.
 *
 * Data-only module so new games just need a new entry here, keyed by the
 * game id used on the Games page.
 *
 * @module components/games/gameInstructionsData
 */

/**
 * Instruction content for every game on the Games page, keyed by game id.
 *
 * @type {Object<string, {title: string, goal: string, steps: string[]}>}
 */
export const GAME_INSTRUCTIONS = {
  tictactoe: {
    title: 'Tic Tac Toe',
    goal: 'Get three X marks in a row — horizontally, vertically, or diagonally — before the AI does.',
    steps: [
      'Click any empty cell to place your X. The AI responds with an O.',
      'Block the AI from completing three O in a row while building your own line.',
      'Pick a difficulty: Easy plays randomly, Medium mixes it up, and Hard plays a perfect game.',
      'When a round ends, press Play Again (or Escape) to start the next one. Scores carry over.',
    ],
  },
  snake: {
    title: 'Snake',
    goal: 'Eat as much food as you can to grow the snake without crashing.',
    steps: [
      'Steer with the arrow keys, or swipe on touch screens.',
      'Each piece of food grows the snake and adds to your score.',
      'Avoid the walls and your own tail — hitting either ends the game.',
      'Press Space or Escape to pause and resume.',
    ],
  },
  memory: {
    title: 'Memory Match',
    goal: 'Find all 8 matching pairs of tech icons in as few moves as possible.',
    steps: [
      'Click a card to flip it over, then flip a second card to look for its match.',
      'Matching pairs stay face up; mismatches flip back — remember where they were!',
      'You can also navigate with the arrow keys and flip with Enter or Space.',
      'Match every pair to win. Your best move count is saved.',
    ],
  },
  minesweeper: {
    title: 'Minesweeper',
    goal: 'Reveal every safe cell without detonating a mine.',
    steps: [
      'Click a cell to reveal it. A number shows how many mines touch that cell.',
      'Use the numbers to deduce where mines are hiding.',
      'Right-click, long-press, or press F to flag a cell you suspect is a mine.',
      'Reveal all safe cells to win — but one wrong click on a mine ends the game.',
    ],
  },
  simon: {
    title: 'Simon Says',
    goal: 'Repeat an ever-growing sequence of colors for as long as you can.',
    steps: [
      'Watch the colored buttons flash in sequence.',
      'Repeat the sequence by clicking the buttons in the same order.',
      'Each round adds one more step to the sequence.',
      'You can also use keys 1–4 for the buttons. One wrong press ends the run.',
    ],
  },
  whack: {
    title: 'Whack-a-Mole',
    goal: 'Whack as many moles as you can before the 30-second timer runs out.',
    steps: [
      'Click a mole as soon as it pops out of its hole to score a point.',
      'Moles pop up faster as the game goes on — stay sharp!',
      'You can also use keys 1–9, which map to the 3×3 grid of holes.',
      'Beat your high score before the clock hits zero.',
    ],
  },
  lightsout: {
    title: 'Lights Out',
    goal: 'Turn off every light on the 5×5 grid in as few moves as possible.',
    steps: [
      'Click a light to toggle it along with its neighbors above, below, left, and right.',
      'Plan ahead — every press flips up to five lights at once.',
      'You can also move with the arrow keys and toggle with Enter or Space.',
      'Every puzzle is solvable. Your fewest-moves record is saved.',
    ],
  },
  2048: {
    title: '2048',
    goal: 'Merge matching tiles until you build the 2048 tile.',
    steps: [
      'Slide all tiles with the arrow keys (or WASD), or swipe on touch screens.',
      'Tiles with the same number merge into one when they collide.',
      'A new tile appears after every move, so keep the board tidy.',
      'Reach 2048 to win — then keep playing for a higher score if you like.',
    ],
  },
  connectfour: {
    title: 'Connect Four',
    goal: 'Connect four of your discs in a row — across, down, or diagonally — before the AI.',
    steps: [
      'Click a column to drop your disc; it falls to the lowest empty slot.',
      'Alternate turns with the AI and block its lines while building your own.',
      'You can also use the arrow keys plus Enter or Space, or press 1–7 to pick a column.',
      'Choose a difficulty to change how far ahead the AI thinks.',
    ],
  },
};
