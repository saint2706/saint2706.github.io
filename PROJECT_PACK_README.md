# Claude Code Project Pack v1.0.0

**Repository:** https://github.com/saint2706/saint2706.github.io  
**Primary site:** https://saint2706.github.io/  
**Created:** 31 October 2026  
**Target:** Claude Code, repository-local project system

This ZIP contains an operational project system, not a website implementation. It includes the product brief, design/architecture/content requirements, task specifications, Claude Code configuration, research, state, validators, evidence templates and release runbooks.

## Start

1. Read `PACK_INSTALLATION.md`.
2. Read `CLAUDE.md`.
3. Start Claude Code in the repository root.
4. Run `project-system/prompts/00-first-run-audit.md` or `/audit-repository`.
5. Review the comprehensive audit and architecture recommendations.
6. Explicitly approve P01 before implementation/architecture commitments.

**P00 is audit-only.** No website implementation is authorized by this ZIP.

## Captured repository baseline

Prepared against `main` commit `95a04fb60193c74b20273b01a983de7b1f465182` on 31 Oct 2026. Captured tree: 182 entries, 161 files, 21 folders. Current snapshot includes React 19/Vite 8, Tailwind 4, React Router 7, Framer Motion, Vitest/Testing Library, Playwright dependency, pnpm 12, GitHub Pages workflow, Gemini Worker proxy, Pyodide, sandboxed JS/HTML, security scripts and eight project thumbnails.

**Important:** Captured `main` branch was not protected. Refresh before relying on any fact.

## Pack content

- `CLAUDE.md`: operating contract
- `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `CONTENT.md`
- `ROADMAP.md`, `TASKS.md`, `QUALITY_GATES.md`
- `DECISIONS.md`, `PLUGINS.md`, `RESEARCH_LIBRARY.md`
- 28 complete task specs across P00–P07
- Repository-local Claude Code skills, read-only agents and safety hooks under `.claude/`
- JSON project state, decision register, task register, schemas and validators
- Prompts, ADR/evidence/handoff templates, risks and release/rollback runbooks

## Validate after installation

```bash
node project-system/scripts/validate-pack.mjs
node project-system/scripts/validate-project-state.mjs
```

The validators use Node's standard library and add no dependencies.
