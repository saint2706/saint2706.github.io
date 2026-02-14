import React from 'react';
import { useTheme } from './theme-context';
import { joinClasses } from './ThemedPrimitives.utils';

const VARIANTS = {
  default: {
    neubrutalism: 'bg-card border-nb border-[color:var(--color-border)] rounded-nb',
    aura: 'aura-glass border border-[color:var(--border-soft)] rounded-2xl',
  },
  interactive: {
    neubrutalism:
      'bg-card border-nb border-[color:var(--color-border)] rounded-nb transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none',
    aura:
      'aura-glass aura-interactive-surface border border-[color:var(--border-soft)] rounded-2xl transition-[filter,transform] hover:brightness-110 hover:scale-[1.01] motion-reduce:transform-none motion-reduce:transition-none',
  },
  highlighted: {
    neubrutalism: 'bg-fun-yellow text-black border-nb border-[color:var(--color-border)] rounded-nb',
    aura: 'aura-glass border border-[color:var(--border-soft)] rounded-2xl',
  },
};

const ThemedCard = ({ as: Component = 'div', variant = 'default', className, style, ...props }) => {
  const { theme } = useTheme();
  const themeKey = theme === 'aura' ? 'aura' : 'neubrutalism';
  const variantClasses = VARIANTS[variant]?.[themeKey] ?? VARIANTS.default[themeKey];

  return (
    <Component
      className={joinClasses(variantClasses, className)}
      style={{ ...(themeKey === 'neubrutalism' ? { boxShadow: 'var(--nb-shadow)' } : {}), ...style }}
      {...props}
    />
  );
};

export default ThemedCard;
