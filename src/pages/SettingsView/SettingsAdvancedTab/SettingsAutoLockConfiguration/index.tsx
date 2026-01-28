import { html } from 'htm/react'
import { AUTO_LOCK_TIMEOUT_OPTIONS, BE_AUTO_LOCK_ENABLED } from 'pearpass-lib-constants'
import { useState } from 'react'
import styled from 'styled-components'
import { PopupMenu } from '../../../../components/PopupMenu'
import { Select } from '../../../../components/Select'

import { useAutoLockPreferences } from '../../../../hooks/useAutoLockPreferences'
import { useTranslation } from '../../../../hooks/useTranslation'
import { InfoIcon } from '../../../../lib-react-components'
import { TooltipWrapper } from '../../../../lib-react-components/components/TooltipWrapper'
import {
  Container,
  ListContainer,
  TooltipContainer,
  TooltipContent,
  Wrapper
} from './styles'

const Label = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
`

const Description = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`

export const TIMEOUT_OPTIONS = Object.values(AUTO_LOCK_TIMEOUT_OPTIONS)

export const AutoLockConfiguration = () => {
  const { t } = useTranslation()

  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const { timeoutMs, setTimeoutMs } = useAutoLockPreferences()

  const translatedOptions = TIMEOUT_OPTIONS.map((option) => ({
    ...option,
    label: t(option.label)
  }))

  const selectedOption = timeoutMs === null
    ? translatedOptions.find((option) => option.value === null)
    : translatedOptions.find((option) => option.value === timeoutMs) ||
    translatedOptions[0]

  return html`
    <${Container}>
      <${Wrapper}>
        <${ContentWrapper}>
          <${Label}>${t('Auto Log-out')}<//>
          <${Description}>
            ${t(
    'Automatically logs you out after you stop interacting with the app, based on the timeout you select.'
  )}
          <//>
        <//>
        <${Select}
          items=${translatedOptions}
          selectedItem=${selectedOption}
          onItemSelect=${(item: { label: string; value: number | null }) => setTimeoutMs(item.value)}
          placeholder=${t('Select a timeout')}
        />
      <//>
      <${TooltipContainer}>
        <${PopupMenu}
          displayOnHover=${true}
          side="right"
          align="right"
          isOpen=${isTooltipOpen}
          setIsOpen=${setIsTooltipOpen}
          content=${html`
            <${TooltipWrapper}>
              <${TooltipContent}>
                <${ListContainer}>
                  <li>
                    ${t(
    "Auto-lock determines how long Pearpass stays unlocked when you're not actively using it."
  )}
                  </li>
                  <li>
                    ${t(
    'Inactivity is based on your interaction with Pearpass, not on device idle time.'
  )}
                  </li>
                  ${BE_AUTO_LOCK_ENABLED && html`<li>
                    ${t(
    "On desktop and browser, Pearpass keeps your session aligned—activity in one helps keep the other unlocked while you're working. Mobile auto-lock is managed separately."
  )}
                  </li>`}
                <//>
              <//>
            <//>
          `}
        >
          <${InfoIcon} />
        <//>
      <//>
    <//>
  `
}
