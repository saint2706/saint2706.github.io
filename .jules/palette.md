## 2024-05-22 - Neubrutalism Shadow Pattern
**Learning:** This project uses a specific "Neubrutalism" shadow style defined in CSS variables (`--nb-shadow`, `--nb-shadow-hover`) and border width (`3px`). New interactive elements must strictly adhere to this pattern (border-3, specific shadow) to maintain visual consistency.
**Action:** When adding new buttons or cards, apply `border-[3px] border-[color:var(--color-border)]` and inline style `boxShadow: 'var(--nb-shadow)'`.
