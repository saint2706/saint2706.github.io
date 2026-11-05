import { defineConfig, devices } from '@playwright/test';

// Runs against the built site (astro build + pagefind), so search and the CSP behave as in production.
export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'pnpm exec astro preview --port 4321',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
