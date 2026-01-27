import { safeJSONStringify } from '../src/utils/security.js';

const tests = [
  {
    name: 'Escapes <script>',
    input: { key: '<script>alert(1)</script>' },
    expectedContains: '\\u003cscript\\u003ealert(1)\\u003c/script\\u003e'
  },
  {
    name: 'Escapes HTML entities',
    input: { key: '& " \'' },
    // JSON.stringify escapes " as \", and safeJSONStringify escapes ' as \u0027 and & as \u0026
    expectedContains: '\\u0026 \\" \\u0027'
  },
  {
    name: 'Escapes line separators',
    input: { key: '\u2028 \u2029' },
    expectedContains: '\\u2028 \\u2029'
  },
  {
    name: 'Handles complex objects',
    input: { a: 1, b: ['<'] },
    expectedContains: '\\u003c'
  }
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
  process.exit(1);
} else {
  console.log('All tests passed!');
}
