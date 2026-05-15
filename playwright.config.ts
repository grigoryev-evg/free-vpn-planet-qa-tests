import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const defaultTimeout = Number(process.env.DEFAULT_TIMEOUT_MS ?? 30_000);
const expectTimeout = Number(process.env.EXPECT_TIMEOUT_MS ?? 10_000);
const isCi = process.env.CI === 'true';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: 1,
  timeout: 90_000,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'artifacts/junit/results.xml' }]
  ],
  outputDir: 'test-results',
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: defaultTimeout,
    navigationTimeout: defaultTimeout,
    ignoreHTTPSErrors: true
  },
  expect: {
    timeout: expectTimeout
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.HEADLESS !== 'false',
        locale: 'en-US',
        timezoneId: 'Europe/Warsaw'
      }
    }
  ]
});
