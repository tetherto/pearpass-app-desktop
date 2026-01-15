'use strict'

const { expect } = require('../fixtures/app.runner')

class MainPage {
  constructor(root) {
    this.root = root
  }

  // ==== LOCATORS ====

  get collectionEmptyText() {
    return this.root.getByText('This collection is empty.')
  }

  get collectionEmptySubText() {
    return this.root.getByText('Create a new element or pass to another collection')
  }

  get element() {
    return this.root.getByTestId('recordList-record-container').locator('span')
  }

  get elementFolder() {
    return this.root.getByTestId('recordList-record-container').locator('p').first()
  }

  get mainPlusButon() {
    return this.root.getByTestId('main-plus-button')
  }

  getElementFavoriteIcon(initials) {
    return this.root.getByTestId(`avatar-favorite-${initials}`)
  }

  // ==== ACTIONS ====

  async clickCreateNewElementButton(name) {
    const button = this.root.getByText(name)
    await expect(button).toBeVisible()
    await button.click()
  }

  async clickMainPlusButton(name) {
    await expect(mainPlusButon).toBeVisible()
    await mainPlusButon.click()
  }

  async openElementDetails() {
    await expect(this.element).toBeVisible()
    await this.element.click()
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
    await expect(this.collectionEmptyText).toBeVisible()
    await expect(this.collectionEmptySubText).toBeVisible()
  }

}

module.exports = { MainPage }
