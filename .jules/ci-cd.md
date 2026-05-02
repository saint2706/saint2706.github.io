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

## CI/CD Optimizations

- Added `needs: lint` to `test`, `build`, and `security` jobs in `ci.yml` to ensure jobs fail fast and save resources.
- Updated ESLint cache key to use `github.sha` instead of file hashing to improve cache hit rates.

## Workflow Optimization

- **Update**: Added needs: [actionlint] to workflow-security in workflow-lint.yml and permissions: contents: read to build job in deploy.yml.
- **Why**: Optimizes pipeline execution and enforces least privilege.

# CI/CD Optimizations

## Workflow Security Improvements

- Updated `actions/upload-pages-artifact` to a more recent v4 SHA (`56afc609e74202658d3ffba0e8f6dda462b719fa`) in `deploy.yml`.
- Ensured external actions are pinned to 40-character commit SHAs.

## Workflow Optimization

- **Update**: Merged `generate` and `commit` jobs into a single `sync` job in `.github/workflows/sync-blogs.yml`.
- **Why**: Eliminates the sequential `needs: generate` constraint and removes the overhead of uploading and downloading artifacts, bypassing a redundant runner spin-up to reduce pipeline duration.

## Fail Fast Dependencies

- **Update**: Added `needs: [lint]` to `test`, `build`, and `security` jobs in `.github/workflows/ci.yml`. Added `needs: [actionlint]` to `workflow-security` job in `.github/workflows/workflow-lint.yml`.
- **Why**: Enforces a fail-fast mechanism. If linting fails, it prevents subsequent resource-intensive jobs from running, saving compute resources and reducing overall pipeline time on broken code.

## Pipeline Audit Results

- **Findings**: Reviewed `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/workflows/dependency-review.yml`, `.github/workflows/sync-blogs.yml`, and `.github/workflows/workflow-lint.yml`.
- All actions/plugins are correctly pinned with SHAs.
- Dependency caching is correctly implemented using `@actions/cache` and `setup-env`.
- Matrix builds are properly used across multiple OS and node-versions.
- Jobs have proper permissions limits and dependencies (`needs: [lint]`).
- The pipeline syntax (`actionlint`) and workflow security guardrails check passes successfully without errors.
- As the CI/CD pipeline is currently optimized according to best practices, no functional changes are necessary at this time.
