import React, { useEffect } from 'react'

import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'

import { FormGroup } from '../../../components/FormGroup'
import { FormWrapper } from '../../../components/FormWrapper'
import { InputFieldNote } from '../../../components/InputFieldNote'
import { CustomFields } from '../../CustomFields'
import { PassPhrase } from '../../PassPhrase'

/**
 * @param {{
 *   initialRecord: {
 *    data: {
 *     title: string
 *     passPhrase: string
 *     note: string
 *     customFields: {
 *        type: string
 *        name: string
 *      }[]
 *     }
 *    }
 *  selectedFolder?: string
 * }} props
 */
export const PassPhraseDetailsForm = ({ initialRecord, selectedFolder }) => {
  const initialValues = React.useMemo(
    () => ({
      title: initialRecord?.data?.title ?? '',
      passPhrase: initialRecord?.data?.passPhrase ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder
    }),
    [initialRecord, selectedFolder]
  )

  const { register, registerArray, setValues, values } = useForm({
    initialValues
  })

  const { value: list, registerItem } = registerArray('customFields')

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  return html`
    <${FormWrapper}>
      <${FormGroup}>
        ${!!values?.passPhrase?.length &&
        html`<${PassPhrase} ...${register('passPhrase')} /> `}
      <//>

      <${FormGroup}>
        ${!!values?.note?.length &&
        html` <${InputFieldNote} ...${register('note')} isDisabled /> `}
      <//>

      <${CustomFields}
        areInputsDisabled=${true}
        customFields=${list}
        register=${registerItem}
      />
    <//>
  `
}
