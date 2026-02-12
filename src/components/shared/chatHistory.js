export const MAX_HISTORY_CONTEXT = 30;

export const buildNextMessages = (messages, userMsg) => [...messages, userMsg];

export const buildGeminiHistory = messages =>
  messages.slice(-MAX_HISTORY_CONTEXT).map(message => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));
