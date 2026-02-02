/**
 * Vite Configuration
 *
 * Build configuration for the portfolio application using Vite as the build tool.
 * Vite provides fast HMR (Hot Module Replacement) during development and optimized builds for production.
 *
 * @see https://vitejs.dev/config/
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Base public path when served in production
  build: {
    // Increase chunk size warning limit to 1MB (1000 KB)
    // This prevents warnings for larger bundles like the AI service and D3 visualizations
    chunkSizeWarningLimit: 1000,
  },
});
