// ABOUTME: Development-focused Playwright configuration for faster testing
// ABOUTME: Only runs tests on Chrome to speed up development workflow

import { defineConfig, devices } from '@playwright/test';

/**
 * Development configuration - only Chrome for faster testing
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // No retries in development
  retries: 0,

  // Simple reporter for development
  reporter: [['list'], ['html', { open: 'never' }]],

  // Shorter timeout for development
  timeout: 30 * 1000,

  // Expect timeout for assertions
  expect: {
    timeout: 5000,
  },

  // Shared settings for all tests
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video on failure
    video: 'retain-on-failure',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Longer timeouts for slow development environment
    actionTimeout: 10 * 1000,
    navigationTimeout: 20 * 1000,
  },

  // Only test on Chrome for development speed
  projects: [
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    // Test against mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Web server configuration
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: true, // Always reuse in development
    timeout: 60 * 1000,
  },

  // Output directory for test results
  outputDir: 'test-results/',
});
