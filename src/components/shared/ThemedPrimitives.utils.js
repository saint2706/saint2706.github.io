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

const AURA_SURFACE_BY_TONE = {
  card: 'aura-glass text-[color:var(--text-primary)]',
  accent: 'aura-glass text-[color:var(--text-primary)]',
  pink: 'aura-glass text-[color:var(--text-primary)]',
  secondary: 'bg-[color:var(--surface-muted)] text-[color:var(--text-primary)]',
  yellow: 'bg-[color:var(--surface-muted)] text-[color:var(--text-primary)]',
};

const NB_SHADOW_BY_DEPTH = {
  default: 'var(--nb-shadow)',
  hover: 'var(--nb-shadow-hover)',
  subtle: '2px 2px 0 var(--color-border)',
};

const AURA_SHADOW_BY_DEPTH = {
  default: '0 20px 52px rgba(5, 10, 24, 0.46)',
  hover: '0 24px 60px rgba(5, 10, 24, 0.52)',
  subtle: '0 10px 24px rgba(5, 10, 24, 0.34)',
};

export const getOverlayShell = ({ theme, tone = 'card', depth = 'default', className = '' } = {}) => {
  const isAura = theme === 'aura';
  return {
    className: joinClasses(
      isAura
        ? `${AURA_SURFACE_BY_TONE[tone] ?? AURA_SURFACE_BY_TONE.card} border border-[color:var(--border-soft)] rounded-2xl`
        : `${NB_SURFACE_BY_TONE[tone] ?? NB_SURFACE_BY_TONE.card} border-nb border-[color:var(--color-border)] rounded-nb`,
      className
    ),
    style: {
      boxShadow: isAura
        ? AURA_SHADOW_BY_DEPTH[depth] ?? AURA_SHADOW_BY_DEPTH.default
        : NB_SHADOW_BY_DEPTH[depth] ?? NB_SHADOW_BY_DEPTH.default,
    },
  };
};
