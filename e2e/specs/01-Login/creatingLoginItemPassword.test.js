import { qase } from 'playwright-qase-reporter'

import {
  LoginPage,
  MainPage,
  SideMenuPage,
  CreateOrEditPage,
  Utilities,
  DetailsPage
} from '../../components/index.js'
import { test, expect } from '../../fixtures/app.runner.js'
import testData from '../../fixtures/test-data.js'

test.describe('Password', () => {
  test.describe.configure({ mode: 'serial' })

  let loginPage,
    createOrEditPage,
    sideMenuPage,
    mainPage,
    utilities,
    detailsPage,
    page

  test.beforeAll(async ({ app }) => {
    page = await app.getPage()
    const root = page.locator('body')

    loginPage = new LoginPage(root)
    mainPage = new MainPage(root)
    sideMenuPage = new SideMenuPage(root)
    createOrEditPage = new CreateOrEditPage(root)
    utilities = new Utilities(root)
    detailsPage = new DetailsPage(root)

    await loginPage.loginToApplication(testData.credentials.validPassword)

    await sideMenuPage.selectSideBarCategory('login')
    await utilities.deleteAllElements()
    await mainPage.clickAddItem('login')

    await createOrEditPage.fillCreateOrEditInput('title', 'Login Title')
    await createOrEditPage.fillCreateOrEditInput('username', 'Test User')
    await createOrEditPage.fillCreateOrEditInput('password', 'Test Pass')
    await createOrEditPage.fillCreateOrEditInput('website', 'https://www.website.co')
    await createOrEditPage.fillCreateOrEditInput('comment', 'Test Note')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
  })

  test.beforeEach(async () => {
    const root = page.locator('body')
    loginPage = new LoginPage(root)
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

  test('Verify that the password was changed to a generic password, with "Safe" strength as the default option.', async () => {
    qase.id(2000)
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.openPasswordMenu()
    await createOrEditPage.clickInsertPasswordButton()
    await createOrEditPage.clickShowHidePasswordButtonLast()
    await createOrEditPage.verifyPasswordToNotHaveValue('Test Pass')
    await createOrEditPage.clickOnCreateOrEditButton('save')
    await page.waitForTimeout(testData.timeouts.action)
    await mainPage.clickDetailsCloseButton()
  })

  test('Verify that password strength updates when the "special characters" switch is toggled', async () => {
    qase.id(2001)
    const root = page.locator('body')
    await mainPage.openElementDetails()
    await detailsPage.editElement()
    await createOrEditPage.openPasswordMenu()

    await expect(root.getByRole('radio', { name: /Random Characters/i })).toBeChecked()
    await expect(root.getByText('8 chars')).toBeVisible()
    await expect(root.getByText('Special character')).toBeVisible()
    const toggle = root.locator('[role="switch"]')
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    await expect(root.getByText('Strong')).toBeVisible()

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
    await expect(root.getByText('Strong')).not.toBeVisible()

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    await expect(root.getByText('Strong')).toBeVisible()

    await root.getByTestId('generatepassword-button-discard').click()
    await createOrEditPage.clickOnCreateOrEditButton('discard')
    await mainPage.clickDetailsCloseButton()
  })
})
