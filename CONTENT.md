# Content model and editorial governance

Support profile facts, project case studies/short entries, writing/tutorials/research, personal collections, learning resources, experiments and contact.

A content record should eventually include stable ID/slug, title/summary/type/space, status, provenance, dates when meaningful, related content, claim evidence, user-approval state, asset references/rights, accessibility metadata, SEO metadata and language code. Exact schema is an ADR decision, not a preselection.

## Editorial requirements

1. Never invent first-person stories, opinions, motivation, achievements or personal contributions.
2. AI may proofread/restructure supplied writing; preserve intent and flag material changes.
3. Claims need source or explicit approval.
4. Distinguish repository evidence from claims about the user's role/contribution.
5. Metrics require a source, definition, timeframe and methodology.
6. Recheck volatile facts such as credentials, dates, titles and links.
7. Do not publish placeholders, thin categories or unsupported superlatives.
8. Include project limitations as well as outcomes.
9. Publish major milestones, not an artificial weekly feed.

Claim statuses: `repo-verified`, `externally-verified`, `user-confirmed`, `needs-user-confirmation`, `unsupported`, `stale`.

Workflow: draft → evidence check → user approval where required → editorial/accessibility QA → publish. Preserve revisions in Git.

Flagship candidates: Coding-For-MBA, Attendance Management System using Face Recognition, Programming-Challenges-5. Audit each first.
