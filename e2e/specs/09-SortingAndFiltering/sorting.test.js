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

test.describe('Sorting test', () => {
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
    // await page.waitForTimeout(testData.timeouts.action)
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

  test('Verify that items are sorted by most recently modified when "Recent" is selected', async ({ page }) => {
    qase.id(2592);
    await sideMenuPage.selectSideBarCategory('login')
    await mainPage.clickCreateNewElementButton('Create a login')
    await createOrEditPage.fillCreateOrEditInput('title', 'AAA')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)

    await sideMenuPage.selectSideBarCategory('creditCard')
    await mainPage.clickCreateNewElementButton('Create a credit card')
    await createOrEditPage.fillCreateOrEditInput('title', 'BBB')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)

    await sideMenuPage.selectSideBarCategory('identity')
    await mainPage.clickCreateNewElementButton('Create an identity')
    await createOrEditPage.fillCreateOrEditInput('title', 'CCC')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)

    await sideMenuPage.selectSideBarCategory('all')

    await mainPage.verifyElementByPosition('0', 'CCC')
    await mainPage.verifyElementByPosition('1', 'BBB')
    await mainPage.verifyElementByPosition('2', 'AAA')

  })

  test('Verify that items are sorted from newest to oldest when "Newest to oldest" is selected', async ({ page }) => {
    qase.id(2593);
    await mainPage.clickSortButton()
    await mainPage.selectSortOption('newToOld')

    await mainPage.verifyElementByPosition('0', 'CCC')
    await mainPage.verifyElementByPosition('1', 'BBB')
    await mainPage.verifyElementByPosition('2', 'AAA')
  })

  test('Verify that items are sorted from oldest to newest when "Oldest to newest" is selected', async ({ page }) => {
    qase.id(2594);
    await mainPage.clickSortButton()
    await mainPage.selectSortOption('oldToNew')

    await mainPage.verifyElementByPosition('0', 'AAA')
    await mainPage.verifyElementByPosition('1', 'BBB')
    await mainPage.verifyElementByPosition('2', 'CCC')
    await page.waitForTimeout(testData.timeouts.action)
  })

  test('Verify that favorite items are displayed first on the Home screen', async ({ page }) => {
    qase.id(2595);
    await sideMenuPage.selectSideBarCategory('login')
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await sideMenuPage.openSideBarFolder('Favorites')

    await sideMenuPage.selectSideBarCategory('creditCard')
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await sideMenuPage.openSideBarFolder('Favorites')

    await sideMenuPage.selectSideBarCategory('all')
    await page.waitForTimeout(testData.timeouts.action)

    await mainPage.verifyElementByPosition('0', 'AAA')
    await mainPage.verifyElementByPosition('1', 'BBB')
    await mainPage.verifyElementByPosition('2', 'CCC')
  })

  test('Verify that only favorite items are displayed when "Favorite" is selected', async ({ page }) => {
    qase.id(2596);
    await sideMenuPage.openSideBarFolder('Favorites')
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.verifyElementByPosition('0', 'AAA')
    await mainPage.verifyElementByPosition('1', 'BBB')

    await sideMenuPage.selectSideBarCategory('all')
  })

})
