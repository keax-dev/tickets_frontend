// Centralizes the Playwright setup used to run the Angular end-to-end suite in a real browser.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Look for e2e specs inside the Angular source tree where each feature keeps its own tests.
  testDir: './src/app',
  testMatch: '**/tests/e2e/**/*.e2e.ts',
  // Allow independent scenarios to run in parallel because the mock backend isolates state per page.
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    // Base URL used by page.goto('/path') calls inside the specs.
    baseURL: 'http://127.0.0.1:4200',
    // Keep useful artifacts only when a scenario fails so debugging stays practical without polluting the repo.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      // Run the suite in Chromium because it is the most common local browser target during development.
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    // Start the Angular dev server automatically before the tests begin.
    command: 'npm start -- --host 127.0.0.1 --port 4200',
    // Wait until the login page is reachable before launching the browser scenarios.
    url: 'http://127.0.0.1:4200/login',
    // Reuse an already running server to keep local reruns fast.
    reuseExistingServer: true,
    timeout: 120000,
  },
});
