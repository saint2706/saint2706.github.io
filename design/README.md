# Design concepts

Code-first design concepts (see `project-system/decisions/ADR-005-design-medium.md`). Not part of the site build or deployment.

- `concepts/a1-specimen-field/index.html`: Direction A1 concept (open the file in a browser). Greyscale placeholders only, system fonts, no external requests, motion toggle, reduced-motion support, plain-text index dialog. All copy is DRAFT.

Checks run so far: Chrome at 1440, 834 and 390 px: no horizontal overflow, all targets at least 44 px, no console errors, reduced motion starts with motion off, index dialog opens and closes with Escape. Firefox and Safari not yet tested.
