import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  '/',
  '/work/',
  '/projects/',
  '/projects/programming-challenges-6/',
  '/projects/coding-for-mba/',
  '/projects/attendance-face-recognition/',
  '/writing/',
  '/about/',
  '/contact/',
  '/personal/',
  '/personal/art/',
  '/personal/books/',
  '/personal/art/fall-of-icarus/',
  '/personal/art/disrobing-of-draupadi/',
  '/personal/art/sleep-of-reason/',
  '/lab/',
  '/search/',
];

for (const route of ROUTES) {
  test(`${route} renders, passes axe and fits the screen`, async ({ page }) => {
    const problems: string[] = [];
    page.on('console', m => m.type() === 'error' && problems.push(m.text()));
    page.on('pageerror', e => problems.push(e.message));
    // The entrance animation fades text in; axe would sample it mid-fade. Reduced motion shows the final state at once.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Rishabh Agrawal/);

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(axe.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`)).toEqual(
      []
    );

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(problems, 'console errors, including CSP violations').toEqual([]);
  });
}

test('skip link moves focus to the main content', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium');
  await page.goto('/work/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: /skip/i });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#content')).toBeFocused();
});

test('the personal space has its own nav, reachable by keyboard', async ({ page }) => {
  await page.goto('/');
  // Professional pages never show the personal nav.
  await expect(page.getByRole('navigation', { name: 'Off the clock' })).toHaveCount(0);
  const gateway = page.locator('a.per[href="/personal/"]');
  await gateway.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/personal\/$/);
  const rooms = page.getByRole('navigation', { name: 'Off the clock' });
  await expect(rooms.getByRole('link', { name: 'Off the clock' })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await rooms.getByRole('link', { name: 'Art and myth' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/personal\/art\/$/);
  await page
    .getByRole('link', { name: /Fall of Icarus/ })
    .first()
    .click();
  // A painting keeps its room marked in the personal nav.
  await expect(
    page
      .getByRole('navigation', { name: 'Off the clock' })
      .getByRole('link', { name: 'Art and myth' })
  ).toHaveAttribute('aria-current', 'true');
});

test('old personal-page anchors land in the new rooms', async ({ page }) => {
  await page.goto('/personal/#books');
  await expect(page).toHaveURL(/\/personal\/books\/$/);
  await page.goto('/personal/#art');
  await expect(page).toHaveURL(/\/personal\/art\/$/);
});

test('old SPA paths redirect', async ({ page }) => {
  await page.goto('/resume/');
  await expect(page).toHaveURL(/\/about\/$/);
});

test('search finds a painting and lists it as a link', async ({ page }) => {
  await page.goto('/search/');
  await page.getByLabel('Search the site').fill('Icarus');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('status')).toContainText('for “Icarus”');
  await expect(page.locator('#results a').first()).toHaveAttribute('href', /fall-of-icarus/);
  await expect(page.locator('#results li').first().locator('.meta')).toHaveText('Painting');
});

test('search labels a case study by kind', async ({ page }) => {
  await page.goto('/search/?q=Pyodide');
  const hit = page.locator('#results li', {
    has: page.locator('a[href*="/projects/coding-for-mba/"]'),
  });
  await expect(hit.locator('.meta')).toHaveText('Case study');
});

test('flagship rows link to their case studies', async ({ page }) => {
  await page.goto('/projects/');
  await page.getByRole('link', { name: 'Read the case study' }).first().click();
  await expect(page).toHaveURL(/\/projects\/programming-challenges-6\/$/);
  await expect(page.getByRole('heading', { name: 'Limits' })).toBeVisible();
});

test('about page prints with contact details and without site chrome', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeVisible();
  await expect(page.locator('.print-only')).toBeHidden();
  await expect(page.getByText(/expired Jul 2026/i)).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-only')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeHidden();
  await expect(page.locator('.site-foot')).toBeHidden();
});

test('search reports nothing found', async ({ page }) => {
  await page.goto('/search/?q=zzqxw');
  await expect(page.getByRole('status')).toContainText('Nothing found');
});

test('a slower earlier search never overwrites the latest one', async ({ page }) => {
  await page.goto('/search/');
  const box = page.getByLabel('Search the site');
  // The first search also loads the index, so it tends to finish after the second.
  await box.fill('Icarus');
  await box.press('Enter');
  await box.fill('zzqxw');
  await box.press('Enter');
  await expect(page.getByRole('status')).toContainText('Nothing found for “zzqxw”');
  await page.waitForTimeout(500);
  await expect(page.getByRole('status')).toContainText('zzqxw');
  await expect(page.locator('#results li')).toHaveCount(0);
});

test('detail markers show only when asked', async ({ page }) => {
  await page.goto('/personal/art/fall-of-icarus/');
  const marks = page.locator('svg.marks');
  await expect(marks).toBeHidden();
  await page.getByLabel('Show where the details are').check();
  await expect(marks).toBeVisible();
});

test('without JavaScript the site menu still works and controls stay hidden', async ({
  browser,
}) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('[data-needs-js]').first()).toBeHidden();
  await page.locator('footer').getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await ctx.close();
});

test('every painting image loads once scrolled into view', async ({ page }) => {
  for (const r of [
    '/personal/art/',
    '/personal/art/fall-of-icarus/',
    '/personal/art/disrobing-of-draupadi/',
  ]) {
    await page.goto(r);
    for (const img of await page.locator('img').all()) await img.scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(() =>
      [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    );
    expect(broken, r).toEqual([]);
  }
});
