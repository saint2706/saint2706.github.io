/**
 * @fileoverview Neubrutalist zigzag SVG divider.
 * Bold geometric section separator replacing thin borders.
 */

import React from 'react';

/**
 * ZigzagDivider — decorative section divider with variant-driven styles
 *
 * @param {Object} props
 * @param {'zigzag'|'gradient'|'soft'|'none'} [props.variant] - Divider style
 * @param {string} [props.fillColor] - Fill color for the zigzag (default: black)
 * @param {number} [props.height] - Height in pixels (default: 20)
 * @param {string} [props.className] - Additional wrapper classes
 */
const ZigzagDivider = ({ variant = 'zigzag', fillColor = '#000000', height = 20, className = '' }) => {
  if (variant === 'none') {
    return null;
  }

  if (variant === 'gradient') {
    return (
      <div
        className={`w-full ${className}`}
        style={{
          height: '2px',
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-accent) 50%, transparent) 20%, color-mix(in srgb, var(--color-accent) 75%, white) 50%, color-mix(in srgb, var(--color-accent) 50%, transparent) 80%, transparent 100%)',
        }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'soft') {
    return (
      <div
        className={`w-full ${className}`}
        style={{
          height: '1px',
          background: 'color-mix(in srgb, var(--color-text-secondary) 30%, transparent)',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: `${height}px` }}
      >
        <path
          d="M0 20 L30 0 L60 20 L90 0 L120 20 L150 0 L180 20 L210 0 L240 20 L270 0 L300 20 L330 0 L360 20 L390 0 L420 20 L450 0 L480 20 L510 0 L540 20 L570 0 L600 20 L630 0 L660 20 L690 0 L720 20 L750 0 L780 20 L810 0 L840 20 L870 0 L900 20 L930 0 L960 20 L990 0 L1020 20 L1050 0 L1080 20 L1110 0 L1140 20 L1170 0 L1200 20 L1200 40 L0 40 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};

export default ZigzagDivider;
