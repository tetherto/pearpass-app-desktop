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

test.describe('Editing/Deleting WiFi Item', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page

  test.beforeAll(async ({ app }) => {
    page = await app.getPage();
    const root = page.locator('body');
    loginPage = new LoginPage(root);
    vaultSelectPage = new VaultSelectPage(root);
    sideMenuPage = new SideMenuPage(root);
    createOrEditPage = new CreateOrEditPage(root);
    utilities = new Utilities(root);
    mainPage = new MainPage(root);
    detailsPage = new DetailsPage(root);

    await loginPage.loginToApplication(testData.credentials.validPassword);
    await vaultSelectPage.selectVaultbyName(testData.vault.name);

    await sideMenuPage.selectSideBarCategory('wifiPassword')
    await utilities.deleteAllElements()
    await mainPage.clickCreateNewElementButton('Save a Wi-fi')
    await createOrEditPage.fillCreateOrEditInput('wifiname', 'WiFi Title')
    await createOrEditPage.fillCreateOrEditInput('wifipassword', 'WiFi Pass')
    await createOrEditPage.fillCreateOrEditInput('note', 'WiFi Note')
    await createOrEditPage.clickOnCreateOrEditButton('save')

    await page.waitForTimeout(testData.timeouts.action);
  })

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

  })

  test.afterAll(async ({ }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Verify that edited "WiFi" item fields are saved correctly', async ({ page }) => {
    qase.id(2148);
    await mainPage.openElementDetails();
    await detailsPage.editElement();
    await createOrEditPage.fillCreateOrEditInput('wifiname', 'WiFi Title Edited')
    await createOrEditPage.fillCreateOrEditInput('wifipassword', 'WiFi Pass Edited')
    await createOrEditPage.fillCreateOrEditInput('note', 'WiFi Note Edited')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await mainPage.verifyElementTitle('WiFi Title Edited')
    await page.waitForTimeout(testData.timeouts.action);
    await mainPage.openElementDetails();
    await detailsPage.verifyTitle('WiFi Title Edited');
    await detailsPage.verifyItemDetailsValue('Password', 'WiFi Pass Edited')
    await detailsPage.verifyItemDetailsValue('Add comment', 'WiFi Note Edited')
  })

  test('Verify that deleted custom "Note" fields are not saved in the edited "WiFi" item', async () => {
    qase.id(2149);
    await detailsPage.editElement()
    await createOrEditPage.clickCreateCustomItem()
    await createOrEditPage.clickCustomItemOptionNote()
    await expect(createOrEditPage.customNoteInput).toHaveCount(1);
    await createOrEditPage.deleteCustomNote();
    await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    await createOrEditPage.clickElementItemCloseButton()
  });

  test('Empty fields are not displayed in view mode', async () => {
    qase.id(2150);
    await detailsPage.editElement()
    await createOrEditPage.fillCreateOrEditInput('note', '')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await mainPage.openElementDetails();
    await detailsPage.verifyItemDetailsValueIsNotVisible('Add comment');
    await mainPage.clickDetailsCloseButton();
  });

})