/**
 * Game Theme Styles Utility
 *
 * Provides a centralized way to generate class names and inline styles for game components,
 * switching between "Liquid" and "Neubrutalism" themes based on the `isLiquid` flag.
 *
 * @module components/games/gameThemeStyles
 */

const join = (...parts) => parts.filter(Boolean).join(' ');

/**
 * Generates theme-specific styles and classes for game components.
 *
 * @param {boolean} isLiquid - Whether the current theme is "Liquid" (true) or "Neubrutalism" (false).
 * @returns {object} An object containing Tailwind class strings and inline style objects for various game elements.
 * @property {string} scoreboard - Classes for the score display container.
 * @property {string} statBlock - Classes for individual statistic blocks.
 * @property {string} separator - Classes for the separator line between stats.
 * @property {string} boardShell - Classes for the outer container of the game board.
 * @property {string} boardPadding - Padding classes for the board.
 * @property {string} overlay - Classes for the game over/start overlay.
 * @property {string} banner - Classes for game banners.
 * @property {string} statusBanner - Classes for status messages.
 * @property {string} buttonPrimary - Classes for primary action buttons.
 * @property {string} buttonSecondary - Classes for secondary/utility buttons.
 * @property {string} tileBase - Base classes for game tiles/cells.
 * @property {string} tileIdle - Classes for inactive/empty tiles.
 * @property {string} tileActive - Classes for active/selected tiles.
 * @property {string} tileWin - Classes for winning state tiles.
 * @property {object} style - Object containing inline styles for specific effects (like shadows).
 */
export const getGameThemeStyles = isLiquid => {
  const panel = isLiquid
    ? 'lg-surface-2 rounded-2xl'
    : 'border-[3px] border-[color:var(--color-border)]';

  return {
    scoreboard: join('flex p-4', isLiquid ? 'gap-5' : 'gap-4 bg-secondary', panel),
    statBlock: 'px-3 md:px-4',
    separator: isLiquid
      ? 'w-px bg-[color:var(--border-soft)]'
      : 'w-[3px] bg-[color:var(--color-border)]',
    boardShell: join(isLiquid ? 'lg-surface-2 rounded-2xl' : 'bg-card', panel),
    boardPadding: isLiquid ? 'p-3' : 'p-4',
    overlay: join(
      'absolute inset-0 flex flex-col items-center justify-center gap-4',
      isLiquid
        ? 'lg-surface-2 rounded-2xl backdrop-blur-md bg-primary/75'
        : 'bg-primary/90 border-[3px] border-[color:var(--color-border)]'
    ),
    banner: join(
      'font-heading font-bold px-4 py-2',
      isLiquid
        ? 'rounded-xl border border-[color:var(--border-soft)] backdrop-blur-sm'
        : 'border-[3px] border-[color:var(--color-border)]'
    ),
    statusBanner: join(
      'px-4 py-2 font-heading font-bold',
      isLiquid
        ? 'lg-surface-2 rounded-xl'
        : 'bg-secondary border-[3px] border-[color:var(--color-border)]'
    ),
    buttonPrimary: join(
      'px-6 py-3 font-heading font-bold flex items-center gap-2 cursor-pointer transition-transform motion-reduce:transform-none motion-reduce:transition-none',
      isLiquid
        ? 'bg-accent/90 text-white border border-[color:var(--border-soft)] rounded-xl hover:brightness-110'
        : 'bg-accent text-white border-[3px] border-[color:var(--color-border)] hover:-translate-y-0.5'
    ),
    buttonSecondary: join(
      'px-6 py-2 font-heading font-bold flex items-center gap-2 cursor-pointer transition-transform motion-reduce:transform-none motion-reduce:transition-none',
      isLiquid
        ? 'lg-surface-2 text-[color:var(--text-primary)] rounded-xl hover:brightness-110'
        : 'bg-fun-yellow text-black border-[3px] border-[color:var(--color-border)] hover:-translate-y-0.5'
    ),
    tileBase: join(
      'font-heading font-bold select-none transition-all motion-reduce:transition-none',
      isLiquid
        ? 'border border-[color:var(--border-soft)] rounded-xl'
        : 'border-[3px] border-[color:var(--color-border)] rounded-nb'
    ),
    tileIdle: isLiquid ? 'bg-[color:var(--surface-muted)]/80' : 'bg-card',
    tileActive: isLiquid
      ? 'lg-tint-blue bg-accent/80 text-white'
      : 'bg-accent text-white -translate-x-0.5 -translate-y-0.5',
    tileWin: isLiquid ? 'lg-tint-amber bg-fun-yellow/40 border-fun-yellow/70' : 'bg-fun-yellow',
    style: {
      raised: isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' },
      board: isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' },
      tile: isLiquid ? undefined : { boxShadow: 'var(--nb-shadow)' },
      tileActive: isLiquid ? undefined : { boxShadow: 'var(--nb-shadow-hover)' },
    },
  };
};
