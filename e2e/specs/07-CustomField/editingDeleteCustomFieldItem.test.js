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

test.describe('Editing/Deleting Custom Field Item', () => {
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

  test('Create/Edit/Delete Custom Field item', async ({ page }) => {

    await test.step('CREATE CUSTOM FIELD ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('custom')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Create a custom element')

      await createOrEditPage.fillCreateOrEditInput('title', 'Custom Field Title')

      // await createOrEditPage.fillCreateOrEditTextArea('note', 'Test Note Text')

      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)

    })

    await test.step('VERIFY CUSTOM FIELD ELEMENT IS CREATED', async () => {
      await mainPage.verifyElementTitle('Custom Field Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('EDIT NOTE ELEMENT', async () => {
      await createOrEditPage.fillCreateOrEditInput('title', 'EDITED Custom Field Title')

      // await createOrEditPage.fillCreateOrEditTextArea('note', 'EDITED ')

      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('VERIFY EDITED NOTE TITLE IS EDITED', async () => {
      await mainPage.verifyElementTitle('EDITED Custom Field Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-665
     * @description Changes after editing all "Custom" item fields including folder destination correspond to entered fields' values
     */
    await test.step('VERIFY EDITED NOTE DETAILS', async () => {
      await detailsPage.verifyTitle('EDITED Custom Field Title');
      // await detailsPage.verifyNoteText('EDITED Test Custom Field Text')
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    /**
     * @qase.id PAS-666
     * @description Custom "Note" field is deleted after deleting it during editing "Credit Card" item
     */
    await test.step('EDIT NOTE ELEMENT - Add/Delete Custom "Note" field during editing "Credit Card" item', async () => {
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
     * @qase.id PAS-667
     * @description "Custom" item is deleted after deleting it
     */
    await test.step('DELETE NOTE ITEM', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickDeleteElement()
      await detailsPage.clickConfirmYes()
    })

    await test.step('VERIFY NOTE ELEMENT IS NOT VISIBLE', async () => {
      await mainPage.verifyElementIsNotVisible()
    })

  })

})