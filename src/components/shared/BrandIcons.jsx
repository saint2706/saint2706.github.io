/**
 * @fileoverview Brand logo icons (GitHub, LinkedIn) dropped from lucide-react in its
 * v1.0 release (https://lucide.dev/guide/react/migration). Reproduced locally, matching
 * lucide's icon component API, so social links keep the same outline style as the rest
 * of the icon set instead of switching to filled brand marks.
 */

import { forwardRef } from 'react';

const svgAttributes = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const createBrandIcon = (displayName, children) => {
  const Component = forwardRef(
    ({ color = 'currentColor', size = 24, strokeWidth = 2, className = '', ...rest }, ref) => (
      <svg
        ref={ref}
        {...svgAttributes}
        width={size}
        height={size}
        stroke={color}
        strokeWidth={strokeWidth}
        className={className}
        {...rest}
      >
        {children}
      </svg>
    )
  );
  Component.displayName = displayName;
  return Component;
};

export const Github = createBrandIcon('Github', [
  <path
    key="body"
    d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
  />,
  <path key="tail" d="M9 18c-4.51 2-5-2-7-2" />,
]);

export const Linkedin = createBrandIcon('Linkedin', [
  <path
    key="body"
    d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
  />,
  <rect key="bar" width="4" height="12" x="2" y="9" />,
  <circle key="dot" cx="4" cy="4" r="2" />,
]);
