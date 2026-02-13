/**
 * AI Service Module
 *
 * Front-end client for backend AI endpoints.
 */

import { sanitizeInput } from '../utils/security.js';

const API_TIMEOUT = 15000;
const MAX_INPUT_LENGTH = 1000;
const RATE_LIMIT_MS = 2000;
const ALLOWED_HISTORY_ROLES = new Set(['user', 'model']);

let lastChatRequestTime = 0;
let lastRoastRequestTime = 0;

const SESSION_STORAGE_KEY = 'ai-session-id';

const getSessionId = () => {
  try {
    const existing = localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const generated =
      globalThis.crypto?.randomUUID?.() || `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, generated);
    return generated;
  } catch {
    return `anon-${Date.now()}`;
  }
};

const withTimeout = async (url, options) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const postAI = async (path, payload) => {
  const response = await withTimeout(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId(),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unexpected AI server error.');
  }

  return data.text || '';
};

export const sanitizeHistoryForGemini = history => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.flatMap(entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return [];
    }

    if (!ALLOWED_HISTORY_ROLES.has(entry.role) || !Array.isArray(entry.parts)) {
      return [];
    }

    const sanitizedParts = entry.parts.flatMap(part => {
      if (
        !part ||
        typeof part !== 'object' ||
        Array.isArray(part) ||
        typeof part.text !== 'string'
      ) {
        return [];
      }

      const sanitizedText = sanitizeInput(part.text);
      if (!sanitizedText) {
        return [];
      }

      return [{ text: sanitizedText }];
    });

    if (sanitizedParts.length === 0) {
      return [];
    }

    return [{ role: entry.role, parts: sanitizedParts }];
  });
};

export const chatWithGemini = async (userMessage, history = []) => {
  if (!userMessage || typeof userMessage !== 'string') {
    return "I didn't catch that. Could you say it again?";
  }

  const sanitizedMessage = sanitizeInput(userMessage);
  if (!sanitizedMessage) {
    return "I didn't catch that. Could you say it again?";
  }

  if (sanitizedMessage.length > MAX_INPUT_LENGTH) {
    return `Whoa, that's a lot of text! My neural circuits are overloaded. Can you keep it under ${MAX_INPUT_LENGTH} characters?`;
  }

  const now = Date.now();
  if (now - lastChatRequestTime < RATE_LIMIT_MS) {
    return "I'm processing a lot of thoughts right now! Please give me a moment to catch my breath.";
  }

  try {
    const text = await postAI('/api/chat', {
      message: sanitizedMessage,
      history: sanitizeHistoryForGemini(history),
    });
    lastChatRequestTime = Date.now();
    return text;
  } catch (error) {
    if (error?.name === 'AbortError') {
      return "I'm thinking really hard, but my connection seems to be slow. Try asking me again!";
    }

    return error?.message || 'I seem to be having a connection glitch. Try again later!';
  }
};

export const roastResume = async () => {
  const now = Date.now();
  if (now - lastRoastRequestTime < RATE_LIMIT_MS) {
    return 'Roast oven is cooling down! Give it a second.';
  }

  try {
    const text = await postAI('/api/roast', {});
    lastRoastRequestTime = Date.now();
    return text;
  } catch (error) {
    if (error?.name === 'AbortError') {
      return 'I was brewing a really good roast, but it took too long. Try again!';
    }

    return error?.message || "I can't roast right now, I'm too nice. (Error connecting to AI)";
  }
};
