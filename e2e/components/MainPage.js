import { test, expect } from '../fixtures/app.runner.js'

class MainPage {
  constructor(root) {
    this.root = root
  }

  // --- Element list / records ---

  get element() {
    return this.root.locator('[data-record-id]').first()
  }

  getElementByPosition(position) {
    return this.root
      .locator('[data-record-id]')
      .nth(position)
      .locator('span')
      .last()
  }

  async clickOnFirstElement() {
    await expect(this.element).toBeVisible()
    await this.element.click()
  }

  async openElementDetails() {
    await expect(this.element).toBeVisible()
    await this.element.click()
  }

  async verifyElementTitle(title) {
    const row = this.root.locator('[data-record-id]').filter({ hasText: title })
    await expect(row).toBeVisible()
  }

  async verifyElementIsNotVisible() {
    await expect(this.element).not.toBeVisible()
  }

  async verifyElementByPosition(position, element_name) {
    await expect(this.getElementByPosition(position)).toHaveText(element_name)
  }

  async clickElementByPosition(position, element_name) {
    const element = this.getElementByPosition(position)
    await expect(element).toContainText(element_name)
    await element.click()
  }

  async elementCheckBox(expectedState) {
    const checkbox = this.element
      .locator('button[aria-checked]')

    await expect(checkbox)
      .toHaveAttribute('aria-checked', String(expectedState))
  }

  // --- Favorites ---

  get mainViewFavoriteIcon() {
    return this.root.getByTestId('multi-select-favorite')
  }

  async clickOnMainViewFavoriteIcon() {
    await expect(this.mainViewFavoriteIcon).toBeVisible()
    await this.mainViewFavoriteIcon.click()
  }

  async favoriteIconDisabled() {
    const favorite1 = this.mainViewFavoriteIcon
    await expect(favorite1).toHaveAttribute('aria-label', 'Add to Favorites')
  }

  async favoriteIconEnabled() {
    const favorite2 = this.mainViewFavoriteIcon
    await expect(favorite2).toHaveAttribute('aria-label', 'Remove from Favorites')
  }

  // --- Multi-select ---

  get mainViewHeaderSelect() {
    return this.root.getByTestId('main-view-header-select')
  }

  get multipleSelectionButon() {
    return this.root.getByTestId('main-view-header-select')
  }

  get multipleSelectDeleteButon() {
    return this.root.getByTestId('multi-select-delete')
  }

  get multipleSelectMoveButon() {
    return this.root.getByTestId('multi-select-move')
  }

  get multipleSelectCancelButon() {
    return this.root.getByTestId('multi-select-cancel-button')
  }

  get multipleSelectCheckerByPosition() {
    return this.root
      .getByTestId('recordList-record-container')
      .nth(`${position}`)
      .getByTestId('undefined-selected')
  }

  async clickMainViewHeaderSelect() {
    await expect(this.mainViewHeaderSelect).toBeVisible()
    await this.mainViewHeaderSelect.click()
  }

  async clickMultipleSelectiontButton() {
    await expect(this.multipleSelectionButon).toBeVisible()
    await this.multipleSelectionButon.click()
  }

  async clickMultipleSelectDeletetButton() {
    await expect(this.multipleSelectDeleteButon).toBeVisible()
    await this.multipleSelectDeleteButon.click()
  }

  async clickMultipleSelectMoveButon() {
    await expect(this.multipleSelectMoveButon).toBeVisible()
    await this.multipleSelectMoveButon.click()
  }

  async verifyMultipleSelectDeleteButtonIsEnabled() {
    await expect(this.multipleSelectDeleteButon).toBeVisible()
    await expect(this.multipleSelectDeleteButon).toBeEnabled()
  }

  // --- Add item / plus button ---

  get mainPlusButon() {
    return this.root.getByTestId('main-plus-button')
  }

  async clickAddItem(type) {
    await expect(this.mainPlusButon).toBeVisible()
    await this.mainPlusButon.click()

    const menuItem = this.root.getByTestId(`add-item-${type}`)
    await expect(menuItem).toBeVisible()
    await menuItem.click()
  }

  // --- Sort ---

  get sortButon() {
    return this.root.getByTestId('main-view-header-sort-menu')
  }

  getSortOption(option) {
    return this.root.getByTestId(`main-view-header-sort-${option}`)
  }

  async clickSortButton() {
    await expect(this.sortButon).toBeVisible()
    await this.sortButon.click()
  }

  async selectSortOption(option) {
    const sortOption = this.getSortOption(option)
    await sortOption.click()
  }

  // --- Folder management ---

  get createNewFolderinputFolderName() {
    return this.root.getByTestId('input-field')
  }

  get createFolderModalButton() {
    return this.root.getByRole('button', { name: 'Create folder' })
  }

  getCollectionButton(button_name) {
    return this.root.getByTestId(`emptycollection-button-create-${button_name}`)
  }

  async verifyElementFolderName(elementfoldername) {
    const folderBtn = this.root.getByTestId(`sidebar-folder-${elementfoldername}`)
    await expect(folderBtn).toBeVisible()
    await folderBtn.click()
    await expect(this.root.locator('[data-record-id]').first()).toBeVisible()
  }

  // --- Move folder ---

  async clickMoveFolderChip(folderName) {
    const chip = this.root.getByTestId(`movefolder-chip-${folderName}`)
    await expect(chip).toBeVisible()
    await chip.click()
  }

  async clickMoveFolderSubmit() {
    const submitBtn = this.root.getByTestId('movefolder-submit')
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()
  }

  // --- Empty collection ---

  get emptyCollectionView() {
    return this.root.getByTestId('empty-collection')
  }

  async verifyEmptyCollection() {
    await expect(this.emptyCollectionView).toBeVisible()
  }

  // --- Details close ---

  get detailsCloseButton() {
    return this.root.getByTestId('details-button-collapse')
  }

  async clickDetailsCloseButton() {
    const collapseBtn = this.root.getByTestId('details-button-collapse')
    const modalCloseBtn = this.root
      .getByTestId('modalheader-button-close')
      .last()
    const closeBtn = collapseBtn.or(modalCloseBtn)
    await closeBtn.click({ timeout: 5000 }).catch(() => { })
  }

  // --- Confirm / delete ---

  async clickYesButton() {
    await this.root.getByTestId('delete-records-submit').click()
  }

}

module.exports = { MainPage }
