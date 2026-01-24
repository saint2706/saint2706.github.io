/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'accent': 'var(--color-accent)',
        'fun-pink': 'var(--color-fun-pink)',
        'fun-yellow': 'var(--color-fun-yellow)',
        // Neubrutalism palette
        'nb-yellow': '#FFEB3B',
        'nb-red': '#FF5252',
        'nb-blue': '#2196F3',
        'nb-black': '#000000',
        'nb-white': '#FFFFFF',
        // Glassmorphism palette (dark mode)
        'glass': {
          'bg': 'var(--glass-bg)',
          'border': 'var(--glass-border)',
          'highlight': 'var(--glass-highlight)',
        },
        'glow': {
          'purple': '#8b5cf6',
          'pink': '#ec4899',
          'blue': '#3b82f6',
          'cyan': '#06b6d4',
        },
      },
      textColor: {
        'primary': 'var(--color-text-primary)',
        'secondary': 'var(--color-text-secondary)',
        'muted': 'var(--color-text-muted)',
      },
      borderColor: {
        'default': 'var(--color-border)',
        'glass': 'var(--glass-border)',
      },
      backgroundColor: {
        'card': 'var(--color-card-bg)',
        'overlay': 'var(--color-overlay)',
        'skeleton': 'var(--color-skeleton)',
        'glass': 'var(--glass-bg)',
      },
      fontFamily: {
        'sans': ['DM Sans', 'sans-serif'],
        'heading': ['Space Grotesk', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'nb': 'var(--nb-shadow)',
        'nb-hover': 'var(--nb-shadow-hover)',
        // Glassmorphism glows
        'glow-sm': '0 0 15px var(--glow-color, rgba(139, 92, 246, 0.3))',
        'glow-md': '0 0 25px var(--glow-color, rgba(139, 92, 246, 0.4))',
        'glow-lg': '0 0 40px var(--glow-color, rgba(139, 92, 246, 0.5))',
        'glow-purple': '0 0 25px rgba(139, 92, 246, 0.4)',
        'glow-pink': '0 0 25px rgba(236, 72, 153, 0.4)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'nb': 'var(--nb-radius)',
        'glass': '16px',
      },
      borderWidth: {
        'nb': 'var(--nb-border-width)',
      },
      backdropBlur: {
        'glass': '12px',
        'glass-lg': '20px',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

