# Draft copy register (P02)

All copy in the Figma concepts is DRAFT. It uses only facts already published on the current site (`src/data/resume.js`, blog list) and a playful tone chosen by the owner. Nothing here is approved for publication. Approval status: `needs-user-approval` unless stated.

| ID   | Where            | Draft wording                                                   | Source of fact                                                                      | Type               | Status                                         |
| ---- | ---------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------- |
| C-01 | v2 home headline | Data, technology and a bit of creativity, used to tell stories. | resume summary: "intersection of data, technology, and creativity ... tell stories" | personal statement | needs-user-approval                            |
| C-02 | Work label       | Projects, roles and what I studied                              | resume.js: projects, experience, education exist                                    | repository fact    | needs-user-approval                            |
| C-03 | Writing label    | Essays and notes                                                | blogs.json: 12 posts (Medium, Dev.to)                                               | repository fact    | needs-user-approval                            |
| C-04 | Lab label        | Experiments, some half-baked                                    | tone only; lab content not yet chosen                                               | opinion/tone       | needs-user-approval                            |
| C-05 | Tags             | poke me / read me / half-baked, click anyway                    | playful tone only                                                                   | tone               | needs-user-approval                            |
| C-06 | Index rows       | Art and myth, Books, Music                                      | brief names these interests; no content exists yet                                  | scope claim        | needs-user-confirmation: which actually launch |

Targeted questions still to the owner (asked in chat): flagship projects, what exists for art/myth, books and music, and which tags feel on-voice.

## Owner decisions 2026-11-01 (round 2)

- The three in-copyright paintings (Magritte x2, Dali) are left out; only public-domain works may be shown, each verified.
- Reading lists: the owner has finished reading them. Stage 5.2 is Hegel and Schelling per the owner, who supplied the eight titles on 2026-11-01 (see `books-reading-path.md`).
- Music space left out of launch scope.
- Design medium switched to code-first (ADR-005).

## Space pages (code-first concept, 2026-11-04)

Copy in `design/concepts/a1-specimen-field/{professional,personal,lab}.html`. Facts are restated from `src/data/resume.js`, `src/data/blogs.json`, `books-verified.json` and owner decisions above. No metrics are shown (the resume's 25% and 1,700+ figures are left out until sourced).

| ID   | Where           | Draft wording                                           | Source of fact                                                       | Type             | Status              |
| ---- | --------------- | ------------------------------------------------------- | -------------------------------------------------------------------- | ---------------- | ------------------- |
| C-07 | Work page       | Project, role and study descriptions                    | resume.js, owner's flagship choice                                   | repository fact  | needs-user-approval |
| C-08 | Work page notes | Archived-repo and face-data privacy notes               | owner decisions 2026-11-01                                           | editorial note   | needs-user-approval |
| C-09 | Personal page   | Off the clock / Art, myth and the books on the shelf.   | tone only                                                            | tone             | needs-user-approval |
| C-10 | Personal books  | A philosophy reading path in thirteen stages, 123 works | books-verified.json (123 kept), owner: all finished                  | personal claim   | needs-user-approval |
| C-11 | Lab page        | Experiments. Some of this works. / candidate trays      | features on the current site (games, playground, Gemini chat, roast) | tone + repo fact | needs-user-approval |
| C-12 | Gateway link    | Off the clock: art, myth and books                      | tone only                                                            | tone             | needs-user-approval |
