# View-transition wrapped navigation toggle

A global config flag controls whether route changes are wrapped with `document.startViewTransition`.

## Disable globally

Set the Vite env flag below to `false` (for example in `.env`, `.env.production`, or your deployment environment):

```bash
VITE_ENABLE_VIEW_TRANSITION_NAVIGATION=false
```

With this set, `viewTransitionNavigate(...)` will always call plain React Router `navigate(...)` directly.

## Behaviors that should remain when disabled

Disabling the transition wrapper should **not** change navigation correctness:

- Client-side navigation should still happen for normal in-app clicks and keyboard activation.
- Modified clicks (new-tab / new-window gestures) should still preserve default browser behavior.
- Routing destinations and history behavior should stay the same as before.
- Users with reduced-motion preferences should continue to get non-animated navigation.

## Known supported browsers used for manual validation

Manual checks for transition-wrapped navigation have been run in modern engines where this project is actively tested:

- Chromium-based browsers (Google Chrome / Microsoft Edge)
- Safari/WebKit
- Firefox (fallback behavior validation when View Transitions are unavailable)
