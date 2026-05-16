1. **Add unit tests for `ai.js` (uncovered lines 209, 225, 253, 266, 310)**
   - In `src/services/ai.test.js`, add tests covering the timeout handling, array input edge cases in `sanitizeHistoryForGemini`, and the `hasExceededHistoryLimit` / `budgetedText` / `sanitizeInput` empty return branches.
2. **Add unit tests for `security.js` (uncovered lines 59, 99, 163)**
   - In `src/utils/security.test.js`, test functions handling unexpected data types in `safeJSONStringify`, and decode failures in `validateUrl` and `validateImageSrc`.
3. **Complete pre-commit steps**
   - Run the full test suite (`pnpm test:run`), lint check, and pre-commit checks to ensure everything passes and test coverage requirements are met.
