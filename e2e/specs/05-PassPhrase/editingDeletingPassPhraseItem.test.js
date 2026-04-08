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
import clipboard from 'clipboardy';
import { qase } from 'playwright-qase-reporter';

test.describe('Editing/Deleting PassPhrase Item', () => {
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

    await sideMenuPage.selectSideBarCategory('passPhrase')
    await utilities.deleteAllElements()
    await mainPage.clickCreateNewElementButton('Save a Recovery phrase')

    await createOrEditPage.fillCreateOrEditInput('title', 'PassPhrase Title')
    await clipboard.write(testData.passphrase.text12)
    await createOrEditPage.clickOnPasteFromClipboard()
    await createOrEditPage.clickOnCreateOrEditButton('save')

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

  test('Verify that edited "PassPhrase" item fields are saved correctly', async () => {
    qase.id(2658);
    await mainPage.openElementDetails();
    await detailsPage.editElement();
    await createOrEditPage.fillCreateOrEditInput('title', 'PassPhrase Title Edited')

    await clipboard.write(testData.passphrase.text24)
    await createOrEditPage.clickOnPasteFromClipboard()
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)

    await mainPage.openElementDetails();

    await detailsPage.verifyTitle('PassPhrase Title Edited')
    await detailsPage.verifyAllRecoveryPhraseWords([
      '#1word1',
      '#2word2',
      '#3word3',
      '#4word4',
      '#5word5',
      '#6word6',
      '#7word7',
      '#8word8',
      '#9word9',
      '#10word10',
      '#11word11',
      '#12word12',
      '#13word13',
      '#14word14',
      '#15word15',
      '#16word16',
      '#17word17',
      '#18word18',
      '#19word19',
      '#20word20',
      '#21word21',
      '#22word22',
      '#23word23',
      '#24word24'
    ]);

  });

  test('Verify that the "PassPhrase" item is removed after deletion', async () => {
    qase.id(2221);
    await utilities.deleteAllElements()
    await mainPage.verifyElementIsNotVisible();
  });

  test('Verify that the empty collection view is displayed on the Home screen after deleting the last item', async () => {
    qase.id(2222);
    await sideMenuPage.selectSideBarCategory('all');
    await expect(mainPage.emptyCollectionView).toBeVisible();
  });

});
