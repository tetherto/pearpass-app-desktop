'use strict'

const { test, expect } = require('../../fixtures/app.runner')
const { LoginPage, VaultSelectPage, CreateOrEditPage, SideMenuPage, MainPage, Utilities, DetailsPage } = require('../../components')
const testData = require('../../fixtures/test-data')

test.describe('Editing/Deleting Identity Item', () => {
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

  test('Create/Edit/Delete Identity item', async ({ page }) => {

    await test.step('CREATE IDENTITY ELEMENT - initial empty element collection', async () => {
      await sideMenuPage.selectSideBarCategory('identity')
      await utilities.deleteAllElements()
      await mainPage.clickCreateNewElementButton('Create an identity')

      await createOrEditPage.fillCreateOrEditInput('title', 'Identity Title')

      await createOrEditPage.fillCreateOrEditInput('fullname', 'Identity Fullname')
      await createOrEditPage.fillCreateOrEditInput('email', 'identitytest@mail.co')
      await createOrEditPage.fillCreateOrEditInput('phonenumber', '')

      await createOrEditPage.fillCreateOrEditInput('address', 'Identity Address')
      await createOrEditPage.fillCreateOrEditInput('zip', 'Identity Zip')
      await createOrEditPage.fillCreateOrEditInput('city', 'Identity City')
      await createOrEditPage.fillCreateOrEditInput('region', 'Identity Region')
      await createOrEditPage.fillCreateOrEditInput('country', 'Identity Country')

      await createOrEditPage.clickOnIdentitySection('passport')

      await createOrEditPage.fillCreateOrEditInput('passportfullname', 'Identity Passport Fullname')
      await createOrEditPage.fillCreateOrEditInput('passportnumber', 'Identity Passport Number')
      await createOrEditPage.fillCreateOrEditInput('passportissuingcountry', 'Identity Issuing Country')
      await createOrEditPage.fillCreateOrEditInput('passportdateofissue', 'Identity Date of Issue')
      await createOrEditPage.fillCreateOrEditInput('passportexpirydate', '01/01/2020')
      await createOrEditPage.fillCreateOrEditInput('passportnationality', '01/01/2025')
      await createOrEditPage.fillCreateOrEditInput('passportdob', '01/01/1990')
      await createOrEditPage.fillCreateOrEditInput('passportgender', 'Identity Gender')

      await createOrEditPage.clickOnIdentitySection('idcard')

      await createOrEditPage.fillCreateOrEditInput('idcardnumber', 'Identity ID Card Number')
      await createOrEditPage.fillCreateOrEditInput('idcarddateofissue', '01/01/2025')
      await createOrEditPage.fillCreateOrEditInput('idcardexpirydate', '01/01/2030')
      await createOrEditPage.fillCreateOrEditInput('idcardissuingcountry', 'USA')

      await createOrEditPage.clickOnIdentitySection('drivinglicense')

      await createOrEditPage.fillCreateOrEditInput('note', 'Identity Driving License Note')

      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)
    })

    await test.step('VERIFY ELEMENT IS CREATED', async () => {
      await mainPage.verifyElementTitle('Identity Title')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    await test.step('EDIT IDENTITY ELEMENT', async () => {
      await createOrEditPage.fillCreateOrEditInput('title', 'Identity Title Edited')

      await createOrEditPage.fillCreateOrEditInput('fullname', 'Identity Fullname Edited')
      await createOrEditPage.fillCreateOrEditInput('email', 'identitytestedited@mail.co')
      await createOrEditPage.fillCreateOrEditInput('phonenumber', 'Phone Number Edited')

      await createOrEditPage.fillCreateOrEditInput('address', 'Identity Address Edited')
      await createOrEditPage.fillCreateOrEditInput('zip', 'Identity Zip Edited')
      await createOrEditPage.fillCreateOrEditInput('city', 'Identity City Edited')
      await createOrEditPage.fillCreateOrEditInput('region', 'Identity Region Edited')
      await createOrEditPage.fillCreateOrEditInput('country', 'Identity Country Edited')

      await createOrEditPage.clickOnIdentitySection('passport')

      await createOrEditPage.fillCreateOrEditInput('passportfullname', 'Identity Passport Fullname Edited')
      await createOrEditPage.fillCreateOrEditInput('passportnumber', 'Identity Passport Number Edited')
      await createOrEditPage.fillCreateOrEditInput('passportissuingcountry', 'Identity Issuing Country Edited')
      await createOrEditPage.fillCreateOrEditInput('passportdateofissue', 'Identity Date of Issue Edited')
      await createOrEditPage.fillCreateOrEditInput('passportexpirydate', '01/01/2022')
      await createOrEditPage.fillCreateOrEditInput('passportnationality', '01/01/2027')
      await createOrEditPage.fillCreateOrEditInput('passportdob', '01/01/1991')
      await createOrEditPage.fillCreateOrEditInput('passportgender', 'Identity Gender Edited')

      await createOrEditPage.clickOnIdentitySection('idcard')

      await createOrEditPage.fillCreateOrEditInput('idcardnumber', 'Identity ID Card Number Edited')
      await createOrEditPage.fillCreateOrEditInput('idcarddateofissue', '01/01/2026')
      await createOrEditPage.fillCreateOrEditInput('idcardexpirydate', '01/01/2031')
      await createOrEditPage.fillCreateOrEditInput('idcardissuingcountry', 'USA Edited')

      await createOrEditPage.clickOnIdentitySection('drivinglicense')

      await createOrEditPage.fillCreateOrEditInput('note', 'Identity Driving License Note Edited')

      await createOrEditPage.clickOnCreateOrEditButton('save')
      await page.waitForTimeout(testData.timeouts.action)
    })

    await test.step('VERIFY EDITED IDENTITY TITLE IS EDITED', async () => {
      await mainPage.verifyElementTitle('Identity Title Edited')
    })

    await test.step('OPEN ELEMENT', async () => {
      await mainPage.openElementDetails()
    })

    /**
     * @qase.id PAS-596
     * @description Changes after editing all "Identity" item fields including folder destination correspond to entered fields' values
     */
    await test.step('VERIFY EDITED IDENTITY DETAILS', async () => {

      await detailsPage.verifyTitle('Identity Title Edited')
      await detailsPage.verifyIdentityDetailsValue('fullname', 'Identity Fullname Edited')
      await detailsPage.verifyIdentityDetailsValue('email', 'identitytestedited@mail.co')
      await detailsPage.verifyIdentityDetailsValue('address', 'Identity Address Edited')
      await detailsPage.verifyIdentityDetailsValue('zip', 'Identity Zip Edited')
      await detailsPage.verifyIdentityDetailsValue('city', 'Identity City Edited')
      await detailsPage.verifyIdentityDetailsValue('region', 'Identity Region Edited')
      await detailsPage.verifyIdentityDetailsValue('country', 'Identity Country Edited')
      await detailsPage.verifyIdentityDetailsValue('passportfullname', 'Identity Passport Fullname Edited')
      await detailsPage.verifyIdentityDetailsValue('passportnumber', 'Identity Passport Number Edited')
      await detailsPage.verifyIdentityDetailsValue('passportissuingcountry', 'Identity Issuing Country Edited')
      await detailsPage.verifyIdentityDetailsValue('passportdateofissue', 'Identity Date of Issue Edited')
      await detailsPage.verifyIdentityDetailsValue('passportexpirydate', '01/01/2022')
      await detailsPage.verifyIdentityDetailsValue('passportnationality', '01/01/2027')
      await detailsPage.verifyIdentityDetailsValue('passportdob', '01/01/1991')
      await detailsPage.verifyIdentityDetailsValue('passportgender', 'Identity Gender Edited')
      await detailsPage.verifyIdentityDetailsValue('idcardnumber', 'Identity ID Card Number Edited')
      await detailsPage.verifyIdentityDetailsValue('idcarddateofissue', '01/01/2026')
      await detailsPage.verifyIdentityDetailsValue('idcardexpirydate', '01/01/2031')
      await detailsPage.verifyIdentityDetailsValue('idcardissuingcountry', 'USA Edited')
      await detailsPage.verifyIdentityDetailsValue('note', 'Identity Driving License Note Edited')
    })

    await test.step('EDIT ELEMENT DETAILS', async () => {
      await detailsPage.editElement()
    })

    /**
     * @qase.id PAS-597
     * @description Custom "Note" field is deleted after deleting it during editing "Identity" item
     */
    await test.step('EDIT IDENTITY ELEMENT - Add/Delete Custom "Note" field during editing "Identity" item', async () => {
      await createOrEditPage.clickCreateCustomItem()
      await createOrEditPage.clickCustomItemOptionNote()
      await expect(createOrEditPage.customNoteInput).toHaveCount(1);
      await createOrEditPage.deleteCustomNote();
      await expect(createOrEditPage.customNoteInput).toHaveCount(0);
    })

    await test.step('CLICK CLOSE (X) BUTTON', async () => {
      await createOrEditPage.clickElementItemCloseButton()
    })

    /**
     * @qase.id PAS-598
     * @description "Identity" item is deleted after deleting it
     */
    await test.step('DELETE IDENTITY ITEM', async () => {
      await detailsPage.openItemBarThreeDotsDropdownMenu()
      await detailsPage.clickDeleteElement()
      await detailsPage.clickConfirmYes()
    })

    await test.step('VERIFY IDENTITY ELEMENT IS NOT VISIBLE', async () => {
      await mainPage.verifyElementIsNotVisible()
    })

  })

})