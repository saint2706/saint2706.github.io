# Picasso Learnings

## Accessibility

- **Dynamic ARIA Labels**: For toggle buttons (like mobile menu), using a dynamic `aria-label` (e.g., "Open menu" vs "Close menu") provides better context than a static "Toggle menu" label combined with `aria-expanded`.
- **Game Accessibility**: Interactive game elements (like "Start Game" overlay buttons) should have clear labels, especially when the visual text might be stylized or icon-heavy.
- **Focus Management**: While `useFocusTrap` is powerful, applying it to conditionally rendered internal components requires careful ref management. Sometimes simpler focus management (like `autoFocus`) combined with correct ARIA roles (`role="dialog"`) is a pragmatic first step.
- **Keyboard Navigation Scope**: Avoid attaching `keydown` listeners to `window` for game controls. Instead, attach them to the game container and use `tabIndex` and `focus()` to scope keyboard interactions. This prevents interference with global page navigation (like scrolling) and improves accessibility for screen reader users who expect focus to remain within the interactive widget.
- **Programmatic Focus**: When implementing custom keyboard navigation (e.g., roving tabindex), ensure focus is programmatically moved to the active element using `ref.current.focus()` inside a `useEffect` hook that watches for focus state changes. This ensures the browser's focus matches the application's internal state.

## Testing

- **Query by Label**: Using `getByLabelText` in tests is a great way to enforce accessible names. If a test fails because it can't find a label, it likely means the implementation is inaccessible or the label is incorrect.
- **Playwright Verification**: Playwright's `get_by_label()` locator is excellent for verifying that accessibility attributes are correctly rendered in the browser.
