import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { NestedFoldersWrapper } from './styles'
import { SidebarFolder } from '../../../components/SidebarFolder'
import { useModal } from '../../../context/ModalContext'
import { useRouter } from '../../../context/RouterContext'
import { PlusIcon } from '../../../lib-react-components'
import { CreateFolderModalContent } from '../../Modal/CreateFolderModalContent'
import { SidebarNestedFile } from '../SidebarNestedFile'

/**
 * @param {{
 *  item: {
 *    id:string,
 *    name: string,
 *    icon: string,
 *    isAlwaysVisible: boolean,
 *    isOpenInitially: boolean,
 *    isActive: boolean,
 *     children: {
 *        name: string,
 *        icon: string,
 *     }[]
 *   },
 *  level: number
 *  onFolderExpandToggle: (id) => void
 *  testId?: string
 * }} props
 */
export const SidebarNestedFolders = ({
  item,
  level = 0,
  onFolderExpandToggle,
  testId
}) => {
  const { i18n } = useLingui()
  const { setModal } = useModal()
  const { navigate } = useRouter()

  const isRoot = item.id === 'allFolders'
  const IsFavorites = item.id === 'favorites'

  const isOpen = item.isOpenInitially

  const isFolder = 'children' in item

  const handleAddClick = () => {
    setModal(html` <${CreateFolderModalContent} /> `)
  }

  const handleFolderClick = () => {
    if (isRoot) {
      return navigate('vault', { recordType: 'all' })
    }

    onFolderExpandToggle(item.id)

    navigate('vault', { recordType: 'all', folder: item.id })
  }

  if (!isFolder) {
    return html`
      <${SidebarNestedFile}
        testId=${`sidebar-file-${item.id}`}
        icon=${item.icon}
        id=${item.id}
        name=${item.name}
        key=${item.name + item.id + 'file'}
        level=${level}
      />
    `
  }

  if (!item.children.length && !isRoot) {
    return html``
  }

  return html`
    <${NestedFoldersWrapper} level=${level} data-testid=${testId}>
      <${SidebarFolder}
        onAddClick=${handleAddClick}
        isOpen=${isOpen}
        onClick=${handleFolderClick}
        onDropDown=${() => onFolderExpandToggle(item.id)}
        isRoot=${isRoot}
        isActive=${item.isActive}
        name=${item.name}
        icon=${item.icon}
        key=${item.name + item.id}
      />

      ${isOpen &&
      html`
        ${item.children.map((childItem) =>
          childItem?.name?.length
            ? html`
                <${SidebarNestedFolders}
                  testId=${`sidebar-folder-${childItem.id}`}
                  key=${childItem.name + childItem.id + level}
                  onFolderExpandToggle=${onFolderExpandToggle}
                  item=${childItem}
                  level=${level + 1}
                />
              `
            : html``
        )}
        ${!isRoot &&
        !IsFavorites &&
        html`
          <${SidebarNestedFile}
            key=${item.id + 'newFile'}
            folderId=${item.id}
            testId=${`sidebar-${item.id}-newfile`}
            icon=${PlusIcon}
            name=${i18n._('New')}
            isNew=${true}
            color=${colors.primary400.mode1}
            level=${level + 1}
          />
        `}
      `}
    <//>
  `
}
