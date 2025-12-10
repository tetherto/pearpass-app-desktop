import { useSelector } from 'react-redux'

import { selectRecordById } from '../selectors/selectRecordById'

/**
 * @param {{
 *  variables: {id: string}
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  data: any
 * }}
 */
export const useRecordById = ({ variables } = {}) => {
  const { isLoading, data } = useSelector(selectRecordById(variables?.id))

  return { isLoading, data }
}
