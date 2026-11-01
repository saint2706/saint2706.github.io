# Rishabh's Portfolio

[![CI](https://github.com/saint2706/saint2706.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/saint2706/saint2706.github.io/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/saint2706/saint2706.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/saint2706/saint2706.github.io/actions/workflows/deploy.yml)

This repository holds my personal portfolio website, which demonstrates frontend development, Python integration, and AI-powered interactions. It has a dual-theme design system.

## 🚀 Features

- **Dual Theme System**: Toggle between "Neubrutalism" (bold, high-contrast) and "Liquid" (editorial, translucent) themes.
- **AI Integration**: Chat with a digital version of myself powered by Google's Gemini AI.
- **Code Playground**: Run Python code directly in the browser using Pyodide (with standard output capture), plus an editable JS/HTML sandbox rendered in a sandboxed iframe with captured console output.
- **Interactive Games**: Includes implementations of Snake, Minesweeper, Tic-Tac-Toe, Simon Says, Memory Match, Whack-A-Mole, Lights Out, 2048, and Connect Four (with a minimax AI opponent).
- **Security First**: strict Content Security Policy (CSP), Subresource Integrity (SRI), and input sanitization.
- **Automated Blog Sync**: Fetches and updates blog posts from RSS feeds automatically.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Runtime**: Node.js `^24.15.0 || >=26.0.0` (for build/scripts; CI tests Node 24 and 26)
- **AI**: Google Generative AI (Gemini)
- **Python**: Pyodide (WebAssembly)
- **Testing**: Vitest + React Testing Library

## 📦 Getting Started

### Prerequisites

- Node.js `^24.15.0 || >=26.0.0`
- pnpm 12 (pinned via `packageManager`; required package manager for installs, scripts, and lockfile updates)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/saint2706/saint2706.github.io
   cd saint2706.github.io
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env`. Set `VITE_GEMINI_PROXY_URL` to your Gemini proxy (see `proxy/README.md`); `VITE_GEMINI_API_KEY` is for local development only and must never be deployed.

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

Project planning, audits and decisions live in `project-system/`; start with `project-system/PROJECT_PACK_README.md`.

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

Security measures include:

- **CSP**: Strict Content Security Policy preventing unauthorized scripts and styles.
- **SRI**: Subresource Integrity checks for external scripts (like Pyodide).
- **Input Sanitization**: All user inputs (chat, contact form) are sanitized to prevent XSS.
- **Dependency Pinning**: Vulnerable transitive dependencies are overridden in `pnpm-workspace.yaml`.

To report a vulnerability, see [SECURITY.md](./SECURITY.md).

## 🔄 CI/CD Optimizations

The GitHub Actions workflows follow these practices:

- **Strict SHA Pinning**: All GitHub Actions (including first-party actions like `actions/checkout`) are pinned to 40-character commit SHAs to prevent malicious updates. The `.github/workflows/workflow-lint.yml` guardrail enforces this policy on every PR.
- **Caching**: The `setup-env` composite action automatically caches the `pnpm` store via `actions/setup-node`, saving bandwidth and speeding up test executions.
- **Fail-Fast Parallelism**: The CI workflow tests across multiple Node.js environments (Node 24 and 26) in parallel, using the `fail-fast: true` strategy to immediately stop the build when any environment fails, saving compute resources.
- **Cross-Platform Matrix Builds**: The test job uses a matrix strategy to verify the application across multiple operating systems (`ubuntu-latest`, `windows-latest`, `macos-latest`) and catch platform-specific issues early.
- **Concurrency control**: Workflows cancel in-progress jobs for outdated commits on the same branch or PR, except on `main`.

## 🤖 AI & Python Integration

### Gemini AI

The chat interface connects to the Google Gemini API to simulate a conversation with me. The system prompt and rate limiting logic are handled in `src/services/ai.js`.

### Pyodide

The Python runner executes code in the browser using WebAssembly. It captures standard output and supports basic Python libraries. You can try it out at the `/playground` route.

## 📄 License

Released under the [MIT License](./LICENSE).

---
