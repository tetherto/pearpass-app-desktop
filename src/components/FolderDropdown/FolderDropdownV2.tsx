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

import { CreateFolderModalContentV2 } from '../../containers/Modal/CreateFolderModalContentV2/CreateFolderModalContentV2'
import { useModal } from '../../context/ModalContext'
import { useTranslation } from '../../hooks/useTranslation'
import { sortByName } from '../../utils/sortByName'

type FolderDropdownV2Props = {
  selectedFolder?: string
  onFolderSelect: (name: string) => void
}

export const FolderDropdownV2 = ({
  selectedFolder,
  onFolderSelect
}: FolderDropdownV2Props) => {
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
      <CreateFolderModalContentV2
        onClose={closeModal}
        onCreate={(folderName: string) => {
          onFolderSelect(folderName)
          closeModal()
        }}
      />
    )
  }

  return (
    <ContextMenu
      fullWidth
      trigger={
        <MultiSlotInput testID='createoredit-folder-slot-v2'>
          <SelectField
            label={t('Folder')}
            value={selectedFolder ?? ''}
            placeholder={t('Choose Folder')}
            testID='createoredit-select-folder-v2'
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
                    data-testid='createoredit-folder-clear-v2'
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
          testID={`createoredit-folder-option-v2-${name}`}
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
        testID='createoredit-folder-create-v2'
      />
    </ContextMenu>
  )
}

