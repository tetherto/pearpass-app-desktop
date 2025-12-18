'use strict'

const { spawn } = require('child_process')
const os = require('node:os')
const path = require('node:path')

const { test: base, expect, chromium } = require('@playwright/test')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function connectWithRetries(wsEndpoint, maxRetries = 5) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await sleep(2 ** attempt * 1000)
      return await chromium.connectOverCDP(wsEndpoint)
    } catch (err) {
      if (attempt === maxRetries) throw err
    }
  }
}

async function launchApp(appDir) {
  const port = Math.floor(Math.random() * (65535 - 10000 + 1)) + 10000
  const isWindows = os.platform() === 'win32'

  const proc = spawn(
    'pear',
    ['run', '--dev', '.', `--remote-debugging-port=${port}`, '--no-sandbox'],
    {
      cwd: appDir,
      stdio: 'inherit',
      detached: !isWindows,
      shell: isWindows
    }
  )

  if (!isWindows) proc.unref()

  const browser = await connectWithRetries(`http://localhost:${port}`)
  const page = browser
    .contexts()[0]
    .pages()
    .find((p) => p.url().endsWith('/index.html'))

  if (!page) throw new Error('Could not find /index.html page')

  return { proc, browser, page, isWindows }
}

async function teardown({ proc, browser, isWindows }) {
  await browser.close()
  if (isWindows) {
    spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], {
      stdio: 'inherit'
    })
  } else {
    process.kill(-proc.pid, 'SIGKILL')
  }
}

exports.test = base.extend({
  app: [
    async ({}, use) => {
      const appDir = path.resolve(__dirname, '..', '..')
      const app = await launchApp(appDir)
      await use(app)
      await teardown(app)
    },
    { scope: 'worker' }
  ]
})

exports.expect = expect
