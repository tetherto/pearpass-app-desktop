import React, { useEffect } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'

import { FormGroup } from '../../../components/FormGroup'
import { FormWrapper } from '../../../components/FormWrapper'
import { InputFieldNote } from '../../../components/InputFieldNote'
import { useToast } from '../../../context/ToastContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard'
import { CopyIcon } from '../../../lib-react-components'
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

  const handleCopy = (value) => {
    if (!value?.length) {
      return
    }

    copyToClipboard(value)
  }

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
        html`
          <${InputFieldNote}
            ...${register('note')}
            onClick=${handleCopy}
            isDisabled
          />
        `}
      <//>

      <${CustomFields}
        areInputsDisabled=${true}
        customFields=${list}
        onClick=${handleCopy}
        register=${registerItem}
      />
    <//>
  `
}
