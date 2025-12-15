'use strict'

const { expect } = require('../fixtures/app.runner')

class VaultSelectPage {
  constructor(root) {
    this.root = root
  }

  // ===== GETTERS - LOCATORS =====

  get title() {
    // return this.root.locator('text=Select a vault') // vault-title
    return this.root.getByTestId('vault-title')
    // return this.root.locator('[data-testid="vault-select-title"]')
  }

  // get createVaultButton() {
  //   return this.root.locator('button:has-text("Create a new vault")')
  //   // return this.root.locator('[data-testid="vault-create-button"]')
  // }

  // get loadVaultButton() {
  //   return this.root.locator('button:has-text("Load a vault")')
  //   // return this.root.locator('[data-testid="vault-load-button"]')
  // }

  vaultItem(name) {
    return this.root.locator(`[data-testid="vault-item-${name}"]`)
  }

  // Dynamic getter
  // vaultItem(vaultName) {
  //   return this.root
  //     .locator(`div:has-text("${vaultName}"):has-text("Created")`)
  //     .first()

  //   // Preferred version (when test-ids exist):
  //   // return this.root.locator(`[data-testid="vault-item-${vaultName}"]`)
  // }

  // ==== ACTIONS ====

  async waitForReady(timeout = 30000) {
    await expect(this.title).toBeVisible({ timeout })
  }

  async isVisible() {
    return await this.title.isVisible().catch(() => false)
  }

  async selectVault(vaultName) {
    const vault = this.vaultItem(vaultName)
    await expect(vault).toBeVisible()
    await vault.click()
  }

  async clickCreateVault() {
    await this.createVaultButton.click()
  }

  async clickLoadVault() {
    await this.loadVaultButton.click()
  }
}

module.exports = { VaultSelectPage }
