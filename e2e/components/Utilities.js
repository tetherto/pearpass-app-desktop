'use strict'

const { expect } = require('../fixtures/app.runner')

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
    return this.root.getByText('Create a new element or pass to another collection')
  }

  // ==== ACTIONS ====

  async deleteAllElements() {
    while (!(await this.collectionEmptyText.isVisible())) {
      await this.element.first().click();
      await this.itemBarThreeDots.click();
      await this.deleteElementButton.click();
      await this.root.getByText('Yes').click();

      await expect(this.collectionEmptyText).toBeVisible({ timeout: 5000 }).catch(() => { });
    }
  }

}

module.exports = { Utilities }
