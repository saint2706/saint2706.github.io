import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatWithGemini, roastResume, sanitizeHistoryForGemini } from './ai';
import * as storage from '../utils/storage';

// Mock dependencies
vi.mock('@google/generative-ai');
vi.mock('../utils/storage');
vi.mock('../utils/security', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    // We can spy on these if needed, or just let them pass through since they are pure functions
    // For now, let's use the actual implementation for security utils as they are critical to test integration
  };
});

describe('AI Service', () => {
  let mockGenerateContent;
  let mockSendMessage;
  let mockStartChat;
  let mockGetGenerativeModel;
  // Start with a base time
  let currentTime = new Date(2025, 0, 1).getTime();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Increment time for each test to ensure we are past any previous rate limits
    currentTime += 10000;
    vi.setSystemTime(currentTime);

    // Setup GoogleGenerativeAI mocks
    mockGenerateContent = vi.fn();
    mockSendMessage = vi.fn();
    mockStartChat = vi.fn().mockReturnValue({
      sendMessage: mockSendMessage,
    });
    mockGetGenerativeModel = vi.fn().mockReturnValue({
      startChat: mockStartChat,
      generateContent: mockGenerateContent,
    });

    GoogleGenerativeAI.prototype.getGenerativeModel = mockGetGenerativeModel;

    // Default storage mocks
    vi.spyOn(storage, 'safeGetLocalStorage').mockReturnValue('0');
    vi.spyOn(storage, 'safeSetLocalStorage');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('chatWithGemini', () => {
    it('should send message successfully', async () => {
      mockSendMessage.mockResolvedValue({
        response: { text: () => 'AI Response' },
      });

      const response = await chatWithGemini('Hello');

      expect(response).toBe('AI Response');
      expect(mockStartChat).toHaveBeenCalled();
      expect(mockSendMessage).toHaveBeenCalledWith('Hello');
      expect(storage.safeSetLocalStorage).toHaveBeenCalled();
    });

    it('should handle empty input', async () => {
      const response = await chatWithGemini('');
      expect(response).toContain("I didn't catch that");
      expect(mockStartChat).not.toHaveBeenCalled();
    });

    it('should handle rate limiting', async () => {
      // Advance time to ensure we are not rate limited from previous tests
      vi.advanceTimersByTime(3000);

      mockSendMessage.mockResolvedValue({
        response: { text: () => 'Response' },
      });

      // First call - should succeed and update timestamp
      await chatWithGemini('First message');

      // Second call - immediately after, should be rate limited
      const response = await chatWithGemini('Second message');

      expect(response).toContain('give me a moment');
      // Should have been called only once for the first message
      expect(mockStartChat).toHaveBeenCalledTimes(1);
    });

    it('should not consume rate limit slot when model is unavailable', async () => {
      vi.advanceTimersByTime(3000);
      mockGetGenerativeModel.mockReturnValue(null);

      const firstResponse = await chatWithGemini('Hello');
      const secondResponse = await chatWithGemini('Hello again');

      expect(firstResponse).toContain('currently offline');
      expect(secondResponse).toContain('currently offline');
      expect(storage.safeSetLocalStorage).not.toHaveBeenCalled();
      expect(mockStartChat).not.toHaveBeenCalled();
    });

    it('should not consume rate limit slot when dispatch fails fast', async () => {
      vi.advanceTimersByTime(3000);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockSendMessage
        .mockImplementationOnce(() => {
          throw new Error('Sync dispatch failure');
        })
        .mockResolvedValueOnce({
          response: { text: () => 'Recovered response' },
        });

      const firstResponse = await chatWithGemini('Hello');
      const secondResponse = await chatWithGemini('Hello again');

      expect(firstResponse).toContain('connection glitch');
      expect(secondResponse).toBe('Recovered response');
      expect(storage.safeSetLocalStorage).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });

    it('should handle API errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Reset rate limit by advancing time
      vi.advanceTimersByTime(3000);

      mockSendMessage.mockRejectedValue(new Error('API Error'));

      const response = await chatWithGemini('Hello');

      expect(response).toContain('connection glitch');
      consoleSpy.mockRestore();
    });

    it('should handle input too long', async () => {
      const longMessage = 'a'.repeat(1001);
      const response = await chatWithGemini(longMessage);
      expect(response).toContain("Whoa, that's a lot of text");
      expect(mockStartChat).not.toHaveBeenCalled();
    });
  });

  describe('roastResume', () => {
    it('should generate roast successfully', async () => {
      // Reset rate limit
      vi.advanceTimersByTime(3000);

      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Roasted!' },
      });

      const response = await roastResume();

      expect(response).toBe('Roasted!');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle rate limiting', async () => {
      // Reset rate limit
      vi.advanceTimersByTime(3000);

      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Roasted!' },
      });

      // First call
      await roastResume();

      // Second call
      const response = await roastResume();

      expect(response).toContain('cooling down');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      // Reset rate limit
      vi.advanceTimersByTime(3000);
      mockGenerateContent.mockRejectedValue(new Error('API Error'));
      const response = await roastResume();
      expect(response).toContain("I can't roast right now");
    });

    it('should not consume rate limit slot when model is unavailable', async () => {
      vi.advanceTimersByTime(3000);
      mockGetGenerativeModel.mockReturnValue(null);

      const firstResponse = await roastResume();
      const secondResponse = await roastResume();

      expect(firstResponse).toContain('currently offline');
      expect(secondResponse).toContain('currently offline');
      expect(mockGenerateContent).not.toHaveBeenCalled();
      expect(storage.safeSetLocalStorage).not.toHaveBeenCalled();
    });

    it('should not consume rate limit slot when roast dispatch fails fast', async () => {
      vi.advanceTimersByTime(3000);

      mockGenerateContent
        .mockImplementationOnce(() => {
          throw new Error('Sync dispatch failure');
        })
        .mockResolvedValueOnce({
          response: { text: () => 'Roasted!' },
        });

      const firstResponse = await roastResume();
      const secondResponse = await roastResume();

      expect(firstResponse).toContain("I can't roast right now");
      expect(secondResponse).toBe('Roasted!');
      expect(storage.safeSetLocalStorage).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout', async () => {
      // Reset rate limit
      vi.advanceTimersByTime(3000);

      // Mock generateContent to never resolve
      mockGenerateContent.mockReturnValue(new Promise(() => {}));

      const roastPromise = roastResume();

      // Advance time past timeout (15000ms)
      vi.advanceTimersByTime(16000);

      const response = await roastPromise;
      expect(response).toContain('took too long');
    });

    it('should handle leaked key error', async () => {
      vi.advanceTimersByTime(3000);
      mockGenerateContent.mockRejectedValue(new Error('Key reported as leaked'));
      const response = await roastResume();
      expect(response).toContain('flagged as leaked');
    });
  });

  describe('sanitizeHistoryForGemini', () => {
    it('should valid history', () => {
      const history = [
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi' }] },
      ];

      const sanitized = sanitizeHistoryForGemini(history);
      expect(sanitized).toEqual(history);
    });

    it('should filter invalid roles', () => {
      const history = [{ role: 'hacker', parts: [{ text: 'Hello' }] }];

      const sanitized = sanitizeHistoryForGemini(history);
      expect(sanitized).toEqual([]);
    });

    it('should filter invalid structure', () => {
      const history = [
        null,
        { role: 'user' }, // missing parts
        { role: 'user', parts: 'not an array' },
        { role: 'user', parts: [{ text: 123 }] }, // text not string
      ];

      const sanitized = sanitizeHistoryForGemini(history);
      expect(sanitized).toEqual([]);
    });

    it('should limit entries, parts, and truncate text length', () => {
      const history = [
        { role: 'user', parts: [{ text: 'drop me' }] },
        {
          role: 'model',
          parts: [{ text: 'abcdef' }, { text: '123456' }, { text: 'ignored' }],
        },
      ];

      const sanitized = sanitizeHistoryForGemini(history, {
        maxEntries: 1,
        maxPartsPerEntry: 2,
        maxPartTextLength: 4,
        maxTotalChars: 50,
      });

      expect(sanitized).toEqual([
        {
          role: 'model',
          parts: [{ text: 'abcd' }, { text: '1234' }],
        },
      ]);
    });

    it('should drop oversize parts when aggregate budget is exceeded', () => {
      const history = [
        {
          role: 'user',
          parts: [{ text: '12345' }, { text: '67890' }, { text: 'abc' }],
        },
      ];

      const sanitized = sanitizeHistoryForGemini(history, {
        maxEntries: 5,
        maxPartsPerEntry: 5,
        maxPartTextLength: 10,
        maxTotalChars: 9,
      });

      expect(sanitized).toEqual([
        {
          role: 'user',
          parts: [{ text: '12345' }, { text: 'abc' }],
        },
      ]);
    });
  });
});
