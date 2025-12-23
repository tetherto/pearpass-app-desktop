'use strict'

const { expect } = require('../fixtures/app.runner')

class CreateLoginPage {
  constructor(root) {
    this.root = root
  }

  // ==== GETTERS - LOCATORS ====
  
  get titleInput() {
    return this.root.locator('input[data-testid="createoredit-input-title"]')
  }

  get emailOrUsernameInput() {
    return this.root.locator('input[data-testid="createoredit-input-username"]')
  }

  get passwordInput() {
    return this.root.locator('input[data-testid="createoredit-input-password"]')
  }

  get passwordMenu() {
    return this.root.getByTestId('createoredit-button-generatepassword')
  }

  get insertPasswordButton() {
    return this.root.getByTestId('passwordGenerator-button-insertpassword').first()
  }

  getPasswordTypeRadioButtonState(state) {
    return this.root.getByTestId(`radioselect-password-${state}`)
  }

  getPassphraseTypeRadioButtonState(state) {
    return this.root.getByTestId(`radioselect-passphrase-${state}`)
  }

  get passphraseTypeRadioButtonInActive() {
    return this.root.getByTestId('radioselect-passphrase-inactive')
  }

  get charSlider() {
    return this.root.getByTestId('passwordgenerator-characterslider-container')
  }

  getSpecialCharacterSwithcerState(state) {
    return this.root.getByTestId(`switchwithlabel-switch-${state}`)
  }

  get elementItemCloseButton() {
    return this.root.getByTestId('button-round-icon').last()
  }

  get websiteInput() {
    return this.root.locator('input[data-testid="createoredit-input-website"]')
  }

  get noteInput() {
    return this.root.locator('input[data-testid="createoredit-input-note"]')
  }

  get createCustomButtonClosed() {
    return this.root.locator('[data-testid="createcustomfield-label-closed"]')
  }

  get createCustomButtonOpen() {
    return this.root.locator('[data-testid="createcustomfield-label-open"]')
  }

  get createCustomOptionNote() {
    return this.root.locator('[data-testid="createcustomfield-option-note"]')
  }

  get createCustomNote() {
    return this.root.locator('[data-testid="createcustomfield-option-note"]')
  }

  get customNoteInput() {
    return this.root.locator('[data-testid="customfields-input-note"]')
  }

  get deleteCustomNoteItem() {
    return this.root.locator('[data-testid="customfields-button-remove"]')
  }

  get saveButton() {
    return this.root.locator('[data-testid="createoredit-button-save"]')
  }

  get elementItemPasswordShowHide() {
    return this.root.getByTestId('passwordfield-button-togglevisibility').last()
  }

  get loadFile() {
    return this.root.getByTestId('createoredit-button-loadfile')
  }

  get fileInput() {
    return this.root.locator('input[type="file"]').first()
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


  // ==== ACTIONS ====

  async waitForReady(timeout = 30000) {
    await expect(this.titleInput).toBeVisible({ timeout })
  }

  async isVisible() {
    return await this.titleInput.isVisible().catch(() => false)
  }

  async createLoginElementInsertData(title, username, password, url, note) {
    await this.titleInput.fill(title)
    await this.emailOrUsernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.websiteInput.fill(url)
    await this.noteInput.fill(note)
  }

  async enterTitle(title) {
    await expect(this.titleInput).toBeVisible()
    await this.titleInput.fill(title)
  }

  async enterEmailOrUsername(value) {
    await expect(this.emailOrUsernameInput).toBeVisible()
    await this.emailOrUsernameInput.fill(value)
  }

  async enterPassword(password) {
    await expect(this.passwordInput).toBeVisible()
    await this.passwordInput.fill(password)
  }

  async verifyPasswordToHaveValue(password) {
    await expect(this.passwordInput).toBeVisible()
    await expect(this.passwordInput).toHaveValue(password)
  }

  async verifyPasswordToNotHaveValue(password) {
    await expect(this.passwordInput).toBeVisible()
    await expect(this.passwordInput).not.toHaveValue(password)
  }

  async enterWebsite(url) {
    await expect(this.websiteInput).toBeVisible()
    await this.websiteInput.fill(url)
  }

  async enterNote(note) {
    await expect(this.noteInput).toBeVisible()
    await this.noteInput.fill(note)
  }

  async clickCreateCustomItem() {
    await expect(this.createCustomButtonClosed).toBeVisible()
    await this.createCustomButtonClosed.click()
  }

  async clickCustomItemOptionNote() {
    await expect(this.createCustomOptionNote).toBeVisible()
    await this.createCustomOptionNote.click()
  }

  async deleteCustomNote() {
    await expect(this.deleteCustomNoteItem).toBeVisible()
    await this.deleteCustomNoteItem.click()
  }

  async clickSave() {
    await this.saveButton.click()
  }

  async openPasswordMenu() {
    await expect(this.passwordMenu).toBeVisible()
    await this.passwordMenu.click()
  }

  async clickInsertPasswordButton() {
    await expect(this.insertPasswordButton).toBeVisible()
    await this.insertPasswordButton.click()
  }

  async clickShowHidePasswordButton() {
    await expect(this.elementItemPasswordShowHide).toBeVisible();
    await this.elementItemPasswordShowHide.click();
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

  async clickDeleteFileButton() {
    await expect(this.deleteFileButton).toBeVisible()
    await this.deleteFileButton.click()
  }

  // ==== VERIFICATIONS - PASSWORD MENU ====

  async verifyInsertPasswordButtonIsVisible() {
    await expect(this.insertPasswordButton).toBeVisible()
  }

  async verifyPasswordTypeRadioButtonState(state) {
    await expect(this.getPasswordTypeRadioButtonState(state)).toBeVisible()
  }

  async verifyPassphraseTypeRadioButtonState(state) {
    await expect(this.getPassphraseTypeRadioButtonState(state)).toBeVisible()
  }

  async verifyCharSliderIsVisible() {
    await expect(this.charSlider).toBeVisible()
  }

  async verifyspecialCharacterSwitcherState(state) {
    await expect(this.getSpecialCharacterSwithcerState(state)).toBeVisible()
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

}

module.exports = { CreateLoginPage }
