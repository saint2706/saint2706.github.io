## 2024-05-24 - Easter Egg Accessibility
**Learning:** Easter eggs and micro-interactions often bypass standard accessibility audits because they are considered 'hidden' or 'bonus' content. However, for screen reader users, encountering an unlabeled interactive element can be confusing and frustrating.
**Action:** Treat all interactive elements, including easter eggs, as first-class citizens requiring proper labels and focus management.

## 2025-02-12 - Hardcoded Colors vs Theme Tokens
**Learning:** Hardcoded colors like `bg-white` and `text-black` in overlay components (like `RoastInterface`) break the Liquid theme's dark mode and translucency effects. The design system relies on semantic tokens (`bg-card`, `text-primary`) or CSS variables (`var(--surface)`) to adapt correctly.
**Action:** Avoid utility colors. Use theme-aware primitives or explicit conditional logic (`isLiquid ? ... : ...`) to ensure readability across all themes.
