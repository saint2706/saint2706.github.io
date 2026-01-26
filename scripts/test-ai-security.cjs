// scripts/verify-ai-logic.js
const assert = require('assert');

// ----------------------
// Logic to be added
// ----------------------
const MAX_INPUT_LENGTH = 1000;
const API_TIMEOUT = 15000;

const validateInput = (input) => {
  if (typeof input !== 'string') {
    throw new Error("Input must be a text string");
  }
  if (!input.trim()) {
    throw new Error("Input cannot be empty");
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
  }
};

const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms))
]);

// ----------------------
// Tests
// ----------------------
async function runTests() {
  console.log('Running security logic verification...');

  // Test 1: Valid input
  try {
    validateInput("Hello world");
    console.log('✅ Valid input passed');
  } catch (e) {
    console.error('❌ Valid input failed:', e.message);
    process.exit(1);
  }

  // Test 2: Empty input
  try {
    validateInput("   ");
    console.error('❌ Empty input failed to throw');
    process.exit(1);
  } catch (e) {
    console.log('✅ Empty input rejected');
  }

  // Test 3: Too long input
  try {
    validateInput("a".repeat(1001));
    console.error('❌ Long input failed to throw');
    process.exit(1);
  } catch (e) {
    assert.strictEqual(e.message, `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
    console.log('✅ Long input rejected');
  }

  // Test 4: Non-string input
  try {
    validateInput(123);
    console.error('❌ Non-string input failed to throw');
    process.exit(1);
  } catch (e) {
    console.log('✅ Non-string input rejected');
  }

  // Test 5: Timeout
  try {
    const slowPromise = new Promise(resolve => setTimeout(resolve, 100));
    await withTimeout(slowPromise, 50);
    console.error('❌ Timeout failed to trigger');
    process.exit(1);
  } catch (e) {
    assert.strictEqual(e.message, "Request timed out");
    console.log('✅ Timeout triggered correctly');
  }

  // Test 6: No Timeout
  try {
    const fastPromise = new Promise(resolve => setTimeout(() => resolve('ok'), 10));
    const result = await withTimeout(fastPromise, 50);
    assert.strictEqual(result, 'ok');
    console.log('✅ No timeout for fast request');
  } catch (e) {
    console.error('❌ Fast request failed:', e.message);
    process.exit(1);
  }

  console.log('🎉 All security logic tests passed!');
}

runTests();
