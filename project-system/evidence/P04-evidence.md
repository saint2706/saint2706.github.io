# P04 evidence (2026-11-05)

Branch `phase/p04-professional`. Authorization: P04-T01..T03, owner, 2026-11-05 (`project-system/state/approvals.json`). No production release.

## Owner approvals used

| Decision                                                                                       | Where recorded       |
| ---------------------------------------------------------------------------------------------- | -------------------- |
| Flagships and order: Programming-Challenges-6, Coding-For-MBA, AI Attendance Management System | `approvals.json` P04 |
| PC6 replaces the archived PC5                                                                  | `approvals.json` P04 |
| Attendance credits Nevil Parmar's 2021 original and describes the owner's rebuild              | `approvals.json` P04 |
| No mention of AI coding agents or bot contributors                                             | `approvals.json` P04 |
| Role lines approved as written (below); candid limits kept                                     | `approvals.json` P04 |
| Print-ready /about/, no PDF; links-only contact; AWS cert shown as expired                     | `approvals.json` P04 |
| Skills as names only; degrees only; internship and PGDM dates; LinkedIn URL                    | `approvals.json` P04 |

Approved role lines: PC6 "Author and maintainer"; Coding-For-MBA "Author and maintainer"; Attendance "Rebuild author and maintainer since September 2025", original "Nevil Parmar, 2021".

## P04-T01 case studies: claim sources

Every claim on the three pages comes from a repository file at a pinned commit, listed in the page's Sources section (`site/content/case-studies.json`). The research sheet behind them was checked on 2026-11-05 with `gh api`. Spot-checks repeated before writing: the first rebuild commit `ea22c77` (saint2706, 2025-09-25), the CHANGELOG 0.1.0 entry, the 2021 README's ViitorCloud internship, HOG and linear-SVM text and its 25-employee test, and the 15 MBA case-study folders.

| Repository                      | Pinned commit |
| ------------------------------- | ------------- |
| Programming-Challenges-6        | `8c984db`     |
| Programming-Challenges-5        | `5f85274`     |
| Coding-For-MBA                  | `b45b15b`     |
| Attendance (HEAD)               | `36df915`     |
| Attendance (2021 source import) | `050ff69`     |

Left out on purpose, because they were unsourced or contradicted:

- Attendance: "CCPA-compliant", BUSINESS_ACTIONS percentages, MULTI_FACE latency table, the 90% coverage goal, "two-stage motion + texture" liveness, and any cosine-distance claim (the code default is euclidean_l2). The 75% spoof figure is shown only as "3 of 4" from an 8-capture test.
- Coding-For-MBA: the README's "162 days" is shown as 145 numbered days plus 17 lettered lessons. "E2E in CI" and "Lighthouse on every build" are not claimed, and those gaps are listed as limits. No licence is claimed.
- PC6: README benchmark speed-ups are not repeated as numbers. The Meeting Notes F1 is stated with its synthetic-corpus method.
- CV: projects with no public evidence (football prediction, episode analytics, script-generation RNN) and the CV's project dates (which conflict with repository creation dates) are not used. The CV is not in the repository.

Link check: all 18 source URLs and the Coding-For-MBA live site returned HTTP 200 (`curl -L`, 2026-11-05).

## P04-T02 profile, resume and contact

- `/about/` has a "Print or save as PDF" button (shown only with JavaScript) and a print stylesheet that hides the site chrome and shows email and profile URLs. Screenshot: `p04/screens/about-print-*.webp`.
- The AWS Certified Cloud Practitioner entry reads "expired Jul 2026", computed by `isExpired`; the e2e test checks this text.
- Skills: three groups of names from the CV Core Competencies, with no ratings.
- Contact stays links only, with no form and no third-party service. There is no phone number, age, school marks or CGPA anywhere (searched `site/` and `project-system/`).

## P04-T03 discovery and search

- Flagship rows on `/projects/` link to their case studies ("Read the case study"); related dev.to posts link as "Post: …" and must exist on `/writing/` (build fails otherwise).
- Pagefind results show a kind label (Case study, Work, Painting, Off the clock, Lab) from `data-pagefind-meta`.
- Section numbers are now `aria-hidden` and `data-pagefind-ignore`. Before this, headings were announced and indexed as "02Python in the browser".
- Mobile: a 136px horizontal overflow on the case-study pages (a grid item's `min-width: auto` plus an unbreakable URL) was fixed in `global.css` and the page's `.facts dd`.

## Builds and tests (local, Windows)

| Check                           | Result                                                                                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run lint` (root)          | no issues                                                                                                                                                                         |
| `pnpm exec vitest run` (root)   | 449 passed, 34 files                                                                                                                                                              |
| `pnpm run build` (root, deploy) | old app only; this phase changes nothing outside `site/` and `project-system/`, so deploy output is unchanged                                                                     |
| `site`: `pnpm check`            | 0 errors                                                                                                                                                                          |
| `site`: `pnpm build`            | builds, including 3 case-study routes                                                                                                                                             |
| `site`: `pnpm test`             | 11 passed                                                                                                                                                                         |
| `site`: `pnpm test:e2e`         | 52 passed on desktop Chrome and Pixel 7: axe WCAG 2.2 AA, no overflow and no console/CSP errors on all routes incl. case studies, case-study link, print view, search kind labels |
| Prettier                        | clean                                                                                                                                                                             |
| State validator                 | pass                                                                                                                                                                              |

Screenshots: `project-system/evidence/p04/screens/` (projects, three case studies, about, about print view and search, each on desktop and mobile).

## Limitations

- Case-study facts are a snapshot at the pinned commits; the source repos keep moving.
- The print view was checked by emulating print media, not on physical paper or every browser's PDF export.
- Search kind labels depend on the URL-based mapping in `Base.astro`; new sections need a mapping entry.
