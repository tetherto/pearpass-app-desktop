import { useEffect, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { CategoryAnimation } from './CategoryAnimation'
import { CreditCardAnimation } from './CreditCardAnimation'
import { PasswordFillAnimation } from './PasswordFillAnimation'
import {
  BlackBackground,
  BottomGradient,
  ButtonContainer,
  ContentContainer,
  LogoContainer,
  LogoImage,
  PearPass,
  ProgressContainer,
  ProgressItem,
  StrongText
} from './styles'
import { TutorialContainer } from './TutorialContainer'
import { WelcomeToPearpass } from './WelcomeToPearpass'
import { useRouter } from '../../context/RouterContext'
import { ButtonPrimary, ButtonSecondary } from '../../lib-react-components'
import { LogoLock } from '../../svgs/LogoLock'

export const Intro = () => {
  const { i18n } = useLingui()
  const { navigate } = useRouter()

  const [pageIndex, setPageIndex] = useState(0)

  const [isLockLocked, setIsLockLocked] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLockLocked(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleNextPage = () => {
    if (pageIndex >= 5) {
      navigate('welcome', {
        state: 'createMasterPassword'
      })
      return
    }

    setPageIndex((prevIndex) => prevIndex + 1)
  }

  const handleSkipToLast = () => {
    setPageIndex(5)
  }

  const renderPageContent = () => {
    switch (pageIndex) {
      case 0:
        return html` <${WelcomeToPearpass} isLockLocked=${isLockLocked} /> `
      case 1:
        return html`
          <${TutorialContainer}
            header=${i18n._('Your passwords. Your rules.')}
            description=${[
              i18n._('PearPass is the first truly local,'),
              html`<${StrongText}
                >${i18n._('peer-to-peer password manager.')}<//
              >`,
              i18n._(' Your data'),
              html`<${StrongText}>${i18n._('never touches a server -')}<//>`,
              i18n._('it lives with you, syncs between your devices, and'),
              html`<${StrongText}
                >${i18n._('stays entirely in your control.')}<//
              >`
            ]}
            content=${html`<${LogoImage}
              src="assets/images/intro_lock_3D.webp"
            />`}
          />
        `
      case 2:
        return html`
          <${TutorialContainer}
            header=${i18n._('You hold the keys')}
            description=${[
              i18n._('No one can unlock your data,'),
              html`<${StrongText}>${i18n._('not even us.')}<//>`,
              i18n._('Your data stays '),
              html`<${StrongText}>${i18n._('fully encrypted and local')}<//>`,
              i18n._('to your device.'),
              html`<${StrongText}
                >${i18n._('Keep your master password safe,')}<//
              >`,
              i18n._('because if you lose it, its gone forever.')
            ]}
            content=${html`<${PasswordFillAnimation} />`}
          />
        `
      case 3:
        return html`
          <${TutorialContainer}
            header=${i18n._('Store more than passwords')}
            description=${[
              html`<${StrongText}
                >${i18n._('Your digital life. Organized and encrypted. ')}<//
              >`,
              i18n._(
                'Store everything from passwords to cards, IDs, and notes.'
              ),
              html`<${StrongText}
                >${i18n._('Grouped how you like. Accessible only to you.')}<//
              >`
            ]}
            content=${html`<${CategoryAnimation} />`}
          />
        `
      case 4:
        return html`
          <${TutorialContainer}
            header=${i18n._('All in one encrypted place.')}
            description=${[
              html`<${StrongText}>${i18n._('Store everything')}<//>`,
              i18n._('from passwords to payment cards, IDs, and private notes')
            ]}
            content=${html`<${CreditCardAnimation} />`}
          />
        `

      case 5:
        return html`
          <${TutorialContainer}
            header=${i18n._('Sync, without the Cloud')}
            description=${[
              html`<${StrongText}>${i18n._('No servers. No middlemen.')}<//>`,
              i18n._('Pearpass syncs directly across your devices using'),
              html`<${StrongText}>${i18n._('peer-to-peer technology,')}<//>`,
              i18n._('powered by Pear Runtime.')
            ]}
            content=${html`<img src="assets/images/LinkedDevices.svg" />`}
          />
        `

      default:
        return null
    }
  }

  const isFirstPage = pageIndex === 0
  const isLastPage = pageIndex === 5

  return html`
    <${BlackBackground} pageIndex=${pageIndex} hasImageBackground=${isLastPage}>
      <${LogoContainer}>
        <${LogoLock} width="42" height="57" />
        <${PearPass}>PearPass<//>
      <//>

      <${ContentContainer}> ${renderPageContent()} <//>

      <${ButtonContainer} className=${isLockLocked ? 'fade-in' : ''}>
        <${ButtonPrimary} disabled=${!isLockLocked} onClick=${handleNextPage}>
          ${isFirstPage ? i18n._('Get started') : i18n._('Continue')}
        <//>
        ${!isLastPage &&
        html`
          <${ButtonSecondary} onClick=${handleSkipToLast}>
            ${i18n._('Skip')}
          <//>
        `}

        <${ProgressContainer}>
          <${ProgressItem}
            onClick=${() => setPageIndex(0)}
            isSelected=${pageIndex === 0}
          />
          <${ProgressItem}
            onClick=${() => setPageIndex(1)}
            isSelected=${pageIndex === 1}
          />
          <${ProgressItem}
            onClick=${() => setPageIndex(2)}
            isSelected=${pageIndex === 2}
          />
          <${ProgressItem}
            onClick=${() => setPageIndex(3)}
            isSelected=${pageIndex === 3}
          />
          <${ProgressItem}
            onClick=${() => setPageIndex(4)}
            isSelected=${pageIndex === 4}
          />
          <${ProgressItem}
            onClick=${() => setPageIndex(5)}
            isSelected=${pageIndex === 5}
          />
        <//>
      <//>

      <${BottomGradient} />
    <//>
  `
}
