/**
 * AI Service Module
 *
 * Provides AI-powered chat and roasting functionality using Google's Gemini API.
 * This service handles chatbot interactions and resume roasting features with
 * built-in security measures including rate limiting, input validation, and timeout protection.
 *
 * @module services/ai
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { resumeData } from '../data/resume.js';
import { sanitizeInput, redactPII } from '../utils/security.js';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage.js';

// API Configuration
const API_KEY = import.meta?.env?.VITE_GEMINI_API_KEY?.trim();
const API_TIMEOUT = 15000; // Maximum time (ms) to wait for API response before timing out
const MAX_INPUT_LENGTH = 1000; // Maximum allowed characters in user input to prevent token exhaustion
const RATE_LIMIT_MS = 2000; // Minimum time (ms) between consecutive requests to prevent API abuse
const ALLOWED_HISTORY_ROLES = new Set(['user', 'model']);
const HISTORY_SANITIZATION_LIMITS = {
  maxEntries: 30,
  maxPartsPerEntry: 1,
  maxCharsPerPart: 4000,
  maxTotalChars: 60000,
};
const MISSING_API_KEY_ERROR =
  'My AI circuits are currently offline. Please check the configuration.';
const CHAT_RATE_LIMIT_KEY = 'chat_last_request_time';
const ROAST_RATE_LIMIT_KEY = 'roast_last_request_time';

// Rate limiting: Initialize from localStorage to enforce limits across page reloads
let lastChatRequestTime = parseInt(safeGetLocalStorage(CHAT_RATE_LIMIT_KEY, '0'), 10);
let lastRoastRequestTime = parseInt(safeGetLocalStorage(ROAST_RATE_LIMIT_KEY, '0'), 10);

/**
 * Gets an instance of the Gemini AI model.
 *
 * @returns {object|null} The Gemini model instance, or null if API key is not configured
 * @private
 */
const getModel = () => {
  if (!API_KEY) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
};

/**
 * Custom error class for timeout handling.
 * Used to distinguish timeout errors from other API errors.
 *
 * @class TimeoutError
 * @extends Error
 */
class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wraps a promise with a timeout mechanism.
 * Creates a race condition between the original promise and a timeout promise.
 *
 * @param {Promise} promise - The promise to wrap with timeout
 * @param {number} ms - Timeout duration in milliseconds
 * @returns {Promise} A promise that rejects with TimeoutError if timeout is reached
 * @private
 */
const withTimeout = (promise, ms) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError('Request timed out')), ms);
  });

  // Race between the original promise and timeout, cleaning up the timer when done
  return Promise.race([promise.finally(() => clearTimeout(timeoutId)), timeoutPromise]);
};

/**
 * System prompt that defines the AI assistant's personality and constraints.
 * This prompt is injected at the start of every chat session to maintain consistent behavior.
 * NOTE: Resume data is minified (no indentation) to reduce token usage and payload size.
 */
const SYSTEM_PROMPT = `
You are "Digital Rishabh", an AI assistant embedded in Rishabh Agrawal's personal portfolio website (https://saint2706.github.io).
Your sole purpose is to help visitors learn about Rishabh's background, skills, projects, and experience.

Here is Rishabh's Resume Data (source of truth — do not invent details outside this):
${JSON.stringify(redactPII(resumeData))}

## Persona
- You are knowledgeable, warm, and slightly geeky — mirroring Rishabh's own personality.
- Use casual, conversational language while staying professional.
- Add light, tasteful humour where natural, but never at the visitor's expense.

## Response Guidelines
1. **Accuracy first**: Answer ONLY from the provided resume data. If something isn't covered, say "I'm not sure about that — you can ask Rishabh directly on LinkedIn!" and point to his LinkedIn URL from the socials list.
2. **Be concise**: 2–4 sentences for simple questions; a short bullet list for complex ones. Avoid walls of text.
3. **Formatting**: Use markdown sparingly — bullet points for skill/project lists, bold for key terms. Plain prose for everything else.
4. **Contact requests**: Direct visitors to Rishabh's LinkedIn or GitHub (from the socials data) rather than sharing any other personal contact details.
5. **Off-topic questions**: Politely acknowledge, then steer back — e.g. "That's outside my expertise as Digital Rishabh! Ask me about his projects or skills instead."
6. **No hallucination**: Never invent experiences, opinions, or facts not present in the resume data.
7. **Current context**: Rishabh is currently pursuing a PGDM in Big Data Analytics at Goa Institute of Management (GIM, 2025–2027) after completing his B.Tech in Computer Science from VIT.

## Special Modes
- **Roast Mode** (if the user explicitly asks): Switch to playfully snarky, self-aware commentary about Rishabh's resume — poke fun at buzzwords, the cert collection, and quirky projects, while keeping it affectionate and good-natured.
- **Geek Mode** (if the user explicitly asks): Respond in leet speak (substitute digits/symbols for letters, e.g. "3" for E, "0" for O, "@" for A, "1" for I) while still giving accurate, useful answers.
`;

