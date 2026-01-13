'use strict'

const { expect } = require('../fixtures/app.runner')

class DetailsPage {
    constructor(root) {
        this.root = root
    }

    // ==== LOCATORS ====

    getElementItemDetails(labelOrPlaceholder) {
        return this.root.locator('input', {
            has: this.root.locator('[data-testid="details-header"]', { hasText: labelOrPlaceholder })
        }).or(this.root.locator(`input[placeholder="${labelOrPlaceholder}"]`));
    }

    get elementItemFileLink() {
        return this.root.getByRole('link', { name: 'TestPhoto.png' })
    }

    get uploadedImage() {
        return this.root.getByAltText('TestPhoto.png')
    }

    get detailsBarEditButton() {
        return this.root.getByText('Edit').last()
    }

    get detailsBarFavoriteButton() {
        return this.root.getByTestId('details-button-favorite')
    }

    get detailsBarThreeDots() {
        return this.root.getByTestId('button-round-icon').first()
    }

    get markAsFavoriteButton() {
        return this.root.getByText('Mark as favorite').last()
    }

    get removeFromFavoritesButton() {
        return this.root.getByText('Remove from Favorites').last()
    }

    get moveToAnotherFolderButton() {
        return this.root.getByText('Move to another folder').last()
    }

    get deleteElementButton() {
        return this.root.getByText('Delete element').last()
    }

    get elementItemCloseButton() {
        return this.root.getByTestId('button-round-icon').last()
    }

    get createNewFolderButton() {
        return this.root.locator('[data-testid="button-single-input"]')
    }

    getCreateNewFolderTitleInput() {
        return this.root.locator(
            'input[data-testid="input-field"][placeholder="Insert folder name"]'
        );
    }

    get createFolderButton() {
        return this.root.getByText('Create folder')
    }

    getItemDetailsFolderName(foldername) {
        return this.root.getByTestId(`details-folder-${foldername}`)
    }

    async verifyItemDetailsFolder() {
        const itemDetailsFolder = this.getItemDetailsFolderName()
        await expect(itemDetailsFolder).toBeVisible();
    }

    get recordListContainer() {
        return this.root.getByTestId('recordList-record-container')
    }

    getFavoriteAvatar(initials) {
        return this.recordListContainer.getByTestId(`avatar-favorite-${initials}`)
    }

    // ==== ACTIONS ====

    async clickRemoveFromFavoritesButton() {
        await expect(this.removeFromFavoritesButton).toBeVisible()
        await this.removeFromFavoritesButton.click()
    }

    async clickMarkAsFavoriteButton() {
        await expect(this.markAsFavoriteButton).toBeVisible()
        await this.markAsFavoriteButton.click()
    }

    async clickFavoriteButton() {
        await expect(this.detailsBarFavoriteButton).toBeVisible()
        await this.detailsBarFavoriteButton.click()
    }

    async clickCreateNewFolder() {
        await expect(this.createNewFolderButton).toBeVisible()
        await this.createNewFolderButton.click()
    }

    async clickCreateFolderButton() {
        await expect(this.createFolderButton).toBeVisible()
        await this.createFolderButton.click()
    }

    async editElement() {
        await expect(this.detailsBarEditButton).toBeVisible()
        await this.detailsBarEditButton.click()
    }

    async openItemBarThreeDotsDropdownMenu() {
        await expect(this.detailsBarThreeDots).toBeVisible()
        await this.detailsBarThreeDots.click()
    }

    async clickMoveToAnotherFolder() {
        await expect(this.moveToAnotherFolderButton).toBeVisible()
        await this.moveToAnotherFolderButton.click()
    }

    async fillCreateNewFolderTitleInput(value) {
        await this.getCreateNewFolderTitleInput().fill(value);
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

    async deleteElementFromDetails() {
        while (!(await this.collectionEmptyText.isVisible())) {
            await this.element.first().click();
            await this.itemBarThreeDots.click();
            await this.deleteElementButton.click();
            await this.root.getByText('Yes').click();

            await expect(this.collectionEmptyText).toBeVisible({ timeout: 5000 }).catch(() => { });
        }
    }

    async clickShowHidePasswordButton() {
        await expect(this.elementItemPasswordShowHide).toBeVisible();
        await this.elementItemPasswordShowHide.click();
    }

    async clickOnUploadedFile() {
        await expect(this.elementItemFileLink).toBeVisible();
        await this.elementItemFileLink.click();
    }

    async clickElementItemCloseButton() {
        await expect(this.elementItemCloseButton).toBeVisible();
        await this.elementItemCloseButton.click();
    }

    // ==== VERIFICATIONS ====

    async verifyItemDetailsValue(labelOrPlaceholder, expectedValue) {
        const itemDetail = this.getElementItemDetails(labelOrPlaceholder);
        await expect(itemDetail).toHaveValue(expectedValue);
    }

    async verifyItemDetailsValueIsNotVisible(labelOrPlaceholder) {
        const itemDetail = this.getElementItemDetails(labelOrPlaceholder);
        await expect(itemDetail).not.toBeVisible();
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

    async verifyUploadedFileIsVisible() {
        await expect(this.elementItemFileLink).toBeVisible();
    }

    async verifyUploadedImageIsVisible() {
        await expect(this.uploadedImage).toBeVisible()
    }

}

module.exports = { DetailsPage }
