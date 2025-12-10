import React, { useEffect } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { isBefore, subtractDateUnits } from 'pear-apps-utils-date'

import { AlertBox } from '../../../components/AlertBox'
import { FormGroup } from '../../../components/FormGroup'
import { FormWrapper } from '../../../components/FormWrapper'
import { InputFieldNote } from '../../../components/InputFieldNote'
import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useToast } from '../../../context/ToastContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import {
  CompoundField,
  CopyIcon,
  InputField,
  KeyIcon,
  PasswordField,
  UserIcon,
  WorldIcon
} from '../../../lib-react-components'
import { isPasswordChangeReminderDisabled } from '../../../utils/isPasswordChangeReminderDisabled'
import { AttachmentField } from '../../AttachmentField'
import { CustomFields } from '../../CustomFields'

/**
 * @param {{
 *   initialRecord: {
 *   data: {
 *    title: string
 *    username: string
 *    password: string
 *    note: string
 *    websites: string[]
 *    customFields: {
 *        type: string
 *        name: string
 *     }[]
 *    attachments: { id: string, name: string}[]
 *    }
 *  }
 *  selectedFolder?: string
 * }} props
 */
export const LoginRecordDetailsForm = ({ initialRecord, selectedFolder }) => {
  const { i18n } = useLingui()

  const { setToast } = useToast()

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: i18n._('Copied to clipboard'),
        icon: CopyIcon
      })
    }
  })

  const initialValues = React.useMemo(
    () => ({
      username: initialRecord?.data?.username ?? '',
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      websites: initialRecord?.data?.websites?.length
        ? initialRecord?.data?.websites.map((website) => ({ website }))
        : [{ name: 'website' }],
      customFields: initialRecord?.data.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? []
    }),
    [initialRecord, selectedFolder]
  )

  const { register, registerArray, setValues, values, setValue } = useForm({
    initialValues
  })

  const { value: websitesList, registerItem } = registerArray('websites')

  const { value: customFieldsList, registerItem: registerCustomFieldItem } =
    registerArray('customFields')

  useGetMultipleFiles({
    fieldNames: [ATTACHMENTS_FIELD_KEY],
    updateValues: setValue,
    initialRecord
  })
  const handleWebsiteClick = (url) => {
    if (!url?.length) {
      return
    }

    window.open(url, '_blank')
  }

  const handleCopy = (value) => {
    if (!value?.length) {
      return
    }

    copyToClipboard(value)
  }
  const isPasswordSixMonthsOld = () => {
    const { passwordUpdatedAt } = initialRecord?.data || {}
    return (
      !!passwordUpdatedAt &&
      isBefore(passwordUpdatedAt, subtractDateUnits(6, 'month'))
    )
  }

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  return html`
    ${!isPasswordChangeReminderDisabled() &&
    isPasswordSixMonthsOld() &&
    html`
      <${AlertBox}
        message=${html`
          ${i18n._('It’s been 6 months since you last updated this password')}
          <br />
          ${i18n._('Consider changing it to keep your account secure.')}
        `}
      />
    `}
    <${FormWrapper}>
      <${FormGroup}>
        ${!!values?.username?.length &&
        html`
          <${InputField}
            label=${i18n._('Email or username')}
            placeholder=${i18n._('Email or username')}
            variant="outline"
            icon=${UserIcon}
            onClick=${handleCopy}
            isDisabled
            ...${register('username')}
          />
        `}
        ${!!values?.password?.length &&
        html`
          <${PasswordField}
            label=${i18n._('Password')}
            placeholder=${i18n._('Password')}
            variant="outline"
            icon=${KeyIcon}
            onClick=${handleCopy}
            isDisabled
            ...${register('password')}
          />
        `}
      <//>

      ${!!values?.websites?.length &&
      html`
        <${CompoundField}>
          ${websitesList.map(
            (website, index) => html`
              <${React.Fragment} key=${website.id}>
                <${InputField}
                  label=${i18n._('Website')}
                  placeholder=${i18n._('https://')}
                  icon=${WorldIcon}
                  ...${registerItem('website', index)}
                  isDisabled
                  onClick=${() =>
                    handleWebsiteClick(registerItem('website', index).value)}
                />
              <//>
            `
          )}
        <//>
      `}
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
            ...${register('note')}
            onClick=${handleCopy}
            isDisabled
          />
        `}
      <//>

      <${CustomFields}
        customFields=${customFieldsList}
        onClick=${handleCopy}
        register=${registerCustomFieldItem}
        areInputsDisabled=${true}
      />
    <//>
  `
}
