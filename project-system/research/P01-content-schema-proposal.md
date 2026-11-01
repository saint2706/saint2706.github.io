# P01 Content schema proposal and publishing workflow

Common fields on every record: `id` (slug), `status` (`draft | review | approved | published | retired`), `approved_by`, `approved_on`, `updated_on`, `provenance[]`.

`provenance` item: `{ claim, evidence_url | evidence_file, verified_on, verified_by, state: verified | unsupported | needs-confirmation }`. Anything `published` must have all claims `verified` or be explicitly free of factual claims.

| Type       | Key fields                                                                                |
| ---------- | ----------------------------------------------------------------------------------------- |
| profile    | name, headline, summary, location, public_email, socials (no phone)                       |
| project    | slug, title, summary, role, outcome, stack, repo_url, demo_url, flagship (bool), assets[] |
| writing    | slug, title, source (medium/dev.to/local), url, published_on, summary, cover asset        |
| interest   | slug, title, body                                                                         |
| experiment | slug, title, lab_url, status                                                              |
| asset      | path, kind, alt_text (required for images), creator, license, source_url, used_by[]       |

Skill levels are replaced by evidence-backed lists (tool, evidence link) with no percentages.

## Workflow

1. Edit `content/**` in a branch.
2. `pnpm content:check` (proposed schema validator) runs in CI.
3. Items move `draft -> review -> approved` only via owner commit/PR approval.
4. Merge publishes (see ADR-004); Git history is the audit trail.
