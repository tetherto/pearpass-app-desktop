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

test.describe('Sorting test', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page

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

    await loginPage.loginToApplication(testData.credentials.validPassword)
    await vaultSelectPage.selectVaultbyName(testData.vault.name)
  })

  test.afterAll(async ({ app }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Sorting by Recent', async ({ page }) => {

    await test.step('CREATE three ELEMENTS - initial empty element collection', async () => {
      
      await sideMenuPage.selectSideBarCategory('all')
      await utilities.deleteAllElements()
      await page.waitForTimeout(testData.timeouts.action)

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

    })

    /**
     * @qase.id PAS-704
     * @description Items are displayed in order from the most recently modified to the oldest when the "Recent" option is selected within the selected "Item" tab
     */
    await test.step('VERIFY SORING ELEMENTS - BY RECENT', async () => {
      await mainPage.verifyElementByPosition('0', 'CCC')
      await mainPage.verifyElementByPosition('1', 'BBB')
      await mainPage.verifyElementByPosition('2', 'AAA')
    })

    /**
     * @qase.id PAS-705
     * @description Items are displayed in order from the most recently created to the oldest when the "Newest to oldest" option is selected within the selected "Item" tab
     */
    await test.step('CLICK ON SORT BUTTON, SELECT OPTION', async () => {
      await mainPage.clickSortButton()
      await mainPage.selectSortOption('newToOld')
    })

    await test.step('VERIFY SORING ELEMENTS - BY RECENT', async () => {
      await mainPage.verifyElementByPosition('0', 'CCC')
      await mainPage.verifyElementByPosition('1', 'BBB')
      await mainPage.verifyElementByPosition('2', 'AAA')

    })

    /**
     * @qase.id PAS-706
     * @description Items are displayed in order from the oldest to the most recently created when the "Oldest to newest" option is selected within the selected "Item" tab
     */
    await test.step('CLICK ON SORT BUTTON, SELECT OPTION', async () => {
      await mainPage.clickSortButton()
      await mainPage.selectSortOption('oldToNew')
    })

    await test.step('VERIFY SORING ELEMENTS - BY RECENT', async () => {
      await mainPage.verifyElementByPosition('0', 'AAA')
      await mainPage.verifyElementByPosition('1', 'BBB')
      await mainPage.verifyElementByPosition('2', 'CCC')
      await page.waitForTimeout(testData.timeouts.action)
    })

    await test.step('VERIFY FAVORITE ELEMENTS', async () => {
      await sideMenuPage.selectSideBarCategory('login')
      await mainPage.clickOnElementThreeDotsByPosition(0)
      await mainPage.selectListItemThreeDotsMenuMarkAsFavorite()

      await sideMenuPage.selectSideBarCategory('creditCard')
      await mainPage.clickOnElementThreeDotsByPosition(0)
      await mainPage.selectListItemThreeDotsMenuMarkAsFavorite()

      await sideMenuPage.selectSideBarCategory('all')
      await page.waitForTimeout(testData.timeouts.action)

      /**
     * @qase.id PAS-707
     * @description Items marked as favorite are always displayed first on the Home screen
     */
      // await mainPage.verifyElementFavoriteIcon()
      await mainPage.verifyElementByPosition('0', 'AAA')
      await mainPage.verifyElementByPosition('1', 'BBB')
      await mainPage.verifyElementByPosition('2', 'CCC')

      /**
     * @qase.id PAS-717
     * @description All items marked as "Favorite" are displayed on Home screen when "Favorite" selection is chosen
     */
      await sideMenuPage.openSideBarFolder('Favorites')
      await page.waitForTimeout(testData.timeouts.action)
      await mainPage.verifyElementByPosition('0', 'AAA')
      await mainPage.verifyElementByPosition('1', 'BBB')

      await sideMenuPage.selectSideBarCategory('all')

      //TODO
      // await mainPage.verifyElementFavoriteIcon('AA')
      // await mainPage.verifyElementFavoriteIcon('BB')
    })



  })

})
