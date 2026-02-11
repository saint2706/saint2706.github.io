/**
 * SRI Verification Script
 *
 * Verifies that the Pyodide script injection in PythonRunner.jsx includes
 * the correct Subresource Integrity (SRI) hash and crossOrigin attribute.
 *
 * @module scripts/verify-sri
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pythonRunnerPath = path.resolve(__dirname, '../src/components/shared/PythonRunner.jsx');
const EXPECTED_HASH = 'sha384-+R8PTzDXzivdjpxOqwVwRhPS9dlske7tKAjwj0O0Kr361gKY5d2Xe6Osl+faRLT7';

try {
  const content = fs.readFileSync(pythonRunnerPath, 'utf8');

  // Check for integrity attribute
  if (!content.includes(`script.integrity = '${EXPECTED_HASH}'`)) {
    console.error('FAILED: SRI integrity attribute is missing or incorrect.');
    console.error(`Expected: script.integrity = '${EXPECTED_HASH}'`);
    process.exit(1);
  }

  // Check for crossOrigin attribute
  if (!content.includes("script.crossOrigin = 'anonymous'")) {
    console.error('FAILED: crossOrigin attribute is missing or incorrect.');
    console.error("Expected: script.crossOrigin = 'anonymous'");
    process.exit(1);
  }

  console.log('PASS: PythonRunner.jsx contains correct SRI attributes.');
} catch (error) {
  console.error('Error reading PythonRunner.jsx:', error);
  process.exit(1);
}
