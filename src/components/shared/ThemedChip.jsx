import React from 'react';
import { useTheme } from './theme-context';
import { joinClasses } from './ThemedPrimitives.utils';

const VARIANTS = {
  yellow: {
    neubrutalism: 'bg-fun-yellow text-black border-2 border-[color:var(--color-border)] rounded-nb',
    liquid:
      'liquid-chip liquid-glow-transition border border-[color:var(--border-soft)] text-[color:var(--color-text-primary)]',
  },
  accent: {
    neubrutalism: 'bg-accent text-white border-2 border-[color:var(--color-border)] rounded-nb',
    liquid:
      'liquid-chip liquid-glow-transition border border-[color:var(--border-soft)] text-[color:var(--color-text-primary)]',
  },
  pink: {
    neubrutalism: 'bg-fun-pink text-white border-2 border-[color:var(--color-border)] rounded-nb',
    liquid:
      'liquid-chip liquid-glow-transition border border-[color:var(--border-soft)] text-[color:var(--color-text-primary)]',
  },
  neutral: {
    neubrutalism: 'bg-secondary text-primary border-2 border-[color:var(--color-border)] rounded-nb',
    liquid:
      'liquid-chip liquid-glow-transition border border-[color:var(--border-soft)] text-[color:var(--color-text-secondary)]',
  },
};

const ThemedChip = ({ as: Component = 'span', variant = 'neutral', className, style, ...props }) => {
  const { theme } = useTheme();
  const themeKey = theme === 'liquid' ? 'liquid' : 'neubrutalism';

  return (
    <Component
      className={joinClasses('inline-flex items-center gap-1 px-2 py-1 text-sm md:text-xs', VARIANTS[variant]?.[themeKey], className)}
      style={{ ...(themeKey === 'neubrutalism' ? { boxShadow: '2px 2px 0 var(--color-border)' } : {}), ...style }}
      {...props}
    />
  );
};

export default ThemedChip;
