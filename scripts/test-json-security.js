/**
 * JSON Security Test Suite
 *
 * Tests the safeJSONStringify security utility function to ensure it correctly escapes
 * dangerous characters that could lead to XSS attacks when JSON is embedded in HTML.
 *
 * This test suite verifies proper escaping of:
 * - HTML tags (< and >)
 * - Script closing tags
 * - Ampersands (&)
 * - Single quotes (')
 * - Unicode line/paragraph separators (U+2028, U+2029)
 *
 * @module scripts/test-json-security
 */

import { safeJSONStringify } from '../src/utils/security.js';

// Comprehensive test cases for XSS prevention in JSON strings
const tests = [
  {
    name: 'Standard object',
    input: { key: 'value' },
    expected: '{"key":"value"}',
  },
  {
    name: 'Object with script tag',
    input: { key: '<script>alert(1)</script>' },
    expected: '{"key":"\\u003cscript\\u003ealert(1)\\u003c/script\\u003e"}',
  },
  {
    name: 'Nested object with script tag',
    input: { nested: { key: '</script>' } },
    expected: '{"nested":{"key":"\\u003c/script\\u003e"}}',
  },
  {
    name: 'Array with script tag',
    input: ['<script>'],
    expected: '["\\u003cscript\\u003e"]',
  },
  {
    name: 'Greater than character',
    input: { key: '">attribute' },
    expected: '{"key":"\\"\\u003eattribute"}',
  },
  {
    name: 'Ampersand character',
    input: { key: 'Tom & Jerry' },
    expected: '{"key":"Tom \\u0026 Jerry"}',
  },
  {
    name: 'HTML event handler injection',
    input: { key: '<img src=x onerror=alert(1)>' },
    expected: '{"key":"\\u003cimg src=x onerror=alert(1)\\u003e"}',
  },
  {
    name: 'Unicode line separator (U+2028)',
    input: { key: 'line\u2028separator' },
    expected: '{"key":"line\\\\u2028separator"}',
  },
  {
    name: 'Unicode paragraph separator (U+2029)',
    input: { key: 'paragraph\u2029separator' },
    expected: '{"key":"paragraph\\\\u2029separator"}',
  },
  {
    name: 'Multiple dangerous characters',
    input: { key: "<script>alert('XSS')</script> & more" },
    expected: '{"key":"\\u003cscript\\u003ealert(\'XSS\')\\u003c/script\\u003e \\u0026 more"}',
  },
];

let failed = false;
console.log('Running JSON Security Tests...');

tests.forEach(({ name, input, expected }) => {
  const result = safeJSONStringify(input);
  if (result !== expected) {
    console.error(`FAILED: ${name}`);
    console.error(`  Input: ${JSON.stringify(input)}`);
    console.error(`  Expected: ${expected}`);
    console.error(`  Got:      ${result}`);
    failed = true;
  } else {
    console.log(`PASS: ${name}`);
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
