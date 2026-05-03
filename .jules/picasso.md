# Picasso Learning

- Always add `aria-hidden="true"` to icon components if the parent button already has an `aria-label` or visible text.
- Added `aria-hidden` attributes to Lucide icons inside various buttons across the codebase to improve screen-reader accessibility and prevent redundant reading.

> > Added `aria-hidden="true"` to icon components if the parent button already has an `aria-label` or visible text to improve screen-reader accessibility and prevent redundant reading.
> > Added title attributes to icon buttons for better tooltip UX and accessibility
> > Removed redundant `title` attributes on elements that already implement custom UI tooltips (via inner span with hover states) to avoid the double-tooltip effect.

## Avoid Double Tooltips / Redundant Titles

- Found cases where components were using both `aria-label` (for screen readers) and `title` (for native tooltips), while also having visible text content (e.g. `Demo` and `Code` buttons in `Projects.jsx`).
- **Learning**: Avoid adding a native HTML `title` attribute to elements that already possess clear, visible text labels (or custom UI tooltips), as the native tooltip is redundant, provides no additional value, and can cause a double-tooltip effect. `title` attributes should generally be reserved for icon-only interactive elements without custom tooltips.
