/**
 * Tailwind CSS Configuration
 *
 * Custom design system configuration for the portfolio website.
 * Defines color palettes, typography, animations, and custom utilities.
 *
 * Design Systems:
 * - Neubrutalism: Bold, high-contrast design with thick borders and shadows
 * - Glassmorphism: Frosted glass effect with blur and transparency for dark mode
 * - Custom animations: Glow effects, floating elements, and ticker animations
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors using CSS variables for theme switching
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        'fun-pink': 'var(--color-fun-pink)',
        'fun-yellow': 'var(--color-fun-yellow)',

        // Neubrutalism Design System
        // Bold, playful colors for high-contrast brutalist design
        'nb-yellow': '#FFEB3B',
        'nb-red': '#FF5252',
        'nb-blue': '#2196F3',
        'nb-black': '#000000',
        'nb-white': '#FFFFFF',

        // Glassmorphism Design System (Dark Mode)
        // Semi-transparent colors for frosted glass effect
        glass: {
          bg: 'var(--glass-bg)',
          border: 'var(--glass-border)',
          highlight: 'var(--glass-highlight)',
        },

        // Glow Effect Colors
        // Used for accent lighting and focus states
        glow: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
      },
      textColor: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        muted: 'var(--color-text-muted)',
      },
      borderColor: {
        default: 'var(--color-border)',
        glass: 'var(--glass-border)',
      },
      backgroundColor: {
        card: 'var(--color-card-bg)',
        overlay: 'var(--color-overlay)',
        skeleton: 'var(--color-skeleton)',
        glass: 'var(--glass-bg)',
      },
      fontFamily: {
        // Custom font stacks for different text styles
        sans: ['DM Sans', 'sans-serif'], // Body text
        heading: ['Space Grotesk', 'sans-serif'], // Headings and titles
        mono: ['Fira Code', 'monospace'], // Code blocks
      },
      boxShadow: {
        // Neubrutalism shadows: Offset shadows for depth effect
        nb: 'var(--nb-shadow)',
        'nb-hover': 'var(--nb-shadow-hover)',
        'nb-xl': 'var(--nb-shadow-xl)',
        'nb-pressed': 'var(--nb-shadow-pressed)',

        // Glassmorphism glow effects: Soft luminous halos
        'glow-sm': '0 0 15px var(--glow-color, rgba(139, 92, 246, 0.3))',
        'glow-md': '0 0 25px var(--glow-color, rgba(139, 92, 246, 0.4))',
        'glow-lg': '0 0 40px var(--glow-color, rgba(139, 92, 246, 0.5))',

        // Colored glow variants
        'glow-purple': '0 0 25px rgba(139, 92, 246, 0.4)',
        'glow-pink': '0 0 25px rgba(236, 72, 153, 0.4)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.4)',

        // Glass effect shadow
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        nb: 'var(--nb-radius)',
        glass: '16px',
      },
      borderWidth: {
        nb: 'var(--nb-border-width)',
      },
      backdropBlur: {
        glass: '12px',
        'glass-lg': '20px',
      },
      animation: {
        // Pulsing glow effect for interactive elements
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        // Shimmer effect for loading states and highlights
        shimmer: 'shimmer 2s linear infinite',
        // Floating animation for decorative elements
        float: 'float 6s ease-in-out infinite',
        // Continuous horizontal scroll for ticker displays
        ticker: 'ticker 30s linear infinite',
        // Neubrutalist stamp-in entrance
        'nb-stamp': 'nb-stamp-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
      keyframes: {
        // Pulsing glow: Breathe effect for glowing elements
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        // Shimmer: Moving gradient effect for loading/highlight
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Float: Gentle up-down motion for decorative elements
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        // Ticker: Continuous horizontal scroll
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // Neubrutalist stamp-in: rubber stamp thwack
        'nb-stamp-in': {
          '0%': { opacity: '0', transform: 'scale(1.15) rotate(3deg)' },
          '60%': { opacity: '1', transform: 'scale(0.97) rotate(-0.5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
};
