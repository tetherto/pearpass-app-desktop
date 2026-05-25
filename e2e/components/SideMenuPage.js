import { test, expect } from '../fixtures/app.runner.js'

class SideMenuPage {
  constructor(root) {
    this.root = root
  }

  // --- Exit / lock ---

  get sidebarExitButton() {
    return this.root.getByTestId('sidebar-lock-app')
  }

  async clickSidebarExitButton() {
    await expect(this.sidebarExitButton).toBeVisible()
    await this.sidebarExitButton.click()
  }

  // --- Settings ---

  get sidebarSettingsButton() {
    return this.root.getByTestId('sidebar-settings-button')
  }

  async clickSidebarSettingsButton() {
    await expect(this.sidebarSettingsButton).toBeVisible()
    await this.sidebarSettingsButton.click()
  }

  // --- Categories ---

  getSidebarCategory(categoryname) {
    return this.root.getByTestId(`sidebar-category-${categoryname}`)
  }

  async selectSideBarCategory(name) {
    const category = this.getSidebarCategory(name)
    await expect(category).toBeVisible()
    await expect(category).toBeEnabled()
    await category.click()
  }

  // --- Favorites folder ---

  get favoritesFolder() {
    return this.root.getByTestId('sidebar-folder-favorites').locator('span').last()
  }

  async verifySideBarFavoritesFolder(items) {
    await expect(this.favoritesFolder).toBeVisible()
    await expect(this.favoritesFolder).toHaveAttribute('aria-label', items)
  }

  // --- Folders ---

  getSideMenuFolder(folderName) {
    return this.root.getByRole('button', { name: folderName })
      .and(this.root.locator('[data-testid^="sidebar-"]'))
  }

  get sidebarAddButton() {
    return this.root.getByTestId('sidebar-folder-add')
  }

  get confirmButton() {
    return this.root.getByTestId('button-primary')
  }

  get deleteFolderButton() {
    return this.root.getByTestId('deletefolder-submit')
  }

  async clickSidebarAddButton() {
    await expect(this.sidebarAddButton).toBeVisible()
    await this.sidebarAddButton.click()
  }

  async createFolder(name) {
    await this.clickSidebarAddButton()
    const nameInput = this.root.getByTestId('createfolder-name').locator('input')
    await expect(nameInput).toBeVisible()
    await nameInput.fill(name)
    const saveBtn = this.root.getByTestId('createfolder-save')
    await expect(saveBtn).toBeVisible()
    await saveBtn.click()
    await expect(saveBtn).toBeHidden()
  }

  async openSideBarFolder(foldername) {
    await expect(this.getSideMenuFolder(foldername)).toBeVisible()
    await this.getSideMenuFolder(foldername).click()
  }

  async deleteMultipleItemsFolder(foldername) {
    const folder = this.getSideMenuFolder(foldername)
    await expect(folder).toBeVisible()
    await folder.click({ button: 'right' })
    const deleteButton = this.root.getByText('Delete Folder', { exact: true })
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()
  }

  async deleteFolder(foldername) {
    const folder = this.getSideMenuFolder(foldername)
    await expect(folder).toBeVisible()
    await folder.click({ button: 'right' })
    const deleteButton = this.root.getByText('Delete Folder', { exact: true })
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()
    await expect(deleteButton).toBeHidden()
  }

  async clickDeleteFolderButton() {
    await expect(this.deleteFolderButton).toBeVisible()
    await this.deleteFolderButton.click()
  }

  async verifySidebarFolderName(foldername) {
    const folder = this.getSideMenuFolder(foldername)
    await expect(folder).toBeVisible()
  }
}

module.exports = { SideMenuPage }
