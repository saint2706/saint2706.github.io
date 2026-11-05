import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  '/',
  '/work/',
  '/projects/',
  '/writing/',
  '/about/',
  '/contact/',
  '/personal/',
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
});

test('search reports nothing found', async ({ page }) => {
  await page.goto('/search/?q=zzqxw');
  await expect(page.getByRole('status')).toContainText('Nothing found');
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
    '/personal/',
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
