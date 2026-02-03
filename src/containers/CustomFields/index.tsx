import React from 'react'

import { FormGroup } from '../../components/FormGroup'
import { InputFieldNote } from '../../components/InputFieldNote'
import { ButtonRoundIcon, DeleteIcon } from '../../lib-react-components'
import { CopyButton } from '../../components/CopyButton'

interface CustomField {
  id: string
  type: 'note'
  props: Record<string, unknown>
}

interface CustomFieldsProps {
  register: (name: string, index: number) => {
    name: string;
    value: string;
    error?: string;
    onChange: (e: unknown) => void;
  }
  customFields?: CustomField[]
  onClick?: () => void
  areInputsDisabled: boolean
  removeItem?: (index: number) => void
}

/**
 * @param {{
 * register: (name: string, index: number) => {
 *   name: string;
 *   value: string;
 *   error?: string;
 *   onChange: (e: unknown) => void;
 * }
 *  customFields?: {
 *      id: string
 *      type: 'note'
 *      props: Record<string, unknown>
 *  }[]
 *  onClick?: () => void
 *  areInputsDisabled: boolean
 *  removeItem?: () => void
 * }} props
 */
export const CustomFields: React.FC<CustomFieldsProps> = ({
  customFields,
  register,
  areInputsDisabled,
  removeItem,
  onClick
}) => {
  return (
    <React.Fragment>
      {customFields?.map((customField, index) => {
        if (customField.type === 'note') {
          return (
            <FormGroup key={customField.id}>
              <InputFieldNote
                testId={`customfields-input-note-${index}`}
                onClick={onClick}
                isDisabled={areInputsDisabled}
                {...customField.props}
                additionalItems={
                  <React.Fragment>
                    {areInputsDisabled && (
                      <CopyButton value={register('note', index).value} />
                    )}

                    {!areInputsDisabled && (
                      <ButtonRoundIcon
                        testId="customfields-button-remove"
                        startIcon={DeleteIcon}
                        onClick={() => removeItem?.(index)}
                      />
                    )}
                  </React.Fragment>
                }
                {...register('note', index)}
              />
            </FormGroup>
          )
        }
        return null
      })}
    </React.Fragment>
  )
}