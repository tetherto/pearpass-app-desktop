'use strict'

const { test, expect } = require('../fixtures/app.runner')
const { LoginPage, VaultSelectPage, MainView, CreateLoginPage } = require('../components')
const testData = require('../fixtures/test-data')

test.describe('Editig / Deleting Login Item', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, mainView, createLoginPage, page

  test.beforeAll(async ({ app }) => {
    page = app.page
    loginPage = new LoginPage(page.locator('body'))
    vaultSelectPage = new VaultSelectPage(page.locator('body'))
    mainView = new MainView(page.locator('body'))
    createLoginPage = new CreateLoginPage(page.locator('body'))
  })

  test('Edit Login Element Item', async ({ page }) => {
    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })

    await test.step('CREATE LOGIN ELEMENT', async () => {
      await mainView.selectSideBarCategory('login')
      await mainView.clickCreateNewElementButton('Create a login')
      await createLoginPage.createLoginElementInsertData('Login Title', 'Test User', 'Test Pass', 'www.website.co', 'Test Note')
      await createLoginPage.clickSave()
    })

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainView.verifyElement('Login Title')
    })

    /**
     * @qase.id PAS-583
     * @description Changes after editing all "Login" item fields including folder destination correspond to entered fields' values
     */
    await test.step('OPEN/EDIT LOGIN ELEMENT - fill all items fields', async () => {
      await mainView.openElement()
      await mainView.editElement()
      await createLoginPage.enterTitle('Login Title Edited')
      await createLoginPage.enterEmailOrUsername('Test User Edited')
      await createLoginPage.enterPassword('Test Pass Edited')
      await createLoginPage.enterWebsite('www.website-edited.co')
      await createLoginPage.enterNote('Test Note Edited')

      await createLoginPage.clickSave()
    })

    await test.step('VERIFY LOGIN ELEMENT EDITED', async () => {
      await mainView.verifyElement('Login Title Edited')
    })

    await test.step('VERIFY SUCCESSFUL EDIT OF THE LOGIN ITEM AND VALIDATION OF ALL ELEMENT VALUES', async () => {
      await mainView.verifyElement('Login Title Edited')
      await mainView.verifyLoginElementItemUsername('Test User Edited')
      await mainView.verifyLoginElementItemPassword('Test Pass Edited')
      await mainView.verifyLoginElementItemWebAddress('https://www.website-edited.co')
      await mainView.verifyLoginElementItemNote('Test Note Edited')
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await mainView.clickSidebarExitButton()
    })

  })

  test('Delete Login Element Item', async ({ page }) => {
    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })

    await test.step('OPEN EDIT MENU (VIEW MODE)', async () => {
      await mainView.editElement()
    })
    
    /**
     * @qase.id PAS-585
     * @description "Login" item is deleted after deleting it
     */
    await test.step('DELETE LOGIN ITEM', async () => {
      await mainView.openItemBarThreeDotsDropdownMenu()
      await mainView.clickDeleteElement()
      await mainView.clickConfirmYes()
    })

    await test.step('VERIFY LOGIN ELEMENT IS NOT VISIBLE', async () => {
      await mainView.verifyElementIsNotVisible()
    })

    /**
     * @qase.id PAS-1240
     * @description All items are displayed on the Home screen after deleting an item
     */
    await test.step('VERIFY COLLECTION IS EMPTY', async () => {
      await expect(mainView.collectionEmptySubText).toBeVisible()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await mainView.clickSidebarExitButton()
    })

  })

})
