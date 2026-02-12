/**
 * PostCSS Configuration
 *
 * Configures PostCSS plugins for CSS processing.
 * - @tailwindcss/postcss: Processes Tailwind CSS utility classes (v4+)
 * - autoprefixer: Automatically adds vendor prefixes for cross-browser compatibility
 *
 * @see https://postcss.org/
 */

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
