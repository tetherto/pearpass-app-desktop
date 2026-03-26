import { test, expect } from '../../fixtures/app.runner.js'
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

test.describe('Creating Note Item', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page

  test.beforeAll(async ({ app }) => {
    page = await app.getPage();
    const root = page.locator('body');
    loginPage = new LoginPage(root);
    vaultSelectPage = new VaultSelectPage(root);
    sideMenuPage = new SideMenuPage(root);
    utilities = new Utilities(root);
    mainPage = new MainPage(root);

    await loginPage.loginToApplication(testData.credentials.validPassword);
    await vaultSelectPage.selectVaultbyName(testData.vault.name);

    await sideMenuPage.selectSideBarCategory('note')
    await utilities.deleteAllElements()
    await mainPage.clickCreateNewElementButton('Create a note')

    await page.waitForTimeout(testData.timeouts.action);
  });

  test.beforeEach(async ({ app }) => {
    page = await app.getPage()
    const root = page.locator('body')
    loginPage = new LoginPage(root)
    vaultSelectPage = new VaultSelectPage(root)
    mainPage = new MainPage(root)
    sideMenuPage = new SideMenuPage(root)
    createOrEditPage = new CreateOrEditPage(root)
    utilities = new Utilities(root)
    detailsPage = new DetailsPage(root)

  })

  test.afterAll(async () => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Creating the "Note" item', async ({ page }) => {
    qase.id(2248);
    await createOrEditPage.fillCreateOrEditInput('title', 'Note Title')
    await createOrEditPage.fillCreateOrEditTextArea('note', 'Test Note Text')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
  })

  test('Viewing created item. Verify item details', async ({ page }) => {
    qase.id(2249);
    await mainPage.openElementDetails()
    await detailsPage.verifyTitle('Note Title');
    await detailsPage.verifyNoteText('Test Note Text')
  })

  test('Dropdown moves to selected item edit screen', async ({ page }) => {
    qase.id(2250);
    await mainPage.verifyElementTitle('Note Title')
    await sideMenuPage.clickSidebarAddButton()
    await detailsPage.fillCreateNewFolderTitleInput('Test Folder')
    await detailsPage.clickCreateFolderButton()
    await detailsPage.editElement()
    await createOrEditPage.openDropdownMenu()
    await createOrEditPage.selectFromDropdownMenu('Test Folder')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await detailsPage.getItemDetailsFolderName('Test Folder')
    await mainPage.verifyElementFolderName('Test Folder')
  })

  test('Item moved to folder (and cleanup)', async ({ page }) => {
    qase.id(2251);
    await sideMenuPage.verifySidebarFolderName('Test Folder')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.openDropdownMenu()
    await createOrEditPage.selectFromDropdownMenu('No Folder')
    await createOrEditPage.clickOnCreateOrEditButton('save')

    await sideMenuPage.deleteFolder('Test Folder')
  })

  test('Add via Favorite icon', async ({ page }) => {
    qase.id(2252);
    await sideMenuPage.selectSideBarCategory('all')
    await mainPage.verifyElementTitle('Note Title')
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await sideMenuPage.openSideBarFolder('Favorites')
    await expect(detailsPage.getFavoriteAvatar('NT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('NT')).toBeVisible()
  })

  test('Remove via Favorite icon', async ({ page }) => {
    qase.id(2253);
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('NT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('NT')).not.toBeVisible()
  })

  test('Add via More options', async ({ page }) => {
    qase.id(2254);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickMarkAsFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('NT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('NT')).toBeVisible()
  })

  test('Remove via More options', async ({ page }) => {
    qase.id(2255);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickRemoveFromFavoritesButton()
    await expect(detailsPage.getFavoriteAvatar('NT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('NT')).not.toBeVisible()
  })

  // test('Add Custom Note', async ({ page }) => {
    // qase.id(2256);
  //   await mainPage.verifyElementTitle('Note Title')
  //   await mainPage.openElementDetails()
  //   await detailsPage.editElement()
  //   await createOrEditPage.clickCreateCustomItem()
  //   await createOrEditPage.clickCustomItemOptionNote()
  //   await expect(createOrEditPage.customNoteInput).toHaveCount(1)
  //   await createOrEditPage.fillCustomNoteInput()
  //   await createOrEditPage.clickOnCreateOrEditButton('save')
  //   await page.waitForTimeout(testData.timeouts.action)
  //   await mainPage.clickDetailsCloseButton()
  // })

  // test('Delete Note field', async ({ page }) => {
    // qase.id(2257);
  //   await mainPage.verifyElementTitle('Note Title')
  //   await mainPage.openElementDetails()
  //   await detailsPage.editElement()
  //   await expect(createOrEditPage.customNoteInput).toHaveCount(2)
  //   await createOrEditPage.deleteCustomNote()
  //   await expect(createOrEditPage.customNoteInput).toHaveCount(1)
  //   await createOrEditPage.clickOnCreateOrEditButton('save')
  //   await page.waitForTimeout(testData.timeouts.action)
  //   await mainPage.clickDetailsCloseButton()

  // })

  test('Close via Cross icon', async ({ page }) => {
    qase.id(2258);
    await mainPage.verifyElementTitle('Note Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await detailsPage.clickElementItemCloseButton()
    await mainPage.verifyElementTitle('Note Title')

  })

  test('View uploaded file in Edit mode', async ({ page }) => {
    qase.id(2259);
    await mainPage.verifyElementTitle('Note Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.clickOnCreateOrEditButton('loadfile')
    await createOrEditPage.uploadFile()
    await createOrEditPage.verifyUploadedFileIsVisible()
    await createOrEditPage.clickOnUploadedFile()
    await createOrEditPage.verifyUploadedImageIsVisible()
    await createOrEditPage.clickElementItemCloseButton()
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickDetailsCloseButton()
  })

  // test('View uploaded file in View mode (and cleanup)', async ({ page }) => {
    // qase.id(2260);
  //   await mainPage.openElementDetails()
  //   await detailsPage.verifyUploadedFileIsVisible()
  //   await detailsPage.clickOnUploadedFile()
  //   await detailsPage.verifyUploadedImageIsVisible()
  //   await detailsPage.clickElementItemCloseButton()
  //   await detailsPage.editElement()
  //   await createOrEditPage.clickOnCreateOrEditButton('deleteattachment') // button-single-input
  //   await createOrEditPage.verifyUploadedImageIsNotVisible()
  //   await createOrEditPage.clickElementItemCloseButton()
  //   await mainPage.clickDetailsCloseButton()
  // })

  test('Empty fields not displayed in view mode', async ({ page }) => {
    qase.id(2261);
    await mainPage.verifyElementTitle('Note Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.fillCreateOrEditTextArea('note', '')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await mainPage.openElementDetails()
    await detailsPage.verifyItemDetailsValueIsNotVisible('Add comment')
    
    await mainPage.clickDetailsCloseButton()

  })

})
