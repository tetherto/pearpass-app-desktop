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

  // ==== ACTIONS ====

  async deleteAllElements() {
    while (await this.listItemThreeDots.isVisible()) {
      await this.listItemThreeDots.click()
      await this.listItemThreeDotsMenuDeleteItem.click()
      await this.root.getByText('Yes').click()

      await expect(this.collectionEmptyText)
        .toBeVisible({ timeout: 5000 })
        .catch(() => {})
    }
  }

  // async deleteAllElements() {
  //   while (!(await this.collectionEmptyText.isVisible())) {
  //     // await expect(this.listItemThreeDots).toBeVisible()
  //     await this.listItemThreeDots.click();
  //     await this.listItemThreeDotsMenuDeleteItem.click();
  //     await this.root.getByText('Yes').click();

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
