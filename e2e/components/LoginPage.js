'use strict'

const { expect } = require('../fixtures/app.runner')

class LoginPage {
  constructor(root) {
    this.root = root
  }

  // ==== LOCATORS ====

  get title() {
    return this.root.getByTestId('login-title')
  }

  get passwordInput() {
    return this.root.getByTestId('login-password-input')
  }

  get continueButton() {
    return this.root.getByTestId('login-continue-button')
  }

  get errorMessage() {
    return this.root.locator('text=Invalid password')
  }

  // ==== ACTIONS ====

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
