import React from 'react';
import { useTheme } from './theme-context';
import { joinClasses } from './ThemedPrimitives.utils';

const VARIANTS = {
  default: {
    neubrutalism: 'bg-card border-nb border-[color:var(--color-border)] rounded-nb',
    liquid: 'lg-surface-2 lg-specular-rim',
  },
  interactive: {
    neubrutalism:
      'bg-card border-nb border-[color:var(--color-border)] rounded-nb transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none',
    liquid:
      'lg-surface-2 lg-specular-rim lg-spring-hover motion-reduce:transform-none motion-reduce:transition-none',
  },
  highlighted: {
    neubrutalism: 'bg-fun-yellow text-black border-nb border-[color:var(--color-border)] rounded-nb',
    liquid: 'lg-surface-2 lg-specular-rim',
  },
};

const ThemedCard = ({ as: Component = 'div', variant = 'default', className, style, ...props }) => {
  const { theme } = useTheme();
  const themeKey = theme === 'liquid' ? 'liquid' : 'neubrutalism';
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
