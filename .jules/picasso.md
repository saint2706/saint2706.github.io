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
