import { test, expect } from '../../fixtures/app.runner.js';
import {
  LoginPage,
  VaultSelectPage,
  MainPage,
  SideMenuPage,
  CreateOrEditPage,
  Utilities,
  DetailsPage
} from '../../components/index.js';
import testData from '../../fixtures/test-data.js';

test.describe('Creating Note Item', () => {
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

  test('Note item is created after fulfilling fields', async ({ page }) => {

    /**
     * @qase.id PAS-641
     * @description "Note" item is created after fulfilling fields
     */
    await test.step('CREATE NOTE ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('note')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Create a note')

      await createOrEditPage.fillCreateOrEditInput('title', 'Note Title')

      await createOrEditPage.fillCreateOrEditTextArea('note', 'Test Note Text')

      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)

    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-642
     * @description All fields' values after creating "Note" item correspond to entered fields' values
     */
    await test.step('VERIFY NOTE DETAILS', async () => {

      await detailsPage.verifyTitle('Note Title');
      await detailsPage.verifyNoteText('Test Note Text')
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('After changing "Item" dropdown option user is moved to the selected "Item" edit screen', async ({ page }) => {

    await test.step('VERIFY NOTE ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Note Title')
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
     * @qase.id PAS-645
     * @description After changing "Item" dropdown option user is moved to the selected "Item" edit screen
     */
    await test.step('VERIFY THAT USER IS MOVED TO SELECTED ITEM EDIT SCREEN', async () => {
      await detailsPage.verifyItemDetailsFolderName('Test Folder')
    })

    await test.step('VERIFY ELEMENT FOLDER NAME', async () => {
      await mainPage.verifyElementFolderName('Test Folder')
    })

    /**
     * @qase.id PAS-646
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

    await test.step('VERIFY NOTE ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Note Title')
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
     * @qase.id PAS-648
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "Favorite" icon
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS VISIBLE - FAVORITE', async () => {
      await expect(detailsPage.getFavoriteAvatar('NT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('NT')).toBeVisible()
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('CLICK FAVORITE (STAR) BUTTON FROM DETAILS PAGE - UNFAVORITE - FAVORITE', async () => {
      await detailsPage.clickFavoriteButton()
    })

    /**
     * @qase.id PAS-649
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "More options"
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS REMOVED - MORE OPTIONS', async () => {
      await expect(detailsPage.getFavoriteAvatar('NT')).not.toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('NT')).not.toBeVisible()
    })

    await test.step('OPEN DETAILS THREE DOTS MENU AND CLICK ON MARK AS FAVORITE - MORE OPTIONS', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickMarkAsFavoriteButton()
    })

    /**
     * @qase.id PAS-647
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "More options"
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS VISIBLE - MORE OPTIONS', async () => {
      await expect(detailsPage.getFavoriteAvatar('NT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('NT')).toBeVisible()
    })

    await test.step('OPEN DETAILS THREE DOTS MENU AND CLICK ON REMOVE FROM FAVORITES - MORE OPTIONS', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickRemoveFromFavoritesButton()
    })

    /**
     * @qase.id PAS-650
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "Favorite" icon
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS REMOVED - FAVORITE', async () => {
      await expect(detailsPage.getFavoriteAvatar('NT')).not.toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('NT')).not.toBeVisible()
    })

    // await test.step('EXIT TO LOGIN SCREEN', async () => {
    //   await sideMenuPage.clickSidebarExitButton()
    // })

  })

  //TODO: Un comment when Id is added

  // test('Adding Custom Field with Note option', async ({ page }) => {

  //   await test.step('VERIFY PASSPHRASE ELEMENT CREATED', async () => {
  //     await mainPage.verifyElementTitle('PassPhrase Title')
  //   })

  //   await test.step('OPEN/EDITLOGIN ELEMENT', async () => {
  //     await mainPage.openElementDetails()
  //     await detailsPage.editElement()
  //   })

  //   /**
  //    * @qase.id PAS-1007
  //    * @description It is possible to add fields
  //    */
  //   await test.step('OPEN CREATE CUSTOM MENU', async () => {
  //     await createOrEditPage.clickCreateCustomItem()
  //   })

  //   await test.step('CLICK ON NOTE OPTION FROM CREATE CUSTOM MENU', async () => {
  //     await createOrEditPage.clickCustomItemOptionNote();
  //   })

  //   await test.step('VERIFY THERE IS ONE NEW CUSTOM NOTES ITEMS INSIDE PASSPHRASE ELEMENT', async () => {
  //     await expect(createOrEditPage.customNoteInput).toHaveCount(1);
  //   })

  //   /**
  //    * @qase.id PAS-1008
  //    * @description It is possible to delete additional fields
  //    */
  //   await test.step('DELETE NEW CUSTOM NOTE ITEM', async () => {
  //     await createOrEditPage.deleteCustomNote();
  //   })

  //   await test.step('VERIFY THERE IS NO CUSTOM NOTES ITEMS INSIDE PASSPHRASE ELEMENT', async () => {
  //     await expect(createOrEditPage.customNoteInput).toHaveCount(0);
  //   })

  //   /**
  //    * @qase.id PAS-1010
  //    * @description It is possible to close the screen by clicking on the "Cross" icon
  //    */
  //   await test.step('CLICK CLOSE (X) BUTTON', async () => {
  //     await createOrEditPage.clickElementItemCloseButton()
  //   })

  //   await test.step('EXIT TO LOGIN SCREEN', async () => {
  //     await sideMenuPage.clickSidebarExitButton()
  //   })

  // })
  

})
