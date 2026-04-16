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

const VENDOR_REACT_PACKAGES = [
  'react',
  'react-dom',
  'react-router-dom',
  '@dr.pogodin/react-helmet',
];
const VENDOR_UI_PACKAGES = ['framer-motion', 'lucide-react'];
const VENDOR_AI_PACKAGES = ['@google/generative-ai'];

function chunkByDependency(id) {
  if (!id.includes('node_modules')) return;

  if (VENDOR_REACT_PACKAGES.some(pkg => id.includes(`/node_modules/${pkg}/`))) {
    return 'vendor-react';
  }

  if (VENDOR_UI_PACKAGES.some(pkg => id.includes(`/node_modules/${pkg}/`))) {
    return 'vendor-ui';
  }

  if (VENDOR_AI_PACKAGES.some(pkg => id.includes(`/node_modules/${pkg}/`))) {
    return 'vendor-ai';
  }
}

export default defineConfig({
  plugins: [react()],
  base: '/', // Base public path when served in production
  build: {
    // Increase chunk size warning limit to 1MB (1000 KB)
    // This prevents warnings for larger bundles like the AI service and D3 visualizations
    chunkSizeWarningLimit: 1000,

    // Vite 8 (Rolldown) expects output.manualChunks to be a function.
    // We intentionally keep our stable vendor chunk names so long-term bundle
    // comparisons remain readable across releases.
    rolldownOptions: {
      output: {
        // Caveat: package-path matching relies on node_modules path segments.
        // Re-evaluate if dependency paths change (for example in PnP/virtual FS setups).
        manualChunks: chunkByDependency,
      },
    },
  },
});
