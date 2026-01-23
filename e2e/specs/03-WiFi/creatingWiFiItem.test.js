'use strict'

const { test, expect } = require('../../fixtures/app.runner')
const { LoginPage, VaultSelectPage, CreateOrEditPage, SideMenuPage, MainPage, Utilities, DetailsPage } = require('../../components')
const testData = require('../../fixtures/test-data')

test.describe('Creating WiFi Item', () => {
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

  test.afterAll(async ({ }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('WiFi item is created after fulfilling fields', async ({ page }) => {

    /**
     * @qase.id PAS-613
     * @description "Wi-Fi" item is created after fulfilling fields
     */
    await test.step('CREATE WiFi ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('wifiPassword')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Save a Wi-fi')

      await createOrEditPage.fillCreateOrEditInput('wifiname', 'WiFi Title')
      await createOrEditPage.fillCreateOrEditInput('wifipassword', 'WiFi Pass')
      await createOrEditPage.fillCreateOrEditInput('note', 'WiFi Note')

      await createOrEditPage.clickOnCreateOrEditButton('save')

    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-614
     * @description All fields' values after creating "Wi-Fi" item correspond to entered fields' values
     */
    await test.step('VERIFY WIFI DETAILS', async () => {
      await detailsPage.verifyTitle('WiFi Title');
      await detailsPage.verifyItemDetailsValue('Password', 'WiFi Pass')
      await detailsPage.verifyItemDetailsValue('Add note', 'WiFi Note')
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Password visibility icon of "Password" field displays/hides value', async ({ page }) => {

    await test.step('VERIFY WIFI ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('WiFi Title')
    })

    /**
     * @qase.id PAS-617
     * @description "Password visibility" icon of "Wi-Fi Password" field displays/hides value
     */
    await test.step('OPEN WIFI ELEMENT DETAILS AND VERIFY PASSWORD SHOW/HIDE', async () => {
      await mainPage.openElementDetails()
      expect(createOrEditPage.verifyPasswordType('password'))
      await createOrEditPage.clickShowHidePasswordButtonFirst()
      expect(createOrEditPage.verifyPasswordType('text'))
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('After changing "Item" dropdown option user is moved to the selected "Item" edit screen', async ({ page }) => {

    await test.step('VERIFY WIFI ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('WiFi Title')
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
     * @qase.id PAS-618
     * @description After changing "Item" dropdown option user is moved to the selected "Item" edit screen
     */
    await test.step('VERIFY THAT USER IS MOVED TO SELECTED ITEM EDIT SCREEN', async () => {
      await detailsPage.verifyItemDetailsFolderName('Test Folder')
    })

    await test.step('VERIFY ELEMENT FOLDER NAME', async () => {
      await mainPage.verifyElementFolderName('Test Folder')
    })

    /**
     * @qase.id PAS-619
     * @description Item is moved to the folder selected in "Folder" dropdown
     */
    await test.step('VERIFY ELEMENT IS MOVED TO THE FOLDER SELECTED FROM DROPDOWN', async () => {
      await sideMenuPage.verifySideMenuFolderName('Test Folder')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT', async () => {
      await detailsPage.editElement()
    })

    await test.step('OPEN FOLDER DROPDOWN MENU, SELECT NO FOLDER AND SAVE', async () => {
      await createOrEditPage.openDropdownMenu()
      await createOrEditPage.selectFromDropdownMenu('No Folder')
      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('DELETE SIDEMANU FOLDER', async () => {
      await sideMenuPage.deleteFolder('Test Folder')
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Moving Element to Favorites folder', async ({ page }) => {

    await test.step('VERIFY WIFI ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('WiFi Title')
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
     * @qase.id PAS-621
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "Favorite" icon
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS VISIBLE - FAVORITE', async () => {
      await expect(detailsPage.getFavoriteAvatar('WT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('WT')).toBeVisible()
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('CLICK FAVORITE (STAR) BUTTON FROM DETAILS PAGE - UNFAVORITE - FAVORITE', async () => {
      await detailsPage.clickFavoriteButton()
    })

    /**
     * @qase.id PAS-622
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "More options"
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS REMOVED - MORE OPTIONS', async () => {
      await expect(detailsPage.getFavoriteAvatar('WT')).not.toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('WT')).not.toBeVisible()
    })

    await test.step('OPEN DETAILS THREE DOTS MENU AND CLICK ON MARK AS FAVORITE - MORE OPTIONS', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickMarkAsFavoriteButton()
    })

    /**
     * @qase.id PAS-620
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "More options"
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS VISIBLE - MORE OPTIONS', async () => {
      await expect(detailsPage.getFavoriteAvatar('WT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('WT')).toBeVisible()
    })

    await test.step('OPEN DETAILS THREE DOTS MENU AND CLICK ON REMOVE FROM FAVORITES - MORE OPTIONS', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickRemoveFromFavoritesButton()
    })

    /**
     * @qase.id PAS-623
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "Favorite" icon
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS REMOVED - FAVORITE', async () => {
      await expect(detailsPage.getFavoriteAvatar('WT')).not.toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('WT')).not.toBeVisible()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('Adding Custom Field with Note option', async ({ page }) => {

    await test.step('VERIFY WIFI ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('WiFi Title')
    })

    await test.step('OPEN/EDITLOGIN ELEMENT', async () => {
      await mainPage.openElementDetails()
      await detailsPage.editElement()
    })

    /**
     * @qase.id PAS-998
     * @description It is possible to add fields
     */
    await test.step('OPEN CREATE CUSTOM MENU', async () => {
      await createOrEditPage.clickCreateCustomItem()
    })

    await test.step('CLICK ON NOTE OPTION FROM CREATE CUSTOM MENU', async () => {
      await createOrEditPage.clickCustomItemOptionNote();
    })

    await test.step('VERIFY THERE IS ONE NEW CUSTOM NOTES ITEMS INSIDE WIFI ELEMENT', async () => {
      await expect(createOrEditPage.customNoteInput).toHaveCount(1);
    })

    /**
     * @qase.id PAS-999
     * @description It is possible to delete additional fields
     */
    await test.step('DELETE NEW CUSTOM NOTE ITEM', async () => {
      await createOrEditPage.deleteCustomNote();
    })

    await test.step('VERIFY THERE IS NO CUSTOM NOTES ITEMS INSIDE WIFI ELEMENT', async () => {
      await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    })

    /**
     * @qase.id PAS-1001
     * @description It is possible to close the screen by clicking on the "Cross" icon
     */
    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  // test('Upload file to WiFi Items', async ({ page }) => {

  //   await test.step('VERIFY WIFI ELEMENT CREATED', async () => {
  //     await mainPage.verifyElementTitle('WiFi Title')
  //   })

  //   await test.step('OPEN ELEMENT', async () => {
  //     await mainPage.openElementDetails()
  //   })

  //   await test.step('EDIT ELEMENT DETAILS', async () => {
  //     await detailsPage.editElement()
  //   })

  //   await test.step('CLICK LOAD FILE BUTTON', async () => {
  //     await createOrEditPage.clickOnCreateOrEditButton('loadfile')
  //   })

  //   await test.step('UPLOAD FILE', async () => {
  //     await createOrEditPage.uploadFile()
  //   })

  //   /**
  //  * @qase.id PAS-901
  //  * @description It is possible to view uploaded files in "Edit" mode
  //  */
  //   await test.step('VERIFY UPLOADED FILE IS VISIBLE INSIDE WIFI ITEMS', async () => {
  //     await createOrEditPage.verifyUploadedFileIsVisible()
  //   })

  //   await test.step('OPEN UPLOADED FILE', async () => {
  //     await createOrEditPage.clickOnUploadedFile()
  //   })

  //   await test.step('VERIFY UPLOADED IMAGE', async () => {
  //     await createOrEditPage.verifyUploadedImageIsVisible()
  //   })

  //   await test.step('CLICK CLOSE (X) BUTTON', async () => {
  //     await createOrEditPage.clickElementItemCloseButton()
  //   })

  //   await test.step('CLICK SAVE BUTTON', async () => {
  //     await createOrEditPage.clickOnCreateOrEditButton('save')
  //   })

  //   /**
  //  * @qase.id PAS-960
  //  * @description It is possible to view uploaded files in "View" mode
  //  */
  //   await test.step('VERIFY UPLOADED FILE IS VISIBLE INSIDE WIFI ITEMS', async () => {
  //     await detailsPage.verifyUploadedFileIsVisible()
  //   })

  //   await test.step('VERIFY UPLOADED FILE NOT VISIBLE', async () => {
  //     await createOrEditPage.verifyUploadedImageIsNotVisible()
  //   })

  //   await test.step('EXIT TO LOGIN SCREEN', async () => {
  //     await sideMenuPage.clickSidebarExitButton()
  //   })

  // })

  test('Deleted WiFi Items are not displayed in view/details mode ', async ({ page }) => {

    await test.step('VERIFY WIFI ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('WiFi Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('DELETE WIFI ITEMS', async () => {
      await createOrEditPage.fillCreateOrEditInput('note', '')

      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-616
     * @description Empty "Wi-Fi" item fields are not displayed in view mode
     */
    await test.step('VERIFY ELEMENT DETAILS', async () => {
      await detailsPage.verifyTitle('WiFi Title');
      await detailsPage.verifyItemDetailsValueIsNotVisible('Add note')
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

  })

})
