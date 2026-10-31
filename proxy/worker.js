// Gemini proxy: holds the API key server-side so it never ships in the site bundle.
// Deploy: see proxy/README.md. Secret: GEMINI_API_KEY. Var: ALLOWED_ORIGINS (comma-separated).
const UPSTREAM = 'https://generativelanguage.googleapis.com';
// Only the endpoints the site uses; anything else (model listing, file upload, tuning) is refused.
const ALLOWED_PATH = /^\/v1beta\/models\/[\w.-]+:(generateContent|streamGenerateContent)$/;

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

    const upstream = await fetch(UPSTREAM + url.pathname + url.search, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: request.body,
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  },
};
