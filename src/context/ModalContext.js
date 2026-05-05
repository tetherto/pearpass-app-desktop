import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react'

import { generateUniqueId } from '@tetherto/pear-apps-utils-generate-unique-id'
import { html } from 'htm/react'

import { Overlay } from '../components/Overlay'
import { BASE_TRANSITION_DURATION } from '../constants/transitions'
import { ModalWrapper } from '../containers/Modal'
import { SideDrawer } from '../containers/Modal/SideDrawer'

// Pad past the overlay fade so unmount lands after `transitionend`.
export const STACK_CLEANUP_BUFFER = 100

const ModalContext = createContext()

const getTopModal = (modalStack) => modalStack[modalStack.length - 1]

const DEFAULT_MODAL_PARAMS = {
  hasOverlay: true,
  overlayType: 'default',
  modalType: 'default',
  closable: true,
  replace: false
}

/**
 * @param {{
 *  children: import('react').ReactNode
 * }} props
 */
export const ModalProvider = ({ children }) => {
  const [modalStack, setModalStack] = useState([])
  // Ids that already have a removal timer pending, to avoid duplicates.
  const scheduledIdsRef = useRef(new Set())

  const isOpen = !!modalStack.length

  const setModal = useCallback((content, params) => {
    setModalStack((prevState) => {
      if (params?.replace) {
        return [
          {
            content,
            id: generateUniqueId(),
            isOpen: true,
            params: { ...DEFAULT_MODAL_PARAMS, ...params }
          }
        ]
      }

      return [
        ...prevState,
        {
          content,
          id: generateUniqueId(),
          isOpen: true,
          params: { ...DEFAULT_MODAL_PARAMS, ...params }
        }
      ]
    })
  }, [])

  const closeModal = useCallback(() => {
    setModalStack((prevState) => {
      // Skip entries already closing so a rapid second close hits the modal
      // beneath one mid-transition.
      for (let i = prevState.length - 1; i >= 0; i--) {
        if (prevState[i].isOpen) {
          const next = [...prevState]
          next[i] = { ...next[i], isOpen: false }
          return next
        }
      }
      return prevState
    })
  }, [])

  // Drops closing entries after their fade. Runs as an effect because the
  // state closeModal flips isn't visible until the next render.
  useEffect(() => {
    const closingEntries = modalStack.filter(
      (m) => !m.isOpen && !scheduledIdsRef.current.has(m.id)
    )
    if (closingEntries.length === 0) return

    closingEntries.forEach(({ id }) => {
      scheduledIdsRef.current.add(id)
      setTimeout(() => {
        setModalStack((prev) => prev.filter((m) => m.id !== id))
        scheduledIdsRef.current.delete(id)
      }, BASE_TRANSITION_DURATION + STACK_CLEANUP_BUFFER)
    })
  }, [modalStack])

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        const topModal = getTopModal(modalStack)
        if (topModal?.params?.closable !== false) {
          void closeModal()
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [isOpen])

  const contextValue = useMemo(
    () => ({ isOpen, setModal, closeModal }),
    [isOpen, setModal, closeModal]
  )

  return html`
    <${ModalContext.Provider} value=${contextValue}>
      ${children}
      ${modalStack?.map(
        ({ content, id, isOpen, params }) => html`
          <${ModalWrapper} key=${id}>
            ${params.hasOverlay &&
            html`<${Overlay}
              onClick=${params?.closable ? closeModal : undefined}
              type=${params.overlayType}
              isOpen=${isOpen}
            /> `}
            ${params.modalType === 'sideDrawer' &&
            html`<${SideDrawer} isOpen=${isOpen}> ${content} <//>`}
            ${params.modalType === 'default' && isOpen && content}
          <//>
        `
      )}
    <//>
  `
}

/**
 * @returns {{
 *   isOpen: boolean,
 *   setModal: (content: any, params?: any) => void,
 *   closeModal: () => void
 * }}
 */
export const useModal = () => useContext(ModalContext)
