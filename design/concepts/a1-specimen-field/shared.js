// Motion toggle and index dialog, shared by every A1 concept page.
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const KEY = 'a1-motion';
const readSaved = () => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const setMotion = (on, save) => {
  root.dataset.motion = on ? 'on' : 'off';
  root.dataset.motionReady = '';
  document.querySelectorAll('[data-motion-toggle]').forEach(b => {
    b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? 'Motion: on' : 'Motion: off';
  });
  if (save) {
    try {
      sessionStorage.setItem(KEY, on ? 'on' : 'off');
    } catch {
      // Storage blocked: the choice just won't carry to the next page.
    }
  }
};
// An explicit choice made on an earlier page wins; otherwise follow the OS setting.
const saved = readSaved();
setMotion(saved ? saved === 'on' : !reduce.matches, false);
reduce.addEventListener('change', e => setMotion(!e.matches, false));
document
  .querySelectorAll('[data-motion-toggle]')
  .forEach(b => b.addEventListener('click', () => setMotion(root.dataset.motion !== 'on', true)));
const dlg = document.getElementById('index');
document
  .querySelectorAll('[data-open-index]')
  .forEach(b => b.addEventListener('click', () => dlg.showModal()));
dlg.querySelectorAll('a').forEach(a => a.addEventListener('click', () => dlg.close()));
dlg.querySelector('[data-close-index]').addEventListener('click', () => dlg.close());