/**
 * Sends a chat message to the Gemini AI and returns a response.
 *
 * This function implements several security and performance measures:
 * - Input validation (type checking and length limits)
 * - Rate limiting to prevent API abuse
 * - Timeout protection to prevent hanging requests
 * - Comprehensive error handling for various failure scenarios
 *
 * @async
 * @param {string} userMessage - The user's message to send to the AI
 * @param {Array<object>} [history=[]] - Optional chat history for context (array of {role, parts} objects)
 * @returns {Promise<string>} The AI's response text or an error message
 *
 * @example
 * const response = await chatWithGemini("What are Rishabh's skills?");
 * // => "Rishabh has expertise in..."
 *
 * @example
 * // With history for multi-turn conversation
 * const history = [
 *   { role: "user", parts: [{ text: "Hello" }] },
 *   { role: "model", parts: [{ text: "Hi! How can I help?" }] }
 * ];
 * const response = await chatWithGemini("Tell me more", history);
 */
/**
 * Sends a user message to the Gemini API and returns the response.
 * @param {string} userMessage - The user's input message.
 * @param {Array<{role: string, parts: Array<{text: string}>}>} [history=[]] - The conversation history.
 * @returns {Promise<string>} The AI's response text.
 */
export const chatWithGemini = async (userMessage, history = []) => {
  // Input Validation: Check type and length to prevent DoS/token exhaustion
  if (!userMessage || typeof userMessage !== 'string') {
    return "I didn't catch that. Could you say it again?";
  }

  // Sanitize input to prevent injection attacks and ensure data integrity
  const sanitizedMessage = sanitizeInput(userMessage);
  if (!sanitizedMessage) {
    return "I didn't catch that. Could you say it again?";
  }

  if (sanitizedMessage.length > MAX_INPUT_LENGTH) {
    return `Whoa, that's a lot of text! My neural circuits are overloaded. Can you keep it under ${MAX_INPUT_LENGTH} characters?`;
  }

  // Rate limiting: Prevent rapid successive requests that could exhaust API quota
  const now = Date.now();
  if (now - lastChatRequestTime < RATE_LIMIT_MS) {
    return "I'm processing a lot of thoughts right now! Please give me a moment to catch my breath.";
  }

  // Update persistent rate limit immediately to prevent race conditions and enforce attempt limits
  lastChatRequestTime = now;
  safeSetLocalStorage(CHAT_RATE_LIMIT_KEY, now.toString());

  const model = getModel();
  if (!model) {
    return MISSING_API_KEY_ERROR;
  }

  try {
    // Sanitize history messages to prevent injection attacks from tampered localStorage
    const sanitizedHistory = sanitizeHistoryForGemini(history);

    // Initialize chat with system prompt and conversation history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am Digital Rishabh. Ask me anything about Rishabh!' }],
        },
        ...sanitizedHistory,
      ],
    });

    // Send message with timeout protection to prevent hanging requests
    const result = await withTimeout(chat.sendMessage(sanitizedMessage), API_TIMEOUT);
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    // Comprehensive error handling with specific messages for different failure modes
    const errorMessage = error?.message || 'Unknown error';
    const isLeakedKey = errorMessage.toLowerCase().includes('reported as leaked');
    const isTimeout = error instanceof TimeoutError;

    // Handle leaked API key scenario (requires key rotation)
    if (isLeakedKey) {
      return 'The Gemini API key was blocked because it was detected as leaked. Rotate the key in GitHub Secrets, restrict it to the deployed domain, and try again.';
    }

    // Handle timeout scenario
    if (isTimeout) {
      return "I'm thinking really hard, but my connection seems to be slow. Try asking me again!";
    }

    // Generic error fallback
    return 'I seem to be having a connection glitch. Maybe my neural pathways are crossed? Try again later!';
  }
};

/**
 * Sanitizes Gemini chat history and drops malformed entries.
 *
 * @param {Array<object>} history - Candidate chat history entries
 * @returns {Array<object>} Strictly valid history entries for Gemini API
 */
