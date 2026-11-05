// Gemini proxy: holds the API key server-side so it never ships in the site bundle.
// Deploy: see proxy/README.md. Secret: GEMINI_API_KEY. Var: ALLOWED_ORIGINS (comma-separated).
// Origin can be faked by non-browser clients, so the model, request size, output length and
// per-IP rate are also capped here; the Google-side quota is the final backstop.
const UPSTREAM = 'https://generativelanguage.googleapis.com';
// Only the model and endpoints the site uses (src/services/ai.js); anything else is refused.
const ALLOWED_PATH =
  /^\/v1beta\/models\/gemini-flash-lite-latest:(generateContent|streamGenerateContent)$/;
const MAX_BODY_CHARS = 32_000; // chat input is capped at 1000 chars plus a short history
const MAX_OUTPUT_TOKENS = 2048;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map(o => o.trim());
    if (!allowed.includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'content-type, x-goog-api-client, x-goog-api-key',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      Vary: 'Origin',
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    if (request.method !== 'POST' || !ALLOWED_PATH.test(url.pathname)) {
      return new Response('Not found', { status: 404, headers: cors });
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (env.RATE_LIMITER && !(await env.RATE_LIMITER.limit({ key: ip })).success) {
      return new Response('Too many requests', { status: 429, headers: cors });
    }

    const text = await request.text();
    if (text.length > MAX_BODY_CHARS) {
      return new Response('Request too large', { status: 413, headers: cors });
    }
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return new Response('Bad request', { status: 400, headers: cors });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return new Response('Bad request', { status: 400, headers: cors });
    }
    const asked = Number(body.generationConfig?.maxOutputTokens);
    body.generationConfig = {
      ...body.generationConfig,
      maxOutputTokens: asked > 0 ? Math.min(asked, MAX_OUTPUT_TOKENS) : MAX_OUTPUT_TOKENS,
    };

    const upstream = await fetch(UPSTREAM + url.pathname + url.search, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      },
    });
  },
};
