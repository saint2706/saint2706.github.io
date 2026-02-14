import React from 'react';
import ThemedChip from './ThemedChip';
import { joinClasses } from './ThemedPrimitives.utils';

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
