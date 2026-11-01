import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd(),
  errors = [];
const required = [
  'CLAUDE.md',
  'PRODUCT.md',
  'DESIGN.md',
  'ARCHITECTURE.md',
  'CONTENT.md',
  'ROADMAP.md',
  'TASKS.md',
  'PLUGINS.md',
  'QUALITY_GATES.md',
  'DECISIONS.md',
  'project-system/PROJECT_PACK_README.md',
  'project-system/PACK_INSTALLATION.md',
  'HANDOFF_GUIDE.md',
  'project-system/state/project.json',
  'project-system/state/repo-baseline.json',
  'project-system/state/approvals.json',
  'project-system/state/tasks.json',
  'project-system/state/decisions.json',
  'project-system/state/research-index.json',
  'project-system/scripts/validate-project-state.mjs',
];
for (const f of required) if (!fs.existsSync(path.join(root, f))) errors.push(`Missing ${f}`);
function walk(dir) {
  let a = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) a = a.concat(walk(full));
    else a.push(full);
  }
  return a;
}
const all = walk(root),
  rels = new Set(all.map(f => path.relative(root, f).split(path.sep).join('/')));
for (const f of all.filter(x => x.endsWith('.json'))) {
  try {
    JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    errors.push(`Invalid JSON ${path.relative(root, f)}: ${e.message}`);
  }
}
let tasks, decisions;
try {
  tasks = JSON.parse(fs.readFileSync(path.join(root, 'project-system/state/tasks.json'), 'utf8'));
} catch {
  /* absence is reported by later checks */
}
try {
  decisions = JSON.parse(
    fs.readFileSync(path.join(root, 'project-system/state/decisions.json'), 'utf8')
  );
} catch {
  /* absence is reported by later checks */
}
if (tasks)
  for (const t of tasks.tasks || []) {
    const f = `project-system/tasks/${t.id}.md`;
    if (!rels.has(f)) errors.push(`Missing ${f}`);
    for (const d of t.depends_on || [])
      if (!(tasks.tasks || []).some(x => x.id === d))
        errors.push(`${t.id} unknown dependency ${d}`);
  }
if (decisions?.decisions?.length !== 163) errors.push('Decision register must contain 163 items.');
for (const f of all.filter(x => x.endsWith('.md'))) {
  const content = fs.readFileSync(f, 'utf8'),
    re = /\[[^\]]+\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(content))) {
    const href = m[1].split('#')[0].trim();
    if (!href || /^(https?:|mailto:|#)/.test(href)) continue;
    const resolved = path.posix.normalize(
      path.posix.join(path.posix.dirname(path.relative(root, f).split(path.sep).join('/')), href)
    );
    if (!rels.has(resolved))
      errors.push(`Broken relative link in ${path.relative(root, f)} -> ${href}`);
  }
}
if (rels.has('README.md'))
  errors.push('Do not overwrite/ship root README.md; use project-system/PROJECT_PACK_README.md.');
if (errors.length) {
  console.error('Pack validation FAILED');
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(
  `Pack validation PASSED: ${rels.size} files; ${tasks.tasks.length} tasks; 163 discovery decisions; JSON and relative Markdown links valid.`
);
