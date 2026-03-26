# CI/CD Optimizations

## Concurrency Controls

- **Update**: Configured GitHub Actions concurrency groups to prevent cancelling runs on primary branches.
- **Why**: Ensuring `cancel-in-progress: ${{ github.ref != 'refs/heads/main' && github.ref != 'refs/heads/master' }}` prevents essential builds from being killed by subsequent commits on main or master branches.
- **Update**: Applied safe concurrency groups to `.github/workflows/workflow-lint.yml`, `.github/workflows/dependency-review.yml`, `.github/workflows/sync-blogs.yml`, and updated `.github/workflows/deploy.yml` to prevent cancelling on primary branches.

## Test Warnings Fix

- **Update**: Resolved React warning regarding testing suspended resources in `src/components/layout/Layout.test.jsx`.
- **Why**: Wrapping `render` calls in `act(...)` with `await` ensures suspended data (e.g. from React.lazy) is resolved properly within the test environment, preventing asynchronous side-effects from failing the Vitest execution silently.

## ESLint Caching

- **Update**: Added ESLint `--cache` to `package.json` scripts and configured `.eslintcache` in `.github/workflows/ci.yml` using `actions/cache`.
- **Why**: Reduces the time required to run the `lint` job in CI by caching the ESLint analysis results for unmodified files.
