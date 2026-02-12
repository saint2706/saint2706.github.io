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

const pyodideLoaderPath = path.resolve(__dirname, '../src/components/shared/pyodideLoader.js');
const EXPECTED_HASH = 'sha384-+R8PTzDXzivdjpxOqwVwRhPS9dlske7tKAjwj0O0Kr361gKY5d2Xe6Osl+faRLT7';

try {
  const content = fs.readFileSync(pyodideLoaderPath, 'utf8');

  // Check for integrity attribute
  if (!content.includes(`script.integrity = PYODIDE_SCRIPT_SRI`)) {
    console.error('FAILED: SRI integrity attribute is missing or incorrect.');
    console.error(`Expected: script.integrity = PYODIDE_SCRIPT_SRI`);
    process.exit(1);
  }

  // Check for the constant definition
  if (!content.includes(`PYODIDE_SCRIPT_SRI =`)) {
    console.error('FAILED: PYODIDE_SCRIPT_SRI constant is missing.');
    console.error(`Expected: const PYODIDE_SCRIPT_SRI = ...`);
    process.exit(1);
  }

  // Check for the expected hash value
  if (!content.includes(`'${EXPECTED_HASH}'`)) {
    console.error('FAILED: SRI hash value is missing or incorrect.');
    console.error(`Expected: '${EXPECTED_HASH}'`);
    process.exit(1);
  }

  // Check for crossOrigin attribute
  if (!content.includes("script.crossOrigin = 'anonymous'")) {
    console.error('FAILED: crossOrigin attribute is missing or incorrect.');
    console.error("Expected: script.crossOrigin = 'anonymous'");
    process.exit(1);
  }

  console.log('PASS: pyodideLoader.js contains correct SRI attributes.');
} catch (error) {
  console.error('Error reading pyodideLoader.js:', error);
  process.exit(1);
}
