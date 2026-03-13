import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  workers: 1, // jedna instanca Electron aplikacije; više workera uzrokuje ECONNREFUSED
  reporter: [
    ['list'],
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
});