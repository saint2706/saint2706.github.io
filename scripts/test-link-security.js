
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
];

const validate = (href) => {
  if (!href) return false;
  // This is the logic we will inject into the component
  return /^(https?:\/\/|mailto:)/i.test(href);
};

let failed = false;
console.log("Running Security Tests...");
tests.forEach(({ input, expected }) => {
  const result = validate(input);
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
