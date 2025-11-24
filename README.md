# Digital Rishabh Portfolio

A Vite-powered React site for Rishabh Agrawal's portfolio, featuring a Gemini chatbot (powered by gemini-2.5-flash) and roast mode.

## Environment Variables

For local development, create a `.env` or `.env.local` file in the project root with the following values:

```
VITE_GEMINI_API_KEY=<your_google_generative_ai_key>
VITE_FIREBASE_API_KEY=<your_firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_firebase_auth_domain>
VITE_FIREBASE_PROJECT_ID=<your_firebase_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_firebase_storage_bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_firebase_messaging_sender_id>
VITE_FIREBASE_APP_ID=<your_firebase_app_id>
```

You can copy `.env.example` to `.env` and update the values as needed.

Then run the dev server as usual:

```
npm install
npm run dev
```

## Deployment (GitHub Pages)

The deployment workflow expects the following repository secrets to be configured:

- `GEMINI_API_KEY` - Maps to `VITE_GEMINI_API_KEY` for the Gemini chatbot
- `FIREBASE_API_KEY` - Maps to `VITE_FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN` - Maps to `VITE_FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID` - Maps to `VITE_FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET` - Maps to `VITE_FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID` - Maps to `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID` - Maps to `VITE_FIREBASE_APP_ID`

Ensure these secrets are configured in the repository settings for the application to work correctly in production.
