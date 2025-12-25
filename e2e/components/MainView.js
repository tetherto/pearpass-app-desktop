'use strict'

const { expect } = require('../fixtures/app.runner')

class MainView {
  constructor(root) {
    this.root = root
  }

  // ==== LOCATORS ====

  get loginCategory() {
    return this.root.getByTestId('sidebar-category-login')
  }

  get createLoginButton() {
    return this.root.getByText('Create a login')
  }
  get element() {
    return this.root
      .getByTestId('recordList-record-container')
      .locator('span')
      .first()
  }

  get mainPlusButon() {
    return this.root.getByTestId('main-plus-button')
  }

  // main-plus-button

  // ELEMENT ITEMS - VIEW MODE

  get elementItemUsername() {
    return this.root.getByPlaceholder('Email or username')
  }

  get elementItemPassword() {
    return this.root.getByPlaceholder('Password')
  }

  get elementItemPasswordShowHide() {
    return this.root.getByTestId('passwordfield-button-togglevisibility')
  }

  get elementItemWebAddress() {
    return this.root.getByPlaceholder('https://')
  }

  get elementItemNote() {
    return this.root.getByPlaceholder('Add note')
  }

  get elementItemFileLink() {
    return this.root.getByRole('link', { name: 'TestPhoto.png' })
  }

  get uploadedImage() {
    return this.root.getByAltText('TestPhoto.png')
  }

  // ITEM BAR ELEMENTS
  // Missing ID's: Login Title, Favorite Button, Edit Button, ThreeDots Menu, Close Item Bar

  get itemBarEditButton() {
    return this.root.getByText('Edit').last()
  }

  get itemBarThreeDots() {
    return this.root.getByTestId('button-round-icon').first()
  }

  get markAsFavoriteButton() {
    return this.root.getByText('Mark as favorite').last()
  }

  get moveToAnotherFolderButton() {
    return this.root.getByText('Move to another folder').last()
  }

  get deleteElementButton() {
    return this.root.getByText('Delete element').last()
  }

  get collectionEmptyText() {
    return this.root.getByText('This collection is empty.')
  }

  get collectionEmptySubText() {
    return this.root.getByText(
      'Create a new element or pass to another collection'
    )
  }

  get sidebarExitButton() {
    return this.root.getByTestId('sidebar-exit-button')
  }

  // ==== ACTIONS ====

  async selectSideBarCategory(name) {
    const category = this.root.getByTestId(`sidebar-category-${name}`)
    await expect(category).toBeVisible()
    await category.click()
  }

  async clickCreateNewElementButton(name) {
    const button = this.root.getByText(name)
    await expect(button).toBeVisible()
    await button.click()
  }

  async clickMainPlusButton(name) {
    await expect(mainPlusButon).toBeVisible()
    await mainPlusButon.click()
  }

  async openElement() {
    await expect(this.element).toBeVisible()
    await this.element.click()
  }

  async editElement() {
    await expect(this.itemBarEditButton).toBeVisible()
    await this.itemBarEditButton.click()
  }

  async openItemBarThreeDotsDropdownMenu() {
    await expect(this.itemBarThreeDots).toBeVisible()
    await this.itemBarThreeDots.click()
  }

  async clickDeleteElement() {
    await expect(this.deleteElementButton).toBeVisible()
    await this.deleteElementButton.click()
  }

  async clickConfirmYes() {
    const yesButton = this.root.getByText('Yes')
    await expect(yesButton).toBeVisible()
    await yesButton.click()
  }

  async deleteElementFromViewMode() {
    await expect(this.itemBarThreeDots).toBeVisible()
    await this.itemBarThreeDots.click()
    await expect(this.deleteElementButton).toBeVisible()
    await this.deleteElementButton.click()
    const yesButton = this.root.getByText('Yes')
    await expect(yesButton).toBeVisible()
    await yesButton.click()
    await expect(this.collectionEmptyText).toBeVisible()
    await expect(this.collectionEmptySubText).toBeVisible()
  }

  async clickShowHidePasswordButton() {
    await expect(this.elementItemPasswordShowHide).toBeVisible()
    await this.elementItemPasswordShowHide.click()
  }

  async clickSidebarExitButton(name) {
    await expect(this.sidebarExitButton).toBeVisible()
    await this.sidebarExitButton.click()
  }

  async clickOnUploadedFile() {
    await expect(this.elementItemFileLink).toBeVisible()
    await this.elementItemFileLink.click()
  }

  // ==== VERIFICATIONS ====

  async verifyElement(title) {
    await expect(this.element).toBeVisible()
    await expect(this.element).toHaveText(title)
  }

  async verifyElementIsNotVisible() {
    await expect(this.element).not.toBeVisible()
  }

  async verifyLoginElementItemUsername(username) {
    await expect(this.elementItemUsername).toBeVisible()
    await expect(this.elementItemUsername).toHaveValue(username)
  }

  async verifyLoginElementItemUsernameNotVisible() {
    await expect(this.elementItemUsername).not.toBeVisible()
  }

  async verifyLoginElementItemPassword(password) {
    await expect(this.elementItemPassword).toBeVisible()
    await expect(this.elementItemPassword).toHaveValue(password)
  }

  async verifyLoginElementItemPasswordNotVisible() {
    await expect(this.elementItemPassword).not.toBeVisible()
  }

  async verifyLoginElementItemWebAddress(webaddress) {
    await expect(this.elementItemWebAddress).toBeVisible()
    await expect(this.elementItemWebAddress).toHaveValue(webaddress)
  }

  async verifyLoginElementItemWebAddressIsVisible() {
    await expect(this.elementItemWebAddress).toBeVisible()
  }

  async verifyLoginElementItemNote(note) {
    await expect(this.elementItemNote).toBeVisible()
    await expect(this.elementItemNote).toHaveValue(note)
  }

  async verifyLoginElementItemNoteIsNotVisible() {
    await expect(this.elementItemNote).not.toBeVisible()
  }

  async verifyEmptyCollection() {
    await expect(this.collectionEmptyText).toBeVisible()
    await expect(this.collectionEmptySubText).toBeVisible()
  }

  async verifyUploadedFileIsVisible() {
    await expect(this.elementItemFileLink).toBeVisible()
  }

  async verifyUploadedImageIsVisible() {
    await expect(this.uploadedImage).toBeVisible()
  }
}

module.exports = { MainView }
