# Design directions (P02-T01)

Status: **proposals for user review. None approved. No palette, font choice or token is selected.** Directions differ in structure, navigation and storytelling mechanism, not in colour. Constraints from `PRODUCT.md`/`DESIGN.md`: visual opening (not a generic hero), no likeness of the owner, three spaces (professional, personal, lab), accessible equivalents for every interaction, restrained motion, Astro + React islands (ADR-001), no empty sections.

## Concepts

### A. Cabinet of Curiosities

- **Idea:** the homepage is an arranged field of typographic and object "specimens" (one per space and featured piece) that visitors pick from.
- **Opening:** composition of oversized letterforms and diagram fragments; each element is a link with a one-line label.
- **Navigation:** object picks lead into spaces; a plain text index always exists as the accessible equivalent.
- **Space transitions:** each space reframes the same objects (professional = labelled plates, personal = looser arrangement, lab = unlabelled prototypes).
- **Motion:** hover/scroll reveals, optional; global motion toggle.
- **Strengths:** strongest first impression, suits eclectic interests. **Risks:** discoverability and mobile layout; easy to become a novelty; needs strong static fallback.
- **Reference lessons:** D05 (labelled modes), D03 (static text for interactions), S02/S03.

### B. Folio / Monograph

- **Idea:** the site reads like a printed monograph: spreads, plates, captions, plate numbers.
- **Opening:** a title plate with expressive typography and a contents list; progressive discovery by turning "pages" (scroll or links).
- **Navigation:** contents index plus numbered sections; each case study is a chapter with a plate sequence.
- **Space transitions:** a change of "volume" (title plate and layout grammar) between professional and personal.
- **Motion:** minimal; page-turn style transitions only where View Transitions are supported.
- **Strengths:** calm, excellent for long case studies, light on JS. **Risks:** can feel static; needs genuinely strong typography and imagery to avoid looking like a template.
- **Reference lessons:** D07 (editorial essays and collections), D06 (visible metadata), D02 (scannable structure).

### C. Atlas

- **Idea:** the site is a map or diagram of the owner's work and interests; routes are coordinates; the data-storyteller identity shows through real visualizations.
- **Opening:** a diagram built from real, verifiable data (for example repositories, writing dates) rendered as an interactive-plus-static figure. No invented metrics.
- **Navigation:** regions on the map, mirrored by a list view.
- **Space transitions:** zoom into a region; professional is the surveyed area, personal the margins, lab the unmapped territory.
- **Motion:** zoom and pan, with reduced-motion cut transitions.
- **Strengths:** ties the design to the analytics skill, memorable. **Risks:** highest design and engineering cost; data must be real; accessibility of map interactions needs careful equivalents.
- **Reference lessons:** D04 (data storytelling), D03 (explain every demo in text), D01 (credit and behind the scenes).

### D. Reading Room / Garden

- **Idea:** an index-led, typographic site where every item carries mode, date and status, like a garden with labelled paths.
- **Opening:** a typographic composition with a "now" strip and a labelled map of the three spaces; no hero image.
- **Navigation:** one clear header; sections described by one-line mode labels; filterable dated indexes.
- **Space transitions:** each space is a named room with its own index grammar.
- **Motion:** almost none; speed and legibility are the feature.
- **Strengths:** best accessibility, performance and low maintenance; suits writing-heavy plans. **Risks:** least visually dramatic; the artistic atmosphere depends on typography and curated imagery.
- **Reference lessons:** D05, D06, D04, D07.

## Concept matrix (qualitative; judgment, not measurement)

| Criterion                      | A Cabinet   | B Folio     | C Atlas | D Reading Room |
| ------------------------------ | ----------- | ----------- | ------- | -------------- |
| Visual-opening distinctiveness | High        | Medium-High | High    | Medium         |
| Fit with three spaces          | High        | High        | High    | High           |
| Case-study storytelling        | Medium      | High        | Medium  | Medium-High    |
| Accessibility effort           | High        | Low         | High    | Low            |
| Performance risk               | Medium      | Low         | High    | Low            |
| Mobile adaptation              | Hard        | Easy        | Hard    | Easy           |
| Build/maintenance cost         | Medium-High | Medium      | High    | Low            |
| Risk of looking templated      | Low         | Medium      | Low     | Medium         |

Combination note: B or D can serve as the shared foundation with A or C reserved for the homepage opening or lab, which keeps most pages light. This is a suggestion, not a decision.

## Rejected or parked options

- **Fully 3D explorable world (as D01):** hostile to accessibility, performance and no-JS delivery; rejected for the whole site, possibly parked for a single lab experiment.
- **Conventional hero (heading, subtitle, buttons):** excluded by the product brief.
- **Neon/dark "developer template":** generic; conflicts with originality goals.
- **Portrait, selfie or AI likeness:** excluded by the product brief.
- **Backend-dependent features in core pages (D01 anti-pattern):** parked; static first.
- **Awwwards-driven trend chasing:** discovery only (D09 unverified).

## Open questions for review (no decisions taken)

1. Which of A-D (or which combination) should proceed to Figma exploration in P02-T02, once you authorize it?
2. What visual references from the library do you like or dislike? Please react to the _visuals_ of D01-D08, since this research could not observe typography or colour.
3. Mood words and anything you want to exclude (to guide palette work later; no palette is chosen).
4. Which interests should have a visible presence at launch (the brief says no empty sections)?

## Acceptance check

- Annotated references with dates and limitations: yes (library).
- Concepts materially different in structure: yes.
- No asset treated as licensed because referenced: yes (Met terms unread; others unverified).
- Palette unapproved: yes.
