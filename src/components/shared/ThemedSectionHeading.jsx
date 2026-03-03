import React from 'react';
import ThemedChip from './ThemedChip';
import { joinClasses } from './ThemedPrimitives.utils';

/**
 * A themed heading component specifically designed for section titles, incorporating an icon and a stylized chip.
 *
 * @param {Object} props - The component props.
 * @param {React.ElementType} [props.as='h2'] - The HTML heading element to render as (e.g., 'h1', 'h2', 'h3').
 * @param {string} props.title - The text content of the heading.
 * @param {React.ReactNode} [props.icon] - An optional icon element to display before the title.
 * @param {'yellow'|'pink'|'blue'|'red'|'lime'|'coral'|'violet'|'orange'} [props.variant='yellow'] - The color variant for the chip background.
 * @param {string} [props.className] - Additional CSS classes to apply to the wrapping heading element.
 * @param {string} [props.chipClassName] - Additional CSS classes to apply to the inner chip element.
 * @returns {React.ReactElement} The themed section heading component.
 */
const ThemedSectionHeading = ({
  as: Component = 'h2',
  title,
  icon,
  variant = 'yellow',
  className,
  chipClassName,
}) => {
  return (
    <Component className={className}>
      <ThemedChip
        variant={variant}
        className={joinClasses('px-4 py-2 text-lg font-heading font-bold gap-2', chipClassName)}
      >
        {icon}
        <span>{title}</span>
      </ThemedChip>
    </Component>
  );
};

export default ThemedSectionHeading;
