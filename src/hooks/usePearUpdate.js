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
    if (!hasNonIgnoredChanges(update?.diff)) {
      return
    }

    if (!Pear.config.key) {
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

function hasNonIgnoredChanges(diff) {
  return diff?.some(
    ({ key: file }) =>
      !file.startsWith('/logs') &&
      !file.includes('pearpass-native-messaging.sock')
  )
}

function handleUpdateApp() {
  Pear.restart({ platform: false })
}
