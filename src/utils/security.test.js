import { describe, it, expect } from 'vitest';
import {
  safeJSONStringify,
  sanitizeInput,
  isValidChatMessage,
  isSafeImageSrc,
  redactPII,
  isSafeHref,
} from './security';

describe('Security Utils', () => {
  describe('safeJSONStringify', () => {
    it('escapes closing script tag', () => {
      const input = { key: '</script><script>alert(1)</script>' };
      const result = safeJSONStringify(input);
      expect(result).toContain(
        '\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e'
      );
    });

    it('escapes <script>', () => {
      const input = { key: '<script>alert(1)</script>' };
      const result = safeJSONStringify(input);
      expect(result).toContain('\\u003cscript\\u003ealert(1)\\u003c/script\\u003e');
    });

    it('escapes HTML entities', () => {
      const input = { key: '& " \'' };
      const result = safeJSONStringify(input);
      // JSON.stringify escapes " as \", and safeJSONStringify escapes ' as \u0027 and & as \u0026
      expect(result).toContain('\\u0026 \\" \\u0027');
    });

    it('escapes line separators', () => {
      const input = { key: '\u2028 \u2029' };
      const result = safeJSONStringify(input);
      expect(result).toContain('\\u2028 \\u2029');
    });

    it('handles complex objects', () => {
      const input = { a: 1, b: ['<'] };
      const result = safeJSONStringify(input);
      expect(result).toContain('\\u003c');
    });

    it('returns fallback for undefined', () => {
      expect(safeJSONStringify(undefined)).toBe('null');
    });

    it('returns fallback for circular references', () => {
      const circularObject = {};
      circularObject.self = circularObject;
      expect(safeJSONStringify(circularObject)).toBe('null');
    });

    it('returns fallback for BigInt values', () => {
      expect(safeJSONStringify({ value: 1n })).toBe('null');
    });

    it('still stringifies normal objects', () => {
      expect(safeJSONStringify({ safe: true })).toBe('{"safe":true}');
    });
  });

  describe('isSafeHref', () => {
    const testCases = [
      { name: 'Valid HTTPS URL', input: 'https://example.com', expected: true },
      { name: 'Valid HTTP URL', input: 'http://example.com', expected: true },
      { name: 'Valid Mailto URL', input: 'mailto:test@example.com', expected: true },
      { name: 'Valid URL with query', input: 'https://example.com?q=1', expected: true },
      { name: 'Valid URL with fragment', input: 'https://example.com#test', expected: true },
      { name: 'Invalid javascript: protocol', input: 'javascript:alert(1)', expected: false },
      { name: 'Invalid data: URI', input: 'data:text/html,test', expected: false },
      { name: 'Encoded javascript: protocol', input: 'javascript%3Aalert(1)', expected: false },
      {
        name: 'Double-encoded javascript: protocol',
        input: 'javascript%253Aalert(1)',
        expected: false,
      },
      {
        name: 'Triple-encoded javascript: protocol',
        input: 'javascript%25253Aalert(1)',
        expected: false,
      },
      { name: 'Invalid file: protocol', input: 'file:///etc/passwd', expected: false },
      { name: 'Null input', input: null, expected: false },
      { name: 'Undefined input', input: undefined, expected: false },
      { name: 'Empty string', input: '', expected: false },
      { name: 'Non-string input', input: 123, expected: false },
      { name: 'Protocol-relative URL', input: '//example.com', expected: false },
      { name: 'Path-only URL', input: '/blog/post', expected: true },
      { name: 'Fragment URL', input: '#section', expected: true },
      { name: 'Encoded slash attack (single encoding)', input: '/%2Fexample.com', expected: false },
      {
        name: 'Encoded slash attack (double encoding)',
        input: '%2F%2Fexample.com',
        expected: false,
      },
      { name: 'Encoded fragment with slashes (safe)', input: '#%2F%2Fevil.com', expected: true },
      { name: 'URL with leading whitespace', input: ' https://example.com', expected: true },
      { name: 'URL with trailing whitespace', input: 'https://example.com ', expected: true },
      // isSafeHref only validates protocol safety, not full URL validity. http:// is safe.
      { name: 'Malformed URL (protocol only)', input: 'http://', expected: true },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        expect(isSafeHref(input)).toBe(expected);
      });
    });
  });

  describe('sanitizeInput', () => {
    const testCases = [
      { name: 'Sanitize null bytes', input: 'Hello\u0000World', expected: 'HelloWorld' },
      { name: 'Sanitize vertical tab', input: 'Hello\u000BWorld', expected: 'HelloWorld' },
      { name: 'Keep newlines', input: 'Hello\nWorld', expected: 'Hello\nWorld' },
      { name: 'Keep tabs', input: 'Hello\tWorld', expected: 'Hello\tWorld' },
      { name: 'Keep carriage returns', input: 'Hello\rWorld', expected: 'Hello\rWorld' },
      { name: 'Trim whitespace', input: '  Hello  ', expected: 'Hello' },
      // NFKC Normalization: Superscript 2 (\u00B2) becomes 2
      { name: 'Normalize Unicode (NFKC)', input: 'x\u00B2', expected: 'x2' },
      {
        name: 'Control chars + Unicode normalization',
        input: 'x\u00B2\u0000test',
        expected: 'x2test',
      },
      { name: 'Whitespace-only input', input: '   \t\n  ', expected: '' },
      { name: 'Empty input', input: '', expected: '' },
      { name: 'Non-string input', input: null, expected: '' },
      { name: 'Undefined input', input: undefined, expected: '' },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        expect(sanitizeInput(input)).toBe(expected);
      });
    });
  });

  describe('isValidChatMessage', () => {
    const testCases = [
      { name: 'Valid user message', input: { role: 'user', text: 'Hello' }, expected: true },
      { name: 'Valid model message', input: { role: 'model', text: 'Hi' }, expected: true },
      { name: 'Invalid role', input: { role: 'admin', text: 'Hello' }, expected: false },
      { name: 'Missing role', input: { text: 'Hello' }, expected: false },
      { name: 'Missing text', input: { role: 'user' }, expected: false },
      { name: 'Non-string text', input: { role: 'user', text: 123 }, expected: false },
      { name: 'Null input', input: null, expected: false },
      { name: 'Undefined input', input: undefined, expected: false },
      { name: 'Empty object', input: {}, expected: false },
      {
        name: 'Excessively long text',
        input: { role: 'user', text: 'a'.repeat(30001) },
        expected: false,
      },
      {
        name: 'Max allowed length',
        input: { role: 'user', text: 'a'.repeat(30000) },
        expected: true,
      },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        expect(isValidChatMessage(input)).toBe(expected);
      });
    });
  });

  describe('isSafeImageSrc', () => {
    const testCases = [
      { name: 'Valid HTTPS URL', input: 'https://example.com/image.png', expected: true },
      { name: 'Valid HTTP URL', input: 'http://example.com/image.png', expected: true },
      {
        name: 'Valid URL with query parameters',
        input: 'https://example.com/image.png?v=1',
        expected: true,
      },
      {
        name: 'Valid URL with fragment',
        input: 'https://example.com/image.png#section',
        expected: true,
      },
      {
        name: 'Valid URL with query and fragment',
        input: 'https://example.com/image.png?v=1#section',
        expected: true,
      },
      { name: 'Invalid javascript: protocol', input: 'javascript:alert(1)', expected: false },
      { name: 'Invalid data: URI', input: 'data:image/png;base64,iVBORw0KGgo=', expected: false },
      { name: 'Invalid mailto: protocol', input: 'mailto:test@example.com', expected: false },
      { name: 'Encoded javascript: protocol', input: 'javascript%3Aalert(1)', expected: false },
      {
        name: 'Double-encoded javascript: protocol',
        input: 'javascript%253Aalert(1)',
        expected: false,
      },
      {
        name: 'Triple-encoded javascript: protocol',
        input: 'javascript%25253Aalert(1)',
        expected: false,
      },
      { name: 'Invalid file: protocol', input: 'file:///etc/passwd', expected: false },
      { name: 'Null input', input: null, expected: false },
      { name: 'Undefined input', input: undefined, expected: false },
      { name: 'Empty string', input: '', expected: false },
      { name: 'Non-string input', input: 123, expected: false },
      { name: 'Protocol-relative URL', input: '//example.com/image.png', expected: false },
      { name: 'Path-only URL', input: '/images/photo.png', expected: true },
      { name: 'Fragment-only URL', input: '#section', expected: true },
      {
        name: 'Encoded slash attack (single encoding)',
        input: '/%2Fexample.com/image.png',
        expected: false,
      },
      {
        name: 'Encoded slash attack (double encoding)',
        input: '%2F%2Fexample.com/image.png',
        expected: false,
      },
      { name: 'Encoded fragment with slashes (safe)', input: '#%2F%2Fevil.com', expected: true },
      {
        name: 'URL with leading whitespace',
        input: ' https://example.com/image.png',
        expected: true,
      },
      { name: 'Malformed URL (protocol only)', input: 'http://', expected: false },
      { name: 'Malformed URL (invalid domain)', input: 'https://###invalid', expected: false },
      { name: 'URL with missing slashes (auto-fixed)', input: 'https:example.com', expected: true },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        expect(isSafeImageSrc(input)).toBe(expected);
      });
    });
  });

  describe('redactPII', () => {
    it('redacts email and phone', () => {
      const input = { basics: { email: 'test@example.com', phone: '123-456' } };
      const expected = { basics: { email: '[REDACTED]', phone: '[REDACTED]' } };
      expect(redactPII(input)).toEqual(expected);
    });

    it('preserves other data', () => {
      const input = { basics: { name: 'John', email: 'e' }, other: 'data' };
      const expected = { basics: { name: 'John', email: '[REDACTED]' }, other: 'data' };
      expect(redactPII(input)).toEqual(expected);
    });

    it('handles missing basics', () => {
      const input = { other: 'data' };
      const expected = { other: 'data' };
      expect(redactPII(input)).toEqual(expected);
    });

    it('handles missing fields', () => {
      const input = { basics: { name: 'John' } };
      const expected = { basics: { name: 'John' } };
      expect(redactPII(input)).toEqual(expected);
    });

    it('handles null input', () => {
      expect(redactPII(null)).toBeNull();
    });

    it('handles undefined input', () => {
      expect(redactPII(undefined)).toBeUndefined();
    });

    it('handles basics as null', () => {
      const input = { basics: null, other: 'data' };
      const expected = { basics: null, other: 'data' };
      expect(redactPII(input)).toEqual(expected);
    });

    it('handles basics as array', () => {
      const input = { basics: ['item1', 'item2'], other: 'data' };
      const expected = { basics: ['item1', 'item2'], other: 'data' };
      expect(redactPII(input)).toEqual(expected);
    });

    it('does not mutate original object', () => {
      const original = { basics: { email: 'test@example.com', phone: '123-456', name: 'John' } };
      const originalCopy = JSON.stringify(original);
      const result = redactPII(original);

      expect(result.basics.email).toBe('[REDACTED]');
      expect(result.basics.phone).toBe('[REDACTED]');
      expect(JSON.stringify(original)).toBe(originalCopy);
    });
  });
});
