import { test, expect } from '../fixtures/app.runner.js'

class LoginPage {
  constructor(root) {
    this.root = root
  }

  // --- Title / ready state ---

  get title() {
    return this.root.locator('h1', { hasText: 'Enter Your Master Password' })
  }

  async waitForReady(timeout = 30000) {
    await expect(this.title).toBeVisible({ timeout })
  }

  // --- Password ---

  get passwordInput() {
    return this.root.getByTestId('login-password-input').locator('input')
  }

  async enterPassword(password) {
    await expect(this.passwordInput).toBeVisible()
    await this.passwordInput.fill(password)
  }

  // --- Continue button ---

  get continueButton() {
    return this.root.getByTestId('login-continue-button')
  }

  async clickContinue() {
    await this.continueButton.click()
  }

  async loginToApplication(password) {
    await this.waitForReady()
    await this.enterPassword(password)
    await this.clickContinue()
  }
}

module.exports = { LoginPage }
