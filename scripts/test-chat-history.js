import assert from 'node:assert/strict';
import { buildNextMessages, buildGeminiHistory, MAX_HISTORY_CONTEXT } from '../src/components/shared/chatHistory.js';

const createMessage = (index, role = 'model') => ({
  id: String(index),
  role,
  text: `message-${index}`,
});

const existingMessages = Array.from({ length: MAX_HISTORY_CONTEXT }, (_, index) =>
  createMessage(index + 1)
);

const userMsg = {
  id: 'user-latest',
  role: 'user',
  text: 'newest user question',
};

const nextMessages = buildNextMessages(existingMessages, userMsg);
const history = buildGeminiHistory(nextMessages);

assert.equal(nextMessages.length, existingMessages.length + 1, 'nextMessages should append user message');
assert.deepEqual(nextMessages.at(-1), userMsg, 'newest user message should be last in nextMessages');
assert.equal(history.length, MAX_HISTORY_CONTEXT, 'history should be capped at MAX_HISTORY_CONTEXT');
assert.equal(
  history.at(-1).parts[0].text,
  userMsg.text,
  'history payload should include the newest user message text'
);
assert.equal(
  history.at(0).parts[0].text,
  'message-2',
  'history should drop the oldest message when over MAX_HISTORY_CONTEXT'
);

console.log('test-chat-history: all assertions passed');
