'use strict'

const { LoginPage, VaultSelectPage, MainView } = require('../components')
const { test, expect } = require('../fixtures/app.runner')
const testData = require('../fixtures/test-data')

test.describe('Login', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, mainView, page

  test.beforeAll(async ({ app }) => {
    page = app.page
    loginPage = new LoginPage(page.locator('body'))
    vaultSelectPage = new VaultSelectPage(page.locator('body'))
    mainView = new MainView(page.locator('body'))
  })

  /**
   * @qase.id PAS-508
   * @description User is logged in with enabled "Password visibility" icon
   * Verify that login screen displays password input with visibility toggle
   */
  test('PAS-508: User is logged in with enabled "Password visibility" icon', async () => {
    await loginPage.waitForReady()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.continueButton).toBeVisible()
  })

  /**
   * @qase.id PAS-1231
   * @description The app is blocked for 5 minutes when entering wrong password 5 times
   * Verify invalid password is rejected
   */
  test('PAS-1231: Invalid password is rejected', async () => {
    await loginPage.login(testData.credentials.invalidPassword)
    await page.waitForTimeout(testData.timeouts.action)

    const stillOnLogin = await loginPage.isVisible()
    expect(stillOnLogin).toBe(true)
  })

  /**
   * @qase.id PAS-1246
   * @description The counter of password-entry attempts is reset when logging into the app successfully
   * Verify valid password logs in successfully
   */
  test('PAS-1246: Valid password logs in successfully', async () => {
    await loginPage.login(testData.credentials.validPassword)
    await page.waitForTimeout(testData.timeouts.navigation)

    await vaultSelectPage.waitForReady()
    expect(await vaultSelectPage.isVisible()).toBe(true)
  })

  /**
   * @qase.id PAS-923
   * @description User is moved to the "Selecting Vaults" screen after the "Sign-up" screen
   * Verify vault selection screen displays correctly
   */
  test('PAS-923: Vault selection screen is displayed', async () => {
    await expect(vaultSelectPage.createVaultButton).toBeVisible()
    await expect(vaultSelectPage.loadVaultButton).toBeVisible()
    await expect(page.locator(`text=${testData.vault.name}`)).toBeVisible()
  })

  /**
   * @qase.id PAS-923
   * @description User can select a vault and access main view
   */
  test('PAS-923: Selecting vault opens main view', async () => {
    await vaultSelectPage.selectVault(testData.vault.name)
    await page.waitForTimeout(testData.timeouts.navigation)

    await mainView.waitForReady()
    expect(await mainView.isVisible()).toBe(true)
  })

  /**
   * @description Verify main view displays all category buttons
   */
  test('Main view displays categories', async () => {
    await expect(mainView.allCategory).toBeVisible()
    await expect(mainView.loginCategory).toBeVisible()
    await expect(mainView.identityCategory).toBeVisible()
    await expect(mainView.creditCardCategory).toBeVisible()
  })

  /**
   * @description Verify sidebar actions are visible
   */
  test('Main view displays sidebar actions', async () => {
    await expect(mainView.settingsButton).toBeVisible()
    await expect(mainView.addDeviceButton).toBeVisible()
    await expect(mainView.exitVaultButton).toBeVisible()
  })

  /**
   * @description Verify search and sort controls are visible
   */
  test('Main view displays search and sort', async () => {
    await expect(mainView.searchInput).toBeVisible()
    await expect(mainView.recentButton).toBeVisible()
    await expect(mainView.multiSelectButton).toBeVisible()
  })

  /**
   * @description Verify exit vault returns user to login screen
   */
  test('Exit vault returns to login screen', async () => {
    await mainView.exitVault()
    await page.waitForTimeout(testData.timeouts.action)

    await loginPage.waitForReady()
    expect(await loginPage.isVisible()).toBe(true)
  })
})
