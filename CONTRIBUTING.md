# Contributing Guide

This document outlines the workflow and standards for maintaining the portfolio codebase.

## Development Workflow

1.  **Clone**: Clone the repository to your local machine.
2.  **Install Dependencies**: This project uses `pnpm`. Run `pnpm install` to ensure consistent lockfiles.
3.  **Branch**: Create a feature branch for your changes (e.g., `feature/new-game` or `fix/typo`).

## Code Standards

- **Linting**: Run `pnpm lint` to check for code quality issues.
- **Formatting**: Run `pnpm format` to automatically format code with Prettier.
- **Testing**: Run `pnpm test` to execute the test suite.

## Pull Request Process

1.  Ensure all tests pass locally.
2.  Update documentation if you've added new features or changed existing ones.
3.  Submit a Pull Request with a clear description of your changes.
4.  The CI pipeline will automatically run linting, tests, and build checks.

## Security

Please refer to `.jules/sentinel.md` for security policies, including vulnerability reporting and mitigation strategies.

## License

This project is private and proprietary.
