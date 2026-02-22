/**
 * Fails if legacy theme term "aura" appears in src/ or docs/,
 * except within the deprecated-history section of docs/liquid-glass-checklist.md.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SEARCH_DIRS = ['src', 'docs'];
const ALLOWED_DOC = path.join('docs', 'liquid-glass-checklist.md');
const AURA_PATTERN = /\baura\b/i;

const textExtensions = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.md',
  '.html',
  '.json',
  '.txt',
  '.xml',
  '.yml',
  '.yaml',
  '.mjs',
  '.cjs',
]);

const violations = [];

const inDeprecatedHistory = (lines, index) => {
  let sectionStart = -1;
  for (let i = index; i >= 0; i--) {
    if (lines[i].startsWith('## ')) {
      sectionStart = i;
      break;
    }
  }
  if (sectionStart === -1) return false;
  return lines[sectionStart].trim().toLowerCase() === '## 5) deprecated history';
};

const isAllowedOccurrence = (relPath, lines, index) => {
  if (relPath !== ALLOWED_DOC) return false;
  return inDeprecatedHistory(lines, index);
};

const walk = dirPath => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dirPath, entry.name);
    const rel = path.relative(rootDir, abs).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      walk(abs);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(ext)) continue;

    const content = fs.readFileSync(abs, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, idx) => {
      if (!AURA_PATTERN.test(line)) return;
      if (isAllowedOccurrence(rel, lines, idx)) return;

      violations.push({
        file: rel,
        line: idx + 1,
        text: line.trim(),
      });
    });
  }
};

for (const d of SEARCH_DIRS) {
  const abs = path.join(rootDir, d);
  if (fs.existsSync(abs)) walk(abs);
}

if (violations.length) {
  console.error('FAILED: Found forbidden "aura" references:');
  violations.forEach(v => {
    console.error(`- ${v.file}:${v.line} -> ${v.text}`);
  });
  process.exit(1);
}

console.log('PASS: No forbidden "aura" references in src/ or docs/.');
