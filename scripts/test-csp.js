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

  // Ensure index.html contains no inline <script> blocks.
  // We only allow scripts loaded from explicit external references.
  const scriptTagRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const inlineScripts = [];
  const externalScripts = [];

  for (const match of content.matchAll(scriptTagRegex)) {
    const attributes = match[1] ?? '';
    const body = (match[2] ?? '').trim();
    const srcMatch = attributes.match(/\ssrc\s*=\s*(["'])(.*?)\1/i);

    if (srcMatch) {
      externalScripts.push(srcMatch[2]);
      if (body.length > 0) {
        inlineScripts.push(`<script${attributes}>...`);
      }
      continue;
    }

    if (body.length > 0) {
      inlineScripts.push(`<script${attributes}>...`);
    }
  }

  if (inlineScripts.length > 0) {
    console.error('FAILED: index.html contains inline <script> blocks.');
    inlineScripts.forEach(script => console.error(` - ${script}`));
    process.exit(1);
  }

  if (externalScripts.length === 0) {
    console.error('FAILED: index.html does not include any external <script src="..."> tags.');
    process.exit(1);
  }

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

  // Check for wasm-unsafe-eval (should be present for Pyodide)
  if (!cspContent.includes("'wasm-unsafe-eval'")) {
    console.error(
      "FAILED: CSP does not contain 'wasm-unsafe-eval'. This is required for Pyodide WebAssembly execution."
    );
    process.exit(1);
  }

  // Check for upgrade-insecure-requests (should be present)
  if (!cspContent.includes('upgrade-insecure-requests')) {
    console.error(
      "FAILED: CSP does not contain 'upgrade-insecure-requests'. This is required to prevent mixed content."
    );
    process.exit(1);
  }

  // Check for frame-ancestors 'none' (prevent clickjacking)
  if (!cspContent.includes("frame-ancestors 'none'")) {
    console.error(
      "FAILED: CSP does not contain frame-ancestors 'none'. This is required to prevent clickjacking."
    );
    process.exit(1);
  }

  // Check for object-src 'none' (prevent Flash/Java applets)
  if (!cspContent.includes("object-src 'none'")) {
    console.error(
      "FAILED: CSP does not contain object-src 'none'. This is required to prevent plugin vulnerabilities."
    );
    process.exit(1);
  }

  // Check for base-uri 'self' (prevent base tag hijacking)
  if (!cspContent.includes("base-uri 'self'")) {
    console.error(
      "FAILED: CSP does not contain base-uri 'self'. This is required to prevent base tag hijacking."
    );
    process.exit(1);
  }

  console.log(
    "PASS: CSP is secure and index.html avoids inline scripts (only explicit external script references are present)."
  );
} catch (error) {
  console.error('Error reading index.html:', error);
  process.exit(1);
}
