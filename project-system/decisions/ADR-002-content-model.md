# ADR-002: Content model and authoring workflow

- Status: **confirmed** 2026-11-01 (local JSON + Markdown, schema-checked)
- Date: 2026-11-01
- Related tasks: P01-T02; no personal content published

## Context

Content is mixed JS in `src/data/resume.js` plus script-synced `blogs.json`. Audit found unsupported skill scores, unverified claims and no provenance. Owner decisions (2026-11-01): phone removed, email kept public.

## Alternatives

| Option                                                                    | Fit                                                       | Cost                        |
| ------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------- |
| Keep JS object                                                            | Simplest, no validation, no provenance                    | none                        |
| **Structured local data (JSON/YAML + Markdown bodies), schema-validated** | Git history, diffable, matches pack schemas, no service   | small validator script      |
| MD/MDX only                                                               | Good for writing, awkward for structured profile/projects | MDX toolchain               |
| Headless CMS                                                              | Editing UI; adds account, cost, availability risk         | high for a solo static site |

## Recommendation

**Structured local data, hybrid with Markdown for long text**, under `content/`, validated in CI by a schema script. Types: `profile`, `project`, `writing`, `interest`, `experiment`, `asset`. See `research/P01-content-schema-proposal.md`. Keep `blogs.json` sync as a generated `writing` source.

## User approval

Required: yes. Evidence: user answers 2026-11-01.

## Consequences

`resume.js` becomes a generated or thin loader; no UI change until approved.
