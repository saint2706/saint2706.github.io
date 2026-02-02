/**
 * @fileoverview Hidden text reveal component for custom cursor spotlight effect.
 * Text is only visible when custom cursor hovers over it.
 */

import React from 'react';

/**
 * Hidden reveal component for text that appears under custom cursor
 *
 * Usage: Wrap text that should only be visible when the custom cursor
 * spotlight hovers over it. Requires custom cursor to be enabled and
 * CSS styling to implement the reveal effect.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Text content to reveal
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Span with reveal data attribute
 *
 * @example
 * <HiddenReveal>This text is hidden until cursor hovers!</HiddenReveal>
 */
const HiddenReveal = ({ children, className = '' }) => {
  return (
    <span className={`hidden-reveal-text ${className}`} data-cursor-reveal="true">
      {children}
    </span>
  );
};

export default HiddenReveal;
