import { test, expect } from '../fixtures/app.runner.js'

class Utilities {
  constructor(root) {
    this.root = root
  }

  // ==== LOCATORS ====

  get element() {
    return this.root.getByTestId('recordList-record-container').locator('span')
  }

  get itemBarThreeDots() {
    return this.root.getByTestId('button-round-icon').first()
  }

  get deleteElementButton() {
    return this.root.getByText('Delete element').last()
    // return this.root.getByTestId('recordaction-item-delete')
  }

  get collectionEmptyText() {
    return this.root.getByText('This collection is empty.')
  }

  get collectionEmptySubText() {
    return this.root.getByText(
      'Create a new element or pass to another collection'
    )
  }

  get listItemThreeDots() {
    return this.root.getByTestId('list-item-threedots').first()
  }

  get listItemThreeDotsMenuDeleteItem() {
    return this.root.getByTestId('recordaction-item-delete').first()
  }

  get detailsHeader() {
    return this.root.getByTestId('details-header')
  }

  // ==== ACTIONS ====

  async deleteAllElements() {
    const firstElement = this.root.getByTestId('recordList-record-container').first();
    const emptyText = this.collectionEmptyText;

    while (true) {
      const emptyVisible = await emptyText.isVisible().catch(() => false);
      if (emptyVisible) break;

      const elementVisible = await firstElement.isVisible({ timeout: 3000 }).catch(() => false);
      if (!elementVisible) break;

      await firstElement.click();

      await expect(this.detailsHeader).toBeVisible({ timeout: 5000 });

      await this.itemBarThreeDots.click();

      await expect(this.deleteElementButton).toBeVisible({ timeout: 5000 });
      await this.deleteElementButton.click();

      await this.root.getByText('Yes').click();

      await expect(emptyText).toBeVisible({ timeout: 5000 }).catch(() => { });
    }
  }

  async pasteFromClipboard(locator, text) {
    // Write text to clipboard
    await this.root.page().evaluate(async (t) => {
      await navigator.clipboard.writeText(t)
    }, text)

    // Click and paste
    await locator.click()
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await this.root.page().keyboard.press(`${modifier}+v`)
  }

  //     await expect(this.collectionEmptyText).toBeVisible({ timeout: 5000 }).catch(() => { });
  //   }
  // }

  // async deleteAllElements() {
  //   while (!(await this.collectionEmptyText.isVisible())) {
  //     await this.element.first().click();
  //     await this.itemBarThreeDots.click();
  //     await this.deleteElementButton.click();
  //     await this.root.getByText('Yes').click();

  //     await expect(this.collectionEmptyText).toBeVisible({ timeout: 5000 }).catch(() => { });
  //   }
  // }

  async pasteFromClipboard(locator, text) {
    // Write text to clipboard
    await this.root.page().evaluate(async (t) => {
      await navigator.clipboard.writeText(t)
    }, text)

    // Click and paste
    await locator.click()
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await this.root.page().keyboard.press(`${modifier}+v`)
  }
}

module.exports = { Utilities }
