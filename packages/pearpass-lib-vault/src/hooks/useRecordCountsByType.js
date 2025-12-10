import { useSelector } from 'react-redux'

import { selectRecordCountsByType } from '../selectors/selectRecordCountsByType'

/**
 * @param {{
 *  variables: {
 *    filters: {
 *        folder: string
 *        isFavorite: boolean
 *    }
 * }
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  data: any
 * }}
 */
export const useRecordCountsByType = ({ variables } = {}) => {
  const { isLoading, data } = useSelector(
    selectRecordCountsByType({ filters: variables?.filters })
  )

  return { isLoading, data }
}
