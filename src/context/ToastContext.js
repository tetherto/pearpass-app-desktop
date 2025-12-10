import { createContext, useState, useContext } from 'react'

import { html } from 'htm/react'

import { Toasts } from '../components/Toasts'

const ToastContext = createContext()

/**
 * @param {{
 *  children: import('react').ReactNode
 * }} props
 */
export const ToastProvider = ({ children }) => {
  const [stack, setStack] = useState([])

  const setToast = (data) => {
    setStack((prev) => [...prev, data])

    setTimeout(() => {
      setStack((prev) => prev.slice(1))
    }, 3000)
  }

  return html`
    <${ToastContext.Provider} value=${{ setToast }}>
      ${children}
      <${Toasts} toasts=${stack} />
    <//>
  `
}

/**
 * @returns {{
 *  setToast: (data: { message: string, icon: import('react').ReactNode }) => void
 * }}
 */
export const useToast = () => useContext(ToastContext)
