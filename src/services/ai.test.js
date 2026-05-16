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



  describe('getModel missing key (Line 310, etc.)', () => {
    it('returns missing key error when API_KEY is missing', async () => {
      vi.useFakeTimers();
      vi.resetModules();
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { roastResume } = await import('./ai.js');

      // Advance timers to clear rate limit
      vi.advanceTimersByTime(3000);
      const response = await roastResume();
      expect(response).toBe('My AI circuits are currently offline. Please check the configuration.');

      vi.unstubAllEnvs();
      vi.useRealTimers();
    });
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
    try {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    } catch {
      // ignore
    }
  });

  describe('chatWithGemini', () => {
    it('should handle timeout error in chatWithGemini', async () => {
      // Create a promise that resolves after the timeout (15000ms)
      mockSendMessage.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 20000)));

      const responsePromise = chatWithGemini('Hello timeout');

      // Fast-forward timers to trigger the timeout
      vi.advanceTimersByTime(16000);

      const response = await responsePromise;
      expect(response).toBe("I'm thinking really hard, but my connection seems to be slow. Try asking me again!");
    });

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
    it('should handle timeout in roastResume', async () => {
      vi.advanceTimersByTime(3000); // clear rate limit
      mockGenerateContent.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 20000)));

      const responsePromise = roastResume();
      vi.advanceTimersByTime(16000);

      const response = await responsePromise;
      expect(response).toBe('I was brewing a really good roast, but it took too long. Try again!');
    });

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
    it('should ignore entry if it is not an object (e.g. array)', () => {
      const history = [ [] ]; // An array instead of an object
      const sanitized = sanitizeHistoryForGemini(history);
      expect(sanitized).toEqual([]);
    });

    it('should ignore entry if it is null', () => {
      const history = [ null ];
      const sanitized = sanitizeHistoryForGemini(history);
      expect(sanitized).toEqual([]);
    });

    it('should ignore entry parts if not an array', () => {
      const history = [{ role: 'user', parts: 'Not an array' }];
      const sanitized = sanitizeHistoryForGemini(history);
      expect(sanitized).toEqual([]);
    });

    it('should handle empty text resulting from sanitizeInput', () => {
      const history = [{ role: 'user', parts: [{ text: '\u0000' }] }]; // Will become empty string after sanitizeInput
      const sanitized = sanitizeHistoryForGemini(history);
      expect(sanitized).toEqual([]);
    });

    it('should handle when budgetedText length is 0 due to remainingBudget', () => {
      // remainingBudget will be <= 0 if we exceed 60000 chars.
      // We need multiple parts or entries to trigger remainingBudget <= 0 or budgetedText empty
      // Max entry is 1 part per entry, 4000 max chars per part, max 30 entries (30 * 4000 = 120000 limit, but total max chars is 60000)
      const parts = Array.from({ length: 30 }, () => ({ role: 'user', parts: [{ text: 'a'.repeat(4000) }] }));
      const sanitized = sanitizeHistoryForGemini(parts);
      // First 15 entries * 4000 chars = 60000. So 16th entry will return empty due to remainingBudget <= 0
      expect(sanitized.length).toBe(15);
    });

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

    it('should limit history entries, parts, and text budgets', () => {
      const history = Array.from({ length: 35 }, (_, index) => ({
        role: index % 2 === 0 ? 'user' : 'model',
        parts: [{ text: 'x'.repeat(5000) }, { text: 'ignored part' }],
      }));

      const sanitized = sanitizeHistoryForGemini(history);
      const totalChars = sanitized.reduce(
        (sum, entry) => sum + entry.parts.reduce((partSum, part) => partSum + part.text.length, 0),
        0
      );

      expect(sanitized.length).toBeLessThanOrEqual(30);
      expect(sanitized.every(entry => entry.parts.length === 1)).toBe(true);
      expect(sanitized.every(entry => entry.parts[0].text.length <= 4000)).toBe(true);
      expect(totalChars).toBe(60000);
    });
  });
});
