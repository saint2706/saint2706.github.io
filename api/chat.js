import { enforceRateLimit } from './_lib/rateLimit.js';
import { readJsonBody, sendJson } from './_lib/http.js';
import {
  isTimeoutError,
  runChatCompletion,
  sanitizeHistory,
  validateMessage,
} from './_lib/aiServer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const rate = enforceRateLimit(req, 'chat');
  if (rate.limited) {
    return sendJson(res, 429, { error: rate.message });
  }

  try {
    const body = await readJsonBody(req);
    const message = validateMessage(body.message);
    const history = sanitizeHistory(body.history);

    const text = await runChatCompletion({ message, history });
    return sendJson(res, 200, { text });
  } catch (error) {
    if (error?.message?.includes('Payload too large')) {
      return sendJson(res, 413, { error: error.message });
    }

    if (isTimeoutError(error)) {
      return sendJson(res, 504, { error: 'AI request timed out. Please retry.' });
    }

    if (error?.message?.includes('Missing GEMINI_API_KEY')) {
      return sendJson(res, 500, { error: 'Server is missing GEMINI_API_KEY.' });
    }

    if (error instanceof Error && /`message`|Invalid JSON/.test(error.message)) {
      return sendJson(res, 400, { error: error.message });
    }

    console.error('Chat endpoint error:', error);
    return sendJson(res, 502, { error: 'Unable to reach AI provider right now.' });
  }
}
