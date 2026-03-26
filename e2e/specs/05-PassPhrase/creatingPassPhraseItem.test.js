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
import clipboard from 'clipboardy';
import { qase } from 'playwright-qase-reporter';

test.describe('Creating PassPhrase Item', () => {
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

    await sideMenuPage.selectSideBarCategory('passPhrase')
    await utilities.deleteAllElements()
    await mainPage.clickCreateNewElementButton('Save a Recovery phrase')

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

  test('Creating the "PassPhrase" item', async ({ page }) => {
    qase.id(2209);
    await createOrEditPage.fillCreateOrEditInput('title', 'PassPhrase Title')

    await clipboard.write('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12')
    await createOrEditPage.clickOnPasteFromClipboard()
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
  })

  test('Viewing created item. Verify item details', async ({ page }) => {
    qase.id(2210);
    await mainPage.verifyElementTitle('PassPhrase Title')
    await mainPage.openElementDetails()
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

  test('Dropdown moves to selected item edit screen', async ({ page }) => {
    qase.id(2211);
    await mainPage.verifyElementTitle('PassPhrase Title')
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
    qase.id(2212);
    await sideMenuPage.verifySidebarFolderName('Test Folder')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.openDropdownMenu()
    await createOrEditPage.selectFromDropdownMenu('No Folder')
    await createOrEditPage.clickOnCreateOrEditButton('save')

    await sideMenuPage.deleteFolder('Test Folder')
  })

  test('Add via Favorite icon', async ({ page }) => {
    qase.id(2213);
    await sideMenuPage.selectSideBarCategory('all')
    await mainPage.verifyElementTitle('PassPhrase Title')
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await sideMenuPage.openSideBarFolder('Favorites')
    await expect(detailsPage.getFavoriteAvatar('PT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('PT')).toBeVisible()
  })

  test('Remove via Favorite icon', async ({ page }) => {
    qase.id(2214);
    await mainPage.openElementDetails()
    await detailsPage.clickFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('PT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('PT')).not.toBeVisible()
  })

  test('Add via More options', async ({ page }) => {
    qase.id(2215);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickMarkAsFavoriteButton()
    await expect(detailsPage.getFavoriteAvatar('PT')).toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('PT')).toBeVisible()
  })

  test('Remove via More options', async ({ page }) => {
    qase.id(2216);
    await mainPage.openElementDetails()
    await detailsPage.openItemBarThreeDotsDropdownMenu()
    await detailsPage.clickRemoveFromFavoritesButton()
    await expect(detailsPage.getFavoriteAvatar('PT')).not.toBeVisible()
    await expect(mainPage.getElementFavoriteIcon('PT')).not.toBeVisible()
  })

  
  // test('Add Custom Note', async ({ page }) => {
  //   qase.id(2217);
  //   await mainPage.verifyElementTitle('PassPhrase Title')
  //   await mainPage.openElementDetails()
  //   await detailsPage.editElement()
  //   await createOrEditPage.clickCreateCustomItem()
  //   await createOrEditPage.clickCustomItemOptionNote()
  //   await expect(createOrEditPage.customNoteInput).toHaveCount(1)
  //   await createOrEditPage.fillCustomNoteInput()
  //   await createOrEditPage.clickOnCreateOrEditButton('save')
  //   await page.waitForTimeout(testData.timeouts.action)
  //   await mainPage.clickDetailsCloseButton()
  // })

  // test('Delete Note field', async ({ page }) => {
  //   qase.id(2218);
  //   await mainPage.verifyElementTitle('PassPhrase Title')
  //   await mainPage.openElementDetails()
  //   await detailsPage.editElement()
  //   await expect(createOrEditPage.customNoteInput_first).toHaveCount(2)
  //   await createOrEditPage.deleteCustomNote()
  //   await expect(createOrEditPage.customNoteInput_first).toHaveCount(1)
  //   await createOrEditPage.clickOnCreateOrEditButton('save')
  //   await page.waitForTimeout(testData.timeouts.action)
  //   await mainPage.clickDetailsCloseButton()
  // })

  test('Close via Cross icon', async ({ page }) => {
    qase.id(2219);
    await mainPage.verifyElementTitle('PassPhrase Title')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await detailsPage.clickElementItemCloseButton()
    await mainPage.verifyElementTitle('PassPhrase Title')
  })

})
