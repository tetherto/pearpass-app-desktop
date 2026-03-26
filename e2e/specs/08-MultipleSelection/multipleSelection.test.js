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

test.describe('Multiple Selection', () => {
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

    await sideMenuPage.selectSideBarCategory('all')
    await utilities.deleteAllElements()
    await page.waitForTimeout(testData.timeouts.action)
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

  test.afterAll(async () => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Verify that selected items in one tab are deleted on "Delete" click', async ({ page }) => {
    qase.id(2580);
    await sideMenuPage.selectSideBarCategory('login')
    await mainPage.clickCollectionButton('login')
    await createOrEditPage.fillCreateOrEditInput('title', 'AAA')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)

    await sideMenuPage.selectSideBarCategory('all')

    await mainPage.clickMultipleSelectiontButton()
    await mainPage.clickElementByPosition(0, 'AAA')

    await mainPage.clickMultipleSelectDeletetButton()
    await mainPage.clickYesButton()

  })

  test('Verify that selected items across tabs are deleted on "Delete" click', async ({ page }) => {
    qase.id(2581);
    await mainPage.clickCollectionButton('login')
    await createOrEditPage.fillCreateOrEditInput('title', 'AAA')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)

    await sideMenuPage.selectSideBarCategory('identity')
    await mainPage.clickCollectionButton('identity')
    await createOrEditPage.fillCreateOrEditInput('title', 'BBB')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)

    await sideMenuPage.selectSideBarCategory('login')
    await mainPage.clickMultipleSelectiontButton()
    await mainPage.clickElementByPosition(0, 'AAA')
    await mainPage.clickMultipleSelectDeletetButton()
    await mainPage.clickYesButton()
    await page.waitForTimeout(testData.timeouts.action)

    await sideMenuPage.selectSideBarCategory('identity')
    await mainPage.clickMultipleSelectiontButton()
    await mainPage.clickElementByPosition(0, 'BBB')
    await mainPage.clickMultipleSelectDeletetButton()
    await mainPage.clickYesButton()
    await page.waitForTimeout(testData.timeouts.action)
  })

  test('Verify that "Multiple Selection" button is hidden when no items exist', async ({ page }) => {
    qase.id(2582);
    await mainPage.verifyMultipleSelectiontButtonIsNotVisible()
  })

  test('Verify that "Multiple Selection" mode can be canceled', async ({ page }) => {
    qase.id(2583);
    await sideMenuPage.selectSideBarCategory('all')
    await utilities.deleteAllElements()
    await page.waitForTimeout(testData.timeouts.action)

    await sideMenuPage.selectSideBarCategory('login')
    await mainPage.clickCollectionButton('login')
    await createOrEditPage.fillCreateOrEditInput('title', 'AAA')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)

    await mainPage.clickMultipleSelectiontButton()
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickElementByPosition(0, 'AAA')
    await mainPage.clickMultipleSelectCancelButon()
  })

  test('Verify that "Delete" button is enabled only when items are selected', async ({ page }) => {
    qase.id(2584);
    await mainPage.clickMultipleSelectiontButton()
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickElementByPosition(0, 'AAA')
    await mainPage.verifyMultipleSelectDeleteButtonIsEnabled()
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickMultipleSelectCancelButon()
    await page.waitForTimeout(testData.timeouts.action)
  })

  test('Verify that multiple items can be added to a folder simultaneously', async ({ page }) => {
    qase.id(2585);
    await mainPage.clickMultipleSelectiontButton()
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickElementByPosition(0, 'AAA')

    await mainPage.clickMultipleSelectMoveButon()
    await page.waitForTimeout(testData.timeouts.action)

    await mainPage.clickCreateNewFoldertButton()
    await mainPage.fillCreateNewFolderInput('Test Folder')
    await mainPage.clickCreateFoldertButton()

    await mainPage.verifyElementFolderName('Test Folder')
    await sideMenuPage.deleteFolder('Test Folder')
  })

})
