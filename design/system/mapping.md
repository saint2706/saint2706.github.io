# Specimen-to-code mapping (P02-T03)

This maps the design-system tokens and the components in `design/system/` to proposed site tokens and components. The site target follows ADR-001 (Astro with React islands). No migration is authorized yet, so every "site" column below is a **proposal** for P03-T01, not code that exists.

Status key: **approved** means the owner approved it on 2026-11-04. **Provisional** means it is designed and checked but still needs owner approval.

## Tokens

Source of truth: `design/system/index.html` (specimen) and `design/system/pages/shared.css` (same values, used by the page designs).

| Specimen token                  | Value                                         | Status                            | Proposed site token                   | Replaces in current `src/index.css`                   |
| ------------------------------- | --------------------------------------------- | --------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| `--sans`                        | Atkinson Hyperlegible Next                    | approved                          | `--font-body`                         | system stack                                          |
| `--serif`                       | Young Serif                                   | approved                          | `--font-display`                      | —                                                     |
| `--mono`                        | Atkinson Hyperlegible Mono                    | approved                          | `--font-mono`                         | —                                                     |
| `--step--1` … `--step-6`        | 1.25 scale from 1rem; steps 5–6 clamp         | provisional                       | `--text-n1` … `--text-6`              | Tailwind defaults                                     |
| `--space-1` … `--space-7`       | 4, 8, 16, 24, 40, 64, 96 px                   | provisional                       | `--space-1` … `--space-7`             | Tailwind defaults                                     |
| `--gutter`                      | 48 / 32 / 20 px at >1024 / 721–1024 / ≤720 px | provisional                       | `--gutter`                            | —                                                     |
| `--ease`                        | `cubic-bezier(0.16, 1, 0.3, 1)`               | provisional                       | `--ease-out`                          | —                                                     |
| `--pro-*`, `--per-*`, `--lab-*` | Sealing wax palette (see specimen)            | approved                          | same names, private to the token file | `--bg`, `--fun-*` and the rest of the current palette |
| `--canvas`                      | page ground for the current space             | approved                          | `--color-canvas`                      | `--bg`                                                |
| `--surface`                     | raised panels, dialog, bottom bar             | provisional (new in page designs) | `--color-surface`                     | `--surface`                                           |
| `--ink`                         | primary text, borders on controls             | approved                          | `--color-ink`                         | `--text-primary`                                      |
| `--ink-2`                       | secondary text, meta                          | approved                          | `--color-ink-2`                       | `--text-secondary`, `--text-muted`, `--text-subtle`   |
| `--rule`                        | hairlines, placeholder fills                  | approved                          | `--color-rule`                        | `--surface-strong`                                    |
| `--accent`                      | links, focus ring, numerals, marks            | approved                          | `--color-accent`                      | `--accent`                                            |

Rules:

- Components use only the semantic roles (`--canvas` … `--accent`). A space switches palette with one class, `.pro`, `.per` or `.lab`, on `body` or on a single element (the home gateway uses `.per` to preview the personal room).
- `--surface` adds `#ffffff` (pro, lab) and `#261a2b` (per). It was added for the page designs; every text pair on it passes AA (lowest measured text contrast on any page: 5.76:1).
- The current site's glass and overlay tokens (`--surface-glass`, `--surface-overlay`) have no successor. The new design has no translucent panels.

## Components

Recurring behaviour becomes a shared component; one-off compositions stay with their section, per DESIGN.md.

| Specimen component (class)                                | Where               | Status      | Proposed site component               | Notes                                                                                             |
| --------------------------------------------------------- | ------------------- | ----------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Skip link (`.skip`)                                       | all pages           | provisional | `SkipLink.astro`                      | focuses `main`                                                                                    |
| Header bar (`header.bar`, `.name`, `.controls`)           | all pages           | provisional | `SiteHeader.astro`                    | controls hide ≤720 px                                                                             |
| Button (`.btn`) incl. hover, disabled, focus              | specimen, all pages | provisional | `Button.astro`                        | 44 px minimum target                                                                              |
| Motion toggle (`[data-motion-toggle]`)                    | all pages           | provisional | `MotionToggle` island                 | `aria-pressed`; follows reduced motion until the visitor chooses; choice kept in `sessionStorage` |
| Index dialog (`dialog#index`)                             | all pages           | provisional | `SiteIndex` island                    | native `<dialog>`, Escape closes, link closes                                                     |
| Bottom bar (`.bottom`)                                    | ≤720 px             | provisional | part of `SiteHeader.astro`            | fixed; pages reserve 120 px at the bottom                                                         |
| Field card (`.spec`, `.shape`, `.label`, `.tag`, `.desc`) | home                | provisional | `FieldCard.astro`                     | shape previews the target space's colour                                                          |
| Gateway (`.gateway a.per`)                                | home                | provisional | `Gateway.astro`                       | a strip of the personal room; arrow has empty alt text                                            |
| Space head (`.space-head`, `.mark`)                       | space pages         | provisional | `SpaceHead.astro`                     | mark shape differs per space                                                                      |
| Numbered block (`.block`, `.num`)                         | space pages         | provisional | `Section.astro`                       | mono numeral in accent; `:target` outline                                                         |
| Entry rows (`.rows`, `.meta`, `.links`)                   | work                | provisional | `EntryList.astro`                     | meta in mono                                                                                      |
| Note (`.note`)                                            | space pages         | provisional | `Note.astro`                          | accent rule on the left                                                                           |
| Next links (`.next`)                                      | space pages         | provisional | `NextLinks.astro`                     |                                                                                                   |
| Frames (`.frames`)                                        | personal (`#art`)   | provisional | section-specific, `ArtFrames.astro`   | slots stay empty until each licence is confirmed                                                  |
| Reading stages (`.stages`)                                | personal (`#books`) | provisional | section-specific, `ReadingPath.astro` | only Stage One expanded                                                                           |
| Bench trays (`.bench`, `.status`)                         | lab                 | provisional | section-specific, `LabTray.astro`     | candidates only; lab content not chosen                                                           |
| Contrast table, swatches                                  | specimen only       | —           | none                                  | design record, not a site component                                                               |

## States

| State           | Treatment                                                                                                | Where it is shown                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Focus           | 3 px `--accent` outline, 3 px offset                                                                     | specimen States section; every page                                           |
| Hover (links)   | underline thickens 1 → 3 px                                                                              | every page                                                                    |
| Hover (buttons) | fill to `--ink`, text `--canvas`                                                                         | specimen; every page                                                          |
| Disabled        | dashed `--ink-2` border, `not-allowed` cursor                                                            | specimen States section                                                       |
| Error           | 2 px `--accent` border on `[aria-invalid='true']`, bold message in `--accent` tied by `aria-describedby` | specimen States section; no page uses it yet (the page designs have no forms) |
| Target          | 2 px `--accent` outline on `.block:target`                                                               | space pages via index links                                                   |
| Reduced motion  | motion starts off; no animation or transition runs; content fully visible                                | every page                                                                    |

## Deviations from the A1 concept

- Greyscale placeholders are replaced by Sealing wax roles; the layout, copy and markup are otherwise unchanged from `design/concepts/a1-specimen-field/`.
- Headings use Young Serif; numerals and meta lines use the mono face.
- The home gateway changed from a plain text link to a strip in the personal palette, so crossing into the personal space shows before the click.
- Field shapes, space marks and note rules take the accent of the space they lead to or belong to.
