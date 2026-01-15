'use strict'

const { expect } = require('../fixtures/app.runner')

class SideMenuPage {
  constructor(root) {
    this.root = root
  }

  // ==== LOCATORS ====

  get sidebarExitButton() {
    return this.root.getByTestId('sidebar-exit-button')
  }

  getSidebarFolder(foldername) {
    return this.root.getByTestId(`sidebar-folder-${foldername}`)
  }

  getSidebarCategory(categoryname) {
    return this.root.getByTestId(`sidebar-category-${categoryname}`)
  }

  get sidebarAddButton() {
    return this.root.getByTestId('sidebarfolder-button-add')
  }

  get confirmButton() {
    return this.root.getByTestId('button-primary');
  }

  get favoritesFolder() {
    return this.page.getByTestId('sidebar-folder-favorites')
  }

  // ==== ACTIONS ====

  async selectSideBarCategory(name) {
    const category = this.getSidebarCategory(name);
    await expect(category).toBeVisible()
    await category.click()
  }

  async deleteFolder(foldername) {
    const folder = this.getSidebarFolder(foldername);
    await folder
      .getByText(foldername, { exact: true })
      .locator('..')
      .locator('div')
      .first()
      .click();
    await folder.getByText('Delete', { exact: true }).click();
    await this.confirmButton.click();
  }

  async clickSidebarAddButton() {
    await expect(this.sidebarAddButton).toBeVisible()
    await this.sidebarAddButton.click()
  }

  async clickSidebarExitButton() {
    await expect(this.sidebarExitButton).toBeVisible()
    await this.sidebarExitButton.click()
  }

  async openSideBarFolder(foldername) {
    await expect(this.getSidebarFolder(foldername)).toBeVisible()
    await this.getSidebarFolder(foldername).click()
  }

  getFavoriteFileName() {
    return this.root.locator('input[data-testid="sidebar-folder-favorites"][placeholder="Insert folder name"]');
  }

  // ==== VERIFICATIONS ====

  async verifySidebarFolderName(foldername) {
    const folder = this.getSidebarFolder(foldername);
    await expect(folder).toBeVisible()
  }

  async verifyFavoriteFolderIsNotVisible(foldername) {
    const folder = this.getSidebarFolder(foldername);
    await expect(folder).not.toBeVisible();
  }

  async verifyFavoriteFileIsVisible(foldername, filename) {
    const folder = this.getSidebarFolder(foldername);
    await expect(folder).toBeVisible();
    await expect(folder).toContainText(filename);
  }

}

module.exports = { SideMenuPage }
