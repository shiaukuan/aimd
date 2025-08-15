// ABOUTME: Development-focused Playwright configuration for faster testing
// ABOUTME: Only runs tests on Chrome to speed up development workflow

import { defineConfig, devices } from '@playwright/test';

/**
 * Development configuration - only Chrome for faster testing
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Run tests in files in parallel with fewer workers
  fullyParallel: true,
  workers: 5, // 減少並行數量避免資源競爭

  // Add retries for flaky tests
  retries: 2, // 增加重試機制

  // Simple reporter for development
  reporter: [['list'], ['html', { open: 'never' }]],

  // Longer timeout for complex operations
  timeout: 60 * 1000, // 增加到60秒

  // Expect timeout for assertions
  expect: {
    timeout: 10 * 1000, // 增加斷言超時時間
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

    // Much longer timeouts for complex operations
    actionTimeout: 30 * 1000, // 從10秒增加到30秒
    navigationTimeout: 45 * 1000, // 從20秒增加到45秒
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
    timeout: 120 * 1000, // 增加伺服器啟動超時到2分鐘
    stdout: 'pipe', // 捕獲伺服器輸出以便調試
    stderr: 'pipe',
  },

  // Output directory for test results
  outputDir: 'test-results/',
});
