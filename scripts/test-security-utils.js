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

import { safeJSONStringify, sanitizeInput, isValidChatMessage } from '../src/utils/security.js';

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
];

let failed = false;

console.log('Running Security Utils Tests...');

tests.forEach(test => {
  try {
    const result = safeJSONStringify(test.input);
    // We check if the result contains the expected sequence (ignoring other JSON parts)
    // But since input is simple, we can rely on inclusion
    // Note: JSON.stringify output order is not guaranteed for keys, but we use simple objects
    const passed = result.includes(test.expectedContains);
    if (!passed) {
      console.error(`FAILED: ${test.name}`);
      console.error(`Input:`, test.input);
      console.error(`Expected to contain:`, test.expectedContains);
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

if (failed) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
