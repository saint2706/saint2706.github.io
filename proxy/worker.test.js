// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from './worker.js';

const SITE = 'https://saint2706.github.io';
const PATH = '/v1beta/models/gemini-flash-lite-latest:generateContent';
const env = (over = {}) => ({ ALLOWED_ORIGINS: SITE, GEMINI_API_KEY: 'k', ...over });
const call = (path, body, { origin = SITE, method = 'POST' } = {}) =>
  new Request('https://proxy.example' + path, {
    method,
    headers: { Origin: origin, 'content-type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' },
    body: method === 'POST' ? body : undefined,
  });

afterEach(() => vi.unstubAllGlobals());

describe('gemini proxy', () => {
  it('refuses unknown origins and other models', async () => {
    expect(
      (await worker.fetch(call(PATH, '{}', { origin: 'https://evil.example' }), env())).status
    ).toBe(403);
    const pro = PATH.replace('flash-lite-latest', '2.5-pro');
    expect((await worker.fetch(call(pro, '{}'), env())).status).toBe(404);
  });

  it('rejects oversized and malformed bodies before calling Google', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    expect((await worker.fetch(call(PATH, 'x'.repeat(128_001)), env())).status).toBe(413);
    expect((await worker.fetch(call(PATH, 'not json'), env())).status).toBe(400);
    expect((await worker.fetch(call(PATH, '[1]'), env())).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('returns 429 when the rate limiter says no', async () => {
    const limiter = { limit: vi.fn(async () => ({ success: false })) };
    const res = await worker.fetch(call(PATH, '{}'), env({ RATE_LIMITER: limiter }));
    expect(res.status).toBe(429);
    expect(limiter.limit).toHaveBeenCalledWith({ key: '1.2.3.4' });
  });

  it('accepts the largest chat the site can send', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 200 }))
    );
    const turn = text => ({ role: 'user', parts: [{ text }] });
    const history = Array.from({ length: 15 }, () => turn('"'.repeat(2000) + 'a'.repeat(2000)));
    const body = JSON.stringify({
      contents: [...history, turn('m'.repeat(1000))],
      systemInstruction: { parts: [{ text: 's'.repeat(2500) }] },
    });
    expect((await worker.fetch(call(PATH, body), env())).status).toBe(200);
  });

  it('caps output tokens and adds the key server-side', async () => {
    const upstream = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', upstream);
    const body = JSON.stringify({
      contents: [],
      generationConfig: { maxOutputTokens: 100000, temperature: 1 },
    });
    const res = await worker.fetch(call(PATH + '?alt=sse', body), env());
    expect(res.status).toBe(200);
    const [url, init] = upstream.mock.calls[0];
    expect(url).toBe('https://generativelanguage.googleapis.com' + PATH + '?alt=sse');
    expect(init.headers['x-goog-api-key']).toBe('k');
    expect(JSON.parse(init.body).generationConfig).toEqual({
      maxOutputTokens: 2048,
      temperature: 1,
    });
  });
});
