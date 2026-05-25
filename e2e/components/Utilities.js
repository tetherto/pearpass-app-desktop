import { test, expect } from '../fixtures/app.runner.js'

class Utilities {
  constructor(root) {
    this.root = root
  }

  // --- Bulk delete ---

  async deleteAllElements() {
    const emptyState = this.root.getByTestId('empty-collection')

    while (true) {
      const emptyVisible = await emptyState.isVisible().catch(() => false)
      if (emptyVisible) break

      const firstRow = this.root.locator('[data-record-id]').first()
      const rowVisible = await firstRow
        .isVisible({ timeout: 3000 })
        .catch(() => false)
      if (!rowVisible) break

      const recordId = await firstRow.getAttribute('data-record-id')
      if (!recordId) break

      await firstRow.click({ button: 'right' })

      const deleteButton = this.root.getByTestId(
        `record-row-menu-delete-${recordId}`
      )
      await expect(deleteButton).toBeVisible({ timeout: 5000 })
      await deleteButton.click()

      const confirmButton = this.root.getByTestId('delete-records-submit')
      await expect(confirmButton).toBeVisible({ timeout: 5000 })
      await confirmButton.click()

      await confirmButton
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => { })
    }
  }

  // --- Clipboard ---

  async pasteFromClipboard(locator, text) {
    await this.root.page().evaluate(async (t) => {
      await navigator.clipboard.writeText(t)
    }, text)

    await locator.click()
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await this.root.page().keyboard.press(`${modifier}+v`)
  }
}

module.exports = { Utilities }
