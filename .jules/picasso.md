# Picasso UX Improvements

## Summary

Implements various UX and accessibility enhancements across the application, focusing on interactive feedback and screen reader support.

## Changes

### 1. Game Accessibility

- **LightsOut**: Added a dedicated "Reset Puzzle" button visible during gameplay. This allows users to restart without needing to win or lose first.
- **TicTacToe**: Verified ARIA labels and announcements are sufficient for screen readers.

### 2. Contact Form UX

- **Loading State**: Replaced the "Send" icon with a spinning loader (`Loader2`) during form submission.
- **Success Feedback**: Added a visual success state (green banner with `CheckCircle` icon) that appears after the "email client opening" simulation completes. This provides clear confirmation to the user that the action succeeded.
- **Accessibility**: Added `aria-busy` to the form during submission.

### 3. Chat Interface Accessibility

- **Typing Indicator**: Wrapped the typing indicator in a container with `role="status"` and `aria-label="AI is typing"` to ensure screen readers announce when the bot is processing.
- **Close Button**: Added a native `title="Close chat"` tooltip to the chat window's close button for better discoverability.
- **Form Inputs**: Added an explicitly linked hidden `<label>` to the `<input>` element to improve form accessibility for screen readers.

### 4. Form Labels Accessibility

- **Contact Form**: Added explicitly linked hidden `<label>` tags to the `message` `<textarea>` to improve form accessibility for screen readers.
- **Terminal Mode**: Added explicitly linked hidden `<label>` tags to the `<input>` element.
- **Command Palette**: Added explicitly linked hidden `<label>` tags to the `<input>` element.

## Verification

- `pnpm lint` passed.
- `pnpm test` passed (207 tests).
- Manual code review confirmed logical correctness of state transitions and conditional rendering.
- Added dynamic aria-label to PythonRunner component based on execution state (isRunning) to improve accessibility for screen readers.
- Added `aria-label` attributes to missing buttons and inputs to improve screen reader accessibility.

### 5. Themed Button Accessibility

- Always add `aria-hidden="true"` to visual loading spinners like `<Loader2 />` inside buttons when the button itself is already marked with `aria-busy`. This prevents screen readers from redundantly announcing the spinner icon.
- Added `focus-visible` styling to navigation links for both Liquid and Neubrutalism themes in `Navbar.jsx` to ensure consistent keyboard focus visibility.
- Added `id` properties to tab buttons and an `aria-labelledby` property to the tab panel in `Playground.jsx` to properly link the tabs to their content for screen readers.

- Always add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2` classes to icon-only buttons (e.g., copy buttons, close buttons) to ensure consistent and accessible keyboard focus visibility across the application.

### 6. Copy Action Accessibility

- When changing the text or icon of a copy button to "Copied!", screen readers may not automatically read the update. Ensure there is a visually hidden element with `aria-live="polite"` that receives the "Copied!" text, so screen readers immediately notify the user of the successful action. Fixed this pattern in `Playground.jsx`, `ChatInterface.jsx`, and `RoastInterface.jsx`.
