import React from 'react';

/**
 * A component that displays hidden text that is only revealed
 * when the custom cursor spotlight hovers over it.
 * 
 * Usage:
 * <HiddenReveal>This text is hidden until cursor hovers!</HiddenReveal>
 */
const HiddenReveal = ({ children, className = '' }) => {
    return (
        <span
            className={`hidden-reveal-text ${className}`}
            data-cursor-reveal="true"
        >
            {children}
        </span>
    );
};

export default HiddenReveal;
