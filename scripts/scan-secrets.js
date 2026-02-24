import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');

// Regex to find potential secrets (high entropy strings assigned to variables)
// This is a heuristic and may produce false positives.
// It looks for:
// - Variables named with KEY, SECRET, TOKEN, PASSWORD
// - Followed by an assignment
// - Followed by a string literal
const SECRET_REGEX =
  /(?<!import\s)(?:const|let|var)\s+([A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*)\s*=\s*['"`]([^'"`\s]+)['"`]/gi;

// Files/directories to exclude
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage'];
const EXCLUDE_FILES = ['.DS_Store', 'package-lock.json', 'pnpm-lock.yaml'];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    let found = false;

    // Reset regex state
    SECRET_REGEX.lastIndex = 0;

    while ((match = SECRET_REGEX.exec(content)) !== null) {
      const [, variableName, value] = match;

      // Ignore empty strings or short strings (less than 8 chars are likely not secrets)
      if (value.length < 8) continue;

      // Ignore placeholders
      if (value.includes('YOUR_') || value.includes('EXAMPLE') || value.includes('REDACTED'))
        continue;

      // Ignore common environment variable references (e.g., process.env.KEY)
      // The regex above already captures string literals, so process.env won't match directly unless it's in a string.
      // But we should check if the value looks like a template literal for env vars.
      if (value.startsWith('${') && value.endsWith('}')) continue;

      // Ignore storage keys and rate limit keys (often public)
      if (variableName.endsWith('STORAGE_KEY') || variableName.endsWith('LIMIT_KEY')) continue;

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
          file.endsWith('.tsx'))
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
