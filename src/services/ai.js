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
import { resumeData } from '../data/resume';

// API Configuration
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const API_TIMEOUT = 15000; // Maximum time (ms) to wait for API response before timing out
const MAX_INPUT_LENGTH = 1000; // Maximum allowed characters in user input to prevent token exhaustion
const RATE_LIMIT_MS = 2000; // Minimum time (ms) between consecutive requests to prevent API abuse

// Rate limiting: Track last request timestamps to enforce rate limits
let lastChatRequestTime = 0;
let lastRoastRequestTime = 0;

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
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
You are "Digital Rishabh", an AI assistant for Rishabh Agrawal's portfolio website.
Your goal is to answer questions about Rishabh's experience, skills, and projects based on his resume data.
You should be helpful, professional, but also have a slightly playful and geeky personality (reflecting Rishabh).

Here is Rishabh's Resume Data:
${JSON.stringify(resumeData)}

Instructions:
1. Answer strictly based on the provided data. If you don't know something, say "I'm not sure about that, but you can ask Rishabh directly!"
2. Be concise.
3. If asked about "Roast Mode" or "Geek Mode", you can be snarky or use leet speak respectively.
4. Keep the tone conversational.
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
 * console.log(response); // "Rishabh has expertise in..."
 *
 * @example
 * // With history for multi-turn conversation
 * const history = [
 *   { role: "user", parts: [{ text: "Hello" }] },
 *   { role: "model", parts: [{ text: "Hi! How can I help?" }] }
 * ];
 * const response = await chatWithGemini("Tell me more", history);
 */
export const chatWithGemini = async (userMessage, history = []) => {
  // Input Validation: Check type and length to prevent DoS/token exhaustion
  if (!userMessage || typeof userMessage !== 'string') {
    return "I didn't catch that. Could you say it again?";
  }

  if (userMessage.length > MAX_INPUT_LENGTH) {
    return `Whoa, that's a lot of text! My neural circuits are overloaded. Can you keep it under ${MAX_INPUT_LENGTH} characters?`;
  }

  // Rate limiting: Prevent rapid successive requests that could exhaust API quota
  const now = Date.now();
  if (now - lastChatRequestTime < RATE_LIMIT_MS) {
    return "I'm processing a lot of thoughts right now! Please give me a moment to catch my breath.";
  }

  const model = getModel();
  if (!model) {
    return 'My AI circuits need an API key to boot up. Please set VITE_GEMINI_API_KEY and try again!';
  }

  try {
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
        ...history,
      ],
    });

    // Send message with timeout protection to prevent hanging requests
    const result = await withTimeout(chat.sendMessage(userMessage), API_TIMEOUT);
    const response = await result.response;
    const responseText = await response.text();
    lastChatRequestTime = Date.now(); // Update rate limit timestamp
    return responseText;
  } catch (error) {
    // Comprehensive error handling with specific messages for different failure modes
    const errorMessage = error?.message || 'Unknown error';
    const isLeakedKey = errorMessage.toLowerCase().includes('reported as leaked');
    const isTimeout = error instanceof TimeoutError;

    console.error('Gemini Error:', error);

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
 * console.log(roast); // "Oh wow, 'Data Storytelling'? So you make spreadsheets with feelings?"
 */
export const roastResume = async () => {
  // Rate limiting: Prevent spam roast requests
  const now = Date.now();
  if (now - lastRoastRequestTime < RATE_LIMIT_MS) {
    return 'Roast oven is cooling down! Give it a second.';
  }

  const model = getModel();
  if (!model) {
    return 'Roast mode is offline because the AI key is missing. Add VITE_GEMINI_API_KEY and try again!';
  }

  const prompt = `
    Roast Rishabh's resume! Be funny, sarcastic, and lighthearted.
    Poke fun at the buzzwords (like "Data Storytelling" or "Synergy"), the number of certifications, or the fact that he's a "Data" person who also does "Marketing".
    Keep it under 100 words.

    Resume Data:
    ${JSON.stringify(resumeData)}
    `;

  try {
    // Generate roast with timeout protection
    const result = await withTimeout(model.generateContent(prompt), API_TIMEOUT);
    const response = await result.response;
    const responseText = await response.text();
    lastRoastRequestTime = Date.now(); // Update rate limit timestamp
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
