import React, { useEffect } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'

import { CopyButton } from '../../../components/CopyButton'
import { FormGroup } from '../../../components/FormGroup'
import { FormWrapper } from '../../../components/FormWrapper'
import { ATTACHMENTS_FIELD_KEY } from '../../../constants/formFields'
import { useGetMultipleFiles } from '../../../hooks/useGetMultipleFiles'
import { TextArea } from '../../../lib-react-components'
import { AttachmentField } from '../../AttachmentField'
import { CustomFields } from '../../CustomFields'

/**
 * @param {{
 *   initialRecord: {
 *    data: {
 *     title: string
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
export const NoteDetailsForm = ({ initialRecord, selectedFolder }) => {
  const { i18n } = useLingui()

  const initialValues = React.useMemo(
    () => ({
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
        ${!!values?.note?.length &&
        html`
          <${TextArea}
            ...${register('note')}
            placeholder=${i18n._('Write a note...')}
            isDisabled
            additionalItems=${html`<${CopyButton} value=${values.note} />`}
          />
        `}
      <//>
      ${values?.attachments?.length > 0 &&
      html`
        <${FormGroup}>
          ${values.attachments.map(
            (attachment) => html`
              <${AttachmentField}
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
