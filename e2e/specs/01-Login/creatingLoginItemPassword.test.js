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

test.describe.only('Password', () => {
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

    // Login and setup vault
    await loginPage.loginToApplication(testData.credentials.validPassword);
    await vaultSelectPage.selectVaultbyName(testData.vault.name);

    // Prepare the environment
    await sideMenuPage.selectSideBarCategory('login');
    await utilities.deleteAllElements();
    await mainPage.clickCreateNewElementButton('Create a login');

    // Create a new login item
    await createOrEditPage.fillCreateOrEditInput('title', 'Login Title');
    await createOrEditPage.fillCreateOrEditInput('username', 'Test User');
    await createOrEditPage.fillCreateOrEditInput('password', 'Test Pass');
    await createOrEditPage.fillCreateOrEditInput('website', 'https://www.website.co');
    await createOrEditPage.fillCreateOrEditInput('note', 'Test Note');
    await createOrEditPage.clickOnCreateOrEditButton('save');

    await page.waitForTimeout(testData.timeouts.action);
  });

  test.beforeEach(async () => {
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
    try {
      if (utilities) await utilities.deleteAllElements();
      if (sideMenuPage) await sideMenuPage.clickSidebarExitButton();
    } catch (e) {
      // Browser/page može biti već zatvoren kada se više describe blokova izvršava u istom workeru
      if (!e.message?.includes('closed') && !e.message?.includes('Target page')) throw e;
    }
  });

  test('Verify that the password was changed to a generic password, with "Safe" strength as the default option.', async () => {
    qase.id(2000);

    await mainPage.openElementDetails();
    await detailsPage.editElement();

    await createOrEditPage.openPasswordMenu();
    await createOrEditPage.clickInsertPasswordButton();
    await createOrEditPage.clickShowHidePasswordButtonLast();
    await createOrEditPage.verifyPasswordToNotHaveValue('Test Password');
  });

  test('Verify that password strength updates when the "special characters" switch is toggled', async () => {
    qase.id(2001);

    await createOrEditPage.openPasswordMenu();

    // Initial state
    await createOrEditPage.verifyRadioButtonPasswordState('active');
    await createOrEditPage.verifyRadioButtonPassphraseState('inactive');
    await createOrEditPage.verifyCharsliderByPositionNumber('8');
    await createOrEditPage.verifySpecialCharactersSwitchByState('on');
    await createOrEditPage.verifyPasswordStrenght('success', 'success', 'Safe');

    // Toggle off
    await createOrEditPage.clickSwitchByState('on');
    await createOrEditPage.verifySpecialCharactersSwitchByState('off');
    await createOrEditPage.verifyPasswordStrenght('warning', 'warning', 'Weak');

    // Toggle on again
    await createOrEditPage.clickSwitchByState('off');
    await createOrEditPage.verifySpecialCharactersSwitchByState('on');
    await createOrEditPage.verifyPasswordStrenght('success', 'success', 'Safe');

    // Close menus
    await createOrEditPage.clickElementItemCloseButton();
    await createOrEditPage.clickElementItemCloseButton();
  });
});