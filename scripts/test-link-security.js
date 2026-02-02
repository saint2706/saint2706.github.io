/**
 * Link Security Test Suite
 * 
 * Tests the isSafeHref security utility function to ensure it correctly validates
 * URLs and prevents XSS attacks via dangerous protocols like javascript: or data:.
 * 
 * This test suite verifies that only safe protocols (http, https, mailto) are allowed.
 * 
 * @module scripts/test-link-security
 */

import { isSafeHref } from '../src/utils/security.js';

// Test cases covering safe and unsafe URL patterns
const tests = [
  { input: 'http://example.com', expected: true },
  { input: 'https://example.com', expected: true },
  { input: 'mailto:user@example.com', expected: true },
  { input: 'javascript:alert(1)', expected: false },  // XSS vector
  { input: ' javascript:alert(1)', expected: false }, // XSS with leading space
  { input: 'vbscript:alert(1)', expected: false },    // VBScript XSS
  { input: 'data:text/html,...', expected: false },   // Data URI XSS
  { input: 'ftp://example.com', expected: false },    // Unsafe protocol
  { input: '/relative/path', expected: false },        // Relative path (no protocol)
  { input: '//protocol-relative', expected: false },   // Protocol-relative URL
  // https:// is safe (not XSS), just a broken link.
  // The original test expected false (invalid), but isSafeHref is a security check, not a validity check.
  { input: 'https://', expected: true },
];

let failed = false;
console.log("Running Security Tests...");

tests.forEach(({ input, expected }) => {
  const result = isSafeHref(input);
  if (result !== expected) {
    console.error(`FAILED: Input "${input}" | Expected: ${expected} | Got: ${result}`);
    failed = true;
  } else {
    console.log(`PASS: "${input}" -> ${result}`);
  }
});

if (failed) {
  console.error("Some tests failed!");
  process.exit(1);
} else {
  console.log("All tests passed!");
}
