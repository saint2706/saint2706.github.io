# Digital Rishabh Portfolio

A Vite-powered React site for Rishabh Agrawal's portfolio, featuring a Gemini chatbot and roast mode.

## Environment Variables

Set the Gemini API key in a Vite-compatible environment variable so it is available to the client build:

```
VITE_GEMINI_API_KEY=<your_google_generative_ai_key>
```

For local development, create a `.env` or `.env.local` file in the project root with the value above, then run the dev server as usual:

```
npm install
npm run dev
```

## Deployment (GitHub Pages)

The deployment workflow expects the key to be provided as the `GEMINI_API_KEY` repository secret and maps it to `VITE_GEMINI_API_KEY` during the build step. Ensure the secret is configured so the chatbot remains available in production.
