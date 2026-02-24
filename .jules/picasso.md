# Picasso Learnings

## Accessibility
- **Dynamic ARIA Labels**: For toggle buttons (like mobile menu), using a dynamic `aria-label` (e.g., "Open menu" vs "Close menu") provides better context than a static "Toggle menu" label combined with `aria-expanded`.
- **Game Accessibility**: Interactive game elements (like "Start Game" overlay buttons) should have clear labels, especially when the visual text might be stylized or icon-heavy.
- **Focus Management**: While `useFocusTrap` is powerful, applying it to conditionally rendered internal components requires careful ref management. Sometimes simpler focus management (like `autoFocus`) combined with correct ARIA roles (`role="dialog"`) is a pragmatic first step.

## Testing
- **Query by Label**: Using `getByLabelText` in tests is a great way to enforce accessible names. If a test fails because it can't find a label, it likely means the implementation is inaccessible or the label is incorrect.
- **Playwright Verification**: Playwright's `get_by_label()` locator is excellent for verifying that accessibility attributes are correctly rendered in the browser.
