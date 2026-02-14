/**
 * CSP Security Test
 *
 * Validates that the Content-Security-Policy in index.html is strict and secure.
 * Specifically checks for the absence of 'unsafe-eval' which allows code execution from strings.
 *
 * @module scripts/test-csp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.resolve(__dirname, '../index.html');

try {
  const content = fs.readFileSync(indexPath, 'utf8');

  // Extract CSP meta tag content
  // First find the meta tag with CSP, then extract content attribute
  const metaTagMatch = content.match(
    /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/is
  );

  if (!metaTagMatch) {
    console.error('FAILED: Content-Security-Policy meta tag not found in index.html');
    process.exit(1);
  }

  // Extract the content attribute value - match until the closing quote of the same type
  // Try double quotes first, then single quotes
  let contentMatch = metaTagMatch[0].match(/content="([^"]+)"/s);
  if (!contentMatch) {
    contentMatch = metaTagMatch[0].match(/content='([^']+)'/s);
  }

  if (!contentMatch) {
    console.error('FAILED: content attribute not found in CSP meta tag');
    process.exit(1);
  }

  const cspContent = contentMatch[1];
  console.log('CSP Content found:', cspContent);

  // Check for unsafe-eval (should not be present)
  if (cspContent.includes("'unsafe-eval'")) {
    console.error("FAILED: CSP contains 'unsafe-eval'. This is a security risk.");
    process.exit(1);
  }

  // Check for upgrade-insecure-requests
  if (!cspContent.includes('upgrade-insecure-requests')) {
    console.error("FAILED: CSP does not contain 'upgrade-insecure-requests'.");
    process.exit(1);
  }

  // Check for wasm-unsafe-eval (should be present for Pyodide)
  if (!cspContent.includes("'wasm-unsafe-eval'")) {
    console.error(
      "FAILED: CSP does not contain 'wasm-unsafe-eval'. This is required for Pyodide WebAssembly execution."
    );
    process.exit(1);
  }

  console.log(
    "PASS: CSP does not contain 'unsafe-eval' and includes 'wasm-unsafe-eval' for WebAssembly support."
  );
} catch (error) {
  console.error('Error reading index.html:', error);
  process.exit(1);
}
