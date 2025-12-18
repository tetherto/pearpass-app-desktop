'use strict'
const { chromium } = require('@playwright/test')

async function explore() {
  const browser = await chromium.connectOverCDP('http://localhost:9222')
  const page = browser
    .contexts()[0]
    .pages()
    .find((p) => p.url().includes('index.html'))

  console.log('Connected to:', page.url())
  await page.waitForTimeout(2000)

  console.log('\n=== VISIBLE TEXT ===')
  console.log(await page.locator('body').innerText())

  console.log('\n=== BUTTONS ===')
  const buttons = await page.locator('button').all()
  for (const btn of buttons) {
    if (await btn.isVisible()) {
      console.log('-', await btn.textContent())
    }
  }

  console.log('\n=== INPUTS ===')
  const inputs = await page.locator('input').all()
  for (const input of inputs) {
    if (await input.isVisible()) {
      const type = await input.getAttribute('type')
      const placeholder = await input.getAttribute('placeholder')
      console.log(`- type="${type}" placeholder="${placeholder}"`)
    }
  }
}

explore().catch(console.error)
