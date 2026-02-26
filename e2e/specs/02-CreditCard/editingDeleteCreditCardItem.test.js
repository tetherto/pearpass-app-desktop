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

test.describe('Editing/Deleting Credit Card Item', () => {
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

  test('Create/Edit/Delete Credit Card item', async ({ page }) => {

    await test.step('CREATE CREDIT CARD ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('creditCard')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Create a credit card')

      await createOrEditPage.fillCreateOrEditInput('title', 'Credit Card Title')
      await createOrEditPage.fillCreateOrEditInput('fullname', 'John')
      await createOrEditPage.fillCreateOrEditInput('number', '12312312')
      await createOrEditPage.fillCreateOrEditInput('expiredate', '1212')
      await createOrEditPage.fillCreateOrEditInput('securitycode', '111')
      await createOrEditPage.fillCreateOrEditInput('pincode', '111')
      await createOrEditPage.fillCreateOrEditInput('note', 'Credit Card Note')
      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('VERIFY CREDIT CARD ELEMENT IS CREATED', async () => {
      await mainPage.verifyElementTitle('Credit Card Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('EDIT CREDIT CARD ELEMENT', async () => {
      await createOrEditPage.fillCreateOrEditInput('title', 'EDITED Credit Card Title')
      await createOrEditPage.fillCreateOrEditInput('fullname', 'EDITED John')
      await createOrEditPage.fillCreateOrEditInput('number', '1234 5678')
      await createOrEditPage.fillCreateOrEditInput('expiredate', '0101')
      await createOrEditPage.fillCreateOrEditInput('securitycode', '888')
      await createOrEditPage.fillCreateOrEditInput('pincode', '2222')
      await createOrEditPage.fillCreateOrEditInput('note', 'EDITED Credit Card Note')

      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('VERIFY EDITED CREDIT CARD TITLE IS EDITED', async () => {
      await mainPage.verifyElementTitle('EDITED Credit Card Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-610
     * @description Changes after editing all "Credit Card" item fields including folder destination correspond to entered fields' values
     */
    await test.step('VERIFY EDITED CREDIT CARD DETAILS', async () => {
      await detailsPage.verifyItemDetailsValue('Full name', 'EDITED John');
      await detailsPage.verifyItemDetailsValue('1234 1234 1234 1234 ', '1234 5678')
      await detailsPage.verifyItemDetailsValue('MM YY', '01 01')
      await detailsPage.verifyItemDetailsValue('123', '888')
      await detailsPage.verifyItemDetailsValue('1234', '2222')
      await detailsPage.verifyItemDetailsValue('Add note', 'EDITED Credit Card Note')
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    /**
     * @qase.id PAS-611
     * @description Custom "Note" field is deleted after deleting it during editing "Credit Card" item
     */
    await test.step('EDIT CREDIT CARD ELEMENT - Add/Delete Custom "Note" field during editing "Credit Card" item', async () => {
      await createOrEditPage.clickCreateCustomItem()
      await createOrEditPage.clickCustomItemOptionNote()
      await expect(createOrEditPage.customNoteInput).toHaveCount(1);
      await createOrEditPage.deleteCustomNote();
      await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

    await test.step('CLOSE DETAILS', async () => {
      await mainPage.clickDetailsCloseButton()
    })

    /**
     * @qase.id PAS-612
     * @description "Credit Card" item is deleted after deleting it
     */
    await test.step('DELETE CREDIT CARD ITEM', async () => {
      await utilities.deleteAllElements()
      // await detailsPage.openItemBarThreeDotsDropdownMenu()
      // await detailsPage.clickDeleteElement()
      // await detailsPage.clickConfirmYes()
    })

    await test.step('VERIFY CREDIT CARD ELEMENT IS NOT VISIBLE', async () => {
      await mainPage.verifyElementIsNotVisible()
    })

    await test.step('VERIFY COLLECTION IS EMPTY', async () => {
      await sideMenuPage.selectSideBarCategory('all')
      await expect(mainPage.emptyCollectionView).toBeVisible()
    })

  })

})