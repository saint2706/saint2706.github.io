# Content inventory: art and books (owner-supplied, 2026-11-01)

Source: untracked folder `art and books/` in the repo root (15 MB; 13 images and one ZIP). It is excluded locally via `.git/info/exclude` so it cannot be committed by accident. Nothing here is approved for publication yet.

## Books: philosophy reading path (13 images)

All 13 images are phone-story graphics (gradient or black backgrounds) listing works by stage. They should be **retyped as accessible text**, not published as images (text-in-image fails accessibility and cannot be searched).

| Image      | Heading                                       | Works listed                                                                                                                                                          |
| ---------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1000113330 | Good books to get into philosophy (Stage One) | Homer (Iliad, Odyssey); Plato; Aristotle; Heraclitus; Parmenides; Epicurus (corrected to Lucretius after verification); Aeschylus                                     |
| 1000113310 | Stage Two                                     | Epictetus Handbook; Aurelius Meditations; Cicero (On the Commonwealth and Laws, On Morals, Letters); Plutarch Moralia; Plotinus Enneads; Proclus Elements of Theology |
| 1000113311 | Stage Three: The Middle Ages (+ optional)     | Augustine (Confessions, City of God); Boethius; Anselm; Aquinas Summa Theologica; Ockham (2); Buridan. Optional: Dionysius; Pearl; Carabine; Eckhart                  |
| 1000113312 | Stage 4.1: Early Modern Rationalists          | Descartes; Spinoza; Leibniz (Philosophical Essays, Monadology)                                                                                                        |
| 1000113313 | Stage 4.2: Early Modern Empiricists           | Locke (4); Berkeley; Hume (6)                                                                                                                                         |
| 1000113314 | Stage 4 (optional)                            | Malebranche (3); Pascal (2); Bacon (2); Montaigne; Bruno (2)                                                                                                          |
| 1000113315 | Stage 5.1: German Idealism                    | Kant (8); Fichte (4)                                                                                                                                                  |
| 1000113316 | Stage 5.2                                     | Image repeats the Kant and Fichte list of 5.1. Owner states Stage 5.2 is **Hegel and Schelling** and supplied the eight titles (see `books-reading-path.md`)          |
| 1000113317 | Stage 5.3                                     | Boehme (4)                                                                                                                                                            |
| 1000113318 | Stage Six: Lebensphilosophie                  | Schopenhauer (4); Nietzsche (11); Kierkegaard (6)                                                                                                                     |
| 1000113319 | Stage Seven: Modern Philosophy                | Heidegger (4); Wittgenstein (2)                                                                                                                                       |
| 1000113320 | Political Philosophy                          | Machiavelli (2); Hobbes; Viroli; Rousseau (3); Montesquieu (2); Voltaire                                                                                              |
| 1000113321 | French Revolution                             | Price (2); Burke (3); Paine (4); Maistre                                                                                                                              |

Gaps and questions: **Stage One** supplied as image 1000113330; Stage 5.2 titles were supplied in text on 2026-11-01; the owner confirmed the listed works, including the optional lists, are finished (2026-11-01), and no notes or opinions were supplied. Titles are facts; any claim about having read them needs the owner's word. The stage scheme is the owner's own, not taken from a published curriculum (user-confirmed 2026-11-04), so it needs no outside credit.

## Art: "Ten Paintings, Ten Questions" (ZIP)

A self-contained 90-minute discussion deck for two (HTML, 10 reproductions, a local `serve.py`). On 2026-11-04 the ZIP was extracted to a scratch folder outside the repo and `index.html` was read as text; `serve.py` was not run and no image was copied into the repo.

- README states seven works are public-domain reproductions; the credits below come from the deck's `WORKS` and `SRC` data.
- README states **three works are still in copyright and may not be redistributed or posted**: Magritte, _The False Mirror_; Magritte, _The Human Condition_; Dali, _Slave Market with the Disappearing Bust of Voltaire_.
- Therefore the deck **must not be published as-is**. Options: (a) publish only the seven public-domain works after verifying each credit and licence; (b) link to museum pages for the three protected works and show no image; (c) publish the questions as text with links only.
- The deck relies on Google Fonts when online; a published copy would need self-hosted or system fonts (CSP and privacy).
- Reproduction files are large (up to ~3.8 MB each); they would need resizing and alt text.

### Painting credits from the deck (read 2026-11-04)

The basis for every painting is the artist's death date (all are long out of copyright). For the reproductions it is PD-Art: a faithful photo of a 2D public-domain work gets no new copyright in the US (_Bridgeman v. Corel_) or in the EU (DSM Directive 2019/790, Art. 14). The source pages were not re-opened live; check each one again before hosting.

