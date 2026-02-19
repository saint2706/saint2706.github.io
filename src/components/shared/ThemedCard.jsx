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
      'bg-card border-nb border-[color:var(--color-border)] rounded-nb transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 nb-squish motion-reduce:transform-none motion-reduce:transition-none',
    liquid:
      'lg-surface-2 lg-specular-rim lg-spring-hover motion-reduce:transform-none motion-reduce:transition-none',
  },
  highlighted: {
    neubrutalism: 'bg-fun-yellow text-black border-nb border-[color:var(--color-border)] rounded-nb',
    liquid: 'lg-surface-2 lg-specular-rim',
  },
  decorated: {
    neubrutalism: 'bg-card border-nb border-[color:var(--color-border)] rounded-nb nb-halftone-bg',
    liquid: 'lg-surface-2 lg-specular-rim',
  },
};

/** Map shadow color names to NB 2.0 colored shadow CSS classes */
const NB_SHADOW_COLOR_MAP = {
  yellow: 'nb-shadow-yellow',
  pink: 'nb-shadow-pink',
  blue: 'nb-shadow-blue',
  red: 'nb-shadow-red',
  lime: 'nb-shadow-lime',
  coral: 'nb-shadow-coral',
  violet: 'nb-shadow-violet',
  orange: 'nb-shadow-orange',
};

const ThemedCard = ({ as: Component = 'div', variant = 'default', shadowColor, className, style, ...props }) => {
  const { theme } = useTheme();
  const themeKey = theme === 'liquid' ? 'liquid' : 'neubrutalism';
  const variantClasses = VARIANTS[variant]?.[themeKey] ?? VARIANTS.default[themeKey];

  // Apply colored shadow class if specified (NB only)
  const coloredShadowClass = themeKey === 'neubrutalism' && shadowColor ? NB_SHADOW_COLOR_MAP[shadowColor] : '';

  return (
    <Component
      className={joinClasses(variantClasses, coloredShadowClass, className)}
      style={{
        ...(themeKey === 'neubrutalism' && !shadowColor ? { boxShadow: 'var(--nb-shadow)' } : {}),
        ...style,
      }}
      {...props}
    />
  );
};

export default ThemedCard;

