/** @typedef {import('pear-interface')} */

import { useEffect, useRef } from 'react'

import { html } from 'htm/react'

import { UpdateRequiredModalContent } from '../containers/Modal/UpdateRequiredModalContent'
import { useModal } from '../context/ModalContext'

export const usePearUpdate = () => {
  const { setModal } = useModal()
  const modalShownRef = useRef(false)
  const electronAPI = window.electronAPI

  const showUpdateRequiredModal = () => {
    if (modalShownRef.current || !Pear.config.key) return

    setModal(
      html`<${UpdateRequiredModalContent} onUpdate=${handleUpdateApp} />`,
      { closable: false }
    )

    modalShownRef.current = true
  }

  const onPearEvent = (name, listener) => {
    if (!electronAPI) return () => {}

    if (name === 'updated') {
      return electronAPI.onRuntimeUpdated(() => listener('updated'))
    }

    return () => {}
  }

  useEffect(() => {
    // DEV: preserve hot-reload behaviour driven by Pear core.
    const checkUpdated = async () => {
      const isUpdated = await electronAPI.checkUpdated()
      if (isUpdated) {
        showUpdateRequiredModal()
      }
    }
    checkUpdated()
    if (!Pear.config.key) {
      const onPearUpdate = () => {
        Pear.reload()
      }
      Pear.updates(onPearUpdate)
      return () => {
        Pear.updates(() => {})
      }
    }

    const offUpdated = onPearEvent('updated', async () => {
      showUpdateRequiredModal()
    })

    return () => {
      offUpdated?.()
    }
  }, [])
}

async function handleUpdateApp() {
  const electronAPI = window.electronAPI
  if (!electronAPI) return
  electronAPI.restart()
}
