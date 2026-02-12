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
import clipboard from 'clipboardy';


test.describe('Creating PassPhrase Item', () => {
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

  test('PassPhrase item is created after fulfilling fields', async ({ page }) => {

    /**
     * @qase.id PAS-627
     * @description "PassPhrase" item is created after fulfilling fields
     */
    await test.step('CREATE PASSPHRASE ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('passPhrase')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Save a Recovery phrase')

      await createOrEditPage.fillCreateOrEditInput('title', 'PassPhrase Title')

      await clipboard.write('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12')
      await createOrEditPage.clickOnPasteFromClipboard()

      //TODO: Uncomment when Id is added
      // await createOrEditPage.fillCreateOrEditInput('note', 'Test Note')

      await createOrEditPage.clickOnCreateOrEditButton('save')

    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
      await page.waitForTimeout(testData.timeouts.action)
    })

    /**
     * @qase.id PAS-628
     * @description All fields' values after creating "PassPhrase" item correspond to entered fields' values
     */
    /**
     * @qase.id PAS-629
     * @description ["PassPhrase" field] The number of words displayed in the "PassPhrase" field depends on the selected "Type" field's option and the "+1 random word" switcher
     */
    await test.step('VERIFY PASSPHRASE DETAILS', async () => {

      await detailsPage.verifyTitle('PassPhrase Title')

      await detailsPage.verifyAllRecoveryPhraseWords([
        '#1word1',
        '#2word2',
        '#3word3',
        '#4word4',
        '#5word5',
        '#6word6',
        '#7word7',
        '#8word8',
        '#9word9',
        '#10word10',
        '#11word11',
        '#12word12'
      ]);

    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await sideMenuPage.clickSidebarExitButton()
    })

  })

  test('After changing "Item" dropdown option user is moved to the selected "Item" edit screen', async ({ page }) => {

    await test.step('VERIFY PASSPHRASE ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('PassPhrase Title')
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
     * @qase.id PAS-632
     * @description After changing "Item" dropdown option user is moved to the selected "Item" edit screen
     */
    await test.step('VERIFY THAT USER IS MOVED TO SELECTED ITEM EDIT SCREEN', async () => {
      await detailsPage.verifyItemDetailsFolderName('Test Folder')
    })

    await test.step('VERIFY ELEMENT FOLDER NAME', async () => {
      await mainPage.verifyElementFolderName('Test Folder')
    })

    /**
     * @qase.id PAS-633
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

    await test.step('VERIFY PASSPHRASE ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('PassPhrase Title')
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
     * @qase.id PAS-635
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "Favorite" icon
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS VISIBLE - FAVORITE', async () => {
      await expect(detailsPage.getFavoriteAvatar('PT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('PT')).toBeVisible()
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('CLICK FAVORITE (STAR) BUTTON FROM DETAILS PAGE - UNFAVORITE - FAVORITE', async () => {
      await detailsPage.clickFavoriteButton()
    })

    /**
     * @qase.id PAS-636
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "More options"
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS REMOVED - MORE OPTIONS', async () => {
      await expect(detailsPage.getFavoriteAvatar('PT')).not.toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('PT')).not.toBeVisible()
    })

    await test.step('OPEN DETAILS THREE DOTS MENU AND CLICK ON MARK AS FAVORITE - MORE OPTIONS', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickMarkAsFavoriteButton()
    })

    /**
     * @qase.id PAS-634
     * @description "Star" icon is added to "Item" icon within "Item view mode" and Home screen when marking item as favorite through "More options"
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS VISIBLE - MORE OPTIONS', async () => {
      await expect(detailsPage.getFavoriteAvatar('PT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('PT')).toBeVisible()
    })

    await test.step('OPEN DETAILS THREE DOTS MENU AND CLICK ON REMOVE FROM FAVORITES - MORE OPTIONS', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickRemoveFromFavoritesButton()
    })

    /**
     * @qase.id PAS-636
     * @description "Star" icon is removed from "Item" icon within "Item view mode" and Home screen when removing item from favorites through "Favorite" icon
     */
    await test.step('VERIFY DETAILS AND MAIN FAVORITE (STAR) ELEMENT IS REMOVED - FAVORITE', async () => {
      await expect(detailsPage.getFavoriteAvatar('PT')).not.toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('PT')).not.toBeVisible()
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
  //    * @qase.id PAS-1002
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
  //    * @qase.id PAS-1003
  //    * @description It is possible to delete additional fields
  //    */
  //   await test.step('DELETE NEW CUSTOM NOTE ITEM', async () => {
  //     await createOrEditPage.deleteCustomNote();
  //   })

  //   await test.step('VERIFY THERE IS NO CUSTOM NOTES ITEMS INSIDE PASSPHRASE ELEMENT', async () => {
  //     await expect(createOrEditPage.customNoteInput).toHaveCount(0);
  //   })

  //   /**
  //    * @qase.id PAS-1001
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
