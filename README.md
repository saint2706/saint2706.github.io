# Portfolio App

## AI backend migration (Gemini key ownership)

The Gemini API key is now **server-side only**.

### What changed

- Added backend endpoints:
  - `POST /api/chat`
  - `POST /api/roast`
- `src/services/ai.js` now calls those endpoints and no longer initializes `GoogleGenerativeAI` in the browser.
- Removed `VITE_GEMINI_API_KEY` usage from client code.

### Required environment variables

Set this in your deployment platform (Vercel project settings, server environment, etc.):

- `GEMINI_API_KEY` – Gemini API key used by server endpoints.

### Deployment notes

- `vercel.json` includes runtime configuration for `api/chat.js` and `api/roast.js`.
- Do **not** expose the Gemini key with `VITE_*` prefixes anymore.

### Security controls on backend

- Input validation (message type/content/length and structured history sanitization).
- Body size limits for incoming JSON payloads.
- Rate limiting using both client IP and session (`X-Session-Id`).
- Response size truncation before returning to the browser.
