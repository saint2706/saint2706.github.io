// Checks the built output (run after `pnpm run build`): metadata, sitemap, privacy and secrets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const SITE = 'https://saint2706.github.io';
const built = existsSync(join(dist, 'index.html'));

const walk = dir =>
  readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
  );
const files = built ? walk(dist) : [];
const pages = files
  .filter(f => f.endsWith('.html'))
  .map(f => {
    const html = readFileSync(f, 'utf8');
    const rel = relative(dist, f).split(sep).join('/');
    const route = rel === '404.html' ? '/404/' : `/${rel.replace(/index\.html$/, '')}`;
    return {
      route,
      html,
      redirect: /http-equiv="refresh"/i.test(html),
      noindex: /name="robots" content="noindex"/.test(html),
    };
  });
const real = pages.filter(p => !p.redirect);
const attr = (html, re) => html.match(re)?.[1];

test(
  'every page has a title, a description and a canonical URL for its own route',
  { skip: !built },
  () => {
    const titles = new Set();
    for (const p of real.filter(p => p.route !== '/404/')) {
      const title = attr(p.html, /<title>([^<]+)<\/title>/);
      assert.ok(title, `${p.route}: no title`);
      assert.ok(!titles.has(title), `${p.route}: duplicate title ${title}`);
      titles.add(title);
      assert.ok(
        attr(p.html, /<meta name="description" content="([^"]+)"/),
        `${p.route}: no description`
      );
      assert.equal(
        attr(p.html, /<link rel="canonical" href="([^"]+)"/),
        SITE + p.route,
        `${p.route}: canonical`
      );
    }
  }
);

test('the sitemap lists every indexable page and nothing else', { skip: !built }, () => {
  const xml = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
  const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(SITE, '')).sort();
  const indexable = real
    .filter(p => !p.noindex && p.route !== '/404/')
    .map(p => p.route)
    .sort();
  assert.deepEqual(listed, indexable);
  assert.match(
    readFileSync(join(dist, 'robots.txt'), 'utf8'),
    /Sitemap: https:\/\/saint2706\.github\.io\/sitemap-index\.xml/
  );
});

test('redirect pages point at a real route', { skip: !built }, () => {
  const routes = new Set(real.map(p => p.route));
  const redirects = pages.filter(p => p.redirect);
  assert.equal(redirects.length, 4);
  for (const p of redirects) {
    const to = attr(p.html, /content="0;url=([^"]+)"/);
    assert.ok(routes.has(to), `${p.route} -> ${to}`);
  }
});

test('no third-party scripts, styles, fonts, images or frames', { skip: !built }, () => {
  for (const p of real) {
    const external = [
      ...p.html.matchAll(/<(script|link|img|iframe|source)\b[^>]*\b(?:src|href)="(https?:[^"]+)"/g),
    ]
      .filter(([, tag, url]) => !(tag === 'link' && url.startsWith(SITE + '/')))
      .map(m => m[2]);
    assert.deepEqual(external, [], p.route);
    assert.match(p.html, /http-equiv="content-security-policy"/i, `${p.route}: no CSP`);
  }
});

test('no cookies, analytics or secrets in the output', { skip: !built }, () => {
  const text = files
    .filter(f => /\.(html|js|css|json|txt|xml)$/.test(f))
    .map(f => readFileSync(f, 'utf8'))
    .join('\n');
  for (const bad of [
    /document\.cookie/,
    /google-analytics|googletagmanager|gtag\(|plausible|umami/i,
    /AIza[0-9A-Za-z_-]{35}/,
    /\bsk-[A-Za-z0-9]{20,}/,
    /GEMINI_API_KEY/,
  ]) {
    assert.doesNotMatch(text, bad);
  }
});
