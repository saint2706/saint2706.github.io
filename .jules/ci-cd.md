# CI/CD Optimizations

## Concurrency Controls

- **Update**: Configured GitHub Actions concurrency groups to prevent cancelling runs on primary branches.
- **Why**: Ensuring `cancel-in-progress: ${{ github.ref != 'refs/heads/main' && github.ref != 'refs/heads/master' }}` prevents essential builds from being killed by subsequent commits on main or master branches.
