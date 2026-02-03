import React, { useEffect } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'

import { CopyButton } from '../../../components/CopyButton'
import { FormGroup } from '../../../components/FormGroup'
import { FormWrapper } from '../../../components/FormWrapper'
import { InputFieldNote } from '../../../components/InputFieldNote'
import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import { PasswordField, PasswordIcon } from '../../../lib-react-components'
import { AttachmentField } from '../../AttachmentField'
import { CustomFields } from '../../CustomFields'
import { WifiPasswordQRCode } from '../../WifiPasswordQRCode'

/**
 * @param {{
 *   initialRecord: {
 *    data: {
 *     title: string
 *     password: string
 *     note: string
 *     customFields: {
 *        type: string
 *        name: string
 *      }[]
 *    attachments: { id: string, name: string}[]
 *     }
 *    }
 *  selectedFolder?: string
 * }} props
 */
export const WifiDetailsForm = ({ initialRecord, selectedFolder }) => {
  const { i18n } = useLingui()

  const initialValues = React.useMemo(
    () => ({
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? []
    }),
    [initialRecord, selectedFolder]
  )

  const { register, registerArray, setValues, values, setValue } = useForm({
    initialValues
  })

  const { value: list, registerItem } = registerArray('customFields')

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  return html`
    <${FormWrapper}>
      <${FormGroup}>
        ${!!values?.password?.length &&
        html`
          <${PasswordField}
            testId="wifidetails-field-password"
            label=${i18n._('Password')}
            placeholder=${i18n._('Password')}
            belowInputContent=${html`
              <${WifiPasswordQRCode}
                ssid=${initialRecord?.data?.title}
                password=${values?.password}
              />
            `}
            variant="outline"
            icon=${PasswordIcon}
            isDisabled
            ...${register('password')}
            additionalItems=${html`
              <${CopyButton} value=${values.password} />
            `}
          />
        `}
      <//>

      <${FormGroup}>
        ${!!values?.note?.length &&
        html`
          <${InputFieldNote}
            testId="wifidetails-field-note"
            ...${register('note')}
            isDisabled
            additionalItems=${html` <${CopyButton} value=${values.note} /> `}
          />
        `}
      <//>
      ${values?.attachments?.length > 0 &&
      html`
        <${FormGroup}>
          ${values.attachments.map(
            (attachment) => html`
              <${AttachmentField}
                testId="wifidetails-attachment"
                key=${attachment.id}
                label=${i18n._('File')}
                attachment=${attachment}
              />
            `
          )}
        <//>
      `}
      <${CustomFields}
        areInputsDisabled=${true}
        customFields=${list}
        register=${registerItem}
      />
    <//>
  `
}
