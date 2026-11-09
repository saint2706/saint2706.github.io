# Project state dashboard

- Pack version: 1.0.0
- Captured repo baseline: 31 October 2026
- Current phase: P05
- Execution mode: phase-gated
- P00, P01, P02, P03, P04, P05: complete (P05 PR #902 merged 2026-11-05; personal UI upgrades completed 2026-11-09 on `phase/ui-upgrade-personal`)
- P06–P07: pending explicit approval
- Discovery decisions: 163 confirmed
- Task specs: 28
- Architecture: Astro + React islands confirmed (ADR-001); new site lives in `site/` (not yet deployed)
- Visual direction: A1 Specimen Field concept, Sealing wax palette and Atkinson Hyperlegible Next + Young Serif typography; interactive SVG header glyph suite (`ChronometerGlyph`, `ArtGlyph`, `BookGlyph`, `FilmGlyph`, `LearningGlyph`) across all personal spaces
- Default branch protection: ruleset `protect-main` active since 2026-11-01 (11 required checks)
- Production: old website remains live during branch work; merge/deploy requires explicit release authorization (P07)

Machine-readable sources:

- `state/project.json`
- `state/approvals.json`
- `state/repo-baseline.json`
- `state/tasks.json`
- `state/decisions.json`
- `state/research-index.json`
