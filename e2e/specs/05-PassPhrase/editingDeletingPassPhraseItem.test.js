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
import clipboard from 'clipboardy';


test.describe('Editing/Deleting PassPhrase Item', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page

  test.beforeAll(async ({ app }) => {
    page = app.page
    loginPage = new LoginPage(page.locator('body'))
    vaultSelectPage = new VaultSelectPage(page.locator('body'))
    mainPage = new MainPage(page.locator('body'))
    sideMenuPage = new SideMenuPage(page.locator('body'))
    createOrEditPage = new CreateOrEditPage(page.locator('body'))
    utilities = new Utilities(page.locator('body'))
    detailsPage = new DetailsPage(page.locator('body'))
  })

  test.beforeEach(async ({ app }) => {
    await loginPage.loginToApplication(testData.credentials.validPassword)
    await vaultSelectPage.selectVaultbyName(testData.vault.name)
  })

  test.afterAll(async ({ app }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Create/Edit/Delete PassPhrase item', async ({ page }) => {

    await test.step('CREATE PASSPHRASE ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('passPhrase')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Save a Recovery phrase')

      await createOrEditPage.fillCreateOrEditInput('title', 'PassPhrase Title')

      await clipboard.write(testData.passphrase.text12)
      await createOrEditPage.clickOnPasteFromClipboard()

      await createOrEditPage.clickOnCreateOrEditButton('save')
    })

    await test.step('VERIFY ELEMENT IS CREATED', async () => {
      await mainPage.verifyElementTitle('PassPhrase Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('VERIFY PASSPHRASE DETAILS', async () => {

      await detailsPage.verifyTitle('PassPhrase Title')

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
        '#12word12'
      ]);

    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('EDIT PASSPHRASE ELEMENT', async () => {
      await createOrEditPage.fillCreateOrEditInput('title', 'PassPhrase Title Edited')

      await clipboard.write(testData.passphrase.text24)
      await createOrEditPage.clickOnPasteFromClipboard()

      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)
    })

    // await test.step('VERIFY EDITED PASSPHRASE TITLE IS EDITED', async () => {
    //   await mainPage.verifyElementTitle('PassPhrase Title Edited')
    // })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-638
     * @description Changes after editing all "PassPhrase" item fields including folder destination correspond to entered fields' values
     */
    await test.step('VERIFY EDITED PASSPHRASE DETAILS', async () => {

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

    })

    // await test.step('EDIT ELEMENT DETAILS', async () => {
    //   await detailsPage.editElement()
    // })

    //TODO: Missing id

    // /**
    //  * @qase.id PAS-639
    //  * @description Custom "Note" field is deleted after deleting it during editing "PassPhrase" item
    //  */
    // await test.step('EDIT PASSPHRASE ELEMENT - Add/Delete Custom "Note" field during editing "Identity" item', async () => {
    //   await createOrEditPage.clickCreateCustomItem()
    //   await createOrEditPage.clickCustomItemOptionNote()
    //   await expect(createOrEditPage.customNoteInput).toHaveCount(1);
    //   await createOrEditPage.deleteCustomNote();
    //   await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    // })

    // await test.step('CLICK CLOSE (X) BUTTON', async () => {
    //   await createOrEditPage.clickElementItemCloseButton()
    // })

    /**
     * @qase.id PAS-640
     * @description "PassPhrase" item is deleted after deleting it
     */
    await test.step('DELETE PASSPHRASE ITEM', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickDeleteElement()
      await detailsPage.clickConfirmYes()
    })

    await test.step('VERIFY PASSPHRASE ELEMENT IS NOT VISIBLE', async () => {
      await mainPage.verifyElementIsNotVisible()
    })

  })

})