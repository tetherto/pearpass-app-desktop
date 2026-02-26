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

test.describe('Multiple Selection', () => {
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

  test.afterAll(async ({ }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Multiple Selection Elements', async ({ page }) => {

    /**
     * @qase.id PAS-702
     * @description Selected items (in/without folder; marked as favorite/without such mark) within one tab are deleted when clicking on "Delete" button
     */
    await test.step('CREATE ONE ELEMENT', async () => {
      await sideMenuPage.selectSideBarCategory('all')
      await utilities.deleteAllElements()
      await page.waitForTimeout(testData.timeouts.action)

      await sideMenuPage.selectSideBarCategory('login')
      await mainPage.clickCollectionButton('login')
      await createOrEditPage.fillCreateOrEditInput('title', 'AAA')
      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)

      await sideMenuPage.selectSideBarCategory('all')

    })

    await test.step('CHECK ELEMENT', async () => {
      await mainPage.clickMultipleSelectiontButton()
      await mainPage.clickElementByPosition(0, 'AAA')
    })

    await test.step('CLICK MULTIPLE SELECT DELETE BUTTON', async () => {
      await mainPage.clickMultipleSelectDeletetButton()
      await mainPage.clickYesButton()
    })

    /**
     * @qase.id PAS-716
     * @description Selected items within different tabs are deleted when clicking on "Delete" button
     */
    await test.step('CREATE TWO ELEMENTS', async () => {
      await sideMenuPage.selectSideBarCategory('login')
      await utilities.deleteAllElements()
      await page.waitForTimeout(testData.timeouts.action)

      // await sideMenuPage.selectSideBarCategory('login')
      await mainPage.clickCollectionButton('login')
      await createOrEditPage.fillCreateOrEditInput('title', 'AAA')
      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)

      await sideMenuPage.selectSideBarCategory('identity')
      await mainPage.clickCollectionButton('identity')
      await createOrEditPage.fillCreateOrEditInput('title', 'BBB')
      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)

      // await sideMenuPage.selectSideBarCategory('all')

    })

    await test.step('CHECK TWO ELEMENTS WITHIN DIFFERENT TABS. DELETE BOTH', async () => {
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

    /**
     * @qase.id PAS-869
     * @description "Multiple Selection" button is not displayed when there are no items
     */
    await test.step('VERIFY MULTIPLE SELECTION BUTTON IS NOT VISIBLE', async () => {
      await mainPage.verifyMultipleSelectiontButtonIsNotVisible()
    })

    await test.step('CREATE ONE ELEMENT', async () => {
      await sideMenuPage.selectSideBarCategory('all')
      await utilities.deleteAllElements()
      await page.waitForTimeout(testData.timeouts.action)

      await sideMenuPage.selectSideBarCategory('login')
      await mainPage.clickCollectionButton('login')
      await createOrEditPage.fillCreateOrEditInput('title', 'AAA')
      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)

      // await mainPage.clickMultipleSelectiontButton()
      // await mainPage.verifyElementisChecked(0)

    })

    /**
     * @qase.id PAS-1084
     * @description It is possible to cancel "Multiple selection" mode
     */
    await test.step('SELECT ELEMENT AND CANCEL MULTIPLE SELECTION', async () => {
      await mainPage.clickMultipleSelectiontButton()
      await page.waitForTimeout(testData.timeouts.action)
      await mainPage.clickElementByPosition(0, 'AAA')
      await mainPage.clickMultipleSelectCancelButon()
    })

    /**
     * @qase.id PAS-1083
     * @description "Delete" button is active only when an item is selected
     */
    await test.step('SELECT ELEMENT AND VERIFY DELETE BUTTON IS ACTIVE', async () => {
      await mainPage.clickMultipleSelectiontButton()
      await page.waitForTimeout(testData.timeouts.action)
      await mainPage.clickElementByPosition(0, 'AAA')
      await mainPage.verifyMultipleSelectDeleteButtonIsEnabled()
      await page.waitForTimeout(testData.timeouts.action)
      await mainPage.clickMultipleSelectCancelButon()
      await page.waitForTimeout(testData.timeouts.action)
    })

    /**
     * @qase.id PAS-1226
     * @description It is possible to place simultaneously several items to a folder
     */
    await test.step('CREATE AND MOVE TO FOLDER', async () => {
      await mainPage.clickMultipleSelectiontButton()
      await page.waitForTimeout(testData.timeouts.action)
      await mainPage.clickElementByPosition(0, 'AAA')

      await mainPage.clickMultipleSelectMoveButon()
      await page.waitForTimeout(testData.timeouts.action)

      await mainPage.clickCreateNewFoldertButton()
      await mainPage.fillCreateNewFolderInput('Test Folder')
      await mainPage.clickCreateFoldertButton()
      // await page.waitForTimeout(testData.timeouts.action)

    })

    //TODO: Add element verification

    await test.step('VERIFY ELEMENT FOLDER NAME', async () => {
      await mainPage.verifyElementFolderName('Test Folder')
    })

    await test.step('DELETE ELEMENT FOLDER', async () => {
      await sideMenuPage.deleteFolder('Test Folder')
    })

  })

})
