import { safeJSONStringify } from '../src/utils/security.js';

const tests = [
  {
    name: "Standard object",
    input: { key: "value" },
    expected: '{"key":"value"}'
  },
  {
    name: "Object with script tag",
    input: { key: "<script>alert(1)</script>" },
    expected: '{"key":"\\u003cscript>alert(1)\\u003c/script>"}'
  },
  {
    name: "Nested object with script tag",
    input: { nested: { key: "</script>" } },
    expected: '{"nested":{"key":"\\u003c/script>"}}'
  },
  {
    name: "Array with script tag",
    input: ["<script>"],
    expected: '["\\u003cscript>"]'
  }
];

let failed = false;
console.log("Running JSON Security Tests...");

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
  console.log("All tests passed!");
}