| #   | Work (deck title)                                                                         | Holder (deck)                                              | Image source and licence (deck)                                               | Assessment                                                                                                                                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3   | After Pieter Bruegel the Elder (?), _Landscape with the Fall of Icarus_, c. 1560s         | Royal Museums of Fine Arts of Belgium, Brussels, inv. 4030 | Google Arts & Culture capture via Wikimedia Commons, PD-Art                   | OK. Credit the attribution as uncertain, as the deck does                                                                                                                                                                                    |
| 4   | Francisco de Goya, _The 3rd of May 1808 in Madrid_, 1814                                  | Museo Nacional del Prado, P000749                          | Prado in Google Earth capture via Wikimedia Commons, PD-Art                   | OK                                                                                                                                                                                                                                           |
| 5   | Käthe Kollwitz, _Woman with Dead Child_, 1903 (Kn 81, state VIII b of X)                  | Städel Museum, Frankfurt, inv. 66346 D                     | Städel Museum, "public domain"; trimmed to plate                              | Kollwitz died 1945, so it is PD in the EU from 2016 and the 1903 publication is PD in the US. Confirm the licence shown on the Städel page                                                                                                   |
| 6   | Raja Ravi Varma, _Shakuntala_, 1898                                                       | Sree Chitra Art Gallery, Thiruvananthapuram                | Google Arts & Culture capture via Wikimedia Commons, PD-Art                   | OK under PD-Art. Titles differ: the deck says "Shakuntala Looking Back" and GA&C says "Shakuntala Removing a Thorn from Her Foot". Pick one and note the alternative                                                                         |
| 7   | Artemisia Gentileschi, _Susanna and the Elders_, 1610                                     | Schönborn collection, Schloss Weißenstein, Pommersfelden   | Web Gallery of Art via Wikimedia Commons, PD-Art; secondary reproduction      | OK. The colour is not a museum capture                                                                                                                                                                                                       |
| 8   | Francisco de Goya, _The sleep of reason produces monsters_ (Caprichos 43), published 1799 | The Met, 18.64(43)                                         | The Met Open Access (CC0); trimmed to plate mark                              | Strongest: CC0 from the holder                                                                                                                                                                                                               |
| 10  | Attributed to Nainsukh, _The Disrobing of Draupadi_, c. 1760–65                           | The Met, 2022.247                                          | Ashmolean photograph (LI118.9, on loan) via Wikimedia Commons, PD-Art; 800 px | **Weakest.** The deck notes that the Met publishes its own copy with reuse restrictions, and the image is a UK museum photo (the UK is outside the EU Art. 14 rule). Prefer a link to the Met page, or have the owner accept the PD-Art risk |

Each credit line should name the artist, title, date, holder, accession number and image source as above. Where an image is trimmed, say so.

## Flagship projects (owner choice: Coding-For-MBA, Programming-Challenges-5, AI Attendance Management System)

| Repo                                                | State seen via GitHub API (2026-11-01)                                                                                                                                              | Notes for case studies                                                 |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Coding-For-MBA                                      | public, TypeScript, last push 2026-10-24, live site, no licence, README present                                                                                                     | Best evidence: live demo. Add a licence decision                       |
| Programming-Challenges-5                            | public, **archived**, Python, Unlicense, last push 2026-09-01, README 80 KB, folders Algorithmic, ArtificialIntelligence, EmulationModeling, GameDevelopment, WebDevelopment, tests | Not on the current site. Large repo; archived status must be explained |
| Attendance-Management-System-Using-Face-Recognition | public, Python, MIT, last push 2026-08-21, README present                                                                                                                           | Face data raises a privacy question to address in the case study       |

None of the case-study claims are verified yet; this is repository metadata only.

## Contact and voice decisions (owner)

- Public: email, GitHub, LinkedIn, Instagram handle `@saintkaprivate` (meant to be public, user-confirmed 2026-11-04). Phone stays private.
- Voice: dry and understated.

## Owner decisions 2026-11-01 (round 2)

- Paintings: leave out _The False Mirror_, _The Human Condition_ and _Slave Market with the Disappearing Bust of Voltaire_. Seven public-domain works may be used after each credit and licence is verified from the deck sources slide.
- Books: owner states all listed works are finished. Claim status: user-confirmed (2026-11-01). Stage 5.2 titles supplied; full text transcription is in `books-reading-path.md`.
- Music: out of launch scope.

## Bibliographic verification (2026-11-01)

At the owner's request every listed title was checked for existence and online availability. 123 of 124 entries are kept (35 with corrected author or title); the Price work was removed at the owner's request, and the owner confirmed keeping commercial-only titles. Full results: `books-reading-path.md` and `books-verified.json`.

## Hosted in P03 (2026-11-05)

- The seven public-domain works are hosted as WebP files in `site/public/art/<slug>/`: full image, thumbnail, the deck's detail crops and its focus crop. They are generated by `site/scripts/build-paintings.cjs` from the deck's own crop rectangles. Rows are in `project-system/audit/05-asset-provenance-inventory.csv`.
- Each painting page shows the full credit line (artist, title, date, medium, size, holder, reference, image credit) and links to the image source.
- _Disrobing of Draupadi_: the owner chose to host the Commons copy of the Ashmolean photograph (tagged PD-Art) even though the Ashmolean and the Met assert rights over their photographs. The owner accepted this risk.
- The Raja Ravi Varma work is titled _Shakuntala Looking Back_, and its alternative titles are noted on the page.
