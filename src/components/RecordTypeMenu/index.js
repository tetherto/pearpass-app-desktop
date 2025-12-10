import { html } from 'htm/react'

import { useRecordMenuItems } from '../../hooks/useRecordMenuItems'
import { MenuDropdown } from '../MenuDropdown'

/**
 * @param {{
 *  selectedRecord?: {
 *    name: string;
 *    icon?: React.ReactNode;
 *  },
 *  onRecordSelect: (record: {
 *    name: string;
 *    icon?: React.ReactNode;
 *  }) => void
 * }} props
 */
export const RecordTypeMenu = ({ selectedRecord, onRecordSelect }) => {
  const { defaultItems } = useRecordMenuItems()

  const selectedItem = defaultItems.filter(
    (item) => item.type === selectedRecord
  )?.[0]

  return html`
    <${MenuDropdown}
      selectedItem=${selectedItem}
      onItemSelect=${onRecordSelect}
      items=${defaultItems}
    />
  `
}
