# ADR-005: Design medium for concepts (code-first instead of Figma)

- Status: **confirmed** 2026-11-01 (owner asked to leave Figma for a tool with more generous free limits; code-first is the recommended alternative and was adopted; owner may redirect)
- Date: 2026-11-01
- Related: supersedes D053 ("Figma-first; browser prototypes for responsive/interaction validation") for the concept and design-system medium; ADR-001 (Astro + React islands); P02-T02

## Context

The Figma MCP on a Starter plan allows very few tool calls per month (official docs say 6, forum posts say 20; resets monthly). The limit was reached on 2026-11-01 with edits still pending, and the owner does not want paid usage. Starter also caps files at 3 pages.

## Alternatives

| Option                                       | Free limits                                                                                     | Fit                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Figma (status quo)                           | MCP calls throttled to near zero                                                                | Blocked until reset; cannot iterate                                                                |
| Penpot                                       | Free plan, no file cap reported; MCP server is a beta with 5 tools and not part of this session | Possible as a human-only canvas; weak for agent-driven iteration                                   |
| **Code-first HTML/CSS concepts in the repo** | None; version-controlled; tested in a real browser                                              | Exactly what the Astro build reuses; accessibility and responsive behaviour are tested, not mocked |

## Decision

Concepts are built as standalone, accessible HTML/CSS pages under `design/concepts/` (not part of `src/`, `public/` or the Pages build), checked with automated browser tests and screenshots. The existing Figma file stays as history. Penpot or Figma can be used by the owner by hand at any time.

## Consequences

- Faster iteration; no tool-call quotas; the concept code seeds the Astro components.
- No canvas for the owner to drag things around: review happens by opening the HTML file or screenshots.
- Prototype pages must stay greyscale/placeholder until a palette is approved, use system fonts and make no external requests.
- Tests run in Chromium, Firefox and WebKit (browsers installed under the owner's standing tooling permission); screen-reader testing is still to do.
