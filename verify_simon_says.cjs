const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the games page
  await page.goto('http://localhost:4173/games');

  // Wait for the games navigation to be visible
  await page.waitForSelector('text=Simon');

  // Click on the Simon button
  await page.click('text=Simon');

  // Wait for the Simon game grid to be visible (it has 4 colored buttons)
  // Let's just wait for a short delay to ensure the component is loaded
  await page.waitForTimeout(1000);

  // Take a screenshot of the page
  await page.screenshot({ path: '/home/jules/verification/simon_says_fixed.png' });

  await browser.close();
})();
