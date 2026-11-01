# Project system directory

Read order for agents is in [`CLAUDE.md`](../CLAUDE.md). `PRODUCT.md` and `DESIGN.md` stay in the repository root because the Impeccable plugin discovers them there.

## Top-level documents

- [`ARCHITECTURE.md`](ARCHITECTURE.md): architecture baseline and known drift/risks.
- [`CONTENT.md`](CONTENT.md): content model and editorial governance.
- [`ROADMAP.md`](ROADMAP.md): phases and authorization gates.
- [`QUALITY_GATES.md`](QUALITY_GATES.md): gates applied per task and phase.
- [`ASSET_GOVERNANCE.md`](ASSET_GOVERNANCE.md): asset provenance and rights rules.
- [`RISK_REGISTER.md`](RISK_REGISTER.md): initial risk register.
- [`PLUGINS.md`](PLUGINS.md): skills, plugins and specialist toolkit.
- [`PROJECT_STATE.md`](PROJECT_STATE.md): current state dashboard.
- [`PROJECT_PACK_README.md`](PROJECT_PACK_README.md), [`PACK_INSTALLATION.md`](PACK_INSTALLATION.md), [`PACK_CHANGELOG.md`](PACK_CHANGELOG.md): the original project pack.

## Directories

- `state/`: JSON source of truth for project, approvals, repo baseline, tasks, decisions and research.
- `tasks/`: 28 executable task specifications plus the [`TASKS.md`](tasks/TASKS.md) register.
- `prompts/`: copy-ready audit, phase, task and release prompts.
- `templates/`: ADR, evidence, research, design, claim, phase, incident and handoff templates.
- `runbooks/`: branch protection, GitHub Pages deployment, release and rollback.
- `schemas/`: JSON Schemas.
- `scripts/`: dependency-free Node validators and snapshot helper.
- `decisions/`: ADRs and the [`DECISIONS.md`](decisions/DECISIONS.md) discovery-decision table.
- `handoffs/`: session handoffs and the [`HANDOFF_GUIDE.md`](handoffs/HANDOFF_GUIDE.md).
- `research/`: research records and the [`RESEARCH_LIBRARY.md`](research/RESEARCH_LIBRARY.md).
- `audit/`, `evidence/`, `future-backlog/`: records created during work.
