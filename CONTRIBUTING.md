# Contributing

Thanks for contributing to this project.

## Setup

1. Install **Node.js 20+**.
2. Install **pnpm 9+** (required package manager):

   ```bash
   npm install -g pnpm
   ```

3. Install dependencies with pnpm:

   ```bash
   pnpm install
   ```

## Development commands (pnpm only)

Use pnpm for all scripts in this repository:

- `pnpm dev`
- `pnpm lint`
- `pnpm test:run`
- `pnpm build`

Do not use `npm run ...` or `npx ...` here.

## Package manager policy

This repository is **pnpm-only**.

- The canonical lockfile is `pnpm-lock.yaml`.
- `package-lock.json` must never be added or committed.
- For dependency changes, run `pnpm install` (or `pnpm add/remove ...`) and commit the resulting `pnpm-lock.yaml` updates.

CI enforces this policy and will fail if `package-lock.json` exists.
