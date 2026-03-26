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

test.describe('Creating WiFi Item', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page

  test.beforeAll(async ({ app }) => {
    page = await app.getPage();
    const root = page.locator('body');
    loginPage = new LoginPage(root);
    vaultSelectPage = new VaultSelectPage(root);
    sideMenuPage = new SideMenuPage(root);
    createOrEditPage = new CreateOrEditPage(root);
    utilities = new Utilities(root);
    mainPage = new MainPage(root);
    detailsPage = new DetailsPage(root);

    await loginPage.loginToApplication(testData.credentials.validPassword);
    await vaultSelectPage.selectVaultbyName(testData.vault.name);

    await sideMenuPage.selectSideBarCategory('wifiPassword')
    await utilities.deleteAllElements()
    await mainPage.clickCreateNewElementButton('Save a Wi-fi')
  })

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

  test.afterAll(async ({}) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Creating the "WiFi" item', async ({ page }) => {
    qase.id(2135);
    await createOrEditPage.fillCreateOrEditInput('wifiname', 'WiFi Title')
    await createOrEditPage.fillCreateOrEditInput('wifipassword', 'WiFi Pass')
    await createOrEditPage.fillCreateOrEditInput('note', 'WiFi Note')
    await createOrEditPage.clickOnCreateOrEditButton('save')
  })

  test('Viewing created item. Verify item details', async ({ page }) => {
    qase.id(2136);
    await mainPage.openElementDetails()
    await detailsPage.verifyTitle('WiFi Title');
    await detailsPage.verifyItemDetailsValue('Password', 'WiFi Pass')
    await detailsPage.verifyItemDetailsValue('Add comment', 'WiFi Note')
  })

  test('Password visibility icon displays/hides value', async ({ page }) => {
    qase.id(2137);
    await mainPage.openElementDetails()
    await mainPage.verifyElementTitle('WiFi Title')
    await createOrEditPage.verifyPasswordType('password')
    await createOrEditPage.clickShowHidePasswordButtonFirst()
    await createOrEditPage.verifyPasswordType('text')
  })

  test('Dropdown moves to selected item edit screen', async ({ page }) => {
    qase.id(2138);
    await mainPage.verifyElementTitle('WiFi Title')
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
    qase.id(2139);
    await sideMenuPage.verifySidebarFolderName('Test Folder')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.openDropdownMenu()
    await createOrEditPage.selectFromDropdownMenu('No Folder')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await sideMenuPage.deleteFolder('Test Folder')
  })

  test('Add via Favorite icon', async ({ page }) => {
    qase.id(2140);
    await sideMenuPage.selectSideBarCategory('all')
    await mainPage.verifyElementTitle('WiFi Title')
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await sideMenuPage.openSideBarFolder('Favorites')
    await expect(detailsPage.getFavoriteAvatar('WT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('WT')).toBeVisible()
  })

  test('Remove via Favorite icon', async ({ page }) => {
    qase.id(2141);
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('WT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('WT')).not.toBeVisible()
  })

  test('Add via More options', async ({ page }) => {
    qase.id(2142);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickMarkAsFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('WT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('WT')).toBeVisible()
  })

  test('Remove via More options', async ({ page }) => {
    qase.id(2143);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickRemoveFromFavoritesButton()
    await expect(detailsPage.getFavoriteAvatar('WT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('WT')).not.toBeVisible()
  })

  test('Add Custom Note', async ({ page }) => {
    qase.id(2144);
    await mainPage.verifyElementTitle('WiFi Title')
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
    qase.id(2145);
    await mainPage.verifyElementTitle('WiFi Title')
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
    qase.id(2146);
    await mainPage.verifyElementTitle('WiFi Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await detailsPage.clickElementItemCloseButton()
    await mainPage.verifyElementTitle('WiFi Title')
  })

  test('Empty fields not displayed in view mode', async ({ page }) => {
    qase.id(2147);
    await mainPage.verifyElementTitle('WiFi Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.fillCreateOrEditInput('note', '')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await mainPage.openElementDetails()
    await detailsPage.verifyTitle('WiFi Title');
    await detailsPage.verifyItemDetailsValueIsNotVisible('Add comment')
    await mainPage.clickDetailsCloseButton()
  })
})
