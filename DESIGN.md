# Design direction and governance

## Approved so far

- Concept: A1 Specimen Field, approved by the owner 2026-11-04 (`design/concepts/a1-specimen-field/`).

## Still provisional

Palette: the owner reopened it on 2026-11-04 (Vermilion withdrawn). Round 3 offers A Cyanotype, B Malachite and C Sealing wax in `design/system/index.html`; professional, personal and lab each map the same roles to their own colours.

Font pairing (Young Serif, Atkinson Hyperlegible Next, Atkinson Hyperlegible Mono; all SIL OFL 1.1, self-hosted), grid, section components and responsive page designs. None is final until the owner approves it.

## Principles

- Visual opening: a distinctive composition with expressive typography, visual motif, spatial rhythm and curiosity, not a generic hero.
- Artistic/eclectic yet composed: gallery-like editorial pacing and meaningful juxtaposition, with clear hierarchy.
- Layered coherence: shared foundations with content-led section systems and deliberate signature departures.
- Form follows content: art, books, music, engineering and experiments need not share templates.
- Motion: restrained by default; elaborate only where it improves the story. Respect reduced motion and measure mobile cost.
- Identity: no photo/selfie/portrait/AI likeness of the user; use symbols, typography, custom graphics, diagrams, objects/places or licensed artwork.

## Figma-first workflow (superseded for concept medium by ADR-005: code-first concepts in `design/concepts/`; steps below still apply with HTML/CSS as the canvas)

1. Broad research, curated by principles and use case.
2. Multiple genuinely distinct concepts, not palette swaps.
3. New dedicated Figma file with research, concepts, design system, page designs and prototypes.
4. Review composition, typography, color, imagery, hierarchy, transitions, responsive behavior and interaction.
5. Record feedback, rejected concepts and decisions.
6. Approve concept before final token lock-in.
7. Build shared and section-specific systems progressively.
8. Implement only approved sections; review browser output at mobile/tablet/desktop.
9. Trace important Figma decisions to code tokens, components and assets; document deviations.

## Design system

Shared foundations may include spacing logic, semantic type/color roles, focus/motion conventions and layout principles. Components are shared only if their behavior genuinely recurs. Sections may define own tokens/compositions when justified. Immersive experiences need performance and accessible equivalents.

## Creative review

Review with written evidence for: originality, storytelling, composition, atmosphere, coherence, fit to content, authenticity, accessibility/usability. A score does not replace critique.

## Visual and accessibility testing

Playwright screenshots compare against approved baselines in a consistent OS/browser environment. Investigate differences before updating snapshots. Target WCAG 2.2 AA; test keyboard, touch, focus, contrast, semantics, reflow, screen readers and reduced motion. Every significant interaction needs an accessible equivalent for essential content/functionality.
