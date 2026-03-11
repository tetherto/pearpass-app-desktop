import { test, expect } from '../fixtures/app.runner.js'

class VaultSelectPage {
  constructor(root) {
    this.root = root
  }

  // ===== LOCATORS =====

  get title() {
    return this.root.getByTestId('vault-title')
  }

  getVaultItem(name) {
    return this.root.getByTestId(`vault-item-${name}`)
  }

  // ==== ACTIONS ====

  async waitForReady(timeout = 30000) {
    await expect(this.title).toBeVisible({ timeout })
  }

  async isVisible() {
    return await this.title.isVisible().catch(() => false)
  }

  async selectVault(vaultName) {
    const vault = this.getVaultItem(vaultName)
    await expect(vault).toBeVisible()
    await vault.click()
  }

  async clickCreateVault() {
    await this.createVaultButton.click()
  }

  async clickLoadVault() {
    await this.loadVaultButton.click()
  }

  async selectVaultbyName(vaultName) {
    const vault = this.getVaultItem(vaultName)
    await expect(vault).toBeVisible()
    await vault.click()
  }
}

module.exports = { VaultSelectPage }
