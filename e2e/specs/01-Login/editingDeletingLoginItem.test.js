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

test.describe('Editing/Deleting Login Item', () => {
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

    await sideMenuPage.selectSideBarCategory('login');
    await utilities.deleteAllElements();
    await mainPage.clickCreateNewElementButton('Create a login');

    await createOrEditPage.fillCreateOrEditInput('title', 'Login Title');
    await createOrEditPage.fillCreateOrEditInput('username', 'Test User');
    await createOrEditPage.fillCreateOrEditInput('password', 'Test Pass');
    await createOrEditPage.fillCreateOrEditInput('website', 'https://www.website.co');
    await createOrEditPage.fillCreateOrEditInput('note', 'Test Note');
    await createOrEditPage.clickOnCreateOrEditButton('save');

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

  test.afterAll(async () => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  });

  test('Verify that edited "Login" item fields are saved correctly', async () => {
    qase.id(2034);
    await mainPage.openElementDetails();
    await detailsPage.editElement();
    await createOrEditPage.fillCreateOrEditInput('title', 'Login Title EDITED');
    await createOrEditPage.fillCreateOrEditInput('username', 'Test User EDITED');
    await createOrEditPage.fillCreateOrEditInput('password', 'Test Pass EDITED');
    await createOrEditPage.fillCreateOrEditInput('website', 'https://www.website1.co');
    await createOrEditPage.fillCreateOrEditInput('note', 'Test Note EDITED');
    await createOrEditPage.clickOnCreateOrEditButton('save');
    await page.waitForTimeout(testData.timeouts.action);
    await mainPage.openElementDetails();
    await detailsPage.verifyItemDetailsValue('Email or username', 'Test User EDITED');
    await detailsPage.verifyItemDetailsValue('Password', 'Test Pass EDITED');
    await detailsPage.verifyItemDetailsValue('https://', 'https://www.website1.co');
    await detailsPage.verifyItemDetailsValue('Add comment', 'Test Note EDITED');
  });

  test('Verify that deleted "Website" and custom "Note" fields are not saved in the edited "Login" item', async () => {
    qase.id(2035);
    await detailsPage.editElement();
    await createOrEditPage.clickOnCreateOrEditButton('addwebsite');
    await createOrEditPage.clickOnCreateOrEditButton('removewebsite');
    await createOrEditPage.clickCreateCustomItem();
    await createOrEditPage.clickCustomItemOptionNote();
    await expect(createOrEditPage.customNoteInput).toHaveCount(1);
    await createOrEditPage.deleteCustomNote();
    await expect(createOrEditPage.customNoteInput).toHaveCount(0);
  });

  test('Empty fields are not displayed in view mode', async () => {
    qase.id(2036);
    await createOrEditPage.fillCreateOrEditInput('username', '');
    await createOrEditPage.fillCreateOrEditInput('password', '');
    await createOrEditPage.fillCreateOrEditInput('website', '');
    await createOrEditPage.fillCreateOrEditInput('note', '');
    await createOrEditPage.clickOnCreateOrEditButton('save');
    await mainPage.openElementDetails();
    await detailsPage.verifyItemDetailsValue('https://', '');
    await detailsPage.verifyItemDetailsValueIsNotVisible('Email or username');
    await detailsPage.verifyItemDetailsValueIsNotVisible('Password');
    await detailsPage.verifyItemDetailsValueIsNotVisible('Add comment');
    await mainPage.clickDetailsCloseButton();
  });

  test('Verify that the "Login" item is removed after deletion', async () => {
    qase.id(2037);
    await utilities.deleteAllElements()
    await mainPage.verifyElementIsNotVisible();
  });

  test('Verify that the empty collection view is displayed on the Home screen after deleting the last item', async () => {
    qase.id(2037);
    await sideMenuPage.selectSideBarCategory('all');
    await expect(mainPage.emptyCollectionView).toBeVisible();
  });

});
