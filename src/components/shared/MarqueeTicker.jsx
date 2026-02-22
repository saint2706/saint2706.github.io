/**
 * @fileoverview Neubrutalist marquee ticker band for tech stack display.
 * Full-width scrolling text with bold borders — classic brutalist/zine element.
 */

import React from 'react';

/** Default tech stack items for the ticker */
const DEFAULT_ITEMS = [
  'Python',
  'React',
  'SQL',
  'Tableau',
  'TensorFlow',
  'Pandas',
  'Machine Learning',
  'Data Science',
  'JavaScript',
  'Power BI',
  'Deep Learning',
  'NLP',
  'Computer Vision',
  'Statistics',
  'D3.js',
  'Git',
  'Docker',
  'AWS',
];

/**
 * MarqueeTicker — full-width scrolling band with neubrutalist or liquid styling
 *
 * @param {Object} props
 * @param {string[]} [props.items] - Text items to scroll
 * @param {string} [props.bgColor] - Background color class (default: bg-fun-yellow)
 * @param {'neub'|'liquid'} [props.variant] - Visual style variant
 * @param {boolean} [props.useBlurBand] - Adds a glassy blur backdrop for liquid variant
 * @param {string} [props.className] - Additional wrapper classes
 */
const MarqueeTicker = ({
  items = DEFAULT_ITEMS,
  bgColor = 'bg-fun-yellow',
  variant = 'neub',
  useBlurBand = false,
  className = '',
}) => {
  // Duplicate items for seamless loop
  const tickerContent = [...items, ...items];
  const isLiquid = variant === 'liquid';

  const wrapperClasses = isLiquid
    ? `${useBlurBand ? 'lg-surface-2' : bgColor} border-y border-[color:var(--border-soft)] py-2`
    : `border-y-[3px] border-black ${bgColor} py-3`;

  const itemClasses = isLiquid
    ? 'whitespace-nowrap px-6 font-heading text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--text-secondary)]'
    : 'whitespace-nowrap px-6 font-heading text-sm font-bold uppercase tracking-widest text-black';

  const separatorClasses = isLiquid
    ? 'mx-4 text-[color:var(--color-text-muted)]'
    : 'mx-4 text-fun-pink';

  return (
    <div
      className={`w-full overflow-hidden ${wrapperClasses} ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      <div className="nb-ticker">
        {tickerContent.map((item, i) => (
          <span key={`${item}-${i}`} className={itemClasses}>
            {item}
            <span className={separatorClasses}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeTicker;
