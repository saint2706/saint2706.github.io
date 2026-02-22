## 2025-02-27 - [Scoped Keyboard Navigation in Games]

**Learning:** Global `window.addEventListener` for keyboard controls in embedded games (like Minesweeper) hijacks page scrolling and breaks accessibility for non-game users.
**Action:** Use `onKeyDown` attached to the game container with `tabIndex="0"` (or managed focus on children) and stop propagation only for game-specific keys. Implement "Roving TabIndex" manually by updating `tabIndex` and calling `.focus()` on the active element.
