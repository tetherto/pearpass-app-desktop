'use strict'

const { spawn } = require('child_process')
const os = require('node:os')
const path = require('node:path')

const { test: base, expect, chromium } = require('@playwright/test')

const isWindows = os.platform() === 'win32'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function connectWithRetries(wsEndpoint, maxRetries) {
  // Windows needs more retries with shorter delays
  // Mac works better with exponential backoff
  const retries = maxRetries ?? (isWindows ? 15 : 5)
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Sleep AFTER first attempt fails, not before
      if (attempt > 0) {
        const delay = isWindows ? 1000 : 2 ** attempt * 1000
        await sleep(delay)
      }
      
      console.log(`[CDP] Attempting connection to ${wsEndpoint} (attempt ${attempt + 1}/${retries + 1})`)
      return await chromium.connectOverCDP(wsEndpoint)
    } catch (err) {
      console.log(`[CDP] Connection failed: ${err.message}`)
      if (attempt === retries) throw err
    }
  }
}

async function waitForPage(browser, maxRetries = 20) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const contexts = browser.contexts()
    for (const context of contexts) {
      const pages = context.pages()
      // Debug: log all page URLs
      if (attempt % 5 === 0) {
        console.log(`[Attempt ${attempt}] Available pages:`, pages.map((p) => p.url()))
      }
      
      // Platform-specific page matching
      let page
      if (isWindows) {
        // Windows: match localhost URL (app doesn't have index.html in URL)
        page = pages.find((p) => {
          const url = p.url()
          return url.startsWith('http://localhost:') && 
                 !url.includes('devtools') &&
                 !url.startsWith('data:') &&
                 !url.startsWith('about:')
        })
      } else {
        // Mac: match index.html in URL
        page = pages.find((p) => p.url().includes('index.html'))
      }
      
      if (page) {
        console.log('[Found] App page:', page.url())
        return page
      }
    }
    await sleep(1000)
  }
  
  // Last resort: return any page that's not blank
  const contexts = browser.contexts()
  for (const context of contexts) {
    const page = context.pages().find((p) => !p.url().startsWith('about:'))
    if (page) {
      console.log('[Fallback] Using page:', page.url())
      return page
    }
  }
  
  return null
}

async function launchApp(appDir) {
  const port = Math.floor(Math.random() * (65535 - 10000 + 1)) + 10000

  console.log(`[Launch] Starting app on port ${port}, platform: ${os.platform()}`)

  let proc
  if (isWindows) {
    // Windows: spawn cmd.exe directly to avoid shell:true issues
    proc = spawn(
      'cmd.exe',
      ['/c', 'pear', 'run', '-d', '.', `--remote-debugging-port=${port}`, '--no-sandbox'],
      {
        cwd: appDir,
        stdio: 'inherit',
        windowsHide: false
      }
    )
  } else {
    // Mac/Linux: use pear directly with detached process
    proc = spawn(
      'pear',
      ['run', '--dev', '.', `--remote-debugging-port=${port}`, '--no-sandbox'],
      {
        cwd: appDir,
        stdio: 'inherit',
        detached: true
      }
    )
    proc.unref()
  }

  // Give the app time to start before trying to connect
  const initialDelay = isWindows ? 3000 : 1000
  console.log(`[Launch] Waiting ${initialDelay}ms for app to initialize...`)
  await sleep(initialDelay)

  const browser = await connectWithRetries(`http://localhost:${port}`)
  
  // Listen for new pages on all contexts
  for (const context of browser.contexts()) {
    context.on('page', (p) => console.log('[Event] New page created:', p.url()))
  }
  
  const page = await waitForPage(browser)

  if (!page) {
    // Final debug output
    const allPages = browser.contexts().flatMap((c) => c.pages().map((p) => p.url()))
    console.error('[Debug] All available page URLs:', allPages)
    throw new Error('Could not find app page')
  }

  // Wait for page to be fully loaded on all platforms
  console.log('[Launch] Waiting for page to be ready...')
  await page.waitForLoadState('domcontentloaded')
  
  // Windows needs additional settling time
  if (isWindows) {
    await sleep(2000)
  }

  return { proc, browser, page, isWindows }
}

const { spawnSync } = require('child_process');

async function teardown({ proc, browser, isWindows }) {
  try {
    if (proc?.pid) {
      if (isWindows) {
        // ❌ spawn async taskkill često ne ubije sve child procese
        // ✅ koristimo spawnSync da sačekamo
        console.log(`[Teardown] Killing Electron process PID=${proc.pid} ...`);
        spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'inherit' });
      } else {
        console.log(`[Teardown] Killing Electron process PID=${proc.pid} ...`);
        process.kill(-proc.pid, 'SIGKILL');
      }
    }
  } catch (e) {
    console.warn('Electron process already terminated or could not be killed', e.message);
  }

  // Mali delay da OS oslobodi port i prozore
  await new Promise(r => setTimeout(r, 500));

  // Close CDP browser connection
  try {
    if (browser) {
      console.log('[Teardown] Closing CDP browser connection...');
      await browser.close();
    }
  } catch (e) {
    console.warn('Browser already closed', e.message);
  }
}


// async function teardown({ proc, browser, isWindows }) {
//   await browser.close()
//   if (isWindows) {
//     spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], {
//       stdio: 'inherit'
//     })
//   } else {
//     process.kill(-proc.pid, 'SIGKILL')
//   }
// }

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
