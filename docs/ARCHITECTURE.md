# Architecture Overview

This document describes the high-level architecture of the Rishabh Agrawal Portfolio application. It is a single-page React application built with Vite, focusing on performance, accessibility, and a unique dual-theme design system.

## Directory Structure

```
src/
├── components/          # React components
│   ├── games/           # Interactive game components (Snake, Minesweeper, etc.)
│   ├── layout/          # Global layout structure (Navbar, Footer, Layout)
│   ├── pages/           # Top-level route components
│   └── shared/          # Reusable UI primitives and utilities
├── data/                # Static data (resume, blog posts, code snippets)
├── services/            # External API integrations (Gemini AI)
├── utils/               # Helper functions (security, storage, SEO)
└── App.jsx              # Main application entry point with routing
```

## Key Components

### 1. `Layout` (`src/components/layout/Layout.jsx`)

The core wrapper for all pages. It handles:

- **Theme Application**: Applies the `data-theme` attribute to the root element.
- **Custom Cursor**: Manages the custom cursor state and rendering.
- **Accessibility**: Handles reduced motion and high contrast preferences.
- **Global Shortcuts**: Listens for global keyboard shortcuts (e.g., `Ctrl+K` for Command Palette).
- **Navigation**: Renders the `Navbar` and `Footer`.

### 2. `App` (`src/App.jsx`)

The main application component that sets up the React Router. It uses `React.lazy` and `Suspense` for code splitting, ensuring that pages and heavy components (like games) are loaded only when needed. It also manages the scroll-to-top behavior on route changes.

### 3. `Chatbot` (`src/components/shared/Chatbot.jsx`)

A floating action button (FAB) that expands to reveal the AI chat and "Roast My Resume" features. It uses lazy loading to fetch the `ChatInterface` and `RoastInterface` components only when the user interacts with the FAB, keeping the initial bundle size small.

### 4. `ThemeContext` (`src/components/shared/theme-context.js`)

A React Context that provides the current theme (`neubrutalism` or `liquid`) and functions to toggle it. This context is consumed by almost all UI components to adapt their visual style.

## Data Flow

- **Static Data**: The application relies heavily on static data files in `src/data/` (e.g., `resume.js`). This data is used to populate the Resume page, Projects page, and is also consumed by the AI service to provide context for the chatbot.
- **AI Integration**: The `src/services/ai.js` module handles communication with the Google Gemini API. It includes rate limiting, input sanitization, and error handling to ensure a robust and secure experience.
- **Local Storage**: User preferences (theme, custom cursor state, game high scores) and chat history are persisted in `localStorage` using safe utility wrappers in `src/utils/storage.js`.

## Security

Security is a primary concern.

- **CSP**: A strict Content Security Policy is enforced via `index.html`, and the file only allows external `<script src="...">` references (no inline scripts).
- **SEO Schema Strategy**: JSON-LD schema markup is injected dynamically through `src/components/shared/SEOHead.jsx` so route-level metadata stays data-driven instead of being hardcoded in `index.html`.
- **Sanitization**: All user inputs are sanitized before being processed or rendered.
- **SRI**: Subresource Integrity is verified for external scripts like Pyodide.
- **Secrets**: API keys are managed via environment variables and checked for leaks during the build process.

## Performance Optimization

- **Code Splitting**: Route-based and component-based code splitting using `React.lazy`.
- **Asset Optimization**: Images are optimized and served in modern formats.
- **Memoization**: Heavy computations (e.g., Markdown rendering, game logic) are memoized using `React.memo` and `useMemo`.
- **Virtualization**: Large lists (like chat history) are rendered efficiently.
