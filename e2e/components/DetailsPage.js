import { test, expect } from '../fixtures/app.runner.js'

class DetailsPage {
  constructor(root) {
    this.root = root
  }

  // --- General / counter ---

  get itemDetailsCounter() {
    return this.root
    .getByTestId('details-header')
    .locator('input[placeholder]')
  }

  async verifyDetailsNoItems() {
    await expect(this.itemDetailsCounter).toHaveCount(0)
  }

  // --- Title ---

  get getItemDetailsTitle() {
    return this.root.locator('[data-testid^="details-title"], [data-testid="details-header"]')
  }

  async verifyTitle(expectedTitle) {
    await expect(this.getItemDetailsTitle).toContainText(expectedTitle)
  }

  // --- Item details / multi-slot ---

  getElementItemDetails(labelOrPlaceholder) {
    const labelMap = {
      'Email or username': 'credentials-multi-slot-input-slot-0',
      'Password': 'credentials-multi-slot-input-slot-1',
      'https://': 'website-multi-slot-input-slot-0',
      'Name on card': 'card-details-multi-slot-input-slot-0',
      'Number on card': 'card-details-multi-slot-input-slot-1',
      'Date of expire': 'card-details-multi-slot-input-slot-2',
      'Security code': 'card-details-multi-slot-input-slot-3',
      'Pin code': 'card-details-multi-slot-input-slot-4',
      'Comment': 'comments-multi-slot-input-slot-0',
      'Wi-Fi Password': 'credentials-multi-slot-input-slot-0',
      'Add comment': 'comments-multi-slot-input-slot-0',
      'Other Field': 'custom-fields-multi-slot-input-slot-0',
    }
    const mappedTestId = labelMap[labelOrPlaceholder]
    if (mappedTestId) {
      return this.root.getByTestId(mappedTestId).locator('input').first()
    }

    return this.root
      .locator('input', {
        has: this.root.locator('[data-testid="details-header"]', {
          hasText: labelOrPlaceholder
        })
      })
      .or(this.root.locator(`input[placeholder="${labelOrPlaceholder}"]`))
  }

  async verifyItemDetailsValue(labelOrPlaceholder, expectedValue) {
    const itemDetail = this.getElementItemDetails(labelOrPlaceholder)
    await expect(itemDetail).toHaveValue(expectedValue)
  }

  async verifyItemDetailsValueIsNotVisible(labelOrPlaceholder) {
    const itemDetail = this.getElementItemDetails(labelOrPlaceholder)
    await expect(itemDetail).not.toBeVisible()
  }

  // --- Comment / note ---

  get getItemDetailsCommentInput() {
    return this.root.getByTestId('comments-multi-slot-input-slot-0').locator('input')
  }

  async verifyCustomNoteText(expectedText) {
    await expect(this.getItemDetailsCommentInput).toBeVisible()
    await expect(this.getItemDetailsCommentInput).toHaveValue(expectedText)
  }

  getElementItemDetailsNew() {
    return this.root.getByTestId('note-multi-slot-input-slot-0').locator('input').first()
  }

  async verifyNoteText(note_text) {
    const noteTextDetail = this.getElementItemDetailsNew()
    await expect(noteTextDetail).toBeVisible()
    await expect(noteTextDetail).toHaveValue(note_text)
  }

  // --- Identity ---

  getIdentityDetails(name) {
    const slotMap = {
      fullname:               'personal-information-multi-slot-input-slot-0',
      email:                  'personal-information-multi-slot-input-slot-1',
      phone:                  'personal-information-multi-slot-input-slot-2',
      address:                'address-multi-slot-input-slot-0',
      zip:                    'address-multi-slot-input-slot-1',
      city:                   'address-multi-slot-input-slot-2',
      region:                 'address-multi-slot-input-slot-3',
      country:                'address-multi-slot-input-slot-4',
      passportfullname:       'passport-multi-slot-input-slot-0',
      passportnumber:         'passport-multi-slot-input-slot-1',
      passportissuingcountry: 'passport-multi-slot-input-slot-2',
      passportdateofissue:    'passport-multi-slot-input-slot-3',
      passportexpirydate:     'passport-multi-slot-input-slot-4',
      passportnationality:    'passport-multi-slot-input-slot-5',
      passportdob:            'passport-multi-slot-input-slot-6',
      passportgender:         'passport-multi-slot-input-slot-7',
      idcardnumber:           'identity-card-multi-slot-input-slot-0',
      idcarddateofissue:      'identity-card-multi-slot-input-slot-1',
      idcardexpirydate:       'identity-card-multi-slot-input-slot-2',
      idcardissuingcountry:   'identity-card-multi-slot-input-slot-3',
      comment:                'comments-multi-slot-input-slot-0',
      note:                   'comments-multi-slot-input-slot-0',
    }
    const mappedTestId = slotMap[name]
    if (mappedTestId) {
      return this.root.getByTestId(mappedTestId).locator('input').first()
    }
    return this.root.getByTestId(`identitydetails-field-${name}`)
  }

  async verifyIdentityDetails(name) {
    const identityDetail = this.getIdentityDetails(name)
    await expect(identityDetail).toBeVisible()
  }

