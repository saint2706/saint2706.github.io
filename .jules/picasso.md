# Picasso Learning

- Always add `aria-hidden="true"` to icon components if the parent button already has an `aria-label` or visible text.
- Added `aria-hidden` attributes to Lucide icons inside various buttons across the codebase to improve screen-reader accessibility and prevent redundant reading.

> > Added `aria-hidden="true"` to icon components if the parent button already has an `aria-label` or visible text to improve screen-reader accessibility and prevent redundant reading.
> > Added title attributes to icon buttons for better tooltip UX and accessibility
> > Removed redundant `title` attributes on elements that already implement custom UI tooltips (via inner span with hover states) to avoid the double-tooltip effect.

- Removed redundant `title` attributes on buttons that already had text content and `aria-label` attributes, improving accessibility and avoiding tooltip redundancy.
