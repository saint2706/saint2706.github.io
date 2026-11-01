# Task register

Authoritative structured registry: `project-system/state/tasks.json`. Every task has a full Markdown specification.

The user must authorize a phase and exact task IDs. P00 and P01 are complete (2026-11-01); only P02-T01 is currently authorized (no production release). Current authorization is in `project-system/state/approvals.json`. No automatic progression.

## P00 — Repository audit and preparation

- [P00-T01 — Capture repository baseline and governance](project-system/tasks/P00-T01.md) (`no dependencies`)
- [P00-T02 — Audit engineering, architecture and deployment](project-system/tasks/P00-T02.md) (`P00-T01`)
- [P00-T03 — Audit content, projects and asset provenance](project-system/tasks/P00-T03.md) (`P00-T01`)
- [P00-T04 — Synthesize audit and prepare approval brief](project-system/tasks/P00-T04.md) (`P00-T02, P00-T03`)

## P01 — Architecture and governance

- [P01-T01 — Evaluate application and rendering architecture](project-system/tasks/P01-T01.md) (`P00-T04`)
- [P01-T02 — Decide content model and authoring workflow](project-system/tasks/P01-T02.md) (`P01-T01`)
- [P01-T03 — Decide information architecture and URL model](project-system/tasks/P01-T03.md) (`P01-T01, P01-T02`)
- [P01-T04 — Define governance, branch protection and release model](project-system/tasks/P01-T04.md) (`P01-T01, P01-T02, P01-T03`)

## P02 — Visual research and Figma

- [P02-T01 — Conduct curated visual research](project-system/tasks/P02-T01.md) (`P01-T04`)
- [P02-T02 — Create Figma file and visual concepts](project-system/tasks/P02-T02.md) (`P02-T01`)
- [P02-T03 — Refine approved direction and design system](project-system/tasks/P02-T03.md) (`P02-T02`)

## P03 — Technical and visual foundations

- [P03-T01 — Implement approved technical and visual foundations](project-system/tasks/P03-T01.md) (`P01-T04, P02-T03`)
- [P03-T02 — Implement content pipeline and navigation shell](project-system/tasks/P03-T02.md) (`P03-T01`)
- [P03-T03 — Establish SEO, privacy and CI foundations](project-system/tasks/P03-T03.md) (`P03-T01, P03-T02`)

## P04 — Professional experience

- [P04-T01 — Build flagship case studies](project-system/tasks/P04-T01.md) (`P03-T02`)
- [P04-T02 — Build profile, resume and contact](project-system/tasks/P04-T02.md) (`P03-T02`)
- [P04-T03 — Build professional discovery and search](project-system/tasks/P04-T03.md) (`P04-T01, P04-T02`)

## P05 — Personal experience

- [P05-T01 — Build personal-space gateway and shell](project-system/tasks/P05-T01.md) (`P03-T02`)
- [P05-T02 — Build art, books, music and culture collections](project-system/tasks/P05-T02.md) (`P05-T01`)
- [P05-T03 — Build selected learning, tech and business collections](project-system/tasks/P05-T03.md) (`P05-T02`)

## P06 — Experimental laboratory

- [P06-T01 — Build curated experimental laboratory](project-system/tasks/P06-T01.md) (`P04-T03, P05-T01`)
- [P06-T02 — Build justified visualizations and explainers](project-system/tasks/P06-T02.md) (`P04-T01`)
- [P06-T03 — Verify progressive enhancement and accessible equivalents](project-system/tasks/P06-T03.md) (`P06-T01, P06-T02`)

## P07 — Integration, quality and release

- [P07-T01 — Complete cross-browser and responsive regression](project-system/tasks/P07-T01.md) (`P04-T03, P05-T03, P06-T03`)
- [P07-T02 — Finalize performance budgets](project-system/tasks/P07-T02.md) (`P07-T01`)
- [P07-T03 — Complete security, privacy and supply-chain review](project-system/tasks/P07-T03.md) (`P07-T01`)
- [P07-T04 — Complete factual, editorial, SEO and creative review](project-system/tasks/P07-T04.md) (`P07-T02, P07-T03`)
- [P07-T05 — Release, verify and close project](project-system/tasks/P07-T05.md) (`P07-T04`)

## Completion standard

Every task requires passing acceptance criteria and recorded evidence. Code written is not sufficient. Update Markdown and JSON together; do not start dependent tasks until evidence is complete.
