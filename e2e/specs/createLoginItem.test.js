'use strict'

const { test, expect } = require('../fixtures/app.runner')
const { LoginPage, VaultSelectPage, MainView, CreateLoginPage } = require('../components')
const testData = require('../fixtures/test-data')

test.describe('Creating Login Item', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, mainView, createLoginPage, page

  test.beforeAll(async ({ app }) => {
    page = app.page
    loginPage = new LoginPage(page.locator('body'))
    vaultSelectPage = new VaultSelectPage(page.locator('body'))
    mainView = new MainView(page.locator('body'))
    createLoginPage = new CreateLoginPage(page.locator('body'))
  })

  /**
   * @qase.id PAS-563
   * @description "Login" item is created after fulfilling fields
   * Verify vault selection screen displays correctly
   */
  test('PAS-563: "Login" item is created after fulfilling fields', async ({ page }) => {

    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })
  
    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
      
    })
  
    await test.step('CREATE LOGIN ITEM - initial empty item', async () => {
      await mainView.selectSideBarCategory('login')
      await mainView.clickCreateNewElementButton('Create a login')
  
      await createLoginPage.enterTitle('Test Title')
      await createLoginPage.clickSave()
    })
  
    await test.step('OPEN & EDIT ITEM - fill fields', async () => {
      await mainView.openItem()
      await mainView.editItem()
  
      await createLoginPage.enterTitle('Login Title')
      await createLoginPage.enterEmailOrUsername('Test User')
      await createLoginPage.enterPassword('Test Pass')
      await createLoginPage.enterWebsite('www.website.co')
      await createLoginPage.enterNote('Test Note')
  
      await createLoginPage.clickSave()
      await page.waitForTimeout(2000)
    })
  
    await test.step('VERIFY LOGIN ITEM CREATED', async () => {
      await mainView.verifyLoginItemUsername()
    })
  
    await test.step('DELETE ITEM', async () => {
      await mainView.openThreeDotsMenu()
      await mainView.clickDeleteItem()
      await mainView.clickConfirmYes()
    })
  
    await test.step('VERIFY COLLECTION EMPTY', async () => {
      await expect(mainView.collectionEmptySubText).toBeVisible()
    })
  
  })
  
})
