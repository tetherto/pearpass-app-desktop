'use strict'

const { expect } = require('../fixtures/app.runner')

class MainView {
  constructor(root) {
    this.root = root
  }

  // ==== GETTERS - LOCATORS ====

  get loginCategory() {
    return this.root.getByTestId('sidebar-category-login')
  }

  get createLoginButton() {
    return this.root.getByText('Create a login')
  }

  get item() {
    return this.root.getByText('Test Title').first()
  }

  get editButton() {
    return this.root.getByText('Edit').last()
  }

  get itemBarThreeDots() {
    return this.root.getByTestId('button-round-icon').first()
  }

  get deleteItemButton() {
    return this.root.getByText('Delete element').last()
  }

  get collectionEmptyText() {
    return this.root.getByText('This collection is empty.')
  }

  get collectionEmptySubText() { 
    return this.root.getByText('Create a new element or pass to another collection')
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

  async openItem() {
    await expect(this.item).toBeVisible()
    await this.item.click()
  }

  async editItem() {
    await expect(this.editButton).toBeVisible()
    await this.editButton.click()
  }

  async openThreeDotsMenu() {
    await expect(this.itemBarThreeDots).toBeVisible()
    await this.itemBarThreeDots.click()
  }

  async clickDeleteItem() {
    await expect(this.deleteItemButton).toBeVisible()
    await this.deleteItemButton.click()
  }

  async clickConfirmYes() {
    const yesButton = this.root.getByText('Yes')
    await expect(yesButton).toBeVisible()
    await yesButton.click()
  }

  async verifyLoginItemUsername() {
    const input = this.root.getByPlaceholder('Email or username')
    await expect(input).toBeVisible()
    await expect(input).toHaveValue('Test User')
  }
  
  async verifyEmptyCollection() {
    await expect(this.collectionEmptyText).toBeVisible()
    await expect(this.collectionEmptySubText).toBeVisible()
  }
}

module.exports = { MainView }
