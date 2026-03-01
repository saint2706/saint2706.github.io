/**
 * Maximum number of messages to include in the context sent to the Gemini API.
 * Helps prevent exceeding token limits.
 * @type {number}
 */
export const MAX_HISTORY_CONTEXT = 30;

/**
 * Appends a new user message to the existing message array.
 *
 * @param {Array<Object>} messages - The current array of chat messages.
 * @param {Object} userMsg - The new user message to append.
 * @returns {Array<Object>} A new array containing the updated chat history.
 */
export const buildNextMessages = (messages, userMsg) => [...messages, userMsg];

/**
 * Transforms the internal chat history array into the format expected by the Gemini API.
 * Truncates the history to the last `MAX_HISTORY_CONTEXT` messages.
 *
 * @param {Array<Object>} messages - The internal array of chat messages.
 * @returns {Array<Object>} The formatted history array for Gemini.
 */
export const buildGeminiHistory = messages =>
  messages.slice(-MAX_HISTORY_CONTEXT).map(message => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));
