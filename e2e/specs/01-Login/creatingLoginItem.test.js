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

test.describe('Creating Login Item', () => {
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

    await sideMenuPage.selectSideBarCategory('login');
    await utilities.deleteAllElements();
    await mainPage.clickCreateNewElementButton('Create a login');

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

  test('Creating the "Login" item', async ({ page }) => {
    qase.id(1928);
    await createOrEditPage.fillCreateOrEditInput('title', 'Login Title')
    await createOrEditPage.fillCreateOrEditInput('username', 'Test User')
    await createOrEditPage.fillCreateOrEditInput('password', 'Test Pass')
    await createOrEditPage.fillCreateOrEditInput('website', 'https://www.website.co')
    await createOrEditPage.fillCreateOrEditInput('note', 'Test Note')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
  })

  test('Viewing created item. Verify item details', async ({ page }) => {
    qase.id(1929);
    await mainPage.verifyElementTitle('Login Title')
    await mainPage.openElementDetails()
    await detailsPage.verifyItemDetailsValue('Email or username', 'Test User')
    await detailsPage.verifyItemDetailsValue('Password', 'Test Pass')
    await detailsPage.verifyItemDetailsValue('https://', 'https://www.website.co')
    await detailsPage.verifyCustomNoteText('Test Note')
  })

  test('Password visibility icon displays/hides value', async ({ page }) => {
    qase.id(1930);
    await mainPage.verifyElementTitle('Login Title')
    await createOrEditPage.verifyPasswordType('password')
    await createOrEditPage.clickShowHidePasswordButtonFirst()
    await createOrEditPage.verifyPasswordType('text')
  })

  test('Dropdown moves to selected item edit screen', async ({ page }) => {
    qase.id(1931);
    await mainPage.verifyElementTitle('Login Title')
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
    qase.id(1932);
    await sideMenuPage.verifySidebarFolderName('Test Folder')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.openDropdownMenu()
    await createOrEditPage.selectFromDropdownMenu('No Folder')
    await createOrEditPage.clickOnCreateOrEditButton('save')

    await sideMenuPage.deleteFolder('Test Folder')
  })

  test('Add via Favorite icon', async ({ page }) => {
    qase.id(1933);
    await sideMenuPage.selectSideBarCategory('all')
    await mainPage.verifyElementTitle('Login Title')
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await sideMenuPage.openSideBarFolder('Favorites')
    await expect(detailsPage.getFavoriteAvatar('LT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('LT')).toBeVisible()
  })

  test('Remove via Favorite icon', async ({ page }) => {
    qase.id(1934);
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('LT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('LT')).not.toBeVisible()
  })

  test('Add via More options', async ({ page }) => {
    qase.id(1935);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickMarkAsFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('LT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('LT')).toBeVisible()
  })

  test('Remove via More options', async ({ page }) => {
    qase.id(1936);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickRemoveFromFavoritesButton()
    await expect(detailsPage.getFavoriteAvatar('LT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('LT')).not.toBeVisible()
  })

  test('Add Custom Note', async ({ page }) => {
    qase.id(1937);
    await mainPage.verifyElementTitle('Login Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.clickCreateCustomItem()
    await createOrEditPage.clickCustomItemOptionNote()
    await expect(createOrEditPage.customNoteInput).toHaveCount(1)
    await createOrEditPage.fillCustomNoteInput()
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickDetailsCloseButton()
  })

  test('Delete Note field', async ({ page }) => {
    qase.id(1938);
    await mainPage.verifyElementTitle('Login Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await expect(createOrEditPage.customNoteInput_first).toHaveCount(2)
    await createOrEditPage.deleteCustomNote()
    await expect(createOrEditPage.customNoteInput_first).toHaveCount(1)
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickDetailsCloseButton()

  })
  
  test('Close via Cross icon', async ({ page }) => {
    qase.id(1939);
    await mainPage.verifyElementTitle('Login Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await detailsPage.clickElementItemCloseButton()
    await mainPage.verifyElementTitle('Login Title')

  })

  test('View uploaded file in Edit mode', async ({ page }) => {
    qase.id(1940);
    await mainPage.verifyElementTitle('Login Title')
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

  test('View uploaded file in View mode (and cleanup)', async ({ page }) => {
    qase.id(1941);
    await mainPage.openElementDetails()
    await detailsPage.verifyUploadedFileIsVisible()
    await detailsPage.clickOnUploadedFile()
    await detailsPage.verifyUploadedImageIsVisible()
    await detailsPage.clickElementItemCloseButton()
    await detailsPage.editElement()
    await createOrEditPage.clickOnCreateOrEditButton('deleteattachment')
    await createOrEditPage.verifyUploadedImageIsNotVisible()
    await createOrEditPage.clickElementItemCloseButton()
    await mainPage.clickDetailsCloseButton()
  })

  test('Empty fields not displayed in view mode', async ({ page }) => {
    qase.id(1942);
    await mainPage.verifyElementTitle('Login Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.fillCreateOrEditInput('username', '')
    await createOrEditPage.fillCreateOrEditInput('password', '')
    await createOrEditPage.fillCreateOrEditInput('website', '')
    await createOrEditPage.fillCreateOrEditInput('note', '')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await mainPage.openElementDetails()
    await detailsPage.verifyItemDetailsValue('https://', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('Email or username')
    await detailsPage.verifyItemDetailsValueIsNotVisible('Password')
    await detailsPage.verifyItemDetailsValueIsNotVisible('Add comment')

    await mainPage.clickDetailsCloseButton()

    await test.step('CLOSE DETAILS', async () => {
      await mainPage.clickDetailsCloseButton()
    })

  })

})
