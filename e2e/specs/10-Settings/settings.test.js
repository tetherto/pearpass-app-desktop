import { test, expect } from '../../fixtures/app.runner.js';
import {
  LoginPage,
  VaultSelectPage,
  MainPage,
  SideMenuPage,
  CreateOrEditPage,
  Utilities,
  DetailsPage,
  SettingsPage
} from '../../components/index.js';
import testData from '../../fixtures/test-data.js';
import { qase } from 'playwright-qase-reporter';


test.describe('Settings test', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page, settingsPage

  test.beforeAll(async ({ app }) => {
    page = await app.getPage();
    const root = page.locator('body');
    loginPage = new LoginPage(root);
    vaultSelectPage = new VaultSelectPage(root);
    sideMenuPage = new SideMenuPage(root);
    utilities = new Utilities(root);
    mainPage = new MainPage(root);

    await loginPage.loginToApplication(testData.credentials.validPassword);
    await vaultSelectPage.selectVaultbyName(testData.vault.name);
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
    settingsPage = new SettingsPage(root)
  })

  test.afterAll(async () => {
    if (!utilities || !sideMenuPage) return
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Verify Security Settings', async ({ page }) => {
    qase.id(2605);
    await sideMenuPage.clickSidebarSettingsButton()
    await settingsPage.clickSettingsNavigation('security')
    await settingsPage.verifySettingsCardIsVisible('master-password')
    await settingsPage.verifySettingsCardIsVisible('pearpass-functions')

    await settingsPage.verifySettingsFunction('reminders-switch')
    await settingsPage.verifySettingsFunction('copy-to-clipboard-switch')
    await settingsPage.verifySettingsFunction('auto-logout-dropdown')

    // Remimder Switch
    await settingsPage.clickPearPassFunctionButton('reminders-switch', 'on')
    await settingsPage.verifySwitchIsOnOrOff('reminders-switch', 'off', 'off')
    await settingsPage.clickPearPassFunctionButton('reminders-switch', 'off')
    await settingsPage.verifySwitchIsOnOrOff('reminders-switch', 'on', 'on')

    // Copy-to-clipboard Switch
    await settingsPage.clickPearPassFunctionButton('copy-to-clipboard-switch', 'on')
    await settingsPage.verifySwitchIsOnOrOff('copy-to-clipboard-switch', 'off', 'off')
    await settingsPage.clickPearPassFunctionButton('copy-to-clipboard-switch', 'off')
    await settingsPage.verifySwitchIsOnOrOff('copy-to-clipboard-switch', 'on', 'on')

    // Auto-Logout Dropdown
    await settingsPage.clickPearPassFunctionDropdown('auto-logout-dropdown')
    await page.waitForTimeout(testData.timeouts.action)
    await settingsPage.getPearPassFunctionDropdownOption('seconds_30')
    await settingsPage.getPearPassFunctionDropdownOption('minutes_1')
    await settingsPage.getPearPassFunctionDropdownOption('minutes_5')
    await settingsPage.getPearPassFunctionDropdownOption('minutes_15')
    await settingsPage.getPearPassFunctionDropdownOption('minutes_30')
    await settingsPage.getPearPassFunctionDropdownOption('hours_1')
    await settingsPage.getPearPassFunctionDropdownOption('hours_4')
    await settingsPage.getPearPassFunctionDropdownOption('never')

  })

  test('Verify Syncing Settings', async ({ page }) => {
    qase.id(2606);
    await settingsPage.clickSettingsNavigation('syncing')
    await settingsPage.verifySettingsCardIsVisible('blind-peering')
    await settingsPage.verifySettingsCardIsVisible('browser-extension')
  })

  test('Verify Vault Settings', async ({ page }) => {
    qase.id(2607);
    await settingsPage.clickSettingsNavigation('vault')

    await settingsPage.verifySettingsCardIsVisible('your-vault')
    await settingsPage.verifySettingsCardIsVisible('linked-devices')
    await settingsPage.verifySettingsCardIsVisible('export-vault')
    await settingsPage.verifySettingsCardIsVisible('import-vault')
  })

  test('Verify Appearance Settings', async ({ page }) => {
    qase.id(2608);
    await settingsPage.clickSettingsNavigation('appearance')
    await settingsPage.verifySettingsCardIsVisible('language')
  })

  test('Verify About Settings', async ({ page }) => {
    qase.id(2609);
    await settingsPage.clickSettingsNavigation('about')

      await settingsPage.verifySettingsCardIsVisible('report')
      await settingsPage.verifySettingsCardIsVisible('pearpass-version')

      await settingsPage.clickBackSettingsButton()
  })

})
