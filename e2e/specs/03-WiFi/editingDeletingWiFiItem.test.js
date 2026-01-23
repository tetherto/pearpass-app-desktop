'use strict'

const { test, expect } = require('../../fixtures/app.runner')
const { LoginPage, VaultSelectPage, CreateOrEditPage, SideMenuPage, MainPage, Utilities, DetailsPage } = require('../../components')
const testData = require('../../fixtures/test-data')

test.describe('Editing/Deleting WiFi Item', () => {
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

  test('Create/Edit/Delete WiFi item', async ({ page }) => {

    await test.step('CREATE WIFI ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('wifiPassword')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Save a Wi-fi')

      await createOrEditPage.fillCreateOrEditInput('wifiname', 'WiFi Title')
      await createOrEditPage.fillCreateOrEditInput('wifipassword', 'WiFi Pass')
      await createOrEditPage.fillCreateOrEditInput('note', 'WiFi Note')

      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('VERIFY WIFI ELEMENT IS CREATED', async () => {
      await mainPage.verifyElementTitle('WiFi Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('EDIT WIFI ELEMENT', async () => {
      await createOrEditPage.fillCreateOrEditInput('wifiname', 'WiFi Title Edited')
      await createOrEditPage.fillCreateOrEditInput('wifipassword', 'WiFi Pass Edited')
      await createOrEditPage.fillCreateOrEditInput('note', 'WiFi Note Edited')

      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('VERIFY EDITED WIFI TITLE IS EDITED', async () => {
      await mainPage.verifyElementTitle('WiFi Title Edited')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-624
     * @description Changes after editing all "Wi-Fi" item fields including folder destination correspond to entered fields' values
     */
    await test.step('VERIFY EDITED WIFI DETAILS', async () => {
      await detailsPage.verifyTitle('WiFi Title Edited');
      await detailsPage.verifyItemDetailsValue('Password', 'WiFi Pass Edited')
      await detailsPage.verifyItemDetailsValue('Add note', 'WiFi Note Edited')
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    /**
     * @qase.id PAS-625
     * @description Custom "Note" field is deleted after deleting it during editing "Wi-Fi" item
     */
    await test.step('EDIT WIFI ELEMENT - Add/Delete Custom "Note" field during editing "Credit Card" item', async () => {
      await createOrEditPage.clickCreateCustomItem()
      await createOrEditPage.clickCustomItemOptionNote()
      await expect(createOrEditPage.customNoteInput).toHaveCount(1);
      await createOrEditPage.deleteCustomNote();
      await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

    /**
     * @qase.id PAS-626
     * @description "Wi-Fi" item is deleted after deleting it
     */
    await test.step('DELETE WIFI ITEM', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickDeleteElement()
      await detailsPage.clickConfirmYes()
    })

    await test.step('VERIFY WIFI ELEMENT IS NOT VISIBLE', async () => {
      await mainPage.verifyElementIsNotVisible()
    })

  })

})