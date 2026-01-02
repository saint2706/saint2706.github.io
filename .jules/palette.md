## 2024-05-23 - Accessibility Patterns for Visual Components
**Learning:** Decorative visual elements that convey data (like progress bars) need explicit ARIA roles to be meaningful to screen readers. Specifically, `role="progressbar"` combined with `aria-valuenow` provides the necessary context that a visual width style cannot.
**Action:** When creating data visualization components, always include ARIA roles that describe the data's nature and value, not just its visual representation. Use `useId` to link labels to these components robustly.

## 2024-05-23 - Accessible Loading States
**Learning:** Skeleton screens are great for perceived performance but can be noisy or confusing for screen readers if not properly managed. Purely visual skeletons should be hidden with `aria-hidden="true"`, while the container should use `role="status"` or `aria-busy` to communicate the loading state.
**Action:** When implementing skeleton loaders, ensure the skeleton components are decorative only and the parent container explicitly announces the busy state to assistive technology.

## 2024-05-24 - Respecting Reduced Motion
**Learning:** Decorative background animations (like floating icons) can be distracting or cause discomfort for users with vestibular disorders. These elements should respect `prefers-reduced-motion` settings.
**Action:** Use `useReducedMotion` hook to conditionally render or disable animations for decorative elements. For purely decorative elements, hiding them entirely for reduced motion users is often the best "quiet" experience.
