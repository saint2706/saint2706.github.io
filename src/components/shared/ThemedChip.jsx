import React from 'react';
import { useTheme } from './theme-context';
import { joinClasses } from './ThemedPrimitives.utils';

const VARIANTS = {
  yellow: {
    neubrutalism: 'bg-fun-yellow text-black border-2 border-[color:var(--color-border)] rounded-nb',
    liquid: 'lg-surface-3 lg-tint-amber lg-pill text-[color:var(--text-primary)]',
  },
  accent: {
    neubrutalism: 'bg-accent text-white border-2 border-[color:var(--color-border)] rounded-nb',
    liquid: 'lg-surface-3 lg-tint-blue lg-pill text-[color:var(--text-primary)]',
  },
  pink: {
    neubrutalism: 'bg-fun-pink text-white border-2 border-[color:var(--color-border)] rounded-nb',
    liquid: 'lg-surface-3 lg-tint-purple lg-pill text-[color:var(--text-primary)]',
  },
  neutral: {
    neubrutalism: 'bg-secondary text-primary border-2 border-[color:var(--color-border)] rounded-nb',
    liquid: 'lg-surface-3 lg-pill text-[color:var(--text-secondary)]',
  },
  sticker: {
    neubrutalism: 'bg-fun-yellow text-black border-2 border-[color:var(--color-border)] rounded-nb nb-sticker',
    liquid: 'lg-surface-3 lg-tint-amber lg-pill text-[color:var(--text-primary)]',
  },
};

/** Map shadow color names to colored micro-shadow values */
const SHADOW_COLORS = {
  yellow: 'var(--nb-shadow-color-yellow)',
  pink: 'var(--nb-shadow-color-pink)',
  blue: 'var(--nb-shadow-color-blue)',
  red: 'var(--nb-shadow-color-red)',
};

const ThemedChip = ({ as: Component = 'span', variant = 'neutral', shadowColor, className, style, ...props }) => {
  const { theme } = useTheme();
  const themeKey = theme === 'liquid' ? 'liquid' : 'neubrutalism';

  const chipShadow = themeKey === 'neubrutalism'
    ? `2px 2px 0 ${shadowColor && SHADOW_COLORS[shadowColor] ? SHADOW_COLORS[shadowColor] : 'var(--color-border)'}`
    : undefined;

  return (
    <Component
      className={joinClasses('inline-flex items-center gap-1 px-2 py-1 text-sm md:text-xs', VARIANTS[variant]?.[themeKey], className)}
      style={{ ...(chipShadow ? { boxShadow: chipShadow } : {}), ...style }}
      {...props}
    />
  );
};

export default ThemedChip;

