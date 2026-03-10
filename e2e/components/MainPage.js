import { test, expect } from '../fixtures/app.runner.js'

class MainPage {
  constructor(root) {
    this.root = root
  }

  // ==== LOCATORS ====

  get listItemThreeDotsMenuMarkAsFavorite() {
    return this.root.getByTestId('recordaction-item-favorite').first()
  }

  async selectListItemThreeDotsMenuMarkAsFavorite() {
    await expect(this.listItemThreeDotsMenuMarkAsFavorite).toBeVisible()
    await this.listItemThreeDotsMenuMarkAsFavorite.click()
  }

  get emptyCollectionView() {
    return this.root.getByTestId('empty-collection-view')
  }

  get element() {
    return this.root
      .getByTestId('recordList-record-container')
      .first()
      .locator('span')
  }

  get firstElement() {
    return this.root.getByTestId('recordList-record-container').first()
  }

  get lastElement() {
    return this.root.getByTestId('recordList-record-container').first()
  }

  get elementFolder() {
    return this.root
      .getByTestId('recordList-record-container')
      .locator('p')
      .first()
  }

  getElementFavoriteIcon(initials) {
    return this.root.getByTestId(`avatar-favorite-${initials}`).last()
  }

  get mainPlusButon() {
    return this.root.getByTestId('main-plus-button')
  }

  get sortButon() {
    return this.root.getByTestId('sort-dropdown-button')
  }

  getSortOption(option) {
    return this.root.getByTestId(`sort-option-${option}`)
  }

  getElementByPosition(position) {
    return this.root
      .getByTestId('recordList-record-container')
      .nth(`${position}`)
      .locator('span')
  }

  getElementByPosition1(position) {
    return this.root
      .getByTestId('recordList-record-container')
      .nth(`${position}`)
  }

  get multipleSelectionButon() {
    return this.root.getByTestId('multi-select-button')
  }

  get multipleSelectDeleteButon() {
    return this.root.getByTestId('multi-select-delete-button')
  }

  get multipleSelectMoveButon() {
    return this.root.getByTestId('multi-select-move-button')
  }

  get multipleSelectCancelButon() {
    return this.root.getByTestId('multi-select-cancel-button')
  }

  get createNewFolderButton() {
    return this.root.getByTestId('button-single-input')
  }

  get createFolderModalButton() {
    return this.root.getByRole('button', { name: 'Create folder' })
  }

  get confirmModalButton() {
    return this.root.getByRole('button', { name: 'Confirm' })
  }

  get createNewFolderinputFolderName() {
    return this.root.getByTestId('input-field')
  }

  get detailsCloseButton() {
    return this.root.getByTestId('details-close-button')
  }

  async clickDetailsCloseButton() {
    await expect(this.detailsCloseButton).toBeVisible()
    await this.detailsCloseButton.click()
  }

  async clickConfirmModalButton() {
    await expect(this.confirmModalButton).toBeVisible()
    await this.confirmModalButton.click()
  }

  async clickCreateFoldertButton() {
    await expect(this.createFolderModalButton).toBeVisible()
    await this.createFolderModalButton.click()
  }

  async fillCreateNewFolderInput() {
    await expect(this.createNewFolderinputFolderName).toBeVisible()
    await this.createNewFolderinputFolderName.fill('Test Folder')
  }

  async clickCreateNewFoldertButton() {
    await expect(this.createNewFolderButton).toBeVisible()
    await this.createNewFolderButton.click()
  }

  async clickMultipleSelectCancelButon() {
    await expect(this.multipleSelectCancelButon).toBeVisible()
    await this.multipleSelectCancelButon.click()
  }

  async clickMultipleSelectMoveButon() {
    await expect(this.multipleSelectMoveButon).toBeVisible()
    await this.multipleSelectMoveButon.click()
  }

  async verifyMultipleSelectDeleteButtonIsDisabled() {
    await expect(this.multipleSelectDeleteButon).toBeVisible()
    await expect(this.multipleSelectDeleteButon).toBeDisabled()
  }

  async verifyMultipleSelectDeleteButtonIsEnabled() {
    await expect(this.multipleSelectDeleteButon).toBeVisible()
    await expect(this.multipleSelectDeleteButon).toBeEnabled()
  }

  get multipleSelectCheckerByPosition() {
    return this.root
      .getByTestId('recordList-record-container')
      .nth(`${position}`)
      .getByTestId('undefined-selected')
  }

  getElementThreeDotsByPosition(position) {
    return this.root.getByTestId('list-item-threedots').nth(`${position}`)
  }

  async clickOnElementThreeDotsByPosition(position) {
    const threedots = this.getElementThreeDotsByPosition(position)
    await expect(threedots).toBeVisible()
    await threedots.click()
  }

  async verifyMultipleSelectiontButtonIsNotVisible() {
    await expect(this.multipleSelectionButon).not.toBeVisible()
  }

  async verifyElementisChecked(position) {
    const checker = this.multipleSelectCheckerByPosition(position)
    await expect(checker).toBeVisible()
  }

  getCollectionButton(button_name) {
    return this.root.getByTestId(`emptycollection-button-create-${button_name}`)
  }

  // ==== ACTIONS ====

  async clickCollectionButton(button_id) {
    const collection_button = this.getCollectionButton(button_id)
    await expect(collection_button).toBeVisible()
    await collection_button.click()
  }

  async clickMultipleSelectDeletetButton() {
    await expect(this.multipleSelectDeleteButon).toBeVisible()
    await this.multipleSelectDeleteButon.click()
  }

  async clickMultipleSelectiontButton() {
    await expect(this.multipleSelectionButon).toBeVisible()
    await this.multipleSelectionButon.click()
  }

  async verifyMultipleSelectiontButtonIsNotVisible() {
    await expect(this.multipleSelectionButon).not.toBeVisible()
  }

  async verifyMultipleSelectDeletetButtonIsVisible() {
    await expect(this.multipleSelectionButon).not.toBeVisible()
  }

  async clickCreateNewElementButton(name) {
    const button = this.root.getByText(name)
    await expect(button).toBeVisible()
    await button.click()
  }

  async openElementDetails() {
    await expect(this.element).toBeVisible()
    await this.element.click()
  }

  async clickMainPlusButton() {
    await expect(this.mainPlusButon).toBeVisible()
    await this.mainPlusButon.click()
  }

  async clickSortButton() {
    await expect(this.sortButon).toBeVisible()
    await this.sortButon.click()
  }

  async selectSortOption(option) {
    const sortOption = this.getSortOption(option)
    await sortOption.click()
  }

  // ==== VERIFICATIONS ====

  async verifyElementTitle(title) {
    await expect(this.element).toBeVisible()
    await expect(this.element).toHaveText(title)
  }

  async verifyElementFavoriteIcon(initials) {
    await expect(this.getElementFavoriteIcon(initials)).toBeVisible()
  }

  async verifyElementFolderName(elementfoldername) {
    await expect(this.elementFolder).toBeVisible()
    await expect(this.elementFolder).toHaveText(elementfoldername)
  }

  async verifyElementIsNotVisible() {
    await expect(this.element).not.toBeVisible()
  }

  async verifyEmptyCollection() {
    await expect(this.emptyCollectionView).toBeVisible()
  }

  async verifyElementByPosition(position, element_name) {
    await expect(this.getElementByPosition(position)).toHaveText(element_name)
  }

  async clickElementByPosition(position, element_name) {
    const element = this.getElementByPosition1(position)
    await expect(element).toContainText(element_name)
    await element.click()
  }

  async clickYesButton() {
    await this.root.getByText('Yes').click()
  }
}

module.exports = { MainPage }
