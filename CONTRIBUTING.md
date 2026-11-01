# Contributing

Thanks for contributing to this project.

## Setup

1. Install **Node.js `^24.15.0 || >=26.0.0`** (the `engines` range in `package.json`).
2. Install **pnpm 12.15.0**, the version pinned in `packageManager` (required package manager):

   ```bash
   npm install -g pnpm@12.15.0
   ```

3. Install dependencies with pnpm:

   ```bash
   pnpm install
   ```

4. Copy `.env.example` to `.env`. See the [README](./README.md#-getting-started) for the Gemini proxy settings.

## Development commands (pnpm only)

Use pnpm for all scripts in this repository:

- `pnpm dev`
- `pnpm lint`
- `pnpm format:check` (`pnpm format` to fix)
- `pnpm test:run`
- `pnpm build`
- `pnpm test:security-full`

Do not use `npm run ...` or `npx ...` here.

## Package manager policy

This repository is **pnpm-only**.

- The canonical lockfile is `pnpm-lock.yaml`.
- `package-lock.json` must never be added or committed.
- For dependency changes, run `pnpm install` (or `pnpm add/remove ...`) and commit the resulting `pnpm-lock.yaml` updates.

CI enforces this policy and will fail if `package-lock.json` exists.

## Pull requests

`main` is protected: changes land through a pull request, squash-merged, once all required CI checks pass. Do not push to `main` directly. The repository owner is listed in `.github/CODEOWNERS`.

Merging to `main` deploys the production site, so keep each PR focused and check the preview locally with `pnpm build && pnpm preview` first.

## CI

The CI workflow runs on every pull request:

- **Lint** (Node 24): format check, pnpm-only lockfile policy, no-Aura check and ESLint.
- **Test**: unit tests on Ubuntu, Windows and macOS with Node `24` and `26`.
- **Build** (Node 24): `pnpm build`.
- **Security** (Node 24): `pnpm test:security-full`, plus the Python runner stdout and Pyodide loader retry tests.

Run the matching `pnpm` scripts locally before opening a PR.

## Security

To report a vulnerability, see [SECURITY.md](./SECURITY.md) instead of opening a public issue.

## Project planning and AI agents

Planning, audits, decisions and research live in [`project-system/`](./project-system/README.md). AI agents should read [`CLAUDE.md`](./CLAUDE.md) first.
