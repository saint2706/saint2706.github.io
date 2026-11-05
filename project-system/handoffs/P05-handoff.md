# P05 handoff: personal space

Date: 2026-11-05. Branch `phase/p05-personal`. Not deployed: the deploy still publishes the old `src/` app until P07.

## Done

- **T01 shell.** `/personal/` is now a landing room linking to separate rooms. Every personal page shows its own "Off the clock" nav under the site bar; painting pages keep "Art and myth" marked. Old `/personal/#art` and `#books` links redirect (needs JS; without it the landing page still links both rooms).
- **T02 collections.** `/personal/films/` publishes the owner's three film notes verbatim (credits checked against Wikipedia). Book stages now lead with a key-idea title (Claude-drafted at the owner's request); the owner's stage labels stay underneath. No music room (no material yet). Films show small hosted posters with credit lines (owner accepted the rights risk).
- **Art additions (owner request).** The art room opens each painting in a museum viewer (whole painting, then each detail; arrow and number keys; plain links without JS). The Print Gallery annex `/personal/art/print-gallery/` zooms forever into Escher's twist, w^α with α = (2πi + log 256)/(2πi), applied to four museum paintings in WebGL2, and explains the de Smit and Lenstra paper. No Escher image is shown; poster×club is credited for the idea.
- **T03 learning path.** `/personal/learning/` orders existing tutorials, courses and essays into five steps. Owner approved the copy 2026-11-05. Data model carries `lang`.

## Validation

astro check 0 errors; site build OK; site node tests 11/11; Playwright 70/70 (desktop and mobile; axe WCAG 2.2 AA, no horizontal overflow, keyboard walk from the home gateway to a painting, old-anchor redirects, museum viewer, Print Gallery zoom). Root ESLint clean, Vitest 449/449. Screenshots in `project-system/evidence/P05/`.

## Open for the owner

- Review PR #902; the owner asked to keep it open rather than merge. Book taglines approved 2026-11-05.
- Music room waits for owner notes; see `project-system/future-backlog/P05-interest-backlog.md`.
- The two Medium essays in the learning path are listed by title only (Medium refuses automated reads).

## Next

Nothing is authorized. P06 (lab) needs explicit owner approval.
