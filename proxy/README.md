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

## Limits

The origin check stops other websites, not scripts that fake an `Origin` header. Against those, the worker:

- accepts only `gemini-flash-lite-latest` (the model `src/services/ai.js` uses);
- rate-limits each IP to 10 requests a minute (`[[ratelimits]]` in `wrangler.toml`, counted per Cloudflare location);
- rejects bodies over 512 KiB, checked against `Content-Length` and while reading, so a huge body is never buffered (the site sends at most about 71,000 characters before JSON escaping) and caps `maxOutputTokens` at 2048.

None of this proves a visitor is human, so the real backstop is on Google's side. Use a key restricted to the Generative Language API, in a Google Cloud project **with billing turned off**. Abuse can then only use up the free quota and never charge you.
