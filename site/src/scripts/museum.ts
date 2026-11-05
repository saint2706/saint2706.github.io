// Museum viewer for /personal/art/: a painting link opens the painting whole, then each detail in turn.
// Without JavaScript the links go to each painting's own page, which has everything the viewer shows.
type Detail = { label: string; text: string; rect: number[] };
type Work = {
  slug: string;
  title: string;
  by: string;
  room: string;
  look: string;
  src: string;
  w: number;
  h: number;
  details: Detail[];
};

const dataEl = document.getElementById('museum-data');
const dialog = document.getElementById('viewer') as HTMLDialogElement | null;

if (dataEl && dialog) {
  const works: Work[] = JSON.parse(dataEl.textContent || '[]');
  const q = <T extends Element>(sel: string) => dialog.querySelector(sel) as T;
  const stage = q<HTMLElement>('[data-stage]');
  const canvas = q<HTMLElement>('[data-canvas]');
  const marks = q<HTMLElement>('[data-marks]');
  const img = document.createElement('img');
  img.alt = '';
  canvas.prepend(img);
  let w = 0;
  let step = 0;
  let opener: HTMLElement | null = null;

  const set = (sel: string, text: string) => (q<HTMLElement>(sel).textContent = text);

  function place() {
    const work = works[w];
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    // Whole painting: fit with a margin. A detail: fit its box, capped so the image stays sharp enough.
    let [x, y, bw, bh, pad] = [0, 0, work.w, work.h, 0.92];
    if (step > 0) {
      const r = work.details[step - 1].rect;
      [x, y, bw, bh, pad] = [
        (r[0] * work.w) / 100,
        (r[1] * work.h) / 100,
        (r[2] * work.w) / 100,
        (r[3] * work.h) / 100,
        0.88,
      ];
    }
    const s = Math.min((sw / bw) * pad, (sh / bh) * pad, step > 0 ? 3 : Infinity);
    const tx = sw / 2 - (x + bw / 2) * s;
    const ty = sh / 2 - (y + bh / 2) * s;
    canvas.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    canvas.style.setProperty('--inv', String(1 / s));
  }

  function show(n: number) {
    const work = works[w];
    step = (n + work.details.length + 1) % (work.details.length + 1);
    dialog!.toggleAttribute('data-zoomed', step > 0);
    if (step === 0) {
      set('[data-count]', `Whole painting · ${work.details.length} details`);
      set('[data-label]', 'Look first');
      set('[data-text]', work.look);
    } else {
      const d = work.details[step - 1];
      set('[data-count]', `Detail ${step} of ${work.details.length}`);
      set('[data-label]', d.label);
      set('[data-text]', d.text);
    }
    place();
  }

  function open(i: number) {
    w = (i + works.length) % works.length;
    const work = works[w];
    img.src = work.src;
    img.width = work.w;
    img.height = work.h;
    canvas.style.width = `${work.w}px`;
    canvas.style.height = `${work.h}px`;
    set('[data-room]', work.room);
    set('[data-title]', work.title);
    set('[data-by]', work.by);
    q<HTMLAnchorElement>('[data-more]').href = `/personal/art/${work.slug}/`;
    marks.replaceChildren(
      ...work.details.map((d, n) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = String(n + 1);
        b.setAttribute('aria-label', `Detail ${n + 1}: ${d.label}`);
        b.style.left = `${d.rect[0]}%`;
        b.style.top = `${d.rect[1]}%`;
        b.addEventListener('click', () => show(n + 1));
        return b;
      })
    );
    if (!dialog!.open) dialog!.showModal();
    show(0);
  }

  document.querySelectorAll<HTMLAnchorElement>('a[data-view]').forEach(a =>
    a.addEventListener('click', e => {
      // Let modified clicks open the full page in a new tab as usual.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      opener = a;
      open(works.findIndex(x => x.slug === a.dataset.view));
    })
  );

  dialog.addEventListener('click', e => {
    const t = (e.target as HTMLElement).closest('button');
    if (!t) return;
    if (t.dataset.step) show(step + Number(t.dataset.step));
    else if (t.hasAttribute('data-whole')) show(0);
    else if (t.dataset.paint) open(w + Number(t.dataset.paint));
    else if (t.hasAttribute('data-close')) dialog.close();
  });

  dialog.addEventListener('keydown', e => {
    if ((e.target as HTMLElement).closest('a')) return;
    if (e.key === 'ArrowRight') show(step + 1);
    else if (e.key === 'ArrowLeft') show(step - 1);
    else if (/^[0-9]$/.test(e.key) && Number(e.key) <= works[w].details.length) show(Number(e.key));
    else return;
    e.preventDefault();
  });

  dialog.addEventListener('close', () => opener?.focus());
  addEventListener('resize', () => dialog.open && place());
}
