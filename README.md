# Rishabh's Portfolio

[![CI](https://github.com/saint2706/saint2706.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/saint2706/saint2706.github.io/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/saint2706/saint2706.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/saint2706/saint2706.github.io/actions/workflows/deploy.yml)

Welcome to the repository for my personal portfolio website. This project showcases my skills in frontend development, Python integration, and AI-powered interactions. It is built with modern web technologies and features a unique dual-theme design system.

## 🚀 Features

- **Dual Theme System**: Toggle between "Neubrutalism" (bold, high-contrast) and "Liquid" (editorial, translucent) themes.
- **AI Integration**: Chat with a digital version of myself powered by Google's Gemini AI.
- **Python Playground**: Run Python code directly in the browser using Pyodide, with standard output capture.
- **Interactive Games**: Includes implementations of Snake, Minesweeper, Tic-Tac-Toe, Simon Says, Memory Match, Whack-A-Mole, and Lights Out.
- **Security First**: strict Content Security Policy (CSP), Subresource Integrity (SRI), and input sanitization.
- **Automated Blog Sync**: Fetches and updates blog posts from RSS feeds automatically.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Runtime**: Node.js `^20.19.0 || >=22.12.0` (for build/scripts, aligned with Vite 8)
- **AI**: Google Generative AI (Gemini)
- **Python**: Pyodide (WebAssembly)
- **Testing**: Vitest + React Testing Library

## 📦 Getting Started

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- pnpm 9+ (required package manager for installs, scripts, and lockfile updates)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/saint2706/saint2706.github.io
   cd rishabh-portfolio
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and add your API keys (e.g., `VITE_GEMINI_API_KEY`).

### Development

Start the development server:

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser.

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

### Package manager policy

This repository is **pnpm-only**:

- Use `pnpm install` for dependency installation.
- Use `pnpm <script>` for all project scripts.
- Keep `pnpm-lock.yaml` as the only committed lockfile.
- Never commit `package-lock.json` (CI fails if it exists).

## 📚 Documentation

Detailed documentation on project architecture, theming, and the games is available in the `.jules/` directory where the agents maintain historical logs and reports.

## 📜 Scripts

| Script                           | Description                                          |
| :------------------------------- | :--------------------------------------------------- |
| `pnpm dev`                       | Start the development server                         |
| `pnpm build`                     | Build the production bundle                          |
| `pnpm preview`                   | Preview the production build locally                 |
| `pnpm lint`                      | Run ESLint checks                                    |
| `pnpm lint:fix`                  | Run ESLint checks and fix auto-fixable issues        |
| `pnpm format`                    | Format code with Prettier                            |
| `pnpm format:check`              | Check code formatting with Prettier                  |
| `pnpm test`                      | Run unit tests with Vitest (watch mode)              |
| `pnpm test:run`                  | Run unit tests with Vitest (single run)              |
| `pnpm test:security`             | Run security utility verification scripts            |
| `pnpm test:csp`                  | Verify Content Security Policy (CSP) in `index.html` |
| `pnpm verify:sri`                | Verify Subresource Integrity (SRI) for Pyodide       |
| `pnpm test:python-runner-stdout` | Verify Python runner standard output capture logic   |
| `pnpm test:pyodide-loader-retry` | Verify Pyodide loader retry mechanism                |
| `pnpm test:no-aura`              | Verify no deprecated Aura theme references exist     |
| `pnpm test:security-full`        | Run comprehensive security checks (CSP, SRI, deps)   |
| `pnpm generate:llms`             | Generate `public/llms.txt` for AI agents             |
| `pnpm generate:sitemap`          | Generate `public/sitemap.xml`                        |
| `pnpm generate:geo`              | Run both `generate:llms` and `generate:sitemap`      |

## 🔒 Security

Security is a core focus of this project. Key measures include:

- **CSP**: Strict Content Security Policy preventing unauthorized scripts and styles.
- **SRI**: Subresource Integrity checks for external scripts (like Pyodide).
- **Input Sanitization**: All user inputs (chat, contact form) are sanitized to prevent XSS.
- **Dependency Pinning**: Vulnerable transitive dependencies are overridden in `package.json`.

For a detailed security report, see [.jules/sentinel.md](.jules/sentinel.md).

## 🔄 CI/CD Optimizations

To ensure reliable, fast, and secure software delivery, the following pipeline optimizations are implemented:

- **Strict SHA Pinning**: All GitHub Actions (including first-party actions like `actions/checkout`) are strictly pinned to 40-character commit SHAs to prevent malicious updates. The `.github/workflows/workflow-lint.yml` guardrail enforces this policy on every PR.
- **Caching**: The `setup-env` composite action automatically caches the `pnpm` store via `actions/setup-node`, saving bandwidth and speeding up test executions.
- **Fail-Fast Parallelism**: The CI workflow tests across multiple Node.js environments (`[20, 22]`) in parallel, using the `fail-fast: true` strategy to immediately stop the build when any environment fails, saving compute resources.
- **Vite 8 Node Compatibility Matrix**: CI verifies test coverage on all supported Vite 8 Node.js lines: `20.19.0`, `22.12.0`, and `24.x` (recommended current line).
- **Cross-Platform Matrix Builds**: The test job uses a matrix strategy to verify the application across multiple operating systems (`ubuntu-latest`, `windows-latest`, `macos-latest`), ensuring broad compatibility and catching platform-specific issues early.
- **Concurrency control**: Workflow concurrency correctly cancels in-progress jobs for outdated commits on the same branch or PR.

## 🤖 AI & Python Integration

### Gemini AI

The chat interface connects to the Google Gemini API to simulate a conversation with me. The system prompt and rate limiting logic are handled in `src/services/ai.js`.

### Pyodide

The Python runner executes code in the browser using WebAssembly. It captures standard output and supports basic Python libraries. You can try it out at the `/playground` route.

## 📄 License

This project is private and proprietary. All rights reserved.

---

_Documentation maintained by [Jules](https://github.com/jules-agent)_
