'use strict'

const { test, expect } = require('../../fixtures/app.runner')
const { LoginPage, VaultSelectPage, CreateOrEditPage, SideMenuPage, MainPage, Utilities, DetailsPage } = require('../../components')
const testData = require('../../fixtures/test-data')

test.describe('Creating Credit Card Item', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page

  test.beforeAll(async ({ app }) => {
    page = app.page
    loginPage = new LoginPage(page.locator('body'))
    vaultSelectPage = new VaultSelectPage(page.locator('body'))
    mainPage = new MainPage(page.locator('body'))
    sideMenuPage = new SideMenuPage(page.locator('body'))
    createOrEditPage = new CreateOrEditPage(page.locator('body'))
    utilities = new Utilities(page.locator('body'))
    detailsPage = new DetailsPage(page.locator('body'))
  })

  test.beforeEach(async ({ app }) => {
    await loginPage.loginToApplication(testData.credentials.validPassword)
    await vaultSelectPage.selectVaultbyName(testData.vault.name)
  })

  test.afterAll(async ({ app }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Credit Card item is created after fulfilling fields', async ({ page }) => {

    /**
     * @qase.id PAS-599
     * @description "Credit Card" item is created after fulfilling fields
     */
    await test.step('CREATE CREDIT CARD ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('creditCard')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Create a credit card')

      await createOrEditPage.fillCreateOrEditInput('title', 'Credit Card Title')
      await createOrEditPage.fillCreateOrEditInput('fullname', 'John')
      await createOrEditPage.fillCreateOrEditInput('number', '1231 2312')
      await createOrEditPage.fillCreateOrEditInput('expiredate', '12 12')
      await createOrEditPage.fillCreateOrEditInput('securitycode', '111')
      await createOrEditPage.fillCreateOrEditInput('pincode', '5555')
      await createOrEditPage.fillCreateOrEditInput('note', 'Credit Card Note')
      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('VERIFY CREDIT CARD ELEMENT IS CREATED', async () => {
      await mainPage.verifyElementTitle('Credit Card Title')
    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-600
     * @description "All fields' values after creating "Credit Card" item correspond to entered fields' values
     */
    await test.step('VERIFY CREATED CREDIT CARD DETAILS', async () => {
      await detailsPage.verifyItemDetailsValue('Full name', 'John');
      await detailsPage.verifyItemDetailsValue('1234 1234 1234 1234 ', '1231 2312')
      await detailsPage.verifyItemDetailsValue('MM YY', '12 12')
      await detailsPage.verifyItemDetailsValue('123', '111')
      await detailsPage.verifyItemDetailsValue('1234', '5555')
      await detailsPage.verifyItemDetailsValue('Add note', 'Credit Card Note')
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Password visibility icon of "Security code" and "Pin code" fields displays/hides value', async ({ page }) => {

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-603
     * @description "Password visibility" icon of "Security code" and "Pin code" fields displays/hides value
     */
    await test.step('VERIFY SECURITY CODE SHOW/HIDE', async () => {
      expect(createOrEditPage.verifyItemType('123', 'password'))
      await createOrEditPage.clickShowHidePasswordButtonFirst()
      await page.waitForTimeout(testData.timeouts.action)
      expect(createOrEditPage.verifyItemType('123', 'text'))
    })

    await test.step('VERIFY PIN CODE SHOW/HIDE', async () => {
      expect(createOrEditPage.verifyItemType('1234', 'password'))
      await createOrEditPage.clickShowHidePasswordButtonLast()
      await page.waitForTimeout(testData.timeouts.action)
      expect(createOrEditPage.verifyItemType('1234', 'text'))
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  // ADD FOLDER INSIDE SIDEMENU
  test('After changing "Item" dropdown option user is moved to the selected "Item" edit screen', async ({ page }) => {

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Credit Card Title')
    })

    await test.step('CLICK ON SIDEMENU "ADD FOLDER +" BUTTON', async () => {
      await sideMenuPage.clickSidebarAddButton()
    })

    // ADD - VERIFY MODAL IS OPEN

    await test.step('FILL FOLDER TITLE INPUT', async () => {
      await detailsPage.fillCreateNewFolderTitleInput('Test Folder')
    })

    await test.step('CLICK CREATE FOLDER BUTTON', async () => {
      await detailsPage.clickCreateFolderButton()
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT', async () => {
      await detailsPage.editElement()
    })

    await test.step('OPEN FOLDER DROPDOWN MENU, SELECT FOLDER AND SAVE', async () => {
      await createOrEditPage.openDropdownMenu()
      await createOrEditPage.selectFromDropdownMenu('Test Folder')
      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    /**
     * @qase.id PAS-604
     * @description After changing "Item" dropdown option user is moved to the selected "Item" edit screen
     */
    await test.step('VERIFY THAT USER IS MOVED TO SELECTED ITEM EDIT SCREEN', async () => {
      await detailsPage.getItemDetailsFolderName('Test Folder')
    })

    await test.step('VERIFY ELEMENT FOLDER NAME', async () => {
      await mainPage.verifyElementFolderName('Test Folder')
    })

    /**
     * @qase.id PAS-605
     * @description Item is moved to the folder selected in "Folder" dropdown
     */
    await test.step('VERIFY ELEMENT IS MOVED TO THE FOLDER SELECTED FROM DROPDOWN', async () => {
      await sideMenuPage.verifySidebarFolderName('Test Folder')
    })

    await test.step('EDIT ELEMENT', async () => {
      await detailsPage.editElement()
    })

    await test.step('OPEN FOLDER DROPDOWN MENU, SELECT NO FOLDER AND SAVE', async () => {
      await createOrEditPage.openDropdownMenu()
      await createOrEditPage.selectFromDropdownMenu('No Folder')
      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('DELETE ELEMENT FOLDER', async () => {
      await sideMenuPage.deleteFolder('Test Folder')
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Moving Element to Favorites folder', async ({ page }) => {

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Credit Card Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('CLICK FAVORITE (STAR) BUTTON FROM DETAILS PAGE', async () => {
      await detailsPage.clickFavoriteButton()
    })

    await test.step('OPEN SIDEBAR FAVORITE FOLDER', async () => {
      await sideMenuPage.openSideBarFolder('favorites')
    })

    /**
     * @qase.id PAS-607
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "Favorite" icon
     */
    await test.step('VERIFY SIDEBAR FAVORITE ELEMENT IS VISIBLE', async () => {
      await sideMenuPage.verifyFavoriteFileIsVisible('favorites', 'Credit Card Title')
      await expect(detailsPage.getFavoriteAvatar('CC')).toBeVisible()
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('CLICK FAVORITE (STAR) BUTTON FROM DETAILS PAGE - UNFAVORITE', async () => {
      await detailsPage.clickFavoriteButton()
    })

    /**
     * @qase.id PAS-608
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "More options"
     */
    await test.step('VERIFY SIDEBAR FAVORITE FOLDER IS NOT VISIBLE', async () => {
      await sideMenuPage.verifyFavoriteFolderIsNotVisible()
      await expect(detailsPage.getFavoriteAvatar('LT')).not.toBeVisible()
    })

    await test.step('OPEN DETAILS MENU AND CLICK ON MARK AS FAVORITE', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickMarkAsFavoriteButton()
    })

    /**
     * @qase.id PAS-606
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "More options"
     */
    await test.step('VERIFY SIDEBAR FAVORITE FILE IS VISIBLE', async () => {
      await sideMenuPage.verifyFavoriteFileIsVisible('favorites', 'Credit Card Title')
      await expect(detailsPage.getFavoriteAvatar('CC')).toBeVisible()
    })

    await test.step('OPEN DETAILS MENU AND CLICK ON REMOVE FROM FAVORITES', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickRemoveFromFavoritesButton()
    })

    /**
     * @qase.id PAS-609
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "Favorite" icon
     */
    await test.step('VERIFY SIDEBAR FAVORITE FOLDER IS NOT VISIBLE', async () => {
      await sideMenuPage.verifyFavoriteFolderIsNotVisible()
      await expect(detailsPage.getFavoriteAvatar('CC')).not.toBeVisible()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Adding Custom Field with Note option to Credit Card Items', async ({ page }) => {

    await test.step('OPEN/EDITLOGIN ELEMENT', async () => {
      await mainPage.openElementDetails()
      await detailsPage.editElement()
    })

    /**
     * @qase.id PAS-993
     * @description It is possible to add fields
     */
    await test.step('OPEN CREATE CUSTOM MENU', async () => {
      await createOrEditPage.clickCreateCustomItem()
    })

    await test.step('CLICK ON NOTE OPTION FROM CREATE CUSTOM MENU', async () => {
      await createOrEditPage.clickCustomItemOptionNote();
    })

    await test.step('VERIFY THERE IS ONE NEW CUSTOM NOTES ITEMS INSIDE LOGIN ELEMENT', async () => {
      await expect(createOrEditPage.customNoteInput).toHaveCount(1);
    })

    /**
     * @qase.id PAS-994
     * @description It is possible to delete additional fields
     */
    await test.step('DELETE NEW CUSTOM NOTE ITEM', async () => {
      await createOrEditPage.deleteCustomNote();
    })

    await test.step('VERIFY THERE IS NO CUSTOM NOTES ITEMS INSIDE LOGIN ELEMENT', async () => {
      await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    })

    /**
     * @qase.id PAS-996
     * @description It is possible to close the screen by clicking on the "Cross" icon
     */
    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Upload file to Credit Card Items', async ({ page }) => {

    await test.step('VERIFY LOGIN ELEMENT IS VISIBLE', async () => {
      await mainPage.verifyElementTitle('Credit Card Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('CLICK LOAD FILE BUTTON', async () => {
      await createOrEditPage.clickOnCreateOrEditButton('loadfile')
    })

    await test.step('UPLOAD FILE', async () => {
      await createOrEditPage.uploadFile()
    })

    /**
   * @qase.id PAS-992
   * @description It is possible to view uploaded files in "Edit" mode
   */
    await test.step('VERIFY UPLOADED FILE IS VISIBLE INSIDE LOGIN ITEMS', async () => {
      await createOrEditPage.verifyUploadedFileIsVisible()
    })

    await test.step('OPEN UPLOADED FILE', async () => {
      await createOrEditPage.clickOnUploadedFile()
    })

    await test.step('VERIFY UPLOADED IMAGE', async () => {
      await createOrEditPage.verifyUploadedImageIsVisible()
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

    await test.step('CLICK SAVE BUTTON', async () => {
      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    /**
   * @qase.id PAS-997
   * @description It is possible to view uploaded files in "View" mode
   */
    await test.step('VERIFY UPLOADED FILE IS VISIBLE INSIDE LOGIN ITEMS', async () => {
      await detailsPage.verifyUploadedFileIsVisible()
    })

    await test.step('CLICK SAVE BUTTON', async () => {
      await detailsPage.clickOnUploadedFile()
    })

    await test.step('VERIFY UPLOADED IMAGE IS VISIBLE', async () => {
      await detailsPage.verifyUploadedImageIsVisible()
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await detailsPage.clickElementItemCloseButton()
    })

    await test.step('CLICK EDIT BUTTON', async () => {
      await detailsPage.editElement()
    })

    await test.step('CLICK DELETE FILE/ATTACHMENT BUTTON', async () => {
      await createOrEditPage.clickOnCreateOrEditButton('deleteattachment')
    })

    await test.step('VERIFY UPLOADED FILE NOT VISIBLE', async () => {
      await createOrEditPage.verifyUploadedImageIsNotVisible()
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Deleted Credit Card Items are not displayed in view/details mode ', async ({ page }) => {

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('DELETE CREDIT CARD ITEMS', async () => {
      await createOrEditPage.fillCreateOrEditInput('fullname', '')
      await createOrEditPage.fillCreateOrEditInput('number', '')
      await createOrEditPage.fillCreateOrEditInput('expiredate', '')
      await createOrEditPage.fillCreateOrEditInput('securitycode', '')
      await createOrEditPage.fillCreateOrEditInput('pincode', '')
      await createOrEditPage.fillCreateOrEditInput('note', '')
      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-602
     * @description "Empty "Credit Card" item fields are not displayed in view mode
     */
    await test.step('VERIFY ELEMENT DETAILS', async () => {
      await detailsPage.verifyItemDetailsValueIsNotVisible('Full name')
      await detailsPage.verifyItemDetailsValueIsNotVisible('1234 1234 1234 1234')
      await detailsPage.verifyItemDetailsValueIsNotVisible('MM YY')
      await detailsPage.verifyItemDetailsValueIsNotVisible('123')
      await detailsPage.verifyItemDetailsValueIsNotVisible('1234')
      await detailsPage.verifyItemDetailsValueIsNotVisible('Add note')
    })

  })


})