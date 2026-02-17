/**
 * Utility to join CSS classes efficiently.
 * Optimized to avoid intermediate array allocation (filter+join).
 * @param {...(string|false|null|undefined)} classes - CSS classes to join.
 * @returns {string} Combined CSS class string.
 */
export const joinClasses = (...classes) => {
  let str = '';
  for (let i = 0; i < classes.length; i++) {
    const c = classes[i];
    if (c) {
      if (str) str += ' ';
      str += c;
    }
  }
  return str;
};

const NB_SURFACE_BY_TONE = {
  card: 'bg-card',
  accent: 'bg-accent text-white',
  pink: 'bg-fun-pink text-white',
  secondary: 'bg-secondary',
  yellow: 'bg-fun-yellow text-black',
};

const LIQUID_SURFACE_BY_TONE = {
  card: 'liquid-glass text-[color:var(--text)]',
  accent: 'liquid-glass text-[color:var(--text)]',
  pink: 'liquid-glass text-[color:var(--text)]',
  secondary: 'bg-[color:var(--surface-muted)] text-[color:var(--text)]',
  yellow: 'bg-[color:var(--surface-muted)] text-[color:var(--text)]',
};

const NB_SHADOW_BY_DEPTH = {
  default: 'var(--nb-shadow)',
  hover: 'var(--nb-shadow-hover)',
  subtle: '2px 2px 0 var(--color-border)',
};

const LIQUID_SHADOW_BY_DEPTH = {
  default: '0 10px 28px rgba(5, 10, 24, 0.28)',
  hover: '0 14px 34px rgba(5, 10, 24, 0.34)',
  subtle: '0 6px 16px rgba(5, 10, 24, 0.2)',
};

export const getOverlayShell = ({ theme, tone = 'card', depth = 'default', className = '' } = {}) => {
  const isLiquid = theme === 'liquid';
  return {
    className: joinClasses(
      isLiquid
        ? `${LIQUID_SURFACE_BY_TONE[tone] ?? LIQUID_SURFACE_BY_TONE.card} border border-[color:var(--border-soft)] rounded-2xl`
        : `${NB_SURFACE_BY_TONE[tone] ?? NB_SURFACE_BY_TONE.card} border-nb border-[color:var(--color-border)] rounded-nb`,
      className
    ),
    style: {
      boxShadow: isLiquid
        ? LIQUID_SHADOW_BY_DEPTH[depth] ?? LIQUID_SHADOW_BY_DEPTH.default
        : NB_SHADOW_BY_DEPTH[depth] ?? NB_SHADOW_BY_DEPTH.default,
    },
  };
};
