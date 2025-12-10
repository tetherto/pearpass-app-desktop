import React, { useState } from 'react'

import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { getNestedValue } from '../utils/getNestedValue'
import { setNestedValue } from '../utils/setNestedValue'

const assignUniqueId = (item) => ({
  id: generateUniqueId(),
  ...item
})

const setInitialValues = (initialValues) =>
  Object.entries(initialValues).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      return {
        ...acc,
        [key]: value.map(assignUniqueId)
      }
    }

    return {
      ...acc,
      [key]: value
    }
  }, {})

/**
 * @param {{
 *  initialValues: Record<string, string>;
 *  validate: (values: Record<string, string>) => Record<string, string>;
 * }} params
 * @returns {{
 *  values: Record<string, string>;
 *  errors: Record<string, string>;
 *  hasErrors: boolean;
 *  setValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
 *  setValue: (name: string, value: any) => void;
 *  register: (name: string) => {
 *      name: string;
 *      value: string;
 *      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 *  };
 *  handleSubmit: (callback: (values: Record<string, string>) => void) => (e: React.FormEvent<HTMLFormElement>) => void;
 *  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
 *  registerArray: (name: string) => {
 *    value: any[];
 *    addItem: (item: any) => void;
 *    removeItem: (index: number) => void;
 *    registerItem: (itemName: string, index: number) => {
 *    name: string;
 *    value: string;
 *    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 *  };
 * };
 * }}
 */
export const useForm = ({ initialValues = {}, validate = () => ({}) }) => {
  const [values, setValues] = useState(setInitialValues(initialValues))

  const [errors, setErrors] = useState({})

  const hasSomeErrors = (errors) =>
    Object.entries(errors).some(([_, value]) => !!value?.length)

  const hasErrors = React.useMemo(() => hasSomeErrors(errors), [errors])

  const setValue = (name, value) => {
    setValues((prev) => setNestedValue(prev, name, value))
  }

  const register = (name) => ({
    name,
    value: getNestedValue(values, name, ''),
    error: getNestedValue(errors, name, ''),
    onChange: (event) => {
      const value = event?.target?.value || event

      setErrors((prev) => setNestedValue(prev, name, null))

      setValue(name, value)
    }
  })

  const registerArray = (name) => ({
    value: values[name] || [],
    addItem: (item) =>
      setValues((prev) => ({
        ...prev,
        [name]: [
          ...(prev[name] || []),
          {
            id: generateUniqueId(),
            ...item
          }
        ]
      })),
    removeItem: (index) =>
      setValues((prev) => ({
        ...prev,
        [name]: prev[name].filter((_, i) => i !== index)
      })),
    registerItem: (itemName, index) => ({
      name: `${name}[${index}]`,
      value: getNestedValue(values, `${name}[${index}].${itemName}`, ''),
      error: errors?.[name]?.find(({ error, index: i }) =>
        i === index ? error[itemName] : null
      )?.error?.[itemName],
      onChange: (e) => {
        setValue(`${name}[${index}].${itemName}`, e?.target?.value || e)

        setErrors((prev) => ({
          ...prev,
          [name]: prev?.[name]?.filter((item) => item.index !== index)
        }))
      }
    })
  })

  const handleSubmit = (callback) => (event) => {
    event?.preventDefault()

    const validationErrors = validate(values) || {}

    if (!hasSomeErrors(validationErrors)) {
      callback(values)
    } else {
      setErrors(validationErrors)
    }
  }

  return {
    values,
    errors,
    hasErrors,
    register,
    handleSubmit,
    setValues,
    setValue,
    setErrors,
    registerArray
  }
}
