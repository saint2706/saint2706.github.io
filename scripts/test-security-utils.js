/**
 * Security Utilities Test Suite
 *
 * Comprehensive test suite for security utility functions including safeJSONStringify and sanitizeInput.
 * Tests various scenarios where dangerous characters need to be escaped to prevent XSS attacks,
 * and validates input sanitization to prevent injection attacks.
 *
 * This test validates:
 * - Script tag escaping
 * - HTML entity escaping
 * - Unicode line separator handling
 * - Complex nested objects
 * - Control character removal
 * - Unicode normalization
 * - Input trimming
 *
 * @module scripts/test-security-utils
 */

import {
  safeJSONStringify,
  sanitizeInput,
  isValidChatMessage,
  isSafeImageSrc,
  redactPII,
  isSafeHref,
} from '../src/utils/security.js';

const circularObject = {};
circularObject.self = circularObject;

const tests = [
  {
    name: 'Escapes closing script tag',
    input: { key: '</script><script>alert(1)</script>' },
    expectedContains: '\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e',
  },
  {
    name: 'Escapes <script>',
    input: { key: '<script>alert(1)</script>' },
    expectedContains: '\\u003cscript\\u003ealert(1)\\u003c/script\\u003e',
  },
  {
    name: 'Escapes HTML entities',
    input: { key: '& " \'' },
    // JSON.stringify escapes " as \", and safeJSONStringify escapes ' as \u0027 and & as \u0026
    expectedContains: '\\u0026 \\" \\u0027',
  },
  {
    name: 'Escapes line separators',
    input: { key: '\u2028 \u2029' },
    expectedContains: '\\u2028 \\u2029',
  },
  {
    name: 'Handles complex objects',
    input: { a: 1, b: ['<'] },
    expectedContains: '\\u003c',
  },
  {
    name: 'Returns fallback for undefined',
    input: undefined,
    expectedExact: 'null',
  },
  {
    name: 'Returns fallback for circular references',
    input: circularObject,
    expectedExact: 'null',
  },
  {
    name: 'Returns fallback for BigInt values',
    input: { value: 1n },
    expectedExact: 'null',
  },
  {
    name: 'Still stringifies normal objects',
    input: { safe: true },
    expectedExact: '{"safe":true}',
  },
];

let failed = false;

console.log('Running Security Utils Tests...');

tests.forEach(test => {
  try {
    const result = safeJSONStringify(test.input);
    // We check if the result contains the expected sequence (ignoring other JSON parts)
    // But since input is simple, we can rely on inclusion
    // Note: JSON.stringify output order is not guaranteed for keys, but we use simple objects
    const passed =
      test.expectedExact !== undefined
        ? result === test.expectedExact
        : result.includes(test.expectedContains);
    if (!passed) {
      console.error(`FAILED: ${test.name}`);
      console.error(`Input:`, test.input);
      if (test.expectedExact !== undefined) {
        console.error(`Expected:`, test.expectedExact);
      } else {
        console.error(`Expected to contain:`, test.expectedContains);
      }
      console.error(`Got:`, result);
      failed = true;
    } else {
      console.log(`PASS: ${test.name}`);
    }
  } catch (e) {
    console.error(`ERROR: ${test.name}`, e);
    failed = true;
  }
});

const hrefTests = [
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
  { name: 'Encoded slash attack (double encoding)', input: '%2F%2Fexample.com', expected: false },
  { name: 'Encoded fragment with slashes (safe)', input: '#%2F%2Fevil.com', expected: true },
  { name: 'URL with leading whitespace', input: ' https://example.com', expected: true },
  { name: 'URL with trailing whitespace', input: 'https://example.com ', expected: true },
  // isSafeHref only validates protocol safety, not full URL validity. http:// is safe.
  { name: 'Malformed URL (protocol only)', input: 'http://', expected: true },
];

console.log('\nRunning Href Validation Tests...');
hrefTests.forEach(test => {
  try {
    const result = isSafeHref(test.input);
    if (result !== test.expected) {
      console.error(`FAILED: ${test.name}`);
      console.error(`Input:`, test.input);
      console.error(`Expected:`, test.expected);
      console.error(`Got:`, result);
      failed = true;
    } else {
      console.log(`PASS: ${test.name}`);
    }
  } catch (e) {
    console.error(`ERROR: ${test.name}`, e);
    failed = true;
  }
});

if (failed) {
  // Don't exit yet, run sanitize tests
} else {
  console.log('safeJSONStringify tests passed!');
}

const sanitizeTests = [
  { name: 'Sanitize null bytes', input: 'Hello\u0000World', expected: 'HelloWorld' },
  { name: 'Sanitize vertical tab', input: 'Hello\u000BWorld', expected: 'HelloWorld' },
  { name: 'Keep newlines', input: 'Hello\nWorld', expected: 'Hello\nWorld' },
  { name: 'Keep tabs', input: 'Hello\tWorld', expected: 'Hello\tWorld' },
  { name: 'Keep carriage returns', input: 'Hello\rWorld', expected: 'Hello\rWorld' },
  { name: 'Trim whitespace', input: '  Hello  ', expected: 'Hello' },
  // NFKC Normalization: Superscript 2 (\u00B2) becomes 2
  { name: 'Normalize Unicode (NFKC)', input: 'x\u00B2', expected: 'x2' },
  { name: 'Control chars + Unicode normalization', input: 'x\u00B2\u0000test', expected: 'x2test' },
  { name: 'Whitespace-only input', input: '   \t\n  ', expected: '' },
  { name: 'Empty input', input: '', expected: '' },
  { name: 'Non-string input', input: null, expected: '' },
  { name: 'Undefined input', input: undefined, expected: '' },
];

