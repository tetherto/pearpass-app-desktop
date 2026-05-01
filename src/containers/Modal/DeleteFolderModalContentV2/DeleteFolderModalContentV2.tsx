import { useState } from 'react'

import { UNSUPPORTED } from '@tetherto/pearpass-lib-constants'
import {
  Button,
  Dialog,
  Radio,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { useFolders, useRecords } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './DeleteFolderModalContentV2.styles'
import { useModal } from '../../../context/ModalContext'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'

interface DeleteFolderModalContentV2Props {
  folderName: string
  count: number
  onClose: () => void
}

enum DeleteOption {
  DeleteFolder = 'deleteFolder',
  DeleteFolderAndItems = 'deleteFolderAndItems'
}

export const DeleteFolderModalContentV2 = ({
  folderName,
  count,
  onClose
}: DeleteFolderModalContentV2Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles()
  const { closeModal } = useModal()
  const { data: routerData, navigate } = useRouter() as {
    data: Record<string, unknown>
    navigate: (page: string, data: Record<string, unknown>) => void
  }

  const { deleteFolder, data: folderData } = useFolders()
  const { updateRecords } = useRecords()

  const [selected, setSelected] = useState<DeleteOption>(
    DeleteOption.DeleteFolderAndItems
  )

  const handleClose = () => {
    onClose()
  }

  const navigateAwayIfNeeded = () => {
    if (routerData?.folder === folderName) {
      navigate('vault', { recordType: 'all' })
    }
  }

  const handleDelete = async () => {
    if (selected === DeleteOption.DeleteFolder) {
      // Folder entries can include markers without data/type; skip them.
      const folderRecords =
        folderData?.customFolders?.[folderName]?.records ?? []
      const realRecords = folderRecords.filter(
        (r: { data?: unknown; type?: unknown }) => !!r.data && !!r.type
      )
      await updateRecords(realRecords.map((r) => ({ ...r, folder: null })))
      // Items are now at root; remove the folder marker record.
      await deleteFolder(folderName)
    } else {
      await deleteFolder(folderName)
    }

    navigateAwayIfNeeded()
    closeModal()
  }

  const options = [
    ...(!UNSUPPORTED
      ? [
          {
            value: DeleteOption.DeleteFolder,
            label: t('Delete Folder'),
            description: t(
              'Only the folder will be removed.\nYour items will be moved to the All Folder list.'
            )
          }
        ]
      : []),
    {
      value: DeleteOption.DeleteFolderAndItems,
      label: t('Delete Folder and Items'),
      description: t(
        'This will permanently remove the folder and all {count} items inside.\nThis action cannot be undone.',
        { count }
      )
    }
  ]

  const isDeleteFolderOnlySelected =
    !UNSUPPORTED && selected === DeleteOption.DeleteFolder

  return (
    <Dialog
      title={t('Delete Folder')}
      onClose={handleClose}
      testID="deletefolder-dialog-v2"
      closeButtonTestID="deletefolder-close-v2"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={handleClose}
            data-testid="deletefolder-discard-v2"
          >
            {t('Discard')}
          </Button>
          {isDeleteFolderOnlySelected ? (
            <Button
              variant="primary"
              size="small"
              type="button"
              onClick={handleDelete}
              data-testid="deletefolder-submit-v2"
            >
              {t('Delete Folder')}
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="small"
              type="button"
              onClick={handleDelete}
              data-testid="deletefolder-submit-v2"
            >
              {t('Delete Folder and Items')}
            </Button>
          )}
        </>
      }
    >
      <div style={styles.body}>
        <Text color={theme.colors.colorTextSecondary}>
          {t('This folder contains {count} items.', { count })}
        </Text>
        <Radio
          options={options}
          value={selected}
          onChange={(value) => setSelected(value as DeleteOption)}
          testID="deletefolder-radio-v2"
        />
      </div>
    </Dialog>
  )
}
