'use strict'

const { expect } = require('../fixtures/app.runner')

class CreateOrEditPage {
  constructor(root) {
    this.root = root
  }

  // ==== LOCATORS ====

  get insertPasswordButton() {
    return this.root.getByTestId('passwordGenerator-button-insertpassword').first()
  }

  getCreateOrEditInputField(field) {
    return this.root.getByTestId(`createoredit-input-${field}`)
  }

  get passwordMenu() {
    return this.root.getByTestId('createoredit-button-generatepassword')
  }

  get createOrEditCustomInputField() {
    return this.root.getByTestId(`createoredit-createcustomfield`)
  }

  get createCustomNote() {
    return this.root.getByTestId('createcustomfield-option-note')
  }

  get customNoteInput() {
    return this.root.getByTestId('customfields-input-note')
  }

  get deleteCustomNoteItem() {
    return this.root.getByTestId('customfields-button-remove')
  }

  get dropdownFolderMenu() {
    return this.root.getByTestId('createoredit-dropdown-folder')
  }

  getDropdownItem(item) {
    return this.root.getByTestId(`menudropdown-item-${item}`)
  }

  getCreateOrEditButton(name) {
    return this.root.getByTestId(`createoredit-button-${name}`)
  }

  get elementItemPassword() {
    return this.root.getByPlaceholder('Password')
  }

  get elementItemPasswordShowHideFirst() {
    return this.root.getByTestId('passwordfield-button-togglevisibility').first()
  }

  get elementItemPasswordShowHideLast() {
    return this.root.getByTestId('passwordfield-button-togglevisibility').last()
  }

  get uploadedFileLink() {
    return this.root.getByRole('link', { name: 'TestPhoto.png' })
  }

  get uploadedImage() {
    return this.root.getByAltText('TestPhoto.png')
  }

  get deleteFileButton() {
    return this.root.getByTestId('createoredit-button-deleteattachment')
  }

  get loadFile() {
    return this.root.getByTestId('createoredit-button-loadfile')
  }

  get saveButton() {
    return this.root.getByTestId('createoredit-button-save')
  }

  get fileInput() {
    return this.root.locator('input[type="file"]').first()
  }

  get elementItemCloseButton() {
    return this.root.getByTestId('button-round-icon').last()
  }

  get passwordInput() {
    return this.root.getByTestId('createoredit-input-password')
  }

  // ==== ACTIONS ==== 

  async clickOnCreateOrEditButton(button) {
    const input = this.getCreateOrEditButton(button)
    await input.waitFor({ state: 'visible' })
    await input.click()
  }

  async clickInsertPasswordButton() {
    await expect(this.insertPasswordButton).toBeVisible()
    await this.insertPasswordButton.click()
  }

  async clickInsertPasswordButton() {
    await expect(this.insertPasswordButton).toBeVisible()
    await this.insertPasswordButton.click()
  }

  async openPasswordMenu() {
    await expect(this.passwordMenu).toBeVisible()
    await this.passwordMenu.click()
  }

  async clickElementItemCloseButton() {
    await expect(this.elementItemCloseButton).toBeVisible();
    await this.elementItemCloseButton.click();
  }

  async clickLoadFileButton() {
    await expect(this.loadFile).toBeVisible();
    await this.loadFile.click();
  }

  async uploadFile() {
    await this.fileInput.setInputFiles('test-files/TestPhoto.png');
  }

  async clickOnUploadedFile() {
    await expect(this.uploadedFileLink).toBeVisible();
    await this.uploadedFileLink.click();
  }

  async clickCreateCustomItem() {
    await expect(this.createOrEditCustomInputField).toBeVisible()
    await this.createOrEditCustomInputField.click()
  }

  async clickCustomItemOptionNote() {
    await expect(this.createCustomNote).toBeVisible()
    await this.createCustomNote.click()
  }

  async deleteCustomNote() {
    await expect(this.deleteCustomNoteItem).toBeVisible()
    await this.deleteCustomNoteItem.click()
  }

  async clickShowHidePasswordButtonFirst() {
    await expect(this.elementItemPasswordShowHideFirst).toBeVisible();
    await this.elementItemPasswordShowHideFirst.click();
  }

  async clickShowHidePasswordButtonLast() {
    await expect(this.elementItemPasswordShowHideLast).toBeVisible();
    await this.elementItemPasswordShowHideLast.click();
  }

  async fillCreateOrEditInput(field, value) {
    const input = this.getCreateOrEditInputField(field)
    await input.waitFor({ state: 'visible' }) // wait before interaction
    await input.fill(value)
  }

  async countItems(labelOrPlaceholder, expectedCount) {
    const itemDetail = this.getElementItemDetails(labelOrPlaceholder);
    await expect(itemDetail).toHaveCount(expectedCount);
  }

  async openDropdownMenu() {
    await this.dropdownFolderMenu.waitFor({ state: 'attached' });
    await this.dropdownFolderMenu.click();
  }

  async selectFromDropdownMenu(foldername) {
    const folder = this.getDropdownItem(foldername)
    await folder.click()
  }

  // ==== VERIFICATIONS ====

  async verifyPasswordToNotHaveValue(password) {
    const passwordInput = this.getCreateOrEditInputField('password')
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).not.toHaveValue(password)
  }

  async verifyUploadedFileIsVisible() {
    await expect(this.uploadedFileLink).toBeVisible();
    await expect(this.uploadedFileLink).toHaveText('TestPhoto.png');
  }

  async verifyUploadedImageIsVisible() {
    await expect(this.uploadedImage).toBeVisible();
  }

  async verifyUploadedImageIsNotVisible() {
    await expect(this.uploadedImage).not.toBeVisible();
  }

  async verifyItemDetailsValue(labelOrPlaceholder, expectedValue) {
    const itemDetail = this.getElementItemDetails(labelOrPlaceholder);
    await expect(itemDetail).toHaveValue(expectedValue);
  }

  async verifyItemDetailsValueIsNotVisible(labelOrPlaceholder) {
    const itemDetail = this.getElementItemDetails(labelOrPlaceholder);
    await expect(itemDetail).not.toBeVisible();
  }

  async verifyPasswordType(password_type) {
    const itemDetail = this.root.getByPlaceholder('Password')
    await expect(itemDetail).toBeVisible();
    await expect(itemDetail).toHaveAttribute('type', password_type);
  }

  async verifyItemType(placeholder, item_type) {
    const itemDetail = this.root.getByPlaceholder(placeholder).nth('1')
    await expect(itemDetail).toBeVisible();
    await expect(itemDetail).toHaveAttribute('type', item_type);
  }

  async verifyItemVisibility(placeholder, counter) {
    const itemDetail = this.root.getByPlaceholder(placeholder).nth(counter)
    await expect(itemDetail).toBeVisible();
  }

}

module.exports = { CreateOrEditPage }