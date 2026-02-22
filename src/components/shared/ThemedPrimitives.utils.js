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
  card: 'lg-surface-2 text-[color:var(--text)]',
  accent: 'lg-surface-2 lg-tint-blue text-[color:var(--text)]',
  pink: 'lg-surface-2 lg-tint-purple text-[color:var(--text)]',
  secondary: 'lg-surface-3 text-[color:var(--text)]',
  yellow: 'lg-surface-3 lg-tint-amber text-[color:var(--text)]',
};

const NB_SHADOW_BY_DEPTH = {
  default: 'var(--nb-shadow)',
  hover: 'var(--nb-shadow-hover)',
  subtle: '2px 2px 0 var(--color-border)',
};

const LIQUID_SHADOW_BY_DEPTH = {
  default: 'var(--glass-drop-shadow, 0 8px 32px rgba(0,0,0,0.08))',
  hover: 'var(--glass-drop-shadow-hover, 0 12px 40px rgba(0,0,0,0.12))',
  subtle: 'var(--glass-drop-shadow-subtle, 0 2px 8px rgba(0,0,0,0.05))',
};

export const getOverlayShell = ({
  theme,
  tone = 'card',
  depth = 'default',
  className = '',
} = {}) => {
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
        ? (LIQUID_SHADOW_BY_DEPTH[depth] ?? LIQUID_SHADOW_BY_DEPTH.default)
        : (NB_SHADOW_BY_DEPTH[depth] ?? NB_SHADOW_BY_DEPTH.default),
    },
  };
};
