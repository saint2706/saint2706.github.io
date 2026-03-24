# CI/CD Optimizations

## Concurrency Controls

- **Update**: Configured GitHub Actions concurrency groups to prevent cancelling runs on primary branches.
- **Why**: Ensuring `cancel-in-progress: ${{ github.ref != 'refs/heads/main' && github.ref != 'refs/heads/master' }}` prevents essential builds from being killed by subsequent commits on main or master branches.
- **Update**: Applied safe concurrency groups to `.github/workflows/workflow-lint.yml`, `.github/workflows/dependency-review.yml`, `.github/workflows/sync-blogs.yml`, and updated `.github/workflows/deploy.yml` to prevent cancelling on primary branches.
