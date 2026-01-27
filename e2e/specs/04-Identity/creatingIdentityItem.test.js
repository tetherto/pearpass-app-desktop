'use strict'

const { test, expect } = require('../../fixtures/app.runner')
const { LoginPage, VaultSelectPage, CreateOrEditPage, SideMenuPage, MainPage, Utilities, DetailsPage } = require('../../components')
const testData = require('../../fixtures/test-data')

test.describe('Creating Identity Item', () => {
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
    await page.waitForLoadState('domcontentloaded')
    await loginPage.loginToApplication(testData.credentials.validPassword)
    await vaultSelectPage.selectVaultbyName(testData.vault.name)
  })

  test.afterAll(async ({ }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Login item is created after fulfilling fields', async ({ page }) => {

    /**
     * @qase.id PAS-586
     * @description "Identity" item is created after fulfilling fields
     */
    await test.step('CREATE IDENTITY ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('identity')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Create an identity')

      await createOrEditPage.fillCreateOrEditInput('title', 'Identity Title')

      await createOrEditPage.fillCreateOrEditInput('fullname', 'Identity Fullname')
      await createOrEditPage.fillCreateOrEditInput('email', 'identitytest@mail.co')
      await createOrEditPage.fillCreateOrEditInput('phonenumber', '')

      await createOrEditPage.fillCreateOrEditInput('address', 'Identity Address')
      await createOrEditPage.fillCreateOrEditInput('zip', 'Identity Zip')
      await createOrEditPage.fillCreateOrEditInput('city', 'Identity City')
      await createOrEditPage.fillCreateOrEditInput('region', 'Identity Region')
      await createOrEditPage.fillCreateOrEditInput('country', 'Identity Country')

      await createOrEditPage.clickOnIdentitySection('passport')

      await createOrEditPage.fillCreateOrEditInput('passportfullname', 'Identity Passport Fullname')
      await createOrEditPage.fillCreateOrEditInput('passportnumber', 'Identity Passport Number')
      await createOrEditPage.fillCreateOrEditInput('passportissuingcountry', 'Identity Issuing Country')
      await createOrEditPage.fillCreateOrEditInput('passportdateofissue', 'Identity Date of Issue')
      await createOrEditPage.fillCreateOrEditInput('passportexpirydate', '01/01/2020')
      await createOrEditPage.fillCreateOrEditInput('passportnationality', '01/01/2025')
      await createOrEditPage.fillCreateOrEditInput('passportdob', '01/01/1990')
      await createOrEditPage.fillCreateOrEditInput('passportgender', 'Identity Gender')

      await createOrEditPage.clickOnIdentitySection('idcard')

      await createOrEditPage.fillCreateOrEditInput('idcardnumber', 'Identity ID Card Number')
      await createOrEditPage.fillCreateOrEditInput('idcarddateofissue', '01/01/2025')
      await createOrEditPage.fillCreateOrEditInput('idcardexpirydate', '01/01/2030')
      await createOrEditPage.fillCreateOrEditInput('idcardissuingcountry', 'USA')

      await createOrEditPage.clickOnIdentitySection('drivinglicense')

      await createOrEditPage.fillCreateOrEditInput('note', 'Identity Driving License Note')

      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)

    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-587
     * @description All fields' values after creating "Identity" item correspond to entered fields' values
     */
    await test.step('VERIFY IDENTITY DETAILS', async () => {
      await detailsPage.verifyTitle('Identity Title')
      await detailsPage.verifyIdentityDetailsValue('fullname', 'Identity Fullname')
      await detailsPage.verifyIdentityDetailsValue('email', 'identitytest@mail.co')
      await detailsPage.verifyIdentityDetailsValue('address', 'Identity Address')
      await detailsPage.verifyIdentityDetailsValue('zip', 'Identity Zip')
      await detailsPage.verifyIdentityDetailsValue('city', 'Identity City')
      await detailsPage.verifyIdentityDetailsValue('region', 'Identity Region')
      await detailsPage.verifyIdentityDetailsValue('country', 'Identity Country')
      await detailsPage.verifyIdentityDetailsValue('passportfullname', 'Identity Passport Fullname')
      await detailsPage.verifyIdentityDetailsValue('passportnumber', 'Identity Passport Number')
      await detailsPage.verifyIdentityDetailsValue('passportissuingcountry', 'Identity Issuing Country')
      await detailsPage.verifyIdentityDetailsValue('passportdateofissue', 'Identity Date of Issue')
      await detailsPage.verifyIdentityDetailsValue('passportexpirydate', '01/01/2020')
      await detailsPage.verifyIdentityDetailsValue('passportnationality', '01/01/2025')
      await detailsPage.verifyIdentityDetailsValue('passportdob', '01/01/1990')
      await detailsPage.verifyIdentityDetailsValue('passportgender', 'Identity Gender')
      await detailsPage.verifyIdentityDetailsValue('idcardnumber', 'Identity ID Card Number')
      await detailsPage.verifyIdentityDetailsValue('idcarddateofissue', '01/01/2025')
      await detailsPage.verifyIdentityDetailsValue('idcardexpirydate', '01/01/2030')
      await detailsPage.verifyIdentityDetailsValue('idcardissuingcountry', 'USA')
      await detailsPage.verifyIdentityDetailsValue('note', 'Identity Driving License Note')

    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('After changing "Item" dropdown option user is moved to the selected "Item" edit screen', async ({ page }) => {

    await test.step('VERIFY IDENTITY ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Identity Title')
    })

    await test.step('CLICK ON SIDEMENU "ADD FOLDER +" BUTTON', async () => {
      await sideMenuPage.clickSidebarAddButton()
    })

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
     * @qase.id PAS-590
     * @description After changing "Item" dropdown option user is moved to the selected "Item" edit screen
     */
    await test.step('VERIFY THAT USER IS MOVED TO SELECTED ITEM EDIT SCREEN', async () => {
      await detailsPage.getItemDetailsFolderName('Test Folder')
    })

    await test.step('VERIFY ELEMENT FOLDER NAME', async () => {
      await mainPage.verifyElementFolderName('Test Folder')
    })

    /**
     * @qase.id PAS-591
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

    await test.step('VERIFY IDENTITY ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Identity Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('CLICK FAVORITE (STAR) BUTTON FROM DETAILS PAGE', async () => {
      await detailsPage.clickFavoriteButton()
    })

    await test.step('OPEN SIDEBAR FAVORITE FOLDER', async () => {
      await sideMenuPage.openSideBarFolder('Favorites')
    })

    /**
     * @qase.id PAS-593
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "Favorite" icon
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS VISIBLE - FAVORITE', async () => {
      await expect(detailsPage.getFavoriteAvatar('IT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('IT')).toBeVisible()
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('CLICK FAVORITE (STAR) BUTTON FROM DETAILS PAGE - UNFAVORITE - FAVORITE', async () => {
      await detailsPage.clickFavoriteButton()
    })

    /**
     * @qase.id PAS-594
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "More options"
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS REMOVED - MORE OPTIONS', async () => {
      await expect(detailsPage.getFavoriteAvatar('IT')).not.toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('IT')).not.toBeVisible()
    })

    await test.step('OPEN DETAILS THREE DOTS MENU AND CLICK ON MARK AS FAVORITE - MORE OPTIONS', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickMarkAsFavoriteButton()
    })

    /**
     * @qase.id PAS-592
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "More options"
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS VISIBLE - MORE OPTIONS', async () => {
      await expect(detailsPage.getFavoriteAvatar('IT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('IT')).toBeVisible()
    })

    await test.step('OPEN DETAILS THREE DOTS MENU AND CLICK ON REMOVE FROM FAVORITES - MORE OPTIONS', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickRemoveFromFavoritesButton()
    })

    /**
     * @qase.id PAS-595
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "Favorite" icon
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS REMOVED - FAVORITE', async () => {
      await expect(detailsPage.getFavoriteAvatar('IT')).not.toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('IT')).not.toBeVisible()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Adding Custom Field with Note option', async ({ page }) => {

    await test.step('VERIFY IDENTITY ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Identity Title')
    })

    await test.step('OPEN/EDIT IDENTITY ELEMENT', async () => {
      await mainPage.openElementDetails()
      await detailsPage.editElement()
    })

    /**
     * @qase.id PAS-987
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
     * @qase.id PAS-988
     * @description It is possible to delete additional fields
     */
    await test.step('DELETE NEW CUSTOM NOTE ITEM', async () => {
      await createOrEditPage.deleteCustomNote();
    })

    await test.step('VERIFY THERE IS NO CUSTOM NOTES ITEMS INSIDE LOGIN ELEMENT', async () => {
      await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    })

    /**
     * @qase.id PAS-990
     * @description It is possible to close the screen by clicking on the "Cross" icon
     */
    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Upload file to Login Items', async ({ page }) => {

    await test.step('VERIFY IDENTITY ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Identity Title')
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
   * @qase.id PAS-986
   * @description It is possible to view uploaded files in "Edit" mode
   */
    await test.step('VERIFY UPLOADED FILE IS VISIBLE INSIDE IDENTITY ITEMS', async () => {
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
   * @qase.id PAS-991
   * @description It is possible to view uploaded files in "View" mode
   */
    await test.step('VERIFY UPLOADED FILE IS VISIBLE INSIDE IDENTITY ITEMS', async () => {
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

  test('Deleted Identity Items are not displayed in view/details mode ', async ({ page }) => {

    await test.step('VERIFY IDENTITY ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Identity Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('DELETE LOGIN ITEMS', async () => {
      await createOrEditPage.fillCreateOrEditInput('title', 'Identity Title')

      await createOrEditPage.fillCreateOrEditInput('fullname', '')
      await createOrEditPage.fillCreateOrEditInput('email', '')
      await createOrEditPage.fillCreateOrEditInput('phonenumber', '')

      await createOrEditPage.fillCreateOrEditInput('address', '')
      await createOrEditPage.fillCreateOrEditInput('zip', '')
      await createOrEditPage.fillCreateOrEditInput('city', '')
      await createOrEditPage.fillCreateOrEditInput('region', '')
      await createOrEditPage.fillCreateOrEditInput('country', '')

      await createOrEditPage.clickOnIdentitySection('passport')

      await createOrEditPage.fillCreateOrEditInput('passportfullname', '')
      await createOrEditPage.fillCreateOrEditInput('passportnumber', '')
      await createOrEditPage.fillCreateOrEditInput('passportissuingcountry', '')
      await createOrEditPage.fillCreateOrEditInput('passportdateofissue', '')
      await createOrEditPage.fillCreateOrEditInput('passportexpirydate', '')
      await createOrEditPage.fillCreateOrEditInput('passportnationality', '')
      await createOrEditPage.fillCreateOrEditInput('passportdob', '')
      await createOrEditPage.fillCreateOrEditInput('passportgender', '')

      await createOrEditPage.clickOnIdentitySection('idcard')

      await createOrEditPage.fillCreateOrEditInput('idcardnumber', '')
      await createOrEditPage.fillCreateOrEditInput('idcarddateofissue', '')
      await createOrEditPage.fillCreateOrEditInput('idcardexpirydate', '')
      await createOrEditPage.fillCreateOrEditInput('idcardissuingcountry', '')

      await createOrEditPage.clickOnIdentitySection('drivinglicense')

      await createOrEditPage.fillCreateOrEditInput('note', '')

      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-589
     * @description "Empty "IDENTITY" item fields are not displayed in view mode
     */
    await test.step('VERIFY ELEMENT DETAILS', async () => {
      await detailsPage.verifyTitle('Identity Title')
      await detailsPage.verifyItemDetailsValueIsNotVisible('fullname', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('email', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('address', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('zip', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('city', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('region', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('country', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('passportfullname', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('passportnumber', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('passportissuingcountry', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('passportdateofissue', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('passportexpirydate', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('passportnationality', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('passportdob', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('passportgender', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('idcardnumber', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('idcarddateofissue', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('idcardexpirydate', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('idcardissuingcountry', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('note', '')
    })


  })

})
