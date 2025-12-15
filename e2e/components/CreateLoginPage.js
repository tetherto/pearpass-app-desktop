'use strict'

const { expect } = require('../fixtures/app.runner')

class CreateLoginPage {
  constructor(root) {
    this.root = root
  }

  // ==== GETTERS - LOCATORS ====
  
  get titleInput() {
    return this.root.locator('input[data-testid="createoredit-input-title"]')
  }

  get emailOrUsernameInput() {
    return this.root.locator('input[data-testid="createoredit-input-username"]')
  }

  get passwordInput() {
    return this.root.locator('input[data-testid="createoredit-input-password"]')
  }

  get websiteInput() {
    return this.root.locator('input[data-testid="createoredit-input-website"]')
  }

  get noteInput() {
    return this.root.locator('input[data-testid="createoredit-input-note"]')
  }

  get createCustomButtonClosed() {
    return this.root.locator('[data-testid="createcustomfield-label-closed"]')
  }

  get createCustomButtonOpen() {
    return this.root.locator('[data-testid="createcustomfield-label-open"]')
  }

  get createCustomNote() {
    return this.root.locator('[data-testid="createcustomfield-option-note"]')
  }

  get saveButton() {
    return this.root.locator('[data-testid="createoredit-button-save"]')
  }

  // ==== ACTIONS ====

  async waitForReady(timeout = 30000) {
    await expect(this.titleInput).toBeVisible({ timeout })
  }

  async isVisible() {
    return await this.titleInput.isVisible().catch(() => false)
  }

  async enterTitle(title) {
    await expect(this.titleInput).toBeVisible()
    await this.titleInput.fill(title)
  }

  async enterEmailOrUsername(value) {
    await expect(this.emailOrUsernameInput).toBeVisible()
    await this.emailOrUsernameInput.fill(value)
  }

  async enterPassword(password) {
    await expect(this.passwordInput).toBeVisible()
    await this.passwordInput.fill(password)
  }

  async enterWebsite(url) {
    await expect(this.websiteInput).toBeVisible()
    await this.websiteInput.fill(url)
  }

  async enterNote(note) {
    await expect(this.noteInput).toBeVisible()
    await this.noteInput.fill(note)
  }

  async clickSave() {
    await this.saveButton.click()
  }
}

module.exports = { CreateLoginPage }
