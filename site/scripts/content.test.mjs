// Content integrity: the schemas parse on import, these tests cover what a schema cannot see.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { paintings, gallery, posts, isExpired } from '../src/lib/content.ts';

const pub = p => fileURLToPath(new URL(`../public${p}`, import.meta.url));

test('every painting image file exists', () => {
  for (const p of paintings) {
    for (const src of [p.image.src, p.image.thumb, p.focus.src, ...p.details.map(d => d.src)]) {
      assert.ok(existsSync(pub(src)), `${p.slug}: missing ${src}`);
    }
  }
});

test('every source a painting cites is listed', () => {
  for (const p of paintings) {
    const ids = new Set(p.sources.map(s => s.id));
    const cited = [p.image.source, ...p.context.map(c => c.source)].filter(Boolean);
    for (const id of cited) assert.ok(ids.has(id), `${p.slug}: unknown source ${id}`);
  }
});

test('only the seven public-domain works are present', () => {
  assert.equal(paintings.length, 7);
  const banned = /false mirror|human condition|slave market/i;
  assert.ok(!paintings.some(p => banned.test(p.title)));
  assert.equal(new Set(gallery.rooms.flatMap(r => r.works)).size, 7);
});

test('blog links carry no tracking parameters and no cover pixel is exposed', () => {
  for (const p of posts) {
    assert.ok(!p.link.includes('?'), p.link);
    assert.ok(!('coverImage' in p));
  }
  assert.equal(posts.filter(p => p.myth).length, 2);
});

test('a certificate expires on the first day of the next month', () => {
  assert.equal(isExpired('Jul 2026', new Date(2026, 6, 31)), false);
  assert.equal(isExpired('Jul 2026', new Date(2026, 7, 1)), true);
  assert.equal(isExpired(null), false);
});

test(
  'no unexpected image hosts in built HTML',
  { skip: !existsSync(fileURLToPath(new URL('../dist/index.html', import.meta.url))) },
  () => {
    const html = readFileSync(
      fileURLToPath(new URL('../dist/personal/index.html', import.meta.url)),
      'utf8'
    );
    assert.ok(!/<img[^>]+src="https?:/.test(html), 'images must be self-hosted');
  }
);
