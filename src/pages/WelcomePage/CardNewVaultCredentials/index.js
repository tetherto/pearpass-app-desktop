import { useEffect } from 'react'

import { html } from 'htm/react'

import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { CreateVaultModalContent } from '../../../containers/Modal/CreateVaultModalContent'
import { useModal } from '../../../context/ModalContext'
import { useRouter } from '../../../context/RouterContext'

export const CardNewVaultCredentials = () => {
  const { navigate, currentPage } = useRouter()
  const { closeModal, setModal } = useModal()

  useEffect(() => {
    const handleClose = () => {
      closeModal()
      navigate(currentPage, { state: NAVIGATION_ROUTES.VAULTS })
    }

    setModal(
      html`<${CreateVaultModalContent}
        onClose=${handleClose}
        onSuccess=${closeModal}
      />`,
      { replace: true }
    )
  }, [closeModal, currentPage, navigate, setModal])

  return null
}
