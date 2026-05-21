import { useEffect, useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import {
  InputField,
  MultiSlotInput,
  PasswordField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'

import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useTranslation } from '../../../hooks/useTranslation'
import { WifiPasswordQRCode } from '../../WifiPasswordQRCode/WifiPasswordQRCode'
import { createStyles } from './WifiDetailsForm.styles'
import { toReadOnlyFieldProps } from './utils'

type CustomField = {
  type: string
  name?: string
  note?: string
}

type WifiRecord = {
  id: string
  folder?: string
  data: {
    title?: string
    password?: string
    note?: string
    customFields?: CustomField[]
  }
}

type WifiDetailsFormProps = {
  initialRecord?: WifiRecord
  selectedFolder?: string
}

type WifiDetailsFormValues = {
  title: string
  password: string
  note: string
  customFields: CustomField[]
  folder?: string
}

export const WifiDetailsForm = ({
  initialRecord,
  selectedFolder
}: WifiDetailsFormProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<WifiDetailsFormValues>(
    () => ({
      title: initialRecord?.data?.title ?? '',
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder
    }),
    [initialRecord, selectedFolder]
  )

  const { register, setValues, values } = useForm({ initialValues })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const hasPassword = !!values.password?.length
  const hasNote = !!values.note?.length
  const hasCustomFields = !!values.customFields?.length

  return (
    <div style={styles.container}>
      {hasPassword && (
        <div style={styles.section}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Credentials')}
          </Text>

          <MultiSlotInput testID="credentials-multi-slot-input">
            <PasswordField
              label={t('Wi-Fi Password')}
              placeholder={t('Insert Wi-Fi Password')}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="credentials-multi-slot-input-slot-0"
              {...toReadOnlyFieldProps(register('password'))}
            />
            <WifiPasswordQRCode
              ssid={values.title}
              password={values.password}
            />
          </MultiSlotInput>
        </div>
      )}

      {(hasNote || hasCustomFields) && (
        <div style={styles.section}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Additional')}
          </Text>

          {hasNote && (
            <MultiSlotInput testID="comments-multi-slot-input">
              <InputField
                label={t('Comment')}
                placeholder={t('Add comment')}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="comments-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('note'))}
              />
            </MultiSlotInput>
          )}

          {hasCustomFields && (
            <MultiSlotInput testID="hidden-messages-multi-slot-input">
              {(values.customFields as CustomField[]).map((field, index) => (
                <PasswordField
                  key={`${field.type}-${index}`}
                  label={t('Hidden Message')}
                  value={field.note ?? ''}
                  placeholder={t('Enter Hidden Message')}
                  readOnly
                  copyable
                  onCopy={copyToClipboard}
                  isGrouped
                  testID={`hidden-messages-multi-slot-input-slot-${index}`}
                />
              ))}
            </MultiSlotInput>
          )}
        </div>
      )}
    </div>
  )
}
