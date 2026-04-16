#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const blockedLockfile = 'package-lock.json';

const trackedMatches = execSync(`git ls-files -- ${blockedLockfile}`, {
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean);

const violations = [];

if (existsSync(blockedLockfile)) {
  violations.push(`${blockedLockfile} exists in the repository root.`);
}

if (trackedMatches.length > 0) {
  violations.push(`${blockedLockfile} is tracked by Git.`);
}

if (violations.length > 0) {
  console.error('❌ Package manager policy check failed.');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  console.error(
    'This repository is pnpm-only. Remove package-lock.json and update pnpm-lock.yaml instead.'
  );
  process.exit(1);
}

console.log('✅ Package manager policy check passed (pnpm-only lockfile policy).');
