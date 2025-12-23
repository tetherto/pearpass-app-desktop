'use strict'

const { expect } = require('../fixtures/app.runner')

/**
 * Login Page - Master password entry screen
 * Recommended test-ids to add in the app:
 * - data-testid="login-title"
 * - data-testid="login-password-input"
 * - data-testid="login-continue-button"
 * - data-testid="login-error-message"
 */
class LoginPage {
  constructor(root) {
    this.root = root

    // Using text selectors until test-ids are added
    this.title = root.locator('text=Enter your Master password')
    this.passwordInput = root.locator('input[type="password"]')
    this.continueButton = root.locator('button:has-text("Continue")')
    this.errorMessage = root.locator('text=Invalid password')

    // Preferred selectors (uncomment when test-ids are added)
    // this.title = root.locator('[data-testid="login-title"]')
    // this.passwordInput = root.locator('[data-testid="login-password-input"]')
    // this.continueButton = root.locator('[data-testid="login-continue-button"]')
    // this.errorMessage = root.locator('[data-testid="login-error-message"]')
  }

  async waitForReady(timeout = 30000) {
    await expect(this.title).toBeVisible({ timeout })
  }

  async isVisible() {
    return await this.title.isVisible().catch(() => false)
  }

  async enterPassword(password) {
    await expect(this.passwordInput).toBeVisible()
    await this.passwordInput.fill(password)
  }

  async clickContinue() {
    await this.continueButton.click()
  }

  async login(password) {
    await this.enterPassword(password)
    await this.clickContinue()
  }

  async hasError() {
    return await this.errorMessage.isVisible().catch(() => false)
  }
}

module.exports = { LoginPage }
