/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  timeout: 5 * 60 * 3000,
  use: {
    screenshot: 'only-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 60000
  },
  reporter: [
    ['html', { outputFolder: 'test-artifacts/report' }],
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        debug: true,
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN
          },
          project: 'PAS',
          uploadAttachments: true,
          run: {
            complete: true
          }
        }
      }
    ]
  ],
  outputDir: 'test-artifacts/results',
  workers: 1,
  fullyParallel: false
}
