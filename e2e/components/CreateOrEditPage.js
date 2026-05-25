import { test, expect } from '../fixtures/app.runner.js'

class CreateOrEditPage {
  constructor(root) {
    this.root = root
  }

  // --- Input fields ---

  getCreateOrEditInputField(field) {
    const overrides = {
      website: 'createoredit-input-website-0',
      attachment: 'createoredit-attachment-upload',
    }
    const dashIndex = field.indexOf('-')
    const testId = overrides[field] ??
      (dashIndex !== -1
        ? `createoredit-${field.slice(0, dashIndex)}-input-${field.slice(dashIndex + 1)}`
        : `createoredit-input-${field}`)
    return this.root.getByTestId(testId).locator('input').first()
  }

  getCreateOrEditTextareaField(field) {
    return this.root.getByTestId(`createoredit-textarea-${field}`)
  }

  async fillCreateOrEditInput(field, value) {
    const input = this.getCreateOrEditInputField(field)
    await input.waitFor({ state: 'visible' })
    await input.fill('')
    await input.fill(value)
  }

  async verifyPasswordToNotHaveValue(password) {
    const passwordInput = this.getCreateOrEditInputField('password')
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).not.toHaveValue(password)
  }

  // --- Form buttons ---

  getCreateOrEditButton(name) {
    const dashIndex = name.indexOf('-')
    const testId = dashIndex !== -1
      ? `createoredit-${name.slice(0, dashIndex)}-button-${name.slice(dashIndex + 1)}`
      : `createoredit-button-${name}`
    return this.root.getByTestId(testId)
  }

  async clickOnCreateOrEditButton(button) {
    const input = this.getCreateOrEditButton(button)
    await input.waitFor({ state: 'visible' })
    await input.click()
  }

  get saveButton() {
    return this.root.getByTestId('createoredit-button-save')
  }

  get elementItemCloseButton() {
    return this.root.getByTestId(/-close$/).first()
  }

  async clickElementItemCloseButton() {
    await expect(this.elementItemCloseButton).toBeVisible()
    await this.elementItemCloseButton.click()
  }

  // --- Multi-slot website / comment ---

  get detailsWebsite() {
    return this.root.getByTestId('website-multi-slot-input-slot-0')
  }

  async verifyDetailsWebsiteCount(expectedCount) {
    await expect(this.detailsWebsite).toHaveCount(expectedCount)
  }

  get detailsComment() {
    return this.root.getByTestId('comments-multi-slot-input-slot-0')
  }

  async verifyDetailsCommentCount(expectedCount) {
    await expect(this.detailsComment).toHaveCount(expectedCount)
  }

  // --- Password generation ---

  get passwordMenu() {
    return this.root.getByTestId('createoredit-button-generatepassword')
  }

  async openPasswordMenu() {
    await expect(this.passwordMenu).toBeVisible()
    await this.passwordMenu.click()
  }

  get insertPasswordButton() {
    return this.root
      .getByTestId('generatepassword-button-primary')
      .first()
  }

  async clickInsertPasswordButton() {
    await expect(this.insertPasswordButton).toBeVisible()
    await this.insertPasswordButton.click()
  }

  // --- Password field ---

  get elementItemPassword() {
    return this.root.getByPlaceholder('Password')
  }

  get passwordInput() {
    return this.root.getByTestId('createoredit-input-password')
  }

  get elementItemPasswordShowHideFirst() {
    return this.root
      .getByTestId('password-field-eye-button')
      .first()
  }

  get elementItemPasswordShowHideLast() {
    return this.root.getByTestId('password-field-eye-button').last()
  }

  async clickShowHidePasswordButtonFirst() {
    await expect(this.elementItemPasswordShowHideFirst).toBeVisible()
    await this.elementItemPasswordShowHideFirst.click()
  }

  async clickShowHidePasswordButtonLast() {
    await expect(this.elementItemPasswordShowHideLast).toBeVisible()
    await this.elementItemPasswordShowHideLast.click()
  }

  async verifyPasswordType(password_type) {
    const itemDetail = this.root.getByPlaceholder('Password')
    await expect(itemDetail).toBeVisible()
    await expect(itemDetail).toHaveAttribute('type', password_type)
  }

  // --- Attachment upload ---

  getCreateOrEditUploadAttachment() {
    return this.root.getByTestId(/-attachment-upload$/).first()
  }

  async clickOnAttachment() {
    const input = this.getCreateOrEditUploadAttachment()
    await input.waitFor({ state: 'visible' })
    await input.click()
  }

  get deleteAttachmentButton() {
    return this.root.getByTestId(/-button-deleteattachment-0$/).first()
  }

  async clickOnDeleteAttachmentButton() {
    const deleteButton = this.deleteAttachmentButton
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()
  }

  get loadFile() {
    return this.root.getByTestId('createoredit-button-loadfile')
  }

  get fileInput() {
    return this.root.locator('input[type="file"]').first()
  }

  async uploadFile() {
    await this.fileInput.setInputFiles('test-files/TestPhoto.png')
  }

  get uploadedFileLink() {
    return this.root
      .getByTestId('uploadfiles-field')
      .getByText('TestPhoto.png', { exact: true })
  }

  get uploadedFile() {
    return this.root.getByTestId('uploadfiles-button-additem')
  }

  get uploadedImage() {
    return this.root.getByAltText('TestPhoto.png')
  }

  async clickOnUploadedFile() {
    await expect(this.uploadedFile).toBeVisible()
    await this.uploadedFile.click()
  }

  async verifyUploadedFileIsVisible() {
    await expect(this.uploadedFileLink).toBeVisible()
    await expect(this.uploadedFileLink).toHaveText('TestPhoto.png')
  }

  async verifyUploadedImageIsVisible() {
    await expect(this.uploadedImage).toBeVisible()
  }

  // --- Custom note fields ---

  get createCustomNote() {
    return this.root.getByTestId('createcustomfield-option-note')
  }

  get customNoteInput() {
    return this.root.getByTestId('createoredit-custom-input-customfield-0').locator('input').first()
  }

  get customNoteInput_first() {
    return this.root.getByTestId(/^createoredit-custom-input-customfield-/)
  }

  async fillCustomNoteInput() {
    const input = this.customNoteInput
    await input.waitFor({ state: 'visible' })
    await input.fill('')
    await input.fill('Custom Note')
  }

  async fillCustomNoteInput_first() {
    const input = this.customNoteInput_first
    await input.waitFor({ state: 'visible' })
    await input.fill('')
    await input.fill('Custom Note')
  }

  async deleteCustomNote() {
    const input = this.customNoteInput
    await input.waitFor({ state: 'visible' })
    await input.fill('')
  }

  // --- Folder dropdown ---

  get dropdownFolderMenu() {
    return this.root.getByTestId('createoredit-select-folder')
  }

  async openDropdownMenu() {
    await this.dropdownFolderMenu.waitFor({ state: 'attached' })
    await this.dropdownFolderMenu.click()
  }

  async selectFromDropdownMenu(foldername) {
    const folder = this.root.getByTestId(`createoredit-folder-option-${foldername}`)
    await expect(folder).toBeVisible()
    await folder.click()
  }

  // --- Identity sections ---

  getSection(sectionname) {
    return this.root.getByTestId(`createoredit-section-${sectionname}`)
  }

  get identitySection() {
    return this.root.getByTestId(`createoredit-section-personalinfo`)
  }

  async clickOnIdentitySection(sectionname) {
    const section = this.getSection(sectionname)
    await section.waitFor({ state: 'visible' })
    await section.click()
  }

  // --- PassPhrase ---

  get passPhrasePasteButton() {
    return this.root.getByRole('button', { name: 'Paste recovery phrase' }).first()
  }

  async clickOnPasteFromClipboard() {
    const pasteButton = this.passPhrasePasteButton
    await expect(pasteButton).toBeVisible()
    await pasteButton.click()
  }

  // --- Item details (shared verifications) ---

  async verifyItemDetailsValue(labelOrPlaceholder, expectedValue) {
    const itemDetail = this.getElementItemDetails(labelOrPlaceholder)
    await expect(itemDetail).toHaveValue(expectedValue)
  }

  async verifyItemDetailsValueIsNotVisible(labelOrPlaceholder) {
    const itemDetail = this.getElementItemDetails(labelOrPlaceholder)
    await expect(itemDetail).not.toBeVisible()
  }

}

module.exports = { CreateOrEditPage }
