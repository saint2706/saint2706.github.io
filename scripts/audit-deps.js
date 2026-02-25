/**
 * Dependency Security Audit Script
 *
 * Runs `pnpm audit` to check for high and critical vulnerabilities in dependencies.
 * If any are found, the script exits with an error code to fail the build.
 *
 * @module scripts/audit-deps
 */

import { execSync } from 'child_process';

console.log('Running dependency security audit (High/Critical only)...');

try {
  // Run pnpm audit for high and critical vulnerabilities
  // --audit-level=high ensures we only fail on serious issues
  execSync('pnpm audit --audit-level=high', { stdio: 'inherit' });
  console.log('PASS: No high or critical vulnerabilities found.');
} catch {
  console.error('\nFAILED: Security vulnerabilities found!');
  console.error('Please run "pnpm audit" to see details and fix them.');
  // Exit with error code to fail CI/CD pipeline
  process.exit(1);
}
