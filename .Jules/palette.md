## 2025-02-27 - [Scoped Keyboard Navigation in Games]
**Learning:** Global `window.addEventListener` for keyboard controls in embedded games (like Minesweeper) hijacks page scrolling and breaks accessibility for non-game users.
**Action:** Use `onKeyDown` attached to the game container with `tabIndex="0"` (or managed focus on children) and stop propagation only for game-specific keys. Implement "Roving TabIndex" manually by updating `tabIndex` and calling `.focus()` on the active element.

## 2025-02-27 - [Reusable Focus Trap]
**Learning:** Implementing focus traps manually in each component leads to duplication and potential bugs (e.g., missing scroll lock or focus restoration).
**Action:** Extracted `useFocusTrap` hook to centralize overlay accessibility logic (trap, scroll lock, escape key). Use this hook for all future modal/overlay components.
