import { useEffect, useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import {
  InputField,
  MultiSlotInput,
  PasswordField
} from '@tetherto/pearpass-lib-ui-kit'

import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useTranslation } from '../../../hooks/useTranslation'
import { PassPhrase } from '../../PassPhrase/PassPhrase'
import { createStyles } from './PassPhraseDetailsForm.styles'
import { toReadOnlyFieldProps } from './utils'

type CustomField = {
  type: string
  name?: string
  note?: string
}

type PassPhraseRecord = {
  id: string
  folder?: string
  data: {
    title?: string
    passPhrase?: string
    note?: string
    customFields?: CustomField[]
  }
}

type PassPhraseDetailsFormProps = {
  initialRecord?: PassPhraseRecord
  selectedFolder?: string
}

type PassPhraseDetailsFormValues = {
  title: string
  passPhrase: string
  note: string
  customFields: CustomField[]
  folder?: string
}

export const PassPhraseDetailsForm = ({
  initialRecord,
  selectedFolder
}: PassPhraseDetailsFormProps) => {
  const { t } = useTranslation()
  const styles = createStyles()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<PassPhraseDetailsFormValues>(
    () => ({
      title: initialRecord?.data?.title ?? '',
      passPhrase: initialRecord?.data?.passPhrase ?? '',
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

  const hasPassPhrase = !!values.passPhrase?.length
  const hasNote = !!values.note?.length
  const hasCustomFields = !!values.customFields?.length

  return (
    <div style={styles.container}>
      {hasPassPhrase && <PassPhrase value={values.passPhrase} />}

      {hasNote && (
        <MultiSlotInput testID="comments-multi-slot-input">
          <InputField
            label={t('Comment')}
            placeholder={t('Enter Comment')}
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
  )
}
