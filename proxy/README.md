# Gemini proxy (Cloudflare Worker)

Keeps `GEMINI_API_KEY` server-side; the site calls this URL instead of Google.

```sh
cd proxy
pnpm dlx wrangler login
pnpm dlx wrangler secret put GEMINI_API_KEY   # paste a NEW key (rotate the old one)
pnpm dlx wrangler deploy                      # prints https://gemini-proxy.<you>.workers.dev
```

Then:

1. GitHub repo -> Settings -> Variables -> add `GEMINI_PROXY_URL` = the Worker URL (no trailing slash).
2. Delete the `VITE_GEMINI_API_KEY` line from `.github/workflows/deploy.yml`, delete the `GEMINI_API_KEY` repo secret.
3. Local dev: set `VITE_GEMINI_PROXY_URL` in `.env` (localhost:5173 is already allowed).

Limits: the origin check stops other websites, not scripts that fake an `Origin` header.
Add a Cloudflare rate-limiting rule and a Google Cloud spend cap on the key.
