/**
 * AI service sanitization tests.
 */

import { sanitizeHistoryForGemini } from '../src/services/ai.js';

let failed = false;

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const tests = [
  {
    name: 'Ignores malformed history entries without throwing',
    input: [
      null,
      'string',
      42,
      { role: 'user' },
      { role: 'admin', parts: [{ text: 'bad role' }] },
      { role: 'model', parts: 'not-an-array' },
      { role: 'user', parts: [{ text: '  hello  ' }, { nope: true }, { text: 123 }] },
      { role: 'model', parts: [{ text: '' }, { text: '  \u0000hi\u0000  ' }] },
      { role: 'model', parts: [{ text: '   ' }] },
    ],
    expected: [
      { role: 'user', parts: [{ text: 'hello' }] },
      { role: 'model', parts: [{ text: 'hi' }] },
    ],
  },
  {
    name: 'Returns empty array when history is not an array',
    input: { role: 'user', parts: [{ text: 'hello' }] },
    expected: [],
  },
];

console.log('Running AI Service Sanitization Tests...');

for (const test of tests) {
  try {
    const output = sanitizeHistoryForGemini(test.input);
    if (!deepEqual(output, test.expected)) {
      console.error(`FAILED: ${test.name}`);
      console.error('Expected:', JSON.stringify(test.expected));
      console.error('Got:', JSON.stringify(output));
      failed = true;
      continue;
    }

    console.log(`PASS: ${test.name}`);
  } catch (error) {
    console.error(`ERROR: ${test.name}`);
    console.error(error);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('AI service sanitization tests passed!');
