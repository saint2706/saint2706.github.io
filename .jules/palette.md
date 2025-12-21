## 2024-05-23 - Accessibility Patterns for Visual Components
**Learning:** Decorative visual elements that convey data (like progress bars) need explicit ARIA roles to be meaningful to screen readers. Specifically, `role="progressbar"` combined with `aria-valuenow` provides the necessary context that a visual width style cannot.
**Action:** When creating data visualization components, always include ARIA roles that describe the data's nature and value, not just its visual representation. Use `useId` to link labels to these components robustly.
