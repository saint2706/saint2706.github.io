import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd(),
  errors = [];
function read(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
  } catch (e) {
    errors.push(`${rel}: ${e.message}`);
    return null;
  }
}
const project = read('project-system/state/project.json');
const approvals = read('project-system/state/approvals.json');
const tasksState = read('project-system/state/tasks.json');
const decisions = read('project-system/state/decisions.json');
const baseline = read('project-system/state/repo-baseline.json');

if (project && (project.current_phase !== 'P00' || project.execution_mode !== 'audit-only'))
  errors.push('Initial state must remain P00 / audit-only.');
for (let i = 0; i <= 7; i++) {
  const phase = `P${String(i).padStart(2, '0')}`;
  const a = approvals?.approvals?.find(x => x.phase === phase);
  if (!a) errors.push(`Missing approval for ${phase}`);
  else if (!['authorized', 'pending-approval', 'complete'].includes(a.status))
    errors.push(`Unexpected authorization status for ${phase}`);
}
const taskList = tasksState?.tasks || [];
const ids = new Set(taskList.map(t => t.id));
if (taskList.length !== 28) errors.push(`Expected 28 tasks, found ${taskList.length}`);
for (const t of taskList) {
  for (const k of ['objective', 'prompt'])
    if (!String(t[k] || '').trim()) errors.push(`${t.id} missing ${k}`);
  for (const k of [
    'scope',
    'acceptance_criteria',
    'expected_deliverables',
    'evidence_required',
    'no_scope_creep',
  ])
    if (!Array.isArray(t[k]) || !t[k].length) errors.push(`${t.id} missing ${k}`);
  for (const d of t.depends_on || [])
    if (!ids.has(d)) errors.push(`${t.id} depends on unknown task ${d}`);
}
const visiting = new Set(),
  visited = new Set(),
  byId = new Map(taskList.map(t => [t.id, t]));
function visit(id) {
  if (visiting.has(id)) {
    errors.push(`Dependency cycle at ${id}`);
    return;
  }
  if (visited.has(id)) return;
  visiting.add(id);
  for (const dep of byId.get(id)?.depends_on || []) visit(dep);
  visiting.delete(id);
  visited.add(id);
}
for (const id of ids) visit(id);
if (decisions?.confirmed_count !== 163 || decisions?.decisions?.length !== 163)
  errors.push('Expected exactly 163 confirmed decisions.');
const nums = (decisions?.decisions || []).map(x => x.number).sort((a, b) => a - b);
if (nums.some((n, i) => n !== i + 1)) errors.push('Decision numbering must cover 1..163 exactly.');
if (baseline && (!baseline.repository || !baseline.default_branch || !baseline.head_sha))
  errors.push('Baseline missing identity fields.');
if (errors.length) {
  console.error('Project state validation FAILED');
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(
  `Project state validation PASSED: ${taskList.length} tasks; 163 decisions; phase state.`
);
