import { enforceRateLimit } from './_lib/rateLimit.js';
import { sendJson } from './_lib/http.js';
import { isTimeoutError, runRoastCompletion } from './_lib/aiServer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const rate = enforceRateLimit(req, 'roast');
  if (rate.limited) {
    return sendJson(res, 429, { error: rate.message });
  }

  try {
    const text = await runRoastCompletion();
    return sendJson(res, 200, { text });
  } catch (error) {
    if (isTimeoutError(error)) {
      return sendJson(res, 504, { error: 'AI request timed out. Please retry.' });
    }

    if (error?.message?.includes('Missing GEMINI_API_KEY')) {
      return sendJson(res, 500, { error: 'Server is missing GEMINI_API_KEY.' });
    }

    console.error('Roast endpoint error:', error);
    return sendJson(res, 502, { error: 'Unable to generate roast right now.' });
  }
}
