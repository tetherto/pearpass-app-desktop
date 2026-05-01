import { Button, Dialog, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'

type UnsavedChangesModalContentProps = {
  description?: string
  onSave: () => void | Promise<void>
  onDiscard: () => void
}

export const UnsavedChangesModalContent = ({
  description,
  onSave,
  onDiscard
}: UnsavedChangesModalContentProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { closeModal } = useModal()

  return (
    <Dialog
      title={t('Unsaved Changes')}
      onClose={closeModal}
      testID="unsaved-changes-dialog"
      closeButtonTestID="unsaved-changes-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={onDiscard}
            data-testid="unsaved-changes-discard"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            onClick={() => void onSave()}
            data-testid="unsaved-changes-save"
          >
            {t('Save Changes')}
          </Button>
        </>
      }
    >
      <Text variant="label" color={theme.colors.colorTextSecondary}>
        {description ??
          t(
            'You have unsaved changes. Would you like to save them before leaving?'
          )}
      </Text>
    </Dialog>
  )
}
