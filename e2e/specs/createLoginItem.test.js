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

  test.afterAll(async ({ app }) => {
    await mainView.deleteElementFromViewMode()
    await mainView.clickSidebarExitButton()
  })

  test('Login item is created after fulfilling fields', async ({ page }) => {
    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })
    /**
     * @qase.id PAS-563
     * @description "Login" item is created after fulfilling fields
     */  
    await test.step('CREATE LOGIN ELEMENT - initial empty element collection', async () => {
      await mainView.selectSideBarCategory('login')
      await mainView.clickCreateNewElementButton('Create a login')

      await createLoginPage.enterTitle('Test Title')
      await createLoginPage.clickSave()
    })

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainView.verifyElement('Test Title')
    })

    /**
     * @qase.id PAS-575
     * @description Empty fields are not displayed in view mode
     */
    await test.step('OPEN LOGIN ELEMENT AND VERIFY LOGIN ELEMENT ITEMS', async () => {
      await mainView.openElement()
      await mainView.verifyLoginElementItemWebAddressIsVisible()
      await mainView.verifyLoginElementItemUsernameNotVisible()
      await mainView.verifyLoginElementItemPasswordNotVisible()
      await mainView.verifyLoginElementItemNoteIsNotVisible()
    })

    /**
     * @qase.id PAS-583
     * @description Changes after editing all "Login" item fields including folder destination correspond to entered fields' values
     */
    await test.step('EDIT LOGIN ELEMENT - fill all items fields', async () => {
      await mainView.editElement()
      await createLoginPage.enterTitle('Login Title')
      await createLoginPage.enterEmailOrUsername('Test User')
      await createLoginPage.enterPassword('Test Pass')
      await createLoginPage.enterWebsite('www.website.co')
      await createLoginPage.enterNote('Test Note')

      await createLoginPage.clickSave()
    })

    await test.step('VERIFY SUCCESSFUL CREATION OF THE LOGIN ITEM AND VALIDATION OF ALL ELEMENT VALUES', async () => {
      await mainView.verifyElement('Login Title')
      await mainView.verifyLoginElementItemUsername('Test User')
      await mainView.verifyLoginElementItemPassword('Test Pass')
      await mainView.verifyLoginElementItemWebAddress('https://www.website.co')
      await mainView.verifyLoginElementItemNote('Test Note')
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await mainView.clickSidebarExitButton()
    })

  })

  test('Password visibility icon of "Password" field displays/hides value', async ({ page }) => {

    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })

    /**
     * @qase.id PAS-576
     * @description "Password visibility" icon of "Password" field displays/hides value
     */
    await test.step('OPEN LOGIN ELEMENT AND VERIFY PASSWORD SHOW/HIDE', async () => {
      await mainView.openElement()
      await expect(mainView.elementItemPassword).toHaveAttribute('type', 'password');
      await mainView.clickShowHidePasswordButton()
      await expect(mainView.elementItemPassword).toHaveAttribute('type', 'text');
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await mainView.clickSidebarExitButton()
    })

  })

  test('PAS-942: Adding Custom Field with Note option', async ({ page }) => {

    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })

    await test.step('OPEN/EDITLOGIN ELEMENT', async () => {
      await mainView.openElement()
      await mainView.editElement()
    })

    /**
     * @qase.id PAS-942
     * @description It is possible to add fields
     */
    await test.step('OPEN CREATE CUSTOM MENU', async () => {
      await createLoginPage.clickCreateCustomItem()
    })

    await test.step('CLICK ON NOTE OPTION FROM CREATE CUSTOM MENU', async () => {
      await createLoginPage.clickCustomItemOptionNote();
    })

    await test.step('VERIFY THERE IS ONE NEW CUSTOM NOTES ITEMS INSIDE LOGIN ELEMENT', async () => {
      await expect(createLoginPage.customNoteInput).toHaveCount(1);
    })

    /**
     * @qase.id PAS-943
     * @description It is possible to delete additional fields
     */
    await test.step('DELETE NEW CUSTOM NOTE ITEM', async () => {
      await createLoginPage.deleteCustomNote();
    })

    await test.step('VERIFY THERE IS NO CUSTOM NOTES ITEMS INSIDE LOGIN ELEMENT', async () => {
      await expect(createLoginPage.customNoteInput).toHaveCount(0);
    })

    /**
     * @qase.id PAS-945
     * @description It is possible to close the screen by clicking on the "Cross" icon
     */
    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createLoginPage.clickElementItemCloseButton()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await mainView.clickSidebarExitButton()
    })

  })

  test('Upload file to Login Items', async ({ page }) => {

    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainView.verifyElement('Login Title')
    })

    await test.step('OPEN/EDITLOGIN ELEMENT', async () => {
      await mainView.openElement()
      await mainView.editElement()
    })

    await test.step('CLICK LOAD FILE BUTTON', async () => {
      await createLoginPage.clickLoadFileButton()
    })

    await test.step('UPLOAD FILE', async () => {
      await createLoginPage.uploadFile()
    })

    /**
   * @qase.id PAS-901
   * @description It is possible to view uploaded files in "Edit" mode
   */
    await test.step('VERIFY UPLOADED FILE IS VISIBLE INSIDE LOGIN ITEMS', async () => {
      await createLoginPage.verifyUploadedFileIsVisible()
    })

    await test.step('OPEN UPLOADED FILE', async () => {
      await createLoginPage.clickOnUploadedFile()
    })

    await test.step('VERIFY UPLOADED IMAGE', async () => {
      await createLoginPage.verifyUploadedImageIsVisible()
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createLoginPage.clickElementItemCloseButton()
    })

    await test.step('CLICK SAVE BUTTON', async () => {
      await createLoginPage.clickSave()
    })

    /**
   * @qase.id PAS-960
   * @description It is possible to view uploaded files in "View" mode
   */
    await test.step('VERIFY UPLOADED FILE IS VISIBLE INSIDE LOGIN ITEMS', async () => {
      await mainView.verifyUploadedFileIsVisible()
    })

    await test.step('CLICK SAVE BUTTON', async () => {
      await mainView.clickOnUploadedFile()
    })

    await test.step('VERIFY UPLOADED IMAGE IS VISIBLE', async () => {
      await mainView.verifyUploadedImageIsVisible()
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createLoginPage.clickElementItemCloseButton()
    })

    await test.step('CLICK EDIT BUTTON', async () => {
      await mainView.editElement()
    })

    await test.step('CLICK DELETE FILE BUTTON', async () => {
      await createLoginPage.clickDeleteFileButton()
    })

    await test.step('VERIFY UPLOADED FILE NOT VISIBLE', async () => {
      await createLoginPage.verifyUploadedImageIsNotVisible()
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createLoginPage.clickElementItemCloseButton()
    })

  })

})
