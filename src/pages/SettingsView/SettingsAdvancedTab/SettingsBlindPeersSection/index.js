import { useEffect, useState } from 'react'

import { html } from 'htm/react'
import { BLIND_PEER_TYPE, BLIND_PEERS_LEARN_MORE } from 'pearpass-lib-constants'
import { colors } from 'pearpass-lib-ui-theme-provider'
import { useBlindMirrors } from 'pearpass-lib-vault'

import {
  LearnMoreLink,
  ListContainer,
  TooltipContent,
  TooltipText,
  Wrapper
} from './styles'
import { CardSingleSetting } from '../../../../components/CardSingleSetting'
import { PopupMenu } from '../../../../components/PopupMenu'
import { BlindPeersModalContent } from '../../../../containers/Modal/BlindPeersModalContent'
import { RuleSelector } from '../../../../containers/Modal/GeneratePasswordSideDrawerContent/RuleSelector'
import { useLoadingContext } from '../../../../context/LoadingContext'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { InfoIcon } from '../../../../lib-react-components'
import { TooltipWrapper } from '../../../../lib-react-components/components/TooltipWrapper'
import { OutsideLinkIcon } from '../../../../lib-react-components/icons/OutsideLinkIcon'

export const SettingsBlindPeersSection = () => {
  const { t } = useTranslation()
  const { setIsLoading } = useLoadingContext()
  const { setModal, closeModal } = useModal()
  const { setToast } = useToast()

  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const {
    removeAllBlindMirrors,
    data: blindMirrorsData,
    getBlindMirrors,
    addBlindMirrors,
    addDefaultBlindMirrors
  } = useBlindMirrors()

  const [blindPeersRules, setBlindPeersRules] = useState({
    blindPeers: false
  })

  useEffect(() => {
    if (blindMirrorsData.length > 0) {
      setBlindPeersRules({ blindPeers: true })
    } else {
      setBlindPeersRules({ blindPeers: false })
    }
  }, [blindMirrorsData])

  useEffect(() => {
    getBlindMirrors()
  }, [])

  /**
   * @param {{
   *   callback: () => Promise<void>,
   *   errorMessage: string,
   *   successMessage?: string
   * }} params
   */
  const handleBlindMirrorsRequest = async ({
    callback,
    errorMessage,
    successMessage
  }) => {
    try {
      setIsLoading(true)
      await callback()
      setBlindPeersRules({ blindPeers: !blindPeersRules.blindPeers })

      if (successMessage) {
        setToast({
          message: successMessage
        })
      }
    } catch {
      setToast({
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlindPeersConfirm = async (data) => {
    if (data.blindPeerType === BLIND_PEER_TYPE.PERSONAL) {
      if (data.blindPeers?.length) {
        await handleBlindMirrorsRequest({
          callback: () => addBlindMirrors(data.blindPeers),
          errorMessage: t('Error adding Blind Peers'),
          successMessage: t('Manual Blind Peers enabled successfully')
        })
      } else {
        return
      }
    }

    if (data.blindPeerType === BLIND_PEER_TYPE.DEFAULT) {
      await handleBlindMirrorsRequest({
        callback: addDefaultBlindMirrors,
        errorMessage: t('Error adding Blind Peers'),
        successMessage: t('Automatic Blind Peers enabled successfully')
      })
    }

    closeModal()
  }

  const handleSetBlindPeersRules = async (newRules) => {
    if (newRules.blindPeers === true) {
      setModal(
        html`<${BlindPeersModalContent}
          onConfirm=${handleBlindPeersConfirm}
          onClose=${() => {
            setBlindPeersRules({ blindPeers: false })
            closeModal()
          }}
        />`
      )
    }

    if (newRules.blindPeers === false) {
      await handleBlindMirrorsRequest({
        callback: removeAllBlindMirrors,
        errorMessage: t('Error removing Blind Peers')
      })
    }
  }

  return html`
    <${CardSingleSetting}
      title=${t('Blind Peering')}
      additionalHeaderContent=${html`
        <${PopupMenu}
          displayOnHover=${true}
          side="right"
          align="right"
          isOpen=${isTooltipOpen}
          setIsOpen=${setIsTooltipOpen}
          content=${html`
            <${TooltipWrapper}>
              <${TooltipContent}>
                <${TooltipText}>
                  ${t('Choose between:')}

                  <${ListContainer}>
                    <li>
                      ${t(
                        'Automatic blind peers: Let PearPass allocate blind peers for you to handle syncing.'
                      )}
                    </li>
                    <li>
                      ${t(
                        'Manual blind peers: Setup your own private blind peers.'
                      )}
                    </li>
                  <//>
                  ${t(
                    'In both cases, all data stays fully encrypted, ensuring safe, non-intrusive replication and better data consistency.'
                  )}
                <//>
                <${LearnMoreLink} href=${BLIND_PEERS_LEARN_MORE}>
                  <${OutsideLinkIcon} color=${colors.primary400.mode1} />
                  ${t('Learn more about blind peering.')}
                <//>
              <//>
            <//>
          `}
        >
          <${InfoIcon} />
        <//>
      `}
    >
      <${Wrapper}>
        <${RuleSelector}
          rules=${[
            {
              name: 'blindPeers',
              label: t(`Private Connections`),
              description: t(
                'Sync your encrypted vault securely with blind peers to improve availability and consistency. Blind peers cannot read your data.'
              )
            }
          ]}
          selectedRules=${blindPeersRules}
          setRules=${handleSetBlindPeersRules}
        />
        <${LearnMoreLink} href=${BLIND_PEERS_LEARN_MORE}>
          <${OutsideLinkIcon} color=${colors.primary400.mode1} />
          ${t('Learn more about blind peering.')}
        <//>
      <//>
    <//>
  `
}
