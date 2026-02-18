import React from 'react';
import { useTheme } from './theme-context';
import { joinClasses } from './ThemedPrimitives.utils';

const SIZE_CLASSES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5',
  lg: 'px-8 py-4',
};

const VARIANTS = {
  primary: {
    neubrutalism:
      'bg-fun-yellow text-black border-nb border-[color:var(--color-border)] hover:-translate-x-0.5 hover:-translate-y-0.5',
    liquid:
      'liquid-button-primary lg-pill lg-spring-hover active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 motion-reduce:transform-none',
  },
  secondary: {
    neubrutalism:
      'bg-card text-primary border-nb border-[color:var(--color-border)] hover:-translate-x-0.5 hover:-translate-y-0.5',
    liquid:
      'lg-surface-3 lg-pill text-[color:var(--text-primary)] lg-spring-hover active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 motion-reduce:transform-none',
  },
  subtle: {
    neubrutalism:
      'bg-secondary text-primary border-nb border-[color:var(--color-border)] hover:-translate-x-0.5 hover:-translate-y-0.5',
    liquid:
      'lg-surface-2 lg-pill text-[color:var(--text-primary)] lg-spring-hover active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 motion-reduce:transform-none',
  },
};

const ThemedButton = ({
  as: Component = 'button',
  variant = 'secondary',
  size = 'md',
  isActive = false,
  className,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const themeKey = theme === 'liquid' ? 'liquid' : 'neubrutalism';

  const activeClasses =
    themeKey === 'neubrutalism' && isActive ? 'bg-fun-yellow text-black -translate-x-0.5 -translate-y-0.5' : '';

  return (
    <Component
      className={joinClasses(
        'inline-flex items-center gap-2 font-heading font-bold cursor-pointer transition-all duration-200 motion-reduce:transform-none motion-reduce:transition-none disabled:bg-secondary disabled:text-muted disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fun-yellow focus-visible:ring-offset-2',
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        VARIANTS[variant]?.[themeKey] ?? VARIANTS.secondary[themeKey],
        activeClasses,
        className
      )}
      style={{ ...(themeKey === 'neubrutalism' ? { boxShadow: 'var(--nb-shadow)' } : {}), ...style }}
      {...props}
    />
  );
};

export default ThemedButton;
