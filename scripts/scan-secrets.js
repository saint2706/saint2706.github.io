import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');

// Regex patterns for specific high-risk secrets
const PATTERNS = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Token', regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/ },
  { name: 'Slack Token', regex: /xox[baprs]-([0-9a-zA-Z]{10,48})/ },
  { name: 'Private Key', regex: /-----BEGIN PRIVATE KEY-----/ },
];

// Heuristic Regex to find potential secrets (high entropy strings assigned to variables)
const GENERIC_SECRET_REGEX =
  /(?<!import\s)(?:const|let|var)\s+([A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*)\s*=\s*['"`]([^'"`\s]+)['"`]/gi;

// Files/directories to exclude
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage'];
const EXCLUDE_FILES = ['.DS_Store', 'package-lock.json', 'pnpm-lock.yaml'];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let found = false;

    // 1. Check for specific patterns
    for (const { name, regex } of PATTERNS) {
      if (regex.test(content)) {
        console.error(`CRITICAL SECRET FOUND in ${path.relative(process.cwd(), filePath)}:`);
        console.error(`  Type: ${name}`);
        found = true;
      }
    }

    // 2. Check for generic secrets
    GENERIC_SECRET_REGEX.lastIndex = 0;
    let match;
    while ((match = GENERIC_SECRET_REGEX.exec(content)) !== null) {
      const [, variableName, value] = match;

      // Ignore empty strings or short strings
      if (value.length < 8) continue;

      // Ignore placeholders
      if (
        value.includes('YOUR_') ||
        value.includes('EXAMPLE') ||
        value.includes('REDACTED') ||
        value.includes('xxxx')
      )
        continue;

      // Ignore template literals like ${env.VAR}
      if (value.startsWith('${') && value.endsWith('}')) continue;

      // Ignore storage keys and rate limit keys
      if (variableName.endsWith('STORAGE_KEY') || variableName.endsWith('LIMIT_KEY')) continue;

      // Ignore color hex codes (if someone named a variable COLOR_KEY or something)
      if (value.match(/^#[0-9A-Fa-f]{6}$/)) continue;

      console.error(`POTENTIAL SECRET FOUND in ${path.relative(process.cwd(), filePath)}:`);
      console.error(`  Variable: ${variableName}`);
      console.error(`  Value: ${value.substring(0, 4)}... (redacted)`);
      found = true;
    }
    return found;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dir) {
  let hasSecrets = false;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        if (scanDirectory(fullPath)) hasSecrets = true;
      }
    } else {
      if (
        !EXCLUDE_FILES.includes(file) &&
        (file.endsWith('.js') ||
          file.endsWith('.jsx') ||
          file.endsWith('.ts') ||
          file.endsWith('.tsx') ||
          file.endsWith('.json') || // Also scan JSON files
          file.endsWith('.env')) // And .env files (though usually ignored by git)
      ) {
        if (scanFile(fullPath)) hasSecrets = true;
      }
    }
  }
  return hasSecrets;
}

console.log('Scanning for secrets in src directory...');
const foundSecrets = scanDirectory(SRC_DIR);

if (foundSecrets) {
  console.error('\nFAILED: Potential secrets found in codebase.');
  process.exit(1);
} else {
  console.log('\nPASS: No obvious hardcoded secrets found.');
}
