// ABOUTME: Vitest configuration for the markdown slides application
// ABOUTME: Configures unit testing with React support, colocation test files, and coverage reporting

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment configuration
    environment: 'jsdom',

    // Test file patterns (supporting colocation)
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/tests/e2e/**', // Exclude E2E tests from unit tests
    ],

    // Setup files
    setupFiles: ['./src/test/setup.ts'],

    // Global test configuration
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__x00__*',
        '**/\x00*',
        'cypress/**',
        'test?(s)/**',
        'tests/**',
        'test-*',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/tests/**',
        '**/__tests__/**',
        '**/.next/**',
        '**/next.config.*',
        '**/vitest.config.*',
        '**/playwright.config.*',
        '**/tailwind.config.*',
        '**/postcss.config.*',
        '**/eslint.config.*',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,
  },

  // Resolve configuration for path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Define configuration
  define: {
    'import.meta.vitest': undefined,
  },
});
