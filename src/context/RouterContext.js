import { createContext, useState, useContext } from 'react'

import { html } from 'htm/react'

const RouterContext = createContext()

/**
 * @typedef RouterProviderProps
 * @property {import('react').ReactNode} children React node to be rendered inside
 */

/**
 * @param {RouterProviderProps} props
 */
export const RouterProvider = ({ children }) => {
  const [state, setState] = useState({
    currentPage: 'loading',
    data: {
      recordId: '',
      recordType: 'all'
    }
  })

  const navigate = (page, data = {}) => {
    setState({ currentPage: page, data })
  }

  return html`
    <${RouterContext.Provider} value=${{ ...state, navigate }}> ${children} <//>
  `
}

/**
 * @returns {{
 *   currentPage: string,
 *   data: Object.<string, any>,
 *   navigate: (currentPage: string, data: Object.<string, any>) => void
 * }}
 */
export const useRouter = () => useContext(RouterContext)
