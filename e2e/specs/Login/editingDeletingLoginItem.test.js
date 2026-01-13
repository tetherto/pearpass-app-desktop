'use strict'

const { test, expect } = require('../../fixtures/app.runner')
const { LoginPage, VaultSelectPage, CreateOrEditPage, SideMenuPage, MainPage, Utilities, DetailsPage } = require('../../components')
const testData = require('../../fixtures/test-data')

test.describe('Editing/Deleting Login Item', () => {
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

  test.afterAll(async ({ app }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Create/Edit/Delete Login item', async ({ page }) => {

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

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('EDIT LOGIN ELEMENT', async () => {
      await createOrEditPage.fillCreateOrEditInput('title', 'Login Title EDITED')

      await createOrEditPage.fillCreateOrEditInput('username', 'Test User EDITED')
      await createOrEditPage.fillCreateOrEditInput('password', 'Test Pass EDITED')
      await createOrEditPage.fillCreateOrEditInput('website', 'https://www.website1.co')
      await createOrEditPage.fillCreateOrEditInput('note', 'Test Note EDITED')

      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)
    })

    await test.step('OPEN ELEMENT)', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-583
     * @description Changes after editing all "Login" item fields including folder destination correspond to entered fields' values
     */
    await test.step('VERIFY EDITED LOGIN DETAILS', async () => {
      await detailsPage.verifyItemDetailsValue('Email or username', 'Test User EDITED')
      await detailsPage.verifyItemDetailsValue('Password', 'Test Pass EDITED')
      await detailsPage.verifyItemDetailsValue('https://', 'https://www.website1.co')
      await detailsPage.verifyItemDetailsValue('Add note', 'Test Note EDITED')
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    /**
     * @qase.id PAS-584
     * @description Additional "Website" and custom "Note" fields are deleted after deleting them during editing "Login" item
     */
    await test.step('EDIT LOGIN ELEMENT - Add Website/Custom Note item and delete them during editing "Login" item', async () => {
      await createOrEditPage.clickOnCreateOrEditButton('addwebsite')
      // await createOrEditPage.countItems('https://', 3)
      await createOrEditPage.clickOnCreateOrEditButton('removewebsite')
      // await createOrEditPage.countItems('https://', 2)

      await createOrEditPage.clickCreateCustomItem()
      await createOrEditPage.clickCustomItemOptionNote()
      await expect(createOrEditPage.customNoteInput).toHaveCount(1);
      await createOrEditPage.deleteCustomNote();
      await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    })

    await test.step('EDIT LOGIN ELEMENT - delete all items fields except title', async () => {
      await createOrEditPage.fillCreateOrEditInput('username', '')
      await createOrEditPage.fillCreateOrEditInput('password', '')
      await createOrEditPage.fillCreateOrEditInput('website', '')
      await createOrEditPage.fillCreateOrEditInput('note', '')

      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-575
     * @description Empty fields are not displayed in view mode
     */
    await test.step('VERIFY LOGIN ELEMENT EDITED AND EMPTY EXCEPT WEBSITE', async () => {
      await detailsPage.verifyItemDetailsValue('https://', '')
      await detailsPage.verifyItemDetailsValueIsNotVisible('Email or username')
      await detailsPage.verifyItemDetailsValueIsNotVisible('Password')
      await detailsPage.verifyItemDetailsValueIsNotVisible('Add note')
    })

    /**
     * @qase.id PAS-585
     * @description "Login" item is deleted after deleting it
     */
    await test.step('DELETE LOGIN ITEM', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickDeleteElement()
      await detailsPage.clickConfirmYes()
    })

    await test.step('VERIFY LOGIN ELEMENT IS NOT VISIBLE', async () => {
      await mainPage.verifyElementIsNotVisible()
    })

    /**
     * @qase.id PAS-1240
     * @description All items are displayed on the Home screen after deleting an item
     */
    await test.step('VERIFY COLLECTION IS EMPTY', async () => {
      await sideMenuPage.selectSideBarCategory('all')
      await expect(mainPage.collectionEmptySubText).toBeVisible()
    })

  })

})
