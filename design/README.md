# Design concepts

Code-first design concepts (see `project-system/decisions/ADR-005-design-medium.md`). Not part of the site build or deployment.

`concepts/a1-specimen-field/` holds the Direction A1 concept. To view it, open `index.html` in a browser. It uses greyscale placeholders only, system fonts and no external requests. It has a motion toggle, reduced-motion support and a plain-text index dialog. All copy is DRAFT (see `project-system/research/draft-copy-register.md`, C-07 onward).

- `index.html`: the field (home). Cards lead to the spaces, and a gateway link leads to the personal space.
- `professional.html`: Work. Holds flagship projects, other projects, roles, study, writing (`#writing`) and contact (`#contact`).
- `personal.html`: Off the clock. Holds empty painting slots (`#art`), essays on myth, and the reading path (`#books`) with only Stage One expanded.
- `lab.html`: candidate trays only. Lab content is not chosen.
- `shared.css` / `shared.js`: one token source and the shared header, index dialog and motion toggle. An explicit motion choice is kept in `sessionStorage` so it carries across pages. Storage errors are caught.

Layouts: desktop (≥1025 px), tablet (721–1024 px; space pages drop to one column, the field keeps three) and phone (≤720 px, fixed bottom bar for Index and Motion).

Checks last run on 2026-11-04 in Chromium, Firefox and WebKit, at 1440, 834 and 390 px, across all four pages:

- No horizontal overflow.
- Non-inline targets are at least 44 px tall. Inline text links have at least an 18 px line box.
- Each page has exactly one `h1`.
- Every internal link resolves to an existing page and id.
- No console errors and no external requests.
- The index dialog opens, closes on Escape and closes when a link is chosen.
- Reduced motion starts with motion off.
- A motion choice carries to the next page in all three browsers.
- Motion (added 2026-11-04 after owner approval) uses opacity and transform only. Field cards, space headings and section blocks rise in a stagger. With motion off, no animations run on any page. With motion on, every element ends fully visible.

Earlier skip-link result (still applies): focus moves to `main`. WebKit's next-Tab check is inconclusive because Safari skips links when tabbing by default.

Manual screen-reader testing is not done.

## Design system (P02-T03, provisional)

`system/index.html` is round 3. The owner reopened the palette on 2026-11-04, so Vermilion is withdrawn and a switcher shows three new options: A Cyanotype, B Malachite and C Sealing wax. The faces are provisional until approved: Young Serif (headings), Atkinson Hyperlegible Next (body and interface) and Atkinson Hyperlegible Mono (code and data). All three are SIL OFL 1.1 and self-hosted in `system/fonts/` with their licence files, about 76 KB in total. The contrast table is measured from the page's own colours. Checks run on 2026-11-04 in three browsers at three widths: no overflow, one `h1`, targets at least 44 px, every pair passes AA in every palette, all five font files load, no console errors or external requests, and no CSS animation runs under reduced motion.

The impeccable detector reports no findings, so the round 2 cream-palette exception is removed from `.impeccable/config.json`.
