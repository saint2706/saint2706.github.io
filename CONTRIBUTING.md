# Contributing Guide

This document outlines the workflow and standards for maintaining the portfolio codebase.

## Project Structure

The project follows a standard React application structure:

- `src/components/layout`: Global layout components (Navbar, Footer, Layout).
- `src/components/pages`: Top-level page components.
- `src/components/shared`: Reusable UI components and hooks used across multiple pages.
- `src/components/games`: Interactive game components and logic.
- `src/data`: Static data files (resume, blogs, snippets).
- `src/services`: API integration services (AI, etc.).
- `src/utils`: Utility functions (security, storage, seo).
- `scripts/`: Build and verification scripts (security checks, sitemap generation).
- `public/`: Static assets (images, fonts, llms.txt).

## Theme System

The application uses a dual-theme system ("Neubrutalism" and "Liquid") managed by `src/components/shared/theme-context.js`.

- **Neubrutalism**: Bold borders, hard shadows, high contrast.
- **Liquid**: Translucent glassmorphism, soft gradients, fluid motion.

Components should use the `useTheme()` hook to adapt their rendering. Shared styling logic is centralized in:

- `src/components/games/gameThemeStyles.js`: For game-specific styles.
- `src/components/shared/ThemedPrimitives.utils.js`: For overlay shells (modals, cards).
- `src/components/shared/themeMotion.js`: For Framer Motion variants.

See `docs/THEMING.md` for more details.

## Development Workflow

1.  **Clone**: Clone the repository to your local machine.
2.  **Install Dependencies**: This project uses `pnpm`. Run `pnpm install` to ensure consistent lockfiles.
3.  **Branch**: Create a feature branch for your changes (e.g., `feature/new-game` or `fix/typo`).

## Code Standards

- **Linting**: Run `pnpm lint` to check for code quality issues.
- **Formatting**: Run `pnpm format` to automatically format code with Prettier.
- **Testing**: Run `pnpm test` to execute the unit test suite.

## Testing & Verification

We employ a comprehensive testing strategy including unit tests, security scans, and build verification.

- **Unit Tests**: `pnpm test` (Vitest) covers logic and component rendering.
- **Security**: `pnpm test:security-full` runs a suite of security checks:
  - `test:security`: Verifies utility functions.
  - `test:csp`: Checks `index.html` for strict Content Security Policy.
  - `verify:sri`: Ensures Pyodide script integrity.
  - `audit-deps`: Checks for vulnerable dependencies.
  - `scan-secrets`: Scans source code for hardcoded secrets.

Please ensure all checks pass before submitting a Pull Request.

## Pull Request Process

1.  Ensure all tests pass locally (`pnpm test` and `pnpm test:security-full`).
2.  Update documentation if you've added new features or changed existing ones.
3.  Submit a Pull Request with a clear description of your changes.
4.  The CI pipeline will automatically run linting, tests, and build checks.

## Security

Please refer to `.jules/sentinel.md` for security policies, including vulnerability reporting and mitigation strategies.

## License

This project is private and proprietary.