/**
 * Sanitizes the chat history to ensure it complies with Gemini's API limits.
 * @param {Array<{role: string, text: string}>} history - The raw chat history.
 * @returns {Array<{role: string, parts: Array<{text: string}>}>} The sanitized history format.
 */
export const sanitizeHistoryForGemini = history => {
  if (!Array.isArray(history)) {
    return [];
  }

  let totalChars = 0;

  return history.slice(-HISTORY_SANITIZATION_LIMITS.maxEntries).flatMap(entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return [];
    }

    if (!ALLOWED_HISTORY_ROLES.has(entry.role) || !Array.isArray(entry.parts)) {
      return [];
    }

    const sanitizedParts = entry.parts
      .slice(0, HISTORY_SANITIZATION_LIMITS.maxPartsPerEntry)
      .flatMap(part => {
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

        const cappedText = sanitizedText.slice(0, HISTORY_SANITIZATION_LIMITS.maxCharsPerPart);
        const remainingBudget = HISTORY_SANITIZATION_LIMITS.maxTotalChars - totalChars;
        if (remainingBudget <= 0) {
          return [];
        }

        const budgetedText = cappedText.slice(0, remainingBudget);
        if (!budgetedText) {
          return [];
        }

        totalChars += budgetedText.length;
        return [{ text: budgetedText }];
      });

    if (sanitizedParts.length === 0) {
      return [];
    }

    return [{ role: entry.role, parts: sanitizedParts }];
  });
};

/**
 * Generates a humorous "roast" of the resume using Gemini AI.
 *
 * This function provides an entertaining feature that pokes fun at resume buzzwords
 * and common tropes. Implements the same security measures as chatWithGemini:
 * - Rate limiting
 * - Timeout protection
 * - Error handling
 *
 * @async
 * @returns {Promise<string>} A funny roast of the resume or an error message
 *
 * @example
 * const roast = await roastResume();
 * // => "Oh wow, 'Data Storytelling'? So you make spreadsheets with feelings?"
 */
/**
 * Triggers a sarcastic roast of the portfolio/resume using the Gemini API.
 * @returns {Promise<string>} The roast text.
 */
export const roastResume = async () => {
  // Rate limiting: Prevent spam roast requests
  const now = Date.now();
  if (now - lastRoastRequestTime < RATE_LIMIT_MS) {
    return 'Roast oven is cooling down! Give it a second.';
  }

  // Update persistent rate limit immediately to prevent race conditions and enforce attempt limits
  lastRoastRequestTime = now;
  safeSetLocalStorage(ROAST_RATE_LIMIT_KEY, now.toString());

  const model = getModel();
  if (!model) {
    return MISSING_API_KEY_ERROR;
  }

  const prompt = `
    You are a stand-up comedian doing a loving, affectionate roast of Rishabh Agrawal's resume. Be witty and punchy — think quick one-liners, not a lecture.

    Roast targets to pick from (use the resume data to find the funniest angles):
    - His title "Data Storyteller & Analytics Strategist" — buzzword bingo on the first line
    - The sheer volume of certifications (11+), including several Udemy certs, some of which have no dates
    - Claiming AWS, Azure, AND Google Cloud skills — cloud platform polygamy
    - "Scroll of Dharma" — a mindfulness app sitting right next to serious ML projects
    - His GitHub username "saint2706" — a saint who commits code
    - Listing "Problem Solving" as a soft skill — as if any resume doesn't
    - Transitioning from festival marketing at Mood Indigo to hardcore data analytics — a true renaissance man
    - "Data Analytics, Storage, Mining & Visual Big Data Technologies" — that course name needs its own resume

    Tone: affectionate and self-aware, never mean-spirited. Punch-line energy.
    Length: under 100 words. Hit hard, laugh harder.

    Resume Data:
    ${JSON.stringify(redactPII(resumeData))}
    `;

  try {
    // Generate roast with timeout protection
    const result = await withTimeout(model.generateContent(prompt), API_TIMEOUT);
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    // Same error handling as chatWithGemini for consistency
    const errorMessage = error?.message || 'Unknown error';
    const isLeakedKey = errorMessage.toLowerCase().includes('reported as leaked');
    const isTimeout = error instanceof TimeoutError;

    if (isLeakedKey) {
      return 'Roast mode is offline because the Gemini key was flagged as leaked. Please rotate the key, restrict it to the site domain, and redeploy.';
    }

    if (isTimeout) {
      return 'I was brewing a really good roast, but it took too long. Try again!';
    }

    return "I can't roast right now, I'm too nice. (Error connecting to AI)";
  }
};
