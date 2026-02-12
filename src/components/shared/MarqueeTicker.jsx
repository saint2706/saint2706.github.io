/**
 * @fileoverview Neubrutalist marquee ticker band for tech stack display.
 * Full-width scrolling text with bold borders — classic brutalist/zine element.
 */

import React from 'react';

/** Default tech stack items for the ticker */
const DEFAULT_ITEMS = [
    'Python', 'React', 'SQL', 'Tableau', 'TensorFlow', 'Pandas',
    'Machine Learning', 'Data Science', 'JavaScript', 'Power BI',
    'Deep Learning', 'NLP', 'Computer Vision', 'Statistics',
    'D3.js', 'Git', 'Docker', 'AWS',
];

/**
 * MarqueeTicker — full-width scrolling band with neubrutalist styling
 *
 * @param {Object} props
 * @param {string[]} [props.items] - Text items to scroll
 * @param {string} [props.bgColor] - Background color class (default: bg-fun-yellow)
 * @param {string} [props.className] - Additional wrapper classes
 */
const MarqueeTicker = ({
    items = DEFAULT_ITEMS,
    bgColor = 'bg-fun-yellow',
    className = '',
}) => {
    // Duplicate items for seamless loop
    const tickerContent = [...items, ...items];

    return (
        <div
            className={`w-full overflow-hidden border-y-[3px] border-black ${bgColor} py-3 ${className}`}
            aria-hidden="true"
            role="presentation"
        >
            <div className="nb-ticker">
                {tickerContent.map((item, i) => (
                    <span
                        key={`${item}-${i}`}
                        className="whitespace-nowrap px-6 font-heading text-sm font-bold uppercase tracking-widest text-black"
                    >
                        {item}
                        <span className="mx-4 text-fun-pink">◆</span>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default MarqueeTicker;
