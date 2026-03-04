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

### 5. Form Fields Accessibility
- **Contact Form**: Replaced `sr-only` class on labels with visually presented labels including an explicit `*` required indicator. Added `aria-required="true"` to Name, Email, and Message inputs to improve form accessibility.

### 6. Search Interface Polish
- **Blog Search**: Enhanced keyboard navigation by adding explicit `focus-visible:ring-2` and `focus-visible:ring-accent` classes to the "Clear search" (`X`) button.
- **Terminal Mode**: Added `aria-label="Minimize terminal"` and `aria-label="Maximize terminal"` to the decorative window control buttons to improve screen reader context.

### 7. Playground Empty States
- **Empty Filters**: Implemented a dedicated empty state UI for the code playground using `InboxIcon` from `lucide-react`. When filtering results in `filteredSnippets.length === 0`, it now displays a clear message rather than a blank grid.