console.log('\nRunning Sanitize Input Tests...');
sanitizeTests.forEach(test => {
  try {
    const result = sanitizeInput(test.input);
    if (result !== test.expected) {
      console.error(`FAILED: ${test.name}`);
      console.error(`Input:`, test.input);
      console.error(`Expected:`, test.expected);
      console.error(`Got:`, result);
      failed = true;
    } else {
      console.log(`PASS: ${test.name}`);
    }
  } catch (e) {
    console.error(`ERROR: ${test.name}`, e);
    failed = true;
  }
});

const validationTests = [
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

console.log('\nRunning Chat Message Validation Tests...');
validationTests.forEach(test => {
  try {
    const result = isValidChatMessage(test.input);
    if (result !== test.expected) {
      console.error(`FAILED: ${test.name}`);
      console.error(`Input:`, test.input);
      console.error(`Expected:`, test.expected);
      console.error(`Got:`, result);
      failed = true;
    } else {
      console.log(`PASS: ${test.name}`);
    }
  } catch (e) {
    console.error(`ERROR: ${test.name}`, e);
    failed = true;
  }
});

const imageSrcTests = [
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
  { name: 'URL with leading whitespace', input: ' https://example.com/image.png', expected: true },
  { name: 'Malformed URL (protocol only)', input: 'http://', expected: false },
  { name: 'Malformed URL (invalid domain)', input: 'https://###invalid', expected: false },
  { name: 'URL with missing slashes (auto-fixed)', input: 'https:example.com', expected: true },
  { name: 'Explicit valid relative path', input: '/images/pic.jpg', expected: true },
  {
    name: 'Explicit malicious protocol-relative',
    input: '//malicious.site/img.jpg',
    expected: false,
  },
  { name: 'Explicit valid absolute path', input: 'https://google.com/logo.png', expected: true },
];

console.log('\nRunning Image Source Validation Tests...');
imageSrcTests.forEach(test => {
  try {
    const result = isSafeImageSrc(test.input);
    if (result !== test.expected) {
      console.error(`FAILED: ${test.name}`);
      console.error(`Input:`, test.input);
      console.error(`Expected:`, test.expected);
      console.error(`Got:`, result);
      failed = true;
    } else {
      console.log(`PASS: ${test.name}`);
    }
  } catch (e) {
    console.error(`ERROR: ${test.name}`, e);
    failed = true;
  }
});

const redactTests = [
  {
    name: 'Redact email and phone',
    input: { basics: { email: 'test@example.com', phone: '123-456' } },
    expected: { basics: { email: '[REDACTED]', phone: '[REDACTED]' } },
  },
  {
    name: 'Preserve other data',
    input: { basics: { name: 'John', email: 'e' }, other: 'data' },
    expected: { basics: { name: 'John', email: '[REDACTED]' }, other: 'data' },
  },
  {
    name: 'Handle missing basics',
    input: { other: 'data' },
    expected: { other: 'data' },
  },
  {
    name: 'Handle missing fields',
    input: { basics: { name: 'John' } },
    expected: { basics: { name: 'John' } },
  },
  {
    name: 'Handle null input',
    input: null,
    expected: null,
  },
  {
    name: 'Handle undefined input',
    input: undefined,
    expected: undefined,
  },
  {
    name: 'Handle basics as null',
    input: { basics: null, other: 'data' },
    expected: { basics: null, other: 'data' },
  },
  {
    name: 'Handle basics as array',
    input: { basics: ['item1', 'item2'], other: 'data' },
    expected: { basics: ['item1', 'item2'], other: 'data' },
  },
];

console.log('\nRunning PII Redaction Tests...');
redactTests.forEach(test => {
  try {
    const result = redactPII(test.input);
    const passed = JSON.stringify(result) === JSON.stringify(test.expected);
    if (!passed) {
      console.error(`FAILED: ${test.name}`);
      console.error(`Input:`, test.input);
      console.error(`Expected:`, test.expected);
      console.error(`Got:`, result);
      failed = true;
    } else {
      console.log(`PASS: ${test.name}`);
    }
  } catch (e) {
    console.error(`ERROR: ${test.name}`, e);
    failed = true;
  }
});

// Test that original object is not mutated
console.log('\nTesting PII redaction does not mutate original object...');
try {
  const original = { basics: { email: 'test@example.com', phone: '123-456', name: 'John' } };
  const originalCopy = JSON.stringify(original);
  const result = redactPII(original);

  // Check that result has redacted values
  const resultIsRedacted =
    result.basics.email === '[REDACTED]' && result.basics.phone === '[REDACTED]';
  // Check that original is unchanged
  const originalUnchanged = JSON.stringify(original) === originalCopy;

  if (!resultIsRedacted || !originalUnchanged) {
    console.error('FAILED: Original object should not be mutated');
    console.error('Original:', original);
    console.error('Result:', result);
    console.error('Result is redacted:', resultIsRedacted);
    console.error('Original unchanged:', originalUnchanged);
    failed = true;
  } else {
    console.log('PASS: Original object is not mutated');
  }
} catch (e) {
  console.error('ERROR: Testing original object mutation', e);
  failed = true;
}

if (failed) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
