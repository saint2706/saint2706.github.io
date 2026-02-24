import { describe, it, expect } from 'vitest';
import { buildNextMessages, buildGeminiHistory, MAX_HISTORY_CONTEXT } from './chatHistory';

describe('Chat History Utils', () => {
  describe('buildNextMessages', () => {
    it('appends user message to messages', () => {
      const messages = [{ text: 'Hello' }];
      const userMsg = { text: 'World' };
      const result = buildNextMessages(messages, userMsg);
      expect(result).toEqual([{ text: 'Hello' }, { text: 'World' }]);
      // Ensure immutability
      expect(result).not.toBe(messages);
    });
  });

  describe('buildGeminiHistory', () => {
    it('formats messages correctly for Gemini', () => {
      const messages = [
        { role: 'user', text: 'Hello' },
        { role: 'model', text: 'Hi' },
      ];
      const result = buildGeminiHistory(messages);
      expect(result).toEqual([
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi' }] },
      ]);
    });

    it('limits history to MAX_HISTORY_CONTEXT', () => {
      const messages = Array.from({ length: MAX_HISTORY_CONTEXT + 5 }, (_, i) => ({
        role: 'user',
        text: `Message ${i}`,
      }));
      const result = buildGeminiHistory(messages);
      expect(result).toHaveLength(MAX_HISTORY_CONTEXT);
      expect(result[0].parts[0].text).toBe('Message 5');
      expect(result[result.length - 1].parts[0].text).toBe(`Message ${MAX_HISTORY_CONTEXT + 4}`);
    });

    it('handles empty messages', () => {
      const result = buildGeminiHistory([]);
      expect(result).toEqual([]);
    });
  });
});
