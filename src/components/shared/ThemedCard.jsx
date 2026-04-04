import React from 'react';
import { useTheme } from './theme-context';
import { joinClasses, NB_SHADOW_COLOR_MAP } from './ThemedPrimitives.utils';

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
    neubrutalism:
      'bg-fun-yellow text-black border-nb border-[color:var(--color-border)] rounded-nb',
    liquid: 'lg-surface-2 lg-specular-rim',
  },
  decorated: {
    neubrutalism: 'bg-card border-nb border-[color:var(--color-border)] rounded-nb nb-halftone-bg',
    liquid: 'lg-surface-2 lg-specular-rim',
  },
};

/**
 * A highly reusable themed card component that adapts to both Neubrutalism and Liquid themes.
 *
 * @param {Object} props - The component props.
 * @param {React.ElementType} [props.as='div'] - The HTML element or React component to render as.
 * @param {'default'|'interactive'|'highlighted'|'decorated'} [props.variant='default'] - The visual variant of the card.
 * @param {'yellow'|'pink'|'blue'|'red'|'lime'|'coral'|'violet'|'orange'} [props.shadowColor] - Optional shadow color for the Neubrutalism theme.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @param {Object} [props.style] - Additional inline styles to apply.
 * @param {React.ReactNode} [props.children] - The contents of the card.
 * @returns {React.ReactElement} The themed card component.
 */
const ThemedCard = ({
  as: Component = 'div',
  variant = 'default',
  shadowColor,
  className,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const themeKey = theme === 'liquid' || theme === 'liquid-dark' ? 'liquid' : 'neubrutalism';

  const variantClasses = React.useMemo(
    () => VARIANTS[variant]?.[themeKey] ?? VARIANTS.default[themeKey],
    [variant, themeKey]
  );

  // Apply colored shadow class if specified (NB only)
  const coloredShadowClass = React.useMemo(
    () => (themeKey === 'neubrutalism' && shadowColor ? NB_SHADOW_COLOR_MAP[shadowColor] : ''),
    [themeKey, shadowColor]
  );

  const computedClassName = React.useMemo(
    () => joinClasses(variantClasses, coloredShadowClass, className),
    [variantClasses, coloredShadowClass, className]
  );

  const computedStyle = React.useMemo(
    () => ({
      ...(themeKey === 'neubrutalism' && !shadowColor ? { boxShadow: 'var(--nb-shadow)' } : {}),
      ...style,
    }),
    [themeKey, shadowColor, style]
  );

  return <Component className={computedClassName} style={computedStyle} {...props} />;
};

export default ThemedCard;
