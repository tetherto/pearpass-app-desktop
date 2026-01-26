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

  getSideMenuFolder(folderName) {
    return this.root
      .getByTestId('sidebar-folder')
      .getByText(folderName, { exact: true });
  }

  async verifySideMenuFolderName(folderName) {
    await expect(this.getSideMenuFolder(folderName)).toBeVisible();
  }


  // getSideMenuFolder(foldername) {
  //   return this.root.getByTestId(`sidebar-folder-${foldername}`)
  // }

  getSidebarCategory(categoryname) {
    return this.root.getByTestId(`sidebar-category-${categoryname}`)
  }

  get sidebarAddButton() {
    return this.root.getByTestId('sidebarfolder-button-add')
  }

  get confirmButton() {
    return this.root.getByTestId('button-primary');
  }

  // get favoritesFolder() {
  //   return this.page.getByTestId('sidebar-folder-favorites')
  // }

  get favoritesFolder() {
  return this.root.getByTestId('sidebar-folder-favorites')
}

  // ==== ACTIONS ====

  async selectSideBarCategory(name) {
    const category = this.getSidebarCategory(name)
    await expect(category).toBeVisible()
    await category.click()
  }

  async deleteFolder(foldername) {
    const folder = this.getSideMenuFolder(foldername)
    await expect(folder).toBeVisible()

    // Reveal action buttons (Delete)
    // await folder.click()

    await folder
      .getByText(foldername)
      .locator('..')
      .locator('div')
      .first()
      .click()

    const deleteButton = folder
      .locator('..') // parent container
      .getByText('Delete', { exact: true })

    // await expect(deleteButton).toBeVisible()
    await deleteButton.click()

    await expect(this.confirmButton).toBeVisible()
    await this.confirmButton.click()
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
    await expect(this.getSideMenuFolder(foldername)).toBeVisible()
    await this.getSideMenuFolder(foldername).click()
  }

  getFavoriteFileName() {
    return this.root.locator('input[data-testid="sidebar-folder-favorites"][placeholder="Insert folder name"]');
  }

  // ==== VERIFICATIONS ====

  async verifySidebarFolderName(foldername) {
    const folder = this.getSideMenuFolder(foldername);
    await expect(folder).toBeVisible()
  }

  async verifyFavoriteFolderIsNotVisible(foldername) {
    const folder = this.getSideMenuFolder(foldername);
    await expect(folder).not.toBeVisible();
  }

  async verifyFavoriteFileIsVisible(foldername, filename) {
    const folder = this.getSideMenuFolder(foldername);
    await expect(folder).toBeVisible();
    await expect(folder).toContainText(filename);
  }

}

module.exports = { SideMenuPage }
