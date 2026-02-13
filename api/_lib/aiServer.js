import { GoogleGenerativeAI } from '@google/generative-ai';
import { resumeData } from '../../src/data/resume.js';
import { redactPII, sanitizeInput } from '../../src/utils/security.js';

const MODEL_NAME = 'gemini-flash-latest';
const API_TIMEOUT_MS = 15000;
const MAX_USER_INPUT = 1000;
const MAX_HISTORY_ITEMS = 20;
const MAX_PART_LENGTH = 1500;
const MAX_RESPONSE_CHARS = 3000;
const ALLOWED_ROLES = new Set(['user', 'model']);

const SYSTEM_PROMPT = `
You are "Digital Rishabh", an AI assistant for Rishabh Agrawal's portfolio website.
Your goal is to answer questions about Rishabh's experience, skills, and projects based on his resume data.
You should be helpful, professional, but also have a slightly playful and geeky personality (reflecting Rishabh).

Here is Rishabh's Resume Data:
${JSON.stringify(redactPII(resumeData))}

Instructions:
1. Answer strictly based on the provided data. If you don't know something, say "I'm not sure about that, but you can ask Rishabh directly!"
2. Be concise.
3. If asked about "Roast Mode" or "Geek Mode", you can be snarky or use leet speak respectively.
4. Keep the tone conversational.
`;

const createTimeoutError = () => {
  const err = new Error('Request timed out');
  err.code = 'TIMEOUT';
  return err;
};

const withTimeout = async (promise, timeoutMs) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(createTimeoutError()), timeoutMs);
  });

  return Promise.race([promise.finally(() => clearTimeout(timeoutId)), timeout]);
};

export const validateMessage = rawMessage => {
  if (typeof rawMessage !== 'string') {
    throw new Error('`message` must be a string.');
  }

  const message = sanitizeInput(rawMessage);
  if (!message) {
    throw new Error('`message` cannot be empty.');
  }

  if (message.length > MAX_USER_INPUT) {
    throw new Error(`Message exceeds ${MAX_USER_INPUT} characters.`);
  }

  return message;
};

export const sanitizeHistory = rawHistory => {
  if (!Array.isArray(rawHistory)) {
    return [];
  }

  return rawHistory.slice(-MAX_HISTORY_ITEMS).flatMap(entry => {
    if (!entry || typeof entry !== 'object' || !ALLOWED_ROLES.has(entry.role)) {
      return [];
    }

    if (!Array.isArray(entry.parts)) {
      return [];
    }

    const parts = entry.parts.flatMap(part => {
      if (!part || typeof part !== 'object' || typeof part.text !== 'string') {
        return [];
      }

      const text = sanitizeInput(part.text);
      if (!text) {
        return [];
      }

      return [{ text: text.slice(0, MAX_PART_LENGTH) }];
    });

    if (parts.length === 0) {
      return [];
    }

    return [{ role: entry.role, parts }];
  });
};

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
};

export const truncateResponse = text => {
  if (typeof text !== 'string') {
    return '';
  }

  if (text.length <= MAX_RESPONSE_CHARS) {
    return text;
  }

  return `${text.slice(0, MAX_RESPONSE_CHARS)}…`;
};

export const runChatCompletion = async ({ message, history }) => {
  const model = getModel();

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Understood. I am Digital Rishabh. Ask me anything about Rishabh!' }] },
      ...history,
    ],
  });

  const result = await withTimeout(chat.sendMessage(message), API_TIMEOUT_MS);
  return truncateResponse(result.response.text());
};

export const runRoastCompletion = async () => {
  const model = getModel();
  const prompt = `
Roast Rishabh's resume! Be funny, sarcastic, and lighthearted.
Poke fun at the buzzwords (like "Data Storytelling" or "Synergy"), the number of certifications, or the fact that he's a "Data" person who also does "Marketing".
Keep it under 100 words.

Resume Data:
${JSON.stringify(redactPII(resumeData))}
`;

  const result = await withTimeout(model.generateContent(prompt), API_TIMEOUT_MS);
  return truncateResponse(result.response.text());
};

export const isTimeoutError = error => error?.code === 'TIMEOUT';
