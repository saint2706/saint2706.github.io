import { isSafeHref } from '../src/utils/security.js';

const tests = [
  { input: 'http://example.com', expected: true },
  { input: 'https://example.com', expected: true },
  { input: 'mailto:user@example.com', expected: true },
  { input: 'javascript:alert(1)', expected: false },
  { input: ' javascript:alert(1)', expected: false },
  { input: 'vbscript:alert(1)', expected: false },
  { input: 'data:text/html,...', expected: false },
  { input: 'ftp://example.com', expected: false },
  { input: '/relative/path', expected: false },
  { input: '//protocol-relative', expected: false },
  { input: 'https://', expected: true },
  // Robustness tests (URL encoded attacks)
  { input: '%6Aavascript:alert(1)', expected: false }, // 'j' encoded (becomes javascript:)
  { input: 'java%09script:alert(1)', expected: false }, // tab encoded
  { input: 'https://malicious.com', expected: true }, // Technically valid protocol, though domain validation is out of scope here
];

let failed = false;
console.log("Running Link Security Tests...");
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
