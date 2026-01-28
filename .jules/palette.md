## 2024-05-22 - Neubrutalism Shadow Pattern
**Learning:** This project uses a specific "Neubrutalism" shadow style defined in CSS variables (`--nb-shadow`, `--nb-shadow-hover`) and border width (`3px`). New interactive elements must strictly adhere to this pattern (border-3, specific shadow) to maintain visual consistency.
**Action:** When adding new buttons or cards, apply `border-[3px] border-[color:var(--color-border)]` and inline style `boxShadow: 'var(--nb-shadow)'`.

## 2024-05-23 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like ScrollToTop) often lack visual labels for mouse users, relying only on aria-labels. Adding tooltips improves clarity and consistency with other nav elements.
**Action:** Always pair icon-only buttons with a tooltip on hover/focus, using the standard `bg-black text-white text-xs` pattern seen in Navbar.

## 2024-05-24 - Dynamic Content Accessibility
**Learning:** Dynamic content updates in modals (like the Roast Mode status) are silent to screen readers unless explicitly marked with `aria-live`. Since the content replaces the previous state entirely, `aria-atomic="true"` is also needed.
**Action:** Wrap dynamic content containers in `aria-live="polite"` `aria-atomic="true"` and toggle `aria-busy={isLoading}` to prevent partial announcements.
