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

    await test.step('CREATE LOGIN ELEMENT - initial empty element collection', async () => {
      await mainView.selectSideBarCategory('login')
      await mainView.clickCreateNewElementButton('Create a login')

      await createLoginPage.enterTitle('Test Title')
      await createLoginPage.clickSave()
    })

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainView.verifyElement('Test Title')
    })

    // PAS-575
    await test.step('OPEN LOGIN ELEMENT AND VERIFY LOGIN ELEMENT ITEMS', async () => {
      await mainView.openElement()
      await mainView.verifyLoginElementItemWebAddressIsVisible()
      await mainView.verifyLoginElementItemUsernameNotVisible()
      await mainView.verifyLoginElementItemPasswordNotVisible()
      await mainView.verifyLoginElementItemNoteIsNotVisible()
    })

    await test.step('EDIT LOGIN ELEMENT - fill all items fields', async () => {
      await mainView.editElement()
      await createLoginPage.enterTitle('Login Title')
      await createLoginPage.enterEmailOrUsername('Test User')
      await createLoginPage.enterPassword('Test Pass')
      await createLoginPage.enterWebsite('www.website.co')
      await createLoginPage.enterNote('Test Note')

      await createLoginPage.clickSave()
      await page.waitForTimeout(2000)
    })

    await test.step('VERIFY LOGIN ELEMENT ITEMS ARE CREATED AND ITEM VALUES', async () => {
      await mainView.verifyLoginElementItemUsername()
      await mainView.verifyLoginElementItemPassword('Test Pass')
      await mainView.verifyLoginElementItemWebAddress()
      await mainView.verifyLoginElementItemNote()
    })

    await test.step('Exit to login screen', async () => {
      await mainView.clickSidebarExitButton()
    })

    // await test.step('DELETE ELEMENT', async () => {
    //   await mainView.openItemBarThreeDotsDropdownMenu()
    //   await mainView.clickDeleteElement()
    //   await mainView.clickConfirmYes()
    // })

    // await test.step('VERIFY COLLECTION IS EMPTY', async () => {
    //   await expect(mainView.collectionEmptySubText).toBeVisible()
    // })

  })

  test('PAS-567: "Password visibility" icon of "Password" field displays/hides value', async ({ page }) => {

    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })

    // await test.step('CREATE LOGIN ELEMENT - initial empty element collection', async () => {
    //   await mainView.selectSideBarCategory('login')
    //   await mainView.clickCreateNewElementButton('Create a login')

    //   await createLoginPage.enterTitle('Test Title')
    //   await createLoginPage.enterPassword('Test Password')

    //   await createLoginPage.clickSave()
    // })

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainView.verifyElement('Login Title')
    })

    await test.step('OPEN LOGIN ELEMENT AND VERIFY PASSWORD SHOW/HIDE', async () => {
      await mainView.openElement()
      await expect(mainView.elementItemPassword).toHaveAttribute('type', 'password');
      await mainView.clickShowHidePasswordButton()
      await expect(mainView.elementItemPassword).toHaveAttribute('type', 'text');
    })

    await test.step('Exit to login screen', async () => {
      await mainView.clickSidebarExitButton()
    })

  })

  test('PAS-XXX: Password menu verification', async ({ page }) => {

    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })

    // await test.step('CREATE LOGIN ELEMENT - initial empty element collection', async () => {
    //   await mainView.selectSideBarCategory('login')
    //   await mainView.clickCreateNewElementButton('Create a login')

    //   await createLoginPage.enterTitle('Test Title')
    //   await createLoginPage.enterPassword('Test Password')

    //   await createLoginPage.clickSave()
    // })

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainView.verifyElement('Login Title')
    })

    await test.step('OPEN LOGIN ELEMENT AND VERIFY PASSWORD MENU OPTIONS', async () => {
      await mainView.openElement()
      await mainView.editElement()
      await createLoginPage.openPasswordMenu()
      await createLoginPage.verifyPasswordTypeRadioButtonState('active')
      await createLoginPage.verifyPassphraseTypeRadioButtonState('inactive')
      await createLoginPage.verifyCharSliderIsVisible()
      await createLoginPage.verifyspecialCharacterSwitcherState('on')

    })

    await test.step('Exit to login screen', async () => {
      await createLoginPage.clickElementItemCloseButton()
    })

    await test.step('Exit to login screen', async () => {
      await createLoginPage.clickElementItemCloseButton()
    })

    await test.step('Exit to login screen', async () => {
      await mainView.clickSidebarExitButton()
    })

  })

  test('PAS-566: Password fields value generated by the app is inserted into "Password" field after clicking on "Insert password" button', async ({ page }) => {

    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })

    // await test.step('CREATE LOGIN ELEMENT - initial empty element collection', async () => {
    //   await mainView.selectSideBarCategory('login')
    //   await mainView.clickCreateNewElementButton('Create a login')

    //   await createLoginPage.enterTitle('Test Title')
    //   await createLoginPage.enterPassword('Test Password')

    //   await createLoginPage.clickSave()
    // })

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainView.verifyElement('Login Title')
    })

    await test.step('OPEN PASSWORD MENU', async () => {
      await mainView.openElement()
      await mainView.editElement()
      await createLoginPage.openPasswordMenu()
    })

    await test.step('CLICK INSERT PASSWORD BUTTON', async () => {
      await createLoginPage.clickInsertPasswordButton()
    })

    await test.step('VERIFY PASSWORD VALUE HAS CHANGED', async () => {
      await createLoginPage.clickShowHidePasswordButton()
      await createLoginPage.verifyPasswordToNotHaveValue('Test Password')
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createLoginPage.clickElementItemCloseButton()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await mainView.clickSidebarExitButton()
    })

    // await test.step('DELETE ELEMENT', async () => {
    //   await mainView.openItemBarThreeDotsDropdownMenu()
    //   await mainView.clickDeleteElement()
    //   await mainView.clickConfirmYes()
    // })

    // await test.step('VERIFY COLLECTION IS EMPTY', async () => {
    //   await expect(mainView.collectionEmptySubText).toBeVisible()
    // })

    // await test.step('EXIT TO LOGIN SCREEN', async () => {
    //   await mainView.clickSidebarExitButton()
    // })

  })

  test('PAS-XXX: Adding Custom Field with Note option', async ({ page }) => {

    await test.step('LOGIN', async () => {
      await expect(loginPage.title).toHaveText('Enter your Master password')
      await loginPage.login(testData.credentials.validPassword)
    })

    await test.step('VAULT SELECTION', async () => {
      await expect(vaultSelectPage.title).toHaveText('Select a vault, create a new one or load another one')
      await vaultSelectPage.selectVault(testData.vault.name)
    })

    // await test.step('CREATE LOGIN ELEMENT - initial empty element collection', async () => {
    //   await mainView.selectSideBarCategory('login')
    //   await mainView.clickCreateNewElementButton('Create a login')

    //   await createLoginPage.enterTitle('Test Title')
    //   await createLoginPage.enterPassword('Test Password')

    //   await createLoginPage.clickSave()
    // })

    await test.step('VERIFY LOGIN ELEMENT CREATED', async () => {
      await mainView.verifyElement('Login Title')
    })

    await test.step('OPEN/EDITLOGIN ELEMENT', async () => {
      await mainView.openElement()
      await mainView.editElement()
    })

    await test.step('OPEN CREATE CUSTOM MENU', async () => {
      await createLoginPage.clickCreateCustomItem()
    })

    await test.step('CLICK ON NOTE OPTION FROM CREATE CUSTOM MENU', async () => {
      await createLoginPage.clickCustomItemOptionNote();
      await page.waitForTimeout(3000);
    })

    await test.step('VERIFY THERE IS ONE NEW CUSTOM NOTES ITEMS INSIDE LOGIN ELEMENT', async () => {
      await expect(createLoginPage.customNoteInput).toHaveCount(1);
    })

    await test.step('DELETE NEW CUSTOM NOTE ITEM', async () => {
      await createLoginPage.deleteCustomNote();
    })

    await test.step('VERIFY THERE IS NO CUSTOM NOTES ITEMS INSIDE LOGIN ELEMENT', async () => {
      await expect(createLoginPage.customNoteInput).toHaveCount(0);
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createLoginPage.clickElementItemCloseButton()
    })

    await test.step('DELETE ELEMENT', async () => {
      await mainView.openItemBarThreeDotsDropdownMenu()
      await mainView.clickDeleteElement()
      await mainView.clickConfirmYes()
    })

    await test.step('VERIFY COLLECTION IS EMPTY', async () => {
      await expect(mainView.collectionEmptySubText).toBeVisible()
    })

    await test.step('EXIT TO LOGIN SCREEN', async () => {
      await mainView.clickSidebarExitButton()
    })

  })

})
