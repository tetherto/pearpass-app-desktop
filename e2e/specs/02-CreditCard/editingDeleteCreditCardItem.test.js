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


test.describe('Editing/Deleting Credit Card Item', () => {
  test.describe.configure({ mode: 'serial' });

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page;

  test.beforeAll(async ({ app }) => {
    page = await app.getPage();
    const root = page.locator('body');

    loginPage = new LoginPage(root);
    vaultSelectPage = new VaultSelectPage(root);
    mainPage = new MainPage(root);
    sideMenuPage = new SideMenuPage(root);
    createOrEditPage = new CreateOrEditPage(root);
    utilities = new Utilities(root);
    detailsPage = new DetailsPage(root);

    await loginPage.loginToApplication(testData.credentials.validPassword);
    await vaultSelectPage.selectVaultbyName(testData.vault.name);

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
    await mainPage.verifyElementTitle('Credit Card Title')

    await page.waitForTimeout(testData.timeouts.action);
  });

  test.beforeEach(async ({ app }) => {
    page = await app.getPage();
    const root = page.locator('body');
    loginPage = new LoginPage(root);
    vaultSelectPage = new VaultSelectPage(root);
    mainPage = new MainPage(root);
    sideMenuPage = new SideMenuPage(root);
    createOrEditPage = new CreateOrEditPage(root);
    utilities = new Utilities(root);
    detailsPage = new DetailsPage(root);
  });

  test.afterAll(async ({ app }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Verify that edited "Credit Card" item fields are saved correctly', async () => {
    qase.id(2130);
    await mainPage.openElementDetails();
    await detailsPage.editElement();
    await createOrEditPage.fillCreateOrEditInput('fullname', '')
    await createOrEditPage.fillCreateOrEditInput('number', '')
    await createOrEditPage.fillCreateOrEditInput('expiredate', '')
    await createOrEditPage.fillCreateOrEditInput('securitycode', '')
    await createOrEditPage.fillCreateOrEditInput('pincode', '')
    await createOrEditPage.fillCreateOrEditInput('note', '')
    await createOrEditPage.clickOnCreateOrEditButton('save')

  });

  // test('Verify that deleted "Website" and custom "Note" fields are not saved in the edited "Credit Card" item', async () => {
    // qase.id(2035);
  //   await detailsPage.editElement();

  //   // Delete website field
  //   await createOrEditPage.clickOnCreateOrEditButton('addwebsite');
  //   await createOrEditPage.clickOnCreateOrEditButton('removewebsite');

  //   // Delete custom note field
  //   await createOrEditPage.clickCreateCustomItem();
  //   await createOrEditPage.clickCustomItemOptionNote();
  //   await expect(createOrEditPage.customNoteInput).toHaveCount(1);
  //   await createOrEditPage.deleteCustomNote();
  //   await expect(createOrEditPage.customNoteInput).toHaveCount(0);
  // });

  test('Empty fields are not displayed in view mode', async ({ page }) => {
    qase.id(2131);
    await mainPage.openElementDetails();
    await detailsPage.verifyItemDetailsValueIsNotVisible('Full name');
    await detailsPage.verifyItemDetailsValueIsNotVisible('1234 1234 1234 1234');
    await detailsPage.verifyItemDetailsValueIsNotVisible('MM YY');
    await detailsPage.verifyItemDetailsValueIsNotVisible('123');
    await detailsPage.verifyItemDetailsValueIsNotVisible('1234');
    await detailsPage.verifyItemDetailsValueIsNotVisible('Add comment');
    await mainPage.clickDetailsCloseButton();
  });

  test('Verify that deleted custom "Note" fields are not saved in the edited "Credit Card" item', async () => {
    qase.id(2132);
    await detailsPage.editElement()
    await createOrEditPage.clickCreateCustomItem()
    await createOrEditPage.clickCustomItemOptionNote()
    await expect(createOrEditPage.customNoteInput).toHaveCount(1);
    await createOrEditPage.deleteCustomNote();
    await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    await createOrEditPage.clickElementItemCloseButton()
  })

  test('Verify that the "Credit Card" item is removed after deletion', async () => {
    qase.id(2133);
    await utilities.deleteAllElements()
    await mainPage.verifyElementIsNotVisible();
  });

  test('Verify that the empty collection view is displayed on the Home screen after deleting the last item', async () => {
    qase.id(2134);
    await sideMenuPage.selectSideBarCategory('all');
    await expect(mainPage.emptyCollectionView).toBeVisible();
  });

});