  async verifyIdentityDetailsValue(name, expectedValue) {
    const identityDetail = this.getIdentityDetails(name)
    await expect(identityDetail).toHaveValue(expectedValue)
  }

  // --- Recovery phrase ---

  get recoveryPhraseDetails() {
    return this.root.getByTestId(/passphrase-word-input-\d+/)
  }

  async verifyAllRecoveryPhraseWords(expectedWords) {
    const slots = this.recoveryPhraseDetails
    const count = await slots.count()
    for (let i = 0; i < count; i++) {
      const input = slots.nth(i).locator('input').first()
      await expect(input).toHaveValue(expectedWords[i])
    }
  }

  // --- Attachment / file ---

  get elementItemFileLink() {
    return this.root
      .getByTestId('attachment-field-0')
      .getByText('TestPhoto.png', { exact: true })
  }

  get uploadedImage() {
    return this.root.getByAltText('TestPhoto.png')
  }

  async clickOnUploadedFile() {
    await expect(this.elementItemFileLink).toBeVisible()
    await this.elementItemFileLink.click()
  }

  async verifyUploadedFileIsVisible() {
    await expect(this.elementItemFileLink).toBeVisible()
  }

  async verifyUploadedImageIsVisible() {
    await expect(this.uploadedImage).toBeVisible()
  }

  // --- Actions bar ---

  get detailsBarActionsButton() {
    return this.root.getByTestId('details-button-actions')
  }

  get detailsBarEditButton() {
    return this.root.getByTestId('details-actions-item-edit')
  }

  get detailsBarFavoriteButton() {
    return this.root.getByTestId('details-actions-item-favorite')
  }

  get detailsBarThreeDots() {
    return this.root.getByTestId('button-round-icon').first()
  }

  async openItemBarThreeDotsDropdownMenu() {
    await expect(this.detailsBarActionsButton).toBeVisible()
    await this.detailsBarActionsButton.click()
  }

  async editElement() {
    await expect(this.detailsBarActionsButton).toBeVisible()
    await this.detailsBarActionsButton.click()
    await expect(this.detailsBarEditButton).toBeVisible()
    await this.detailsBarEditButton.click()
  }

  get markAsFavoriteButton() {
    return this.root.locator('[data-testid="details-actions-item-favorite"]').getByText('Add to Favorites', { exact: true })
  }

  get removeFromFavoritesButton() {
    return this.root.locator('[data-testid="details-actions-item-favorite"]').getByText('Remove from Favorites', { exact: true })
  }

  async clickMarkAsFavoriteButton() {
    await expect(this.detailsBarFavoriteButton).toBeVisible()
    await this.detailsBarFavoriteButton.click()
  }

  async clickRemoveFromFavoritesButton() {
    await expect(this.removeFromFavoritesButton).toBeVisible()
    await this.removeFromFavoritesButton.click()
  }

  async clickFavoriteButton() {
    await expect(this.detailsBarActionsButton).toBeVisible()
    await this.detailsBarActionsButton.click()
    await expect(this.detailsBarFavoriteButton).toBeVisible()
    await this.detailsBarFavoriteButton.click()
  }

  // --- Close button ---

  get elementItemCloseButton() {
    return this.root.getByTestId(/-close$/).first()
  }

  async clickElementItemCloseButton() {
    await expect(this.elementItemCloseButton).toBeVisible()
    await this.elementItemCloseButton.click()
  }

  // --- Folder management ---

  getCreateNewFolderTitleInput() {
    return this.root.locator(
      'input[placeholder="Enter Name"]'
    )
  }

  get createFolderButton() {
    return this.root.getByRole('button', { name: 'Create New Folder' });
  }

  async fillCreateNewFolderTitleInput(value) {
    await this.getCreateNewFolderTitleInput().fill(value)
  }

  async clickCreateFolderButton() {
    const saveBtn = this.root.getByTestId('createfolder-save')
    await expect(saveBtn).toBeVisible()
    await saveBtn.click()
  }

  getItemDetailsFolderName(foldername) {
    return this.root.getByTestId(`sidebar-folder-${foldername}`)
  }

  async verifyItemDetailsFolderName(foldername) {
    const itemDetailsFolder = this.getItemDetailsFolderName(foldername)
    await expect(itemDetailsFolder).toBeVisible()
  }

  // --- Record list / favorites ---

  get recordListContainer() {
    return this.root.getByTestId('recordList-record-container')
  }

  // --- Password visibility ---

  async clickShowHidePasswordButton() {
    await expect(this.elementItemPasswordShowHide).toBeVisible()
    await this.elementItemPasswordShowHide.click()
  }

  async clickPasswordToggle(slotTestId) {
    const toggle = this.root.getByTestId(slotTestId).getByTestId('password-field-eye-button')
    await expect(toggle).toBeVisible()
    await toggle.click()
  }

  async verifyPasswordFieldType(slotTestId, expectedType) {
    const input = this.root.getByTestId(slotTestId).locator('input').first()
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('type', expectedType)
  }

}

module.exports = { DetailsPage }
