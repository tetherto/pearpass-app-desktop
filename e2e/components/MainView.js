'use strict'

const { expect } = require('../fixtures/app.runner')

/**
 * Main View - Password list and categories
 * Recommended test-ids to add in the app:
 * - data-testid="main-search-input"
 * - data-testid="category-all"
 * - data-testid="category-login"
 * - data-testid="category-identity"
 * - data-testid="category-credit-card"
 * - data-testid="sidebar-settings"
 * - data-testid="sidebar-add-device"
 * - data-testid="sidebar-exit-vault"
 * - data-testid="sort-recent"
 * - data-testid="multi-select"
 */
class MainView {
  constructor(root) {
    this.root = root

    // Search
    this.searchInput = root.locator('input[placeholder="Search..."]')

    // Sidebar categories
    this.allCategory = root.locator('button:has-text("All")')
    this.loginCategory = root.locator('button:has-text("Login")')
    this.identityCategory = root.locator('button:has-text("Identity")')
    this.creditCardCategory = root.locator('button:has-text("Credit Card")')

    // Sidebar actions
    this.settingsButton = root.locator('text=Settings').first()
    this.addDeviceButton = root.locator('text=Add a Device').first()
    this.exitVaultButton = root.locator('text=Exit Vault').first()

    // Sort/filter
    this.recentButton = root.locator('text=Recent').first()
    this.multiSelectButton = root.locator('text=Multiple selection').first()

    // Preferred selectors (uncomment when test-ids are added)
    // this.searchInput = root.locator('[data-testid="main-search-input"]')
    // this.allCategory = root.locator('[data-testid="category-all"]')
    // this.exitVaultButton = root.locator('[data-testid="sidebar-exit-vault"]')
  }

  async waitForReady(timeout = 30000) {
    await expect(this.searchInput).toBeVisible({ timeout })
  }

  async isVisible() {
    return await this.searchInput.isVisible().catch(() => false)
  }

  async search(query) {
    await this.searchInput.fill(query)
  }

  async selectCategory(name) {
    const category = this.root.locator(`button:has-text("${name}")`).first()
    await category.click()
  }

  async exitVault() {
    await this.exitVaultButton.click()
  }

  async openSettings() {
    await this.settingsButton.click()
  }
}

module.exports = { MainView }
