import React from 'react'

import { html } from 'htm/react'

import { FormGroup } from '../../components/FormGroup'
import { InputFieldNote } from '../../components/InputFieldNote'
import { ButtonRoundIcon, DeleteIcon } from '../../lib-react-components'

/**
 * @param {{
 *  register: (name: string, index: number) => any
 *  customFields?: {
 *      id: string
 *      type: 'note'
 *      props: any
 *  }[]
 *  onClick?: () => void
 *  areInputsDisabled: boolean
 *  removeItem?: () => void
 * }} props
 */
export const CustomFields = ({
  customFields,
  register,
  areInputsDisabled,
  removeItem,
  onClick
}) => html`
  <${React.Fragment}>
    ${customFields?.map((customField, index) => {
      if (customField.type === 'note') {
        return html`
          <${FormGroup} key=${customField.id}>
            <${InputFieldNote}
              testId="customfields-input-note"
              onClick=${onClick}
              isDisabled=${areInputsDisabled}
              additionalItems=${!areInputsDisabled &&
              html`
                <${ButtonRoundIcon}
                  testId="customfields-button-remove"
                  startIcon=${DeleteIcon}
                  onClick=${() => removeItem?.(index)}
                />
              `}
              ...${register('note', index)}
            />
          <//>
        `
      }
    })}
  <//>
`
