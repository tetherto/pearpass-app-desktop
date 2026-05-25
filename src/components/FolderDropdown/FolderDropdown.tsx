import { useMemo } from 'react'

import {
  Button,
  ContextMenu,
  MultiSlotInput,
  NavbarListItem,
  SelectField,
  rawTokens,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Close, CreateNewFolder, Folder, KeyboardArrowBottom } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useFolders } from '@tetherto/pearpass-lib-vault'

import { CreateFolderModalContent } from '../../containers/Modal/CreateFolderModalContent/CreateFolderModalContent'
import { useModal } from '../../context/ModalContext'
import { useTranslation } from '../../hooks/useTranslation'
import { sortByName } from '../../utils/sortByName'

type FolderDropdownProps = {
  selectedFolder?: string
  onFolderSelect: (name: string) => void
}

export const FolderDropdown = ({
  selectedFolder,
  onFolderSelect
}: FolderDropdownProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { setModal, closeModal } = useModal()
  const { data: folders } = useFolders()

  const folderOptions = useMemo(() => {
    return sortByName(
      Object.values(
        (folders?.customFolders ?? {}) as Record<string, { name: string }>
      )
    ).map((f) => f.name)
  }, [folders])

  const handleCreateFolder = () => {
    setModal(
      <CreateFolderModalContent
        onClose={closeModal}
        onCreate={(folderName: string) => {
          onFolderSelect(folderName)
        }}
      />
    )
  }

  return (
    <ContextMenu
      fullWidth
      trigger={
        <MultiSlotInput testID='createoredit-folder-slot'>
          <SelectField
            label={t('Folder')}
            value={selectedFolder ?? ''}
            placeholder={t('Choose Folder')}
            testID='createoredit-select-folder'
            rightSlot={
              <div style={{ display: 'flex', alignItems: 'center', gap: rawTokens.spacing6 }}>
                {selectedFolder && (
                  <Button
                    variant='tertiary'
                    size='small'
                    type='button'
                    aria-label={t('Clear folder')}
                    iconBefore={
                      <Close
                        width={16}
                        height={16}
                        color={theme.colors.colorTextPrimary}
                      />
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      onFolderSelect(selectedFolder)
                    }}
                    data-testid='createoredit-folder-clear'
                  />
                )}
                <KeyboardArrowBottom color={theme.colors.colorTextPrimary} />
              </div>
            }
          />
        </MultiSlotInput>
      }
    >
      {folderOptions.map((name) => (
        <NavbarListItem
          key={name}
          icon={
            <Folder
              width={16}
              height={16}
              color={theme.colors.colorTextPrimary}
            />
          }
          iconSize={16}
          label={name}
          selected={selectedFolder === name}
          onClick={() => onFolderSelect(name)}
          testID={`createoredit-folder-option-${name}`}
        />
      ))}
      <NavbarListItem
        icon={
          <CreateNewFolder
            width={16}
            height={16}
            color={theme.colors.colorTextPrimary}
          />
        }
        iconSize={16}
        label={t('Add New Folder')}
        onClick={handleCreateFolder}
        testID='createoredit-folder-create'
      />
    </ContextMenu>
  )
}

