import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as lucide from 'lucide-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'src');
const validExports = new Set(Object.keys(lucide));
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);

const readSourceFiles = dir => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readSourceFiles(absPath));
      continue;
    }

    const ext = path.extname(entry.name);
    if (sourceExtensions.has(ext)) files.push(absPath);
  }

  return files;
};

const parseLucideImports = content => {
  const lucideImportPattern = /import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"];?/g;
  const imports = [];
  let match;

  while ((match = lucideImportPattern.exec(content))) {
    const names = match[1]
      .split(',')
      .map(name => name.trim())
      .filter(Boolean)
      .map(name => name.split(/\s+as\s+/)[0].trim());

    imports.push(...names);
  }

  return imports;
};

const files = readSourceFiles(sourceDir);
const inventory = new Map();
const invalidImports = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importedIcons = parseLucideImports(content);
  if (importedIcons.length === 0) continue;

  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  inventory.set(relPath, importedIcons);

  for (const iconName of importedIcons) {
    if (!validExports.has(iconName)) invalidImports.push({ file: relPath, iconName });
  }
}

console.log('Lucide import inventory:');
for (const [file, icons] of [...inventory.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`- ${file}: ${icons.join(', ')}`);
}

if (invalidImports.length > 0) {
  console.error('\nInvalid lucide-react imports detected:');
  for (const violation of invalidImports) {
    console.error(`- ${violation.file}: ${violation.iconName}`);
  }
  process.exit(1);
}

console.log(`\nPASS: Verified ${inventory.size} files against lucide-react@1.8.0 exports.`);
