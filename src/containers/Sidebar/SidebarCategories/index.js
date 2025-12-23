import { html } from 'htm/react'
import { useRecordCountsByType } from 'pearpass-lib-vault'

import { CategoriesContainer } from './styles'
import { SidebarCategory } from '../../../components/SidebarCategory'
import { RECORD_COLOR_BY_TYPE } from '../../../constants/recordColorByType'
import { RECORD_ICON_BY_TYPE } from '../../../constants/recordIconByType'
import { useRouter } from '../../../context/RouterContext'
import { useRecordMenuItems } from '../../../hooks/useRecordMenuItems'

/**
 *
 * @param {{
 *  sidebarSize: 'default' | 'tight'
 * }} props
 */
export const SideBarCategories = ({ sidebarSize = 'default' }) => {
  const { navigate, data: routerData } = useRouter()

  const { menuItems } = useRecordMenuItems()
  const { data: recordCountData } = useRecordCountsByType()

  const handleRecordClick = (type) => {
    navigate('vault', { ...routerData, recordType: type, folder: undefined })
  }

  return html`
    <${CategoriesContainer} size=${sidebarSize}>
      ${menuItems.map((record) => {
        const count = recordCountData[record?.type] || 0
        return html`
          <${SidebarCategory}
            testId=${`sidebar-category-${record?.type}`}
            key=${record?.type}
            categoryName=${record?.name}
            color=${RECORD_COLOR_BY_TYPE[record?.type]}
            quantity=${count}
            isSelected=${routerData.recordType === record?.type}
            icon=${RECORD_ICON_BY_TYPE[record?.type]}
            onClick=${() => handleRecordClick(record?.type)}
            size=${sidebarSize}
          />
        `
      })}
    <//>
  `
}
