/** @typedef {import('pear-interface')} */

import { useEffect, useRef } from 'react'

import { html } from 'htm/react'

import { UpdateRequiredModalContent } from '../containers/Modal/UpdateRequiredModalContent'
import { useModal } from '../context/ModalContext'

export const usePearUpdate = () => {
  const { setModal } = useModal()
  const modalShownRef = useRef(false)

  const showUpdateRequiredModal = () => {
    if (modalShownRef.current || !Pear.config.key) {
      return
    }

    setModal(
      html`<${UpdateRequiredModalContent} onUpdate=${handleUpdateApp} />`,
      { closable: false }
    )

    modalShownRef.current = true
  }

  const checkIfUpdated = async () => {
    const update = await Pear.updated()

    if (update) {
      showUpdateRequiredModal()
    }
  }

  const onPearUpdate = (update) => {
    if (shouldIgnoreChanges(update?.diff)) {
      return
    }

    // `key` is undefined in DEV mode.
    if (!Pear.config.key) {
      // Reload is necessary for hot-reload after TS compile.
      Pear.reload()
      return
    }

    showUpdateRequiredModal()
  }

  useEffect(() => {
    checkIfUpdated()

    Pear.updates(onPearUpdate)
  }, [])
}

function shouldIgnoreChanges(diff) {
  return diff?.every(
    ({ key: file }) =>
      file.startsWith('/src') ||
      file.startsWith('/logs') ||
      file.includes('pearpass-native-messaging.sock')
  )
}

function handleUpdateApp() {
  Pear.restart({ platform: false })
}
