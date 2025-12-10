import { useState } from 'react'

import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

/**
 * @param {{
 *  customFields?: {
 *      id: string,
 *      type: string,
 *      props: any
 *  }[]
 * }} props
 * @returns {{
 *  customFields: {id: string, type: string, props: any}[],
 *  createCustomField: (type: string, props: any) => void,
 *  setCustomFields: React.Dispatch<React.SetStateAction<{id: string, type: string, props: any}[]>>
 * }}
 */
export const useCustomFields = ({
  customFields: initialCustomFields = []
} = {}) => {
  const [customFields, setCustomFields] = useState(initialCustomFields)

  const createCustomField = (type, props) => {
    const id = generateUniqueId()

    return {
      id,
      type,
      props: {
        ...props
      }
    }
  }

  return {
    customFields,
    createCustomField,
    setCustomFields
  }
}
