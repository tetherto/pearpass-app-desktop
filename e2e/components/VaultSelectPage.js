'use strict'

const { expect } = require('../fixtures/app.runner')

/**
 * Vault Selection Page
 * Recommended test-ids to add in the app:
 * - data-testid="vault-select-title"
 * - data-testid="vault-item-{vaultName}"
 * - data-testid="vault-create-button"
 * - data-testid="vault-load-button"
 */
class VaultSelectPage {
  constructor(root) {
    this.root = root

    this.title = root.locator('text=Select a vault')
    this.createVaultButton = root.locator(
      'button:has-text("Create a new vault")'
    )
    this.loadVaultButton = root.locator('button:has-text("Load a vault")')

    // Preferred selectors (uncomment when test-ids are added)
    // this.title = root.locator('[data-testid="vault-select-title"]')
    // this.createVaultButton = root.locator('[data-testid="vault-create-button"]')
    // this.loadVaultButton = root.locator('[data-testid="vault-load-button"]')
  }

  async waitForReady(timeout = 30000) {
    await expect(this.title).toBeVisible({ timeout })
  }

  async isVisible() {
    return await this.title.isVisible().catch(() => false)
  }

  async selectVault(vaultName) {
    // Preferred: root.locator(`[data-testid="vault-item-${vaultName}"]`)
    const vault = this.root
      .locator(`div:has-text("${vaultName}"):has-text("Created")`)
      .first()
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
