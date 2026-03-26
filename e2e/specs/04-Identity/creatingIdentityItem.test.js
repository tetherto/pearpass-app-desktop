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

test.describe('Creating Identity Item', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page

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

    await sideMenuPage.selectSideBarCategory('identity');
    await utilities.deleteAllElements();
    await mainPage.clickCreateNewElementButton('Create an identity');

    await page.waitForTimeout(testData.timeouts.action);
  });

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
  })

  test.afterAll(async () => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Creating the "Identity" item', async ({ page }) => {
    qase.id(2151);
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

  test('Viewing created item. Verify item details', async ({ page }) => {
    qase.id(2152);
    await mainPage.openElementDetails()
    await detailsPage.verifyIdentityDetailsValue('fullname', 'Identity Fullname')
    await detailsPage.verifyIdentityDetailsValue('email', 'identitytest@mail.co')
    await detailsPage.verifyIdentityDetailsValue('address', 'Identity Address')
    await detailsPage.verifyIdentityDetailsValue('zip', 'Identity Zip')
    await detailsPage.verifyIdentityDetailsValue('city', 'Identity City')
    await detailsPage.verifyIdentityDetailsValue('region', 'Identity Region')
    await detailsPage.verifyIdentityDetailsValue('country', 'Identity Country')
    await detailsPage.verifyIdentityDetailsValue('passportfullname', 'Identity Passport Fullname')
    await detailsPage.verifyIdentityDetailsValue('passportnumber', 'Identity Passport Number')
    await detailsPage.verifyIdentityDetailsValue('passportissuingcountry', 'Identity Issuing Country')
    await detailsPage.verifyIdentityDetailsValue('passportdateofissue', 'Identity Date of Issue')
    await detailsPage.verifyIdentityDetailsValue('passportexpirydate', '01/01/2020')
    await detailsPage.verifyIdentityDetailsValue('passportnationality', '01/01/2025')
    await detailsPage.verifyIdentityDetailsValue('passportdob', '01/01/1990')
    await detailsPage.verifyIdentityDetailsValue('passportgender', 'Identity Gender')
    await detailsPage.verifyIdentityDetailsValue('idcardnumber', 'Identity ID Card Number')
    await detailsPage.verifyIdentityDetailsValue('idcarddateofissue', '01/01/2025')
    await detailsPage.verifyIdentityDetailsValue('idcardexpirydate', '01/01/2030')
    await detailsPage.verifyIdentityDetailsValue('idcardissuingcountry', 'USA')
    await detailsPage.verifyIdentityDetailsValue('note', 'Identity Driving License Note')
  })

  test('Dropdown moves to selected item edit screen', async ({ page }) => {
    qase.id(2153);
    await mainPage.verifyElementTitle('Identity Title')
    await sideMenuPage.clickSidebarAddButton()
    await detailsPage.fillCreateNewFolderTitleInput('Test Folder')
    await detailsPage.clickCreateFolderButton()
    await detailsPage.editElement()
    await createOrEditPage.openDropdownMenu()
    await createOrEditPage.selectFromDropdownMenu('Test Folder')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await detailsPage.getItemDetailsFolderName('Test Folder')
    await mainPage.verifyElementFolderName('Test Folder')
  })

  test('Item moved to folder (and cleanup)', async ({ page }) => {
    qase.id(2155);
    await sideMenuPage.verifySidebarFolderName('Test Folder')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.openDropdownMenu()
    await createOrEditPage.selectFromDropdownMenu('No Folder')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await sideMenuPage.deleteFolder('Test Folder')
  })

  test('Add via Favorite icon', async ({ page }) => {
    qase.id(2156);
    await sideMenuPage.selectSideBarCategory('all')
    await mainPage.verifyElementTitle('Identity Title')
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await sideMenuPage.openSideBarFolder('Favorites')
    await expect(detailsPage.getFavoriteAvatar('IT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('IT')).toBeVisible()
  })

  test('Remove via Favorite icon', async ({ page }) => {
    qase.id(2157);
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('IT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('IT')).not.toBeVisible()
  })

  test('Add via More options', async ({ page }) => {
    qase.id(2158);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickMarkAsFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('IT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('IT')).toBeVisible()
  })

  test('Remove via More options', async ({ page }) => {
    qase.id(2159);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickRemoveFromFavoritesButton()
    await expect(detailsPage.getFavoriteAvatar('IT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('IT')).not.toBeVisible()
  })

  test('Add Custom Note', async ({ page }) => {
    qase.id(2160);
    await mainPage.verifyElementTitle('Identity Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.clickCreateCustomItem()
    await createOrEditPage.clickCustomItemOptionNote()
    await expect(createOrEditPage.customNoteInput).toHaveCount(1)
    await createOrEditPage.fillCustomNoteInput()
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickDetailsCloseButton()
  })

  test('Delete Note field', async ({ page }) => {
    qase.id(2161);
    await mainPage.verifyElementTitle('Identity Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await expect(createOrEditPage.customNoteInput_first).toHaveCount(2)
    await createOrEditPage.deleteCustomNote()
    await expect(createOrEditPage.customNoteInput_first).toHaveCount(1)
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickDetailsCloseButton()
  })

  test('Close via Cross icon', async ({ page }) => {
    qase.id(2162);
    await mainPage.verifyElementTitle('Identity Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await detailsPage.clickElementItemCloseButton()
    await mainPage.verifyElementTitle('Identity Title')
  })

  test('View uploaded file in Edit mode', async ({ page }) => {
    qase.id(2163);
    await mainPage.verifyElementTitle('Identity Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.clickOnCreateOrEditButton('loadfile')
    await createOrEditPage.uploadFile()
    await createOrEditPage.verifyUploadedFileIsVisible()
    await createOrEditPage.clickOnUploadedFile()
    await createOrEditPage.verifyUploadedImageIsVisible()
    await createOrEditPage.clickElementItemCloseButton()
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickDetailsCloseButton()
  })

  test('View uploaded file in View mode (and cleanup)', async ({ page }) => {
    qase.id(2164);
    await mainPage.openElementDetails()
    await detailsPage.verifyUploadedFileIsVisible()
    await detailsPage.clickOnUploadedFile()
    await detailsPage.verifyUploadedImageIsVisible()
    await detailsPage.clickElementItemCloseButton()
    await detailsPage.editElement()
    await createOrEditPage.clickOnCreateOrEditButton('deleteattachment')
    await createOrEditPage.verifyUploadedImageIsNotVisible()
    await createOrEditPage.clickElementItemCloseButton()
    await mainPage.clickDetailsCloseButton()
  })

  test('Empty fields not displayed in view mode', async ({ page }) => {
    qase.id(2165);
    await mainPage.verifyElementTitle('Identity Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.fillCreateOrEditInput('title', 'Identity Title')
    await createOrEditPage.fillCreateOrEditInput('fullname', '')
    await createOrEditPage.fillCreateOrEditInput('email', '')
    await createOrEditPage.fillCreateOrEditInput('phonenumber', '')
    await createOrEditPage.fillCreateOrEditInput('address', '')
    await createOrEditPage.fillCreateOrEditInput('zip', '')
    await createOrEditPage.fillCreateOrEditInput('city', '')
    await createOrEditPage.fillCreateOrEditInput('region', '')
    await createOrEditPage.fillCreateOrEditInput('country', '')
    await createOrEditPage.clickOnIdentitySection('passport')
    await createOrEditPage.fillCreateOrEditInput('passportfullname', '')
    await createOrEditPage.fillCreateOrEditInput('passportnumber', '')
    await createOrEditPage.fillCreateOrEditInput('passportissuingcountry', '')
    await createOrEditPage.fillCreateOrEditInput('passportdateofissue', '')
    await createOrEditPage.fillCreateOrEditInput('passportexpirydate', '')
    await createOrEditPage.fillCreateOrEditInput('passportnationality', '')
    await createOrEditPage.fillCreateOrEditInput('passportdob', '')
    await createOrEditPage.fillCreateOrEditInput('passportgender', '')
    await createOrEditPage.clickOnIdentitySection('idcard')
    await createOrEditPage.fillCreateOrEditInput('idcardnumber', '')
    await createOrEditPage.fillCreateOrEditInput('idcarddateofissue', '')
    await createOrEditPage.fillCreateOrEditInput('idcardexpirydate', '')
    await createOrEditPage.fillCreateOrEditInput('idcardissuingcountry', '')
    await createOrEditPage.clickOnIdentitySection('drivinglicense')
    await createOrEditPage.fillCreateOrEditInput('note', '')
    await createOrEditPage.clickOnCreateOrEditButton('save')

    await mainPage.openElementDetails()

    await detailsPage.verifyTitle('Identity Title')
    await detailsPage.verifyItemDetailsValueIsNotVisible('fullname', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('email', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('address', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('zip', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('city', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('region', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('country', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('passportfullname', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('passportnumber', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('passportissuingcountry', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('passportdateofissue', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('passportexpirydate', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('passportnationality', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('passportdob', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('passportgender', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('idcardnumber', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('idcarddateofissue', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('idcardexpirydate', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('idcardissuingcountry', '')
    await detailsPage.verifyItemDetailsValueIsNotVisible('note', '')

    await mainPage.clickDetailsCloseButton()
  })
})
