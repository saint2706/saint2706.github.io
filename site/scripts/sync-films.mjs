/**
 * Film Synchronization Script (Letterboxd)
 *
 * Orchestrates full profile and diary synchronization for https://letterboxd.com/saint2706/
 * using letterboxdpy to scrape all films (beyond the 50-item RSS ceiling), download missing
 * posters locally to site/public/films/ (zero-external-host CSP mandate), and update
 * site/content/films.json.
 *
 * Usage:
 *   pnpm -F site sync:films
 *   node site/scripts/sync-films.mjs
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pythonScript = path.resolve(__dirname, 'sync-films.py');

console.log(`[sync-films] Running python sync pipeline (${pythonScript})...`);

try {
  execSync(`python "${pythonScript}"`, {
    stdio: 'inherit',
  });
  console.log('[sync-films] Synchronization completed successfully.');
} catch (error) {
  console.error('[sync-films] Synchronization failed:', error.message);
  process.exit(1);
}
