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
import { qase } from 'playwright-qase-reporter';

test.describe.only('Creating Login Item', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page

  test.beforeEach(async ({ app }) => {
    // Re-bind to current page so we never use a closed page (avoids "Target page has been closed")
    page = await app.getPage()
    const root = page.locator('body')
    loginPage = new LoginPage(root)
    vaultSelectPage = new VaultSelectPage(root)
    mainPage = new MainPage(root)
    sideMenuPage = new SideMenuPage(root)
    createOrEditPage = new CreateOrEditPage(root)
    utilities = new Utilities(root)
    detailsPage = new DetailsPage(root)

    // await loginPage.loginToApplication(testData.credentials.validPassword)
    // await vaultSelectPage.selectVaultbyName(testData.vault.name)
  })

  test.afterAll(async ({ }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Login to application', async ({ page }) => {
    await loginPage.loginToApplication(testData.credentials.validPassword)
    await vaultSelectPage.selectVaultbyName(testData.vault.name)
  })

  /**
   * @qase.id PAS-1928
   * @description Creating the "Login" item
   */
  test('Creating the "Login" item', async ({ page }) => {
    qase.id(1928);
    await test.step('CREATE LOGIN ELEMENT - initial empty element collection', async () => {

      await sideMenuPage.selectSideBarCategory('login')
      await utilities.deleteAllElements()

      await mainPage.clickCreateNewElementButton('Create a login')

      await createOrEditPage.fillCreateOrEditInput('title', 'Login Title')
      await createOrEditPage.fillCreateOrEditInput('username', 'Test User')
      await createOrEditPage.fillCreateOrEditInput('password', 'Test Pass')
      await createOrEditPage.fillCreateOrEditInput('website', 'https://www.website.co')
      await createOrEditPage.fillCreateOrEditInput('note', 'Test Note')

      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)
    })
  })

  test('Viewing created item - all fields match ', async ({ page }) => {
    qase.id(1929);
    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Login Title')
    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('VERIFY LOGIN DETAILS', async () => {
      await detailsPage.verifyItemDetailsValue('Email or username', 'Test User')
      await detailsPage.verifyItemDetailsValue('Password', 'Test Pass')
      await detailsPage.verifyItemDetailsValue('https://', 'https://www.website.co')
      await detailsPage.verifyCustomNoteText('Test Note')
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description Password visibility icon displays/hides value
   */
  test('Password visibility icon displays/hides value', async ({ page }) => {
    qase.id(1930);
    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Login Title')
    })

    await test.step('OPEN LOGIN ELEMENT DETAILS AND VERIFY PASSWORD SHOW/HIDE', async () => {
      // await mainPage.openElementDetails()
      await createOrEditPage.verifyPasswordType('password')
      await createOrEditPage.clickShowHidePasswordButtonFirst()
      await createOrEditPage.verifyPasswordType('text')
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description Dropdown moves to selected item edit screen
   */
  test('Dropdown moves to selected item edit screen', async ({ page }) => {
    qase.id(1931);
    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Login Title')
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

    // await test.step('OPEN ELEMENT', async () => {
    //   await mainPage.openElementDetails()
    // })

    await test.step('EDIT ELEMENT', async () => {
      await detailsPage.editElement()
    })

    await test.step('OPEN FOLDER DROPDOWN MENU, SELECT FOLDER AND SAVE', async () => {
      await createOrEditPage.openDropdownMenu()
      await createOrEditPage.selectFromDropdownMenu('Test Folder')
      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('VERIFY THAT USER IS MOVED TO SELECTED ITEM EDIT SCREEN', async () => {
      await detailsPage.getItemDetailsFolderName('Test Folder')
    })

    await test.step('VERIFY ELEMENT FOLDER NAME', async () => {
      await mainPage.verifyElementFolderName('Test Folder')
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description Item moved to folder (and cleanup)
   */
  test('Item moved to folder (and cleanup)', async ({ page }) => {
    qase.id(1932);
    await test.step('VERIFY ELEMENT IS MOVED TO THE FOLDER SELECTED FROM DROPDOWN', async () => {
      await sideMenuPage.verifySidebarFolderName('Test Folder')
    })

    await test.step('EDIT ELEMENT', async () => {
      await mainPage.openElementDetails()
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
  })

  /**
   * @qase.id AQA-XXXX
   * @description Add via Favorite icon
   */
  test('Add via Favorite icon', async ({ page }) => {
    qase.id(1933);
    await sideMenuPage.selectSideBarCategory('all')
    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Login Title')
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

    await test.step('VERIFY FAVORITE (STAR) IS VISIBLE', async () => {
      await expect(detailsPage.getFavoriteAvatar('LT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('LT')).toBeVisible()
    })
  })

    /**
     * @qase.id AQA-XXXX
     * @description Remove via Favorite icon
     */
    test('Remove via Favorite icon', async ({ page }) => {
      qase.id(1934);
      await test.step('OPEN ELEMENT', async () => {
        await mainPage.openElementDetails()
      })

      await test.step('CLICK FAVORITE (STAR) BUTTON TO REMOVE', async () => {
        await detailsPage.clickFavoriteButton()
      })

      await test.step('VERIFY FAVORITE (STAR) IS REMOVED', async () => {
        await expect(detailsPage.getFavoriteAvatar('LT')).not.toBeVisible()
        await expect(mainPage.getElementFavoriteIcon('LT')).not.toBeVisible()
      })
    })

  /**
   * @qase.id AQA-XXXX
   * @description Add via More options
   */
  test('Add via More options', async ({ page }) => {
    qase.id(1935);
    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('OPEN THREE DOTS MENU AND CLICK MARK AS FAVORITE', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickMarkAsFavoriteButton()
    })

    await test.step('VERIFY FAVORITE (STAR) IS VISIBLE', async () => {
      await expect(detailsPage.getFavoriteAvatar('LT')).toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('LT')).toBeVisible()
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description Remove via More options
   */
  test('Remove via More options', async ({ page }) => {
    qase.id(1936);
    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('OPEN THREE DOTS MENU AND CLICK REMOVE FROM FAVORITES', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickRemoveFromFavoritesButton()
    })

    await test.step('VERIFY FAVORITE (STAR) IS REMOVED', async () => {
      await expect(detailsPage.getFavoriteAvatar('LT')).not.toBeVisible()
      await expect(mainPage.getElementFavoriteIcon('LT')).not.toBeVisible()
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description Add Note field
   */
  test('Add Custom Note', async ({ page }) => {
    qase.id(1937);
    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Login Title')
    })

    await test.step('OPEN/EDIT LOGIN ELEMENT', async () => {
      await mainPage.openElementDetails()
      await detailsPage.editElement()
    })

    await test.step('OPEN CREATE CUSTOM MENU', async () => {
      await createOrEditPage.clickCreateCustomItem()
    })

    await test.step('CLICK ON NOTE OPTION FROM CREATE CUSTOM MENU', async () => {
      await createOrEditPage.clickCustomItemOptionNote()
    })

    await test.step('VERIFY ONE NEW CUSTOM NOTE ITEM', async () => {
      await expect(createOrEditPage.customNoteInput).toHaveCount(1)
    })

    await test.step('VERIFY ONE NEW CUSTOM NOTE ITEM', async () => {
      await createOrEditPage.fillCustomNoteInput()
    })

    // click delete icon

    await test.step('SAVE AND CLOSE', async () => {
      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)
      await mainPage.clickDetailsCloseButton()
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description Delete Note field
   */
  test('Delete Note field', async ({ page }) => {
    qase.id(1938);
    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Login Title')
    })

    await test.step('OPEN/EDIT LOGIN ELEMENT', async () => {
      await mainPage.openElementDetails()
      await detailsPage.editElement()
    })

    await test.step('VERIFY CUSTOM NOTE EXISTS', async () => {
      await expect(createOrEditPage.customNoteInput).toHaveCount(2)
    })

    await test.step('DELETE CUSTOM NOTE ITEM', async () => {
      await createOrEditPage.deleteCustomNote()
    })

    await test.step('VERIFY NO CUSTOM NOTE ITEMS', async () => {
      await expect(createOrEditPage.customNoteInput).toHaveCount(1)
    })

    await test.step('SAVE AND CLOSE', async () => {
      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)
      await mainPage.clickDetailsCloseButton()
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description Close via Cross icon
   */
  test('Close via Cross icon', async ({ page }) => {
    qase.id(1939);
    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.verifyElementTitle('Login Title')
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await detailsPage.clickElementItemCloseButton()
    }) // modalheader-button-close

    await test.step('VERIFY DETAILS CLOSED', async () => {
      await mainPage.verifyElementTitle('Login Title')
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description View uploaded file in Edit mode
   */
  test('View uploaded file in Edit mode', async ({ page }) => {
    qase.id(1940);
    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Login Title')
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

    await test.step('VERIFY UPLOADED FILE IS VISIBLE (EDIT MODE)', async () => {
      await createOrEditPage.verifyUploadedFileIsVisible()
    })

    await test.step('OPEN UPLOADED FILE', async () => {
      await createOrEditPage.clickOnUploadedFile()
    })

    await test.step('VERIFY UPLOADED IMAGE', async () => {
      await createOrEditPage.verifyUploadedImageIsVisible()
    })

    await test.step('CLOSE IMAGE AND SAVE', async () => {
      await createOrEditPage.clickElementItemCloseButton()
      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)
      await mainPage.clickDetailsCloseButton()
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description View uploaded file in View mode (and cleanup)
   */
  test('View uploaded file in View mode (and cleanup)', async ({ page }) => {
    qase.id(1941);
    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('VERIFY UPLOADED FILE IS VISIBLE (VIEW MODE)', async () => {
      await detailsPage.verifyUploadedFileIsVisible()
    })

    await test.step('OPEN UPLOADED FILE AND VERIFY IMAGE', async () => {
      await detailsPage.clickOnUploadedFile()
      await detailsPage.verifyUploadedImageIsVisible()
    })

    await test.step('CLOSE IMAGE', async () => {
      await detailsPage.clickElementItemCloseButton()
    })

    await test.step('CLEANUP: REMOVE ATTACHMENT', async () => {
      await detailsPage.editElement()
      await createOrEditPage.clickOnCreateOrEditButton('deleteattachment')
      await createOrEditPage.verifyUploadedImageIsNotVisible()
      await createOrEditPage.clickElementItemCloseButton()
      await mainPage.clickDetailsCloseButton()
    })
  })

  /**
   * @qase.id AQA-XXXX
   * @description Empty fields not displayed in view mode
   */
  test('Empty fields not displayed in view mode', async ({ page }) => {
    qase.id(1942);
    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainPage.verifyElementTitle('Login Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('CLEAR LOGIN FIELDS (username, password, website, note)', async () => {
      await createOrEditPage.fillCreateOrEditInput('username', '')
      await createOrEditPage.fillCreateOrEditInput('password', '')
      await createOrEditPage.fillCreateOrEditInput('website', '')
      await createOrEditPage.fillCreateOrEditInput('note', '')

      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('OPEN ELEMENT DETAILS', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('VERIFY EMPTY FIELDS NOT DISPLAYED', async () => {
      await detailsPage.verifyItemDetailsValue('https://', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('Email or username')
      await detailsPage.verifyItemDetailsValueIsNotVisible('Password')
      await detailsPage.verifyItemDetailsValueIsNotVisible('Add note')
    })

    await test.step('CLOSE DETAILS', async () => {
      await mainPage.clickDetailsCloseButton()
    })

  })

})
