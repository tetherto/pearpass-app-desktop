import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  timeout: 5 * 60 * 1000,
  testDir: './specs',

  workers: 1,
  forbidOnly: !!process.env.CI,
  maxFailures: process.env.CI ? 5 : undefined,
  fullyParallel: false,

  retries: 0,

  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 30000,
    navigationTimeout: 60000
  },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-artifacts/report', open: 'never' }],
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        debug: false,
        testops: {
          api: {
            token: process.env.API_TOKEN,
          },
          project: 'PAS',
          uploadAttachments: true,
          run: {
            title: 'Automated Playwright Run',
            description: 'Nightly regression tests',
            complete: true,
          },
          batch: {
            size: 100,
          },
        },
        framework: {
          browser: {
            addAsParameter: true,
            parameterName: 'Browser',
          },
          markAsFlaky: true,
        },
      },
    ],
  ],

  outputDir: 'test-artifacts/results'
});