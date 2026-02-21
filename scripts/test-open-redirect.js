
import { isSafeHref } from '../src/utils/security.js';

const cases = [
  { input: '/\t/example.com', expected: false, name: 'Tab character in protocol-relative URL' },
  { input: '/\n/example.com', expected: false, name: 'Newline character in protocol-relative URL' },
  { input: '/\r/example.com', expected: false, name: 'Carriage return character in protocol-relative URL' },
  { input: '//example.com', expected: false, name: 'Standard protocol-relative URL' },
];

let failed = false;

console.log('Running Open Redirect Reproduction Tests...');

cases.forEach(({ input, expected, name }) => {
  const result = isSafeHref(input);
  if (result !== expected) {
    console.error(`FAILED: ${name}`);
    console.error(`Input: "${input.replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`);
    console.error(`Expected: ${expected}`);
    console.error(`Got: ${result}`);
    failed = true;
  } else {
    console.log(`PASS: ${name}`);
  }
});

if (failed) {
  console.log('\nVulnerable: Open Redirect possible via control characters.');
  process.exit(1);
} else {
  console.log('\nSecure: No Open Redirect vulnerabilities found.');
}
