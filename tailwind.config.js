/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'accent': 'var(--color-accent)',
        'fun-pink': 'var(--color-fun-pink)',
        'fun-yellow': 'var(--color-fun-yellow)',
      },
      textColor: {
        'primary': 'var(--color-text-primary)',
        'secondary': 'var(--color-text-secondary)',
        'muted': 'var(--color-text-muted)',
      },
      borderColor: {
        'default': 'var(--color-border)',
      },
      backgroundColor: {
        'card': 'var(--color-card-bg)',
        'overlay': 'var(--color-overlay)',
        'skeleton': 'var(--color-skeleton)',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
