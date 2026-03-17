import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 5 * 60 * 1000,
  testDir: './specs',

  workers: 1,
  forbidOnly: !!process.env.CI,
  maxFailures: process.env.CI ? 5 : undefined,
  fullyParallel: false,

  retries: 1,

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
            token: '93d463e7ca693a401ff7bff5a12125fdba52d70540585ff1a562ac0ecacb1235',
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