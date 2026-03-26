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

test.describe('Editing/Deleting Note Item', () => {
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

    await sideMenuPage.selectSideBarCategory('note')
    await utilities.deleteAllElements()
    await mainPage.clickCreateNewElementButton('Create a note')

    await createOrEditPage.fillCreateOrEditInput('title', 'Note Title')

    await createOrEditPage.fillCreateOrEditTextArea('note', 'Test Note Text')

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

  test('Verify that edited "Note" item fields are saved correctly', async () => {
    qase.id(2262);
    await mainPage.openElementDetails();
    await detailsPage.editElement();
    await createOrEditPage.fillCreateOrEditInput('title', 'EDITED Note Title');
    await createOrEditPage.fillCreateOrEditTextArea('note', 'EDITED Test Note Text');
    await createOrEditPage.clickOnCreateOrEditButton('save');
    await page.waitForTimeout(testData.timeouts.action);
    await mainPage.openElementDetails();
    await detailsPage.verifyTitle('EDITED Note Title');
    await detailsPage.verifyNoteText('EDITED Test Note Text')
  });

  // test('Verify that custom "Note" fields are not saved in the edited "Note" item', async () => {
  //   // qase.id(2263);
  //   await detailsPage.editElement();
  //   await createOrEditPage.clickCreateCustomItem();
  //   await createOrEditPage.clickCustomItemOptionNote();
  //   await expect(createOrEditPage.customNoteInput).toHaveCount(1);
  //   await createOrEditPage.deleteCustomNote();
  //   await expect(createOrEditPage.customNoteInput).toHaveCount(0);
  // });

  // test('Empty fields are not displayed in view mode', async () => {
  //   // qase.id(2264);
  //   await createOrEditPage.fillCreateOrEditTextArea('note', '');
  //   await mainPage.openElementDetails();
  //   await detailsPage.verifyItemDetailsValue('https://', '');
  //   await detailsPage.verifyItemDetailsValueIsNotVisible('Email or username');
  //   await detailsPage.verifyItemDetailsValueIsNotVisible('Password');
  //   await detailsPage.verifyItemDetailsValueIsNotVisible('Add comment');
  //   await mainPage.clickDetailsCloseButton();
  // });

  test('Verify that the "Login" item is removed after deletion', async () => {
    qase.id(2265);
    await utilities.deleteAllElements()
    await mainPage.verifyElementIsNotVisible();
  });

  test('Verify that the empty collection view is displayed on the Home screen after deleting the last item', async () => {
    qase.id(2266);
    await sideMenuPage.selectSideBarCategory('all');
    await expect(mainPage.emptyCollectionView).toBeVisible();
  });

});
