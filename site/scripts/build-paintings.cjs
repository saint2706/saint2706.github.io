// Turns the owner's deck data (deck.json) + zip images into site/content/paintings.json and webp crops.
// usage: NODE_PATH=<folder with sharp installed> node build-paintings.cjs <deck.json> <imgDir> <siteDir>
// sharp is not a project dependency (its libvips binaries are LGPL-3.0); install it in a scratch folder to rerun.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const [deckPath, imgDir, siteDir] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(deckPath, 'utf8'));

const ORDER = [
  ['icarus', 'fall-of-icarus'],
  ['may3', 'third-of-may'],
  ['kollwitz', 'woman-with-dead-child'],
  ['shak', 'shakuntala-looking-back'],
  ['susanna', 'susanna-and-the-elders'],
  ['sleep', 'sleep-of-reason'],
  ['draupadi', 'disrobing-of-draupadi'],
];
const TAGS = { doc: 'Documented', sch: 'Scholarly', deb: 'Debated', pro: 'For discussion' };
// Repeat until stable so removing one tag cannot join fragments into a new one ("<scr<b>ipt>").
const strip = s => {
  let prev;
  do {
    prev = s;
    s = s.replace(/<[^>]*>/g, '');
  } while (s !== prev);
  return s.replace(/\s+/g, ' ').trim();
};
const listItems = html => [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => strip(m[1]));

const out = [];
(async () => {
  for (const [key, slug] of ORDER) {
    const w = d.WORKS[key];
    const slides = d.SLIDES.filter(s => s.work === key);
    const get = t => slides.find(s => s.type === t);
    const look = get('look'), rd = get('readings'), q = get('discuss');
    const srcIds = new Set([w.imgSrc]);
    const src = id => { if (id) srcIds.add(id); return id; };

    const file = path.join(imgDir, path.basename(w.img));
    const meta = await sharp(file).metadata();
    const dir = path.join(siteDir, 'public', 'art', slug);
    fs.mkdirSync(dir, { recursive: true });
    const W = meta.width, H = meta.height;
    const full = await sharp(file).resize({ width: 1600, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(dir, 'full.webp'));
    const thumb = await sharp(file).resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(dir, 'thumb.webp'));
    const crop = async (r, name) => {
      const left = Math.round((r[0] / 100) * W), top = Math.round((r[1] / 100) * H);
      const width = Math.min(W - left, Math.round((r[2] / 100) * W)), height = Math.min(H - top, Math.round((r[3] / 100) * H));
      const info = await sharp(file).extract({ left, top, width, height }).resize({ width: 960, height: 960, fit: 'inside', withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(dir, name));
      return { src: `/art/${slug}/${name}`, width: info.width, height: info.height, rect: r };
    };

    const rawDetails = w.details || w.looks || [];
    const details = [];
    for (const [i, x] of rawDetails.entries()) details.push({ label: x.label, text: x.text, ...(await crop(x.r, `detail-${i + 1}.webp`)) });

    const work = {
      slug,
      n: w.n,
      artist: w.artist,
      title: w.title,
      note: w.alt || null,
      date: w.date,
      medium: w.medium,
      dims: w.dims,
      holder: w.coll,
      holderRef: w.credit,
      image: { src: `/art/${slug}/full.webp`, width: full.width, height: full.height, thumb: `/art/${slug}/thumb.webp`, thumbWidth: thumb.width, thumbHeight: thumb.height, credit: w.imgCredit, source: src(w.imgSrc) },
      look: look.prompt,
      details,
      context: rd.context.map(([tag, text, id]) => ({ tag, label: TAGS[tag], text, source: src(id) })),
      quote: rd.quote ? { ...rd.quote, cite: src(rd.quote.cite) } : null,
      readings: rd.readings.map(r => ({ tag: r.tag, label: TAGS[r.tag], name: r.name, evidence: r.ev, lit: r.lit, open: r.open })),
      extra: rd.extra ? { ...rd.extra, label: TAGS[rd.extra.tag] } : null,
      question: q.q,
      follow: q.follow,
      counter: q.counter,
      now: q.now,
      focus: { caption: q.cropCap, ...(await crop(q.crop, 'focus.webp')) },
    };
    if (key === 'draupadi') {
      work.story = get('story').steps_.map(([kind, text]) => ({ kind, text }));
      const court = get('court').notes;
      work.technical = listItems(court);
      work.technicalNote = strip(court.split('</ul>')[1] || '');
      work.ladder = listItems(get('ladder').notes);
      work.view = w.view; src('met_draupadi');
    }
    work.sources = [...srcIds].filter(Boolean).map(id => ({ id, title: d.SRC[id].t, url: d.SRC[id].u }));
    const bad = JSON.stringify(work).match(/<[a-z\/][^>]*>/i);
    if (bad) throw new Error(`${slug}: HTML left in text: ${bad[0]}`);
    out.push(work);
    console.log(slug, W + 'x' + H, '->', full.size, 'bytes full,', details.length, 'details');
  }
  fs.writeFileSync(path.join(siteDir, 'content', 'paintings.json'), JSON.stringify(out, null, 2) + '\n');
})().catch(e => { console.error(e); process.exit(1); });
