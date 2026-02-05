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
  const cspMatch = content.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content=["'](.*?)["']/i);

  if (!cspMatch) {
    console.error('FAILED: Content-Security-Policy meta tag not found in index.html');
    process.exit(1);
  }

  const cspContent = cspMatch[1];
  console.log('CSP Content found:', cspContent);

  // Check for unsafe-eval
  if (cspContent.includes("'unsafe-eval'")) {
    console.error("FAILED: CSP contains 'unsafe-eval'. This is a security risk.");
    process.exit(1);
  }

  console.log("PASS: CSP does not contain 'unsafe-eval'.");

} catch (error) {
  console.error('Error reading index.html:', error);
  process.exit(1);
}
