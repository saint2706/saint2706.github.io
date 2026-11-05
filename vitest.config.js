import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

const GLOBAL_STUBS = ['src/navigation/viewTransitionNavigate.test.ts', 'src/utils/storage.test.js'];

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    // site/ runs its own node:test and Playwright suites.
    exclude: [...configDefaults.exclude, 'site/**'],
    projects: [
      {
        // vmThreads builds jsdom once per worker instead of once per file, with a fresh window per file.
        extends: true,
        test: {
          name: 'dom',
          pool: 'vmThreads',
          exclude: [...configDefaults.exclude, 'site/**', ...GLOBAL_STUBS],
        },
      },
      // These delete or stub window/document, which a VM realm's global does not allow.
      { extends: true, test: { name: 'globals', include: GLOBAL_STUBS } },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  define: {
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify('test-api-key'),
  },
});
