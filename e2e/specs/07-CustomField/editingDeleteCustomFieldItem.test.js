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

test.describe('Editing/Deleting Custom Item', () => {
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

    await sideMenuPage.selectSideBarCategory('custom')
    await utilities.deleteAllElements()
    await mainPage.clickCreateNewElementButton('Create a custom element')

    await createOrEditPage.fillCreateOrEditInput('title', 'Custom Field Title')
    await createOrEditPage.clickCreateCustomItem();
    await createOrEditPage.clickCustomItemOptionNote();
    await createOrEditPage.fillCustomNoteInput()

    await createOrEditPage.clickOnCreateOrEditButton('save')

    await page.waitForTimeout(testData.timeouts.action)
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

  test.afterAll(async () => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  });

  test('Verify that edited "Custom" item fields are saved correctly', async () => {
    qase.id(2572);
    await mainPage.openElementDetails();
    await detailsPage.editElement();
    await createOrEditPage.fillCreateOrEditInput('title', 'EDITED Custom Field Title')
    await createOrEditPage.fillCustomNoteInput()
    await page.waitForTimeout(testData.timeouts.action);

    await createOrEditPage.clickOnCreateOrEditButton('save');
    await page.waitForTimeout(testData.timeouts.action);

    await mainPage.openElementDetails();
    await page.waitForTimeout(testData.timeouts.action);
    await mainPage.verifyElementTitle('EDITED Custom Field Title')
    await detailsPage.verifyItemDetailsValue('Add comment', 'Custom Note');
    // Verify Note
  });

  test('Verify that custom "Note" fields are not saved in the edited "Custom" item', async () => {
    qase.id(2573);
    await detailsPage.editElement();
    await createOrEditPage.deleteCustomNote();
    await createOrEditPage.clickOnCreateOrEditButton('save');
    await detailsPage.verifyItemDetailsValueIsNotVisible('Add comment');
  }); 

  test('Verify that the "Custom Field" item is removed after deletion', async () => {
    qase.id(2574);
    await utilities.deleteAllElements()
    await mainPage.verifyElementIsNotVisible();
  });

  test('Verify that the empty collection view is displayed on the Home screen after deleting the last item', async () => {
    qase.id(2575);
    await sideMenuPage.selectSideBarCategory('all');
    await expect(mainPage.emptyCollectionView).toBeVisible();
  });

});
