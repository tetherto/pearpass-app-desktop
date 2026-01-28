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
import {
  CalendarIcon,
  CreditCardIcon,
  InputField,
  NineDotsIcon,
  PasswordField,
  UserIcon
} from '../../../lib-react-components'
import { AttachmentField } from '../../AttachmentField'
import { CustomFields } from '../../CustomFields'

/**
 * @param {{
 *   initialRecord: {
 *   data: {
 *    title: string
 *    name: string
 *    number: string
 *    expireDate: string
 *    securityCode: string
 *    pinCode: string
 *    note: string
 *    customFields: {
 *       type: string
 *       name: string
 *    }[]
 *    attachments: { id: string, name: string}[]
 *  }
 * }
 *  selectedFolder?: string
 * }} props
 */
export const CreditCardDetailsForm = ({ initialRecord, selectedFolder }) => {
  const { i18n } = useLingui()

  const initialValues = React.useMemo(
    () => ({
      name: initialRecord?.data?.name ?? '',
      number: initialRecord?.data?.number ?? '',
      expireDate: initialRecord?.data?.expireDate ?? '',
      securityCode: initialRecord?.data?.securityCode ?? '',
      pinCode: initialRecord?.data?.pinCode ?? '',
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
        ${!!values?.name?.length &&
        html`
          <${InputField}
            label=${i18n._('Full name')}
            placeholder=${i18n._('Full name')}
            variant="outline"
            icon=${UserIcon}
            isDisabled
            ...${register('name')}
            additionalItems=${html` <${CopyButton} value=${values.name} /> `}
          />
        `}
        ${!!values?.number?.length &&
        html`
          <${InputField}
            label=${i18n._('Number on card')}
            placeholder="1234 1234 1234 1234 "
            variant="outline"
            icon=${CreditCardIcon}
            isDisabled
            ...${register('number')}
            value=${values.number.replace(/(.{4})/g, '$1 ').trim()}
            additionalItems=${html`
              <${CopyButton} value=${values.number.replace(/\s/g, '')} />
            `}
          />
        `}
        ${!!values?.expireDate?.length &&
        html`
          <${InputField}
            label=${i18n._('Date of expire')}
            placeholder="MM YY"
            variant="outline"
            icon=${CalendarIcon}
            isDisabled
            ...${register('expireDate')}
            additionalItems=${html`
              <${CopyButton} value=${values.expireDate} />
            `}
          />
        `}
        ${!!values?.securityCode?.length &&
        html`
          <${PasswordField}
            label=${i18n._('Security code')}
            placeholder="123"
            variant="outline"
            icon=${CreditCardIcon}
            isDisabled
            ...${register('securityCode')}
            additionalItems=${html`
              <${CopyButton} value=${values.securityCode} />
            `}
          />
        `}
        ${!!values?.pinCode?.length &&
        html`
          <${PasswordField}
            label=${i18n._('Pin code')}
            placeholder="1234"
            variant="outline"
            icon=${NineDotsIcon}
            isDisabled
            ...${register('pinCode')}
            additionalItems=${html` <${CopyButton} value=${values.pinCode} /> `}
          />
        `}
      <//>

      ${values?.attachments?.length > 0 &&
      html`
        <${FormGroup}>
          ${values.attachments.map(
            (attachment) => html`
              <${AttachmentField}
                label=${i18n._('File')}
                attachment=${attachment}
              />
            `
          )}
        <//>
      `}

      <${FormGroup}>
        ${!!values?.note?.length &&
        html`
          <${InputFieldNote}
            isDisabled
            ...${register('note')}
            additionalItems=${html` <${CopyButton} value=${values.note} /> `}
          />
        `}
      <//>

      <${CustomFields}
        areInputsDisabled=${true}
        customFields=${list}
        register=${registerItem}
      />
    <//>
  `
}
