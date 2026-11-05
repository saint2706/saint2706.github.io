// Gemini proxy: holds the API key server-side so it never ships in the site bundle.
// Deploy: see proxy/README.md. Secret: GEMINI_API_KEY. Var: ALLOWED_ORIGINS (comma-separated).
// Origin can be faked by non-browser clients, so the model, request size, output length and
// per-IP rate are also capped here; the Google-side quota is the final backstop.
const UPSTREAM = 'https://generativelanguage.googleapis.com';
// Only the model and endpoints the site uses (src/services/ai.js); anything else is refused.
const ALLOWED_PATH =
  /^\/v1beta\/models\/gemini-flash-lite-latest:(generateContent|streamGenerateContent)$/;
// ai.js sends at most ~71k chars (60k history, 1k message, ~10k system prompt with the resume JSON).
// JSON escaping and UTF-8 can grow that several times, so the cap is generous; it only stops huge bodies.
const MAX_BODY_BYTES = 512 * 1024;
const MAX_OUTPUT_TOKENS = 2048;

// Reads the body but gives up (returns null) as soon as it passes `max` bytes, so a huge or
// unannounced-length body is never buffered whole.
async function readCapped(stream, max) {
  if (!stream) return '';
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return text + decoder.decode();
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
}

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

    const text =
      Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES
        ? null
        : await readCapped(request.body, MAX_BODY_BYTES);
    if (text === null) {
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
