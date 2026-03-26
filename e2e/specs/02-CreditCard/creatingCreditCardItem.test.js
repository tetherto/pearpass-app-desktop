import { test, expect } from '../../fixtures/app.runner.js'
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

test.describe('Creating Credit Card Item', async () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage, vaultSelectPage, createOrEditPage, sideMenuPage, mainPage, utilities, detailsPage, page

  test.beforeAll(async ({ app }) => {
    page = await app.getPage();
    const root = page.locator('body');
    loginPage = new LoginPage(root);
    vaultSelectPage = new VaultSelectPage(root);
    sideMenuPage = new SideMenuPage(root);
    createOrEditPage = new CreateOrEditPage(root);
    utilities = new Utilities(root);
    mainPage = new MainPage(root);
    detailsPage = new DetailsPage(root);

    await loginPage.loginToApplication(testData.credentials.validPassword);
    await vaultSelectPage.selectVaultbyName(testData.vault.name);

    await sideMenuPage.selectSideBarCategory('creditCard');
    await utilities.deleteAllElements();
    await mainPage.clickCreateNewElementButton('Create a credit card');

    await page.waitForTimeout(testData.timeouts.action);
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
  })

  test.afterAll(async ({ app }) => {
    await utilities.deleteAllElements()
    await sideMenuPage.clickSidebarExitButton()
  })

  test('Creating the "Credit Card" item', async ({ page }) => {
    qase.id(2115);
    await createOrEditPage.fillCreateOrEditInput('title', 'Credit Card Title')
    await createOrEditPage.fillCreateOrEditInput('fullname', 'John')
    await createOrEditPage.fillCreateOrEditInput('number', '1231 2312')
    await createOrEditPage.fillCreateOrEditInput('expiredate', '12 12')
    await createOrEditPage.fillCreateOrEditInput('securitycode', '111')
    await createOrEditPage.fillCreateOrEditInput('pincode', '5555')
    await createOrEditPage.fillCreateOrEditInput('note', 'Credit Card Note')
    await createOrEditPage.clickOnCreateOrEditButton('save')
  })

  test('Viewing created item. Verify item details', async ({ page }) => {
    qase.id(2116);
    await mainPage.verifyElementTitle('Credit Card Title')
    await mainPage.openElementDetails()

    await detailsPage.verifyItemDetailsValue('Full name', 'John');
    await detailsPage.verifyItemDetailsValue('1234 1234 1234 1234 ', '1231 2312')
    await detailsPage.verifyItemDetailsValue('MM YY', '12 12')
    await detailsPage.verifyItemDetailsValue('123', '111')
    await detailsPage.verifyItemDetailsValue('1234', '5555')
    await detailsPage.verifyItemDetailsValue('Add comment', 'Credit Card Note')
  })

  test('Password visibility icon displays/hides value', async ({ page }) => {
    qase.id(2117);
    expect(createOrEditPage.verifyItemType('123', 'password'))
    await createOrEditPage.clickShowHidePasswordButtonFirst()
    expect(createOrEditPage.verifyItemType('123', 'text'))
    expect(createOrEditPage.verifyItemType('1234', 'password'))
    await createOrEditPage.clickShowHidePasswordButtonLast()
    expect(createOrEditPage.verifyItemType('1234', 'text'))
  })

  test('Dropdown moves to selected item edit screen', async ({ page }) => {
    qase.id(2118);
    await mainPage.verifyElementTitle('Credit Card Title')
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
    qase.id(2119);
    await sideMenuPage.verifySidebarFolderName('Test Folder')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.openDropdownMenu()
    await createOrEditPage.selectFromDropdownMenu('No Folder')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await sideMenuPage.deleteFolder('Test Folder')
  })

  test('Add via Favorite icon', async ({ page }) => {
    qase.id(2120);
    await sideMenuPage.selectSideBarCategory('all')
    await mainPage.verifyElementTitle('Credit Card Title')
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await sideMenuPage.openSideBarFolder('Favorites')
    await expect(detailsPage.getFavoriteAvatar('CC')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('CC')).toBeVisible()
  })

  test('Remove via Favorite icon', async ({ page }) => {
    qase.id(2121);
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('CC')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('CC')).not.toBeVisible()
  })

  test('Add via More options', async ({ page }) => {
    qase.id(2122);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickMarkAsFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('CC')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('CC')).toBeVisible()
  })

  test('Remove via More options', async ({ page }) => {
    qase.id(2123);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickRemoveFromFavoritesButton()
    await expect(detailsPage.getFavoriteAvatar('CC')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('CC')).not.toBeVisible()
  })

  test('Add Custom Note', async ({ page }) => {
    qase.id(2124);
    await mainPage.verifyElementTitle('Credit Card Title')
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
    qase.id(2125);
    await mainPage.verifyElementTitle('Credit Card Title')
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
    qase.id(2126);
    await mainPage.verifyElementTitle('Credit Card Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await detailsPage.clickElementItemCloseButton()
    await mainPage.verifyElementTitle('Credit Card Title')
  })

  test('View uploaded file in Edit mode', async ({ page }) => {
    qase.id(2127);
    await mainPage.verifyElementTitle('Credit Card Title')
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
    qase.id(2128);
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
    qase.id(2129);
    await mainPage.verifyElementTitle('Credit Card Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.fillCreateOrEditInput('fullname', '')
    await createOrEditPage.fillCreateOrEditInput('number', '')
    await createOrEditPage.fillCreateOrEditInput('expiredate', '')
    await createOrEditPage.fillCreateOrEditInput('securitycode', '')
    await createOrEditPage.fillCreateOrEditInput('pincode', '')
    await createOrEditPage.fillCreateOrEditInput('note', '')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await mainPage.openElementDetails()
    await detailsPage.verifyItemDetailsValueIsNotVisible('Full name')
    await detailsPage.verifyItemDetailsValueIsNotVisible('1234 1234 1234 1234')
    await detailsPage.verifyItemDetailsValueIsNotVisible('MM YY')
    await detailsPage.verifyItemDetailsValueIsNotVisible('123')
    await detailsPage.verifyItemDetailsValueIsNotVisible('1234')
    await detailsPage.verifyItemDetailsValueIsNotVisible('note')
    await detailsPage.verifyItemDetailsValueIsNotVisible('MM YY')
    await mainPage.clickDetailsCloseButton()
  })

})
