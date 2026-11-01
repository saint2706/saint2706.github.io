# Design concepts

Code-first design concepts (see `project-system/decisions/ADR-005-design-medium.md`). Not part of the site build or deployment.

- `concepts/a1-specimen-field/index.html`: Direction A1 concept (open the file in a browser). Greyscale placeholders only, system fonts, no external requests, motion toggle, reduced-motion support, plain-text index dialog. All copy is DRAFT.

Checks run so far (Chromium, Firefox and WebKit at 1440, 834 and 390 px): no horizontal overflow, all targets at least 44 px, no console errors, no external requests, every in-page link has a destination, reduced motion starts with motion off, the index dialog opens, closes on Escape and closes when a link is chosen. The skip link moves focus to `main` (tabindex -1); in Chromium and Firefox the next Tab reaches the first card. WebKit also moves focus to `main`, but its default of skipping links when tabbing makes the next-Tab check inconclusive there. Manual screen-reader testing is not done.
