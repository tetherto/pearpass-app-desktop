import { html } from 'htm/react'
import { AUTO_LOCK_TIMEOUT_OPTIONS } from 'pearpass-lib-constants'
import { useState } from 'react'
import { PopupMenu } from '../../../../components/PopupMenu'
import { Select } from '../../../../components/Select'
import { SwitchWithLabel } from '../../../../components/SwitchWithLabel'
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

export const TIMEOUT_OPTIONS = Object.values(AUTO_LOCK_TIMEOUT_OPTIONS)

export const AutoLockConfiguration = () => {
  const { t } = useTranslation()

  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const { isAutoLockEnabled, timeoutMs, setAutoLockEnabled, setTimeoutMs } =
    useAutoLockPreferences()

  const translatedOptions = TIMEOUT_OPTIONS.map((option) => ({
    ...option,
    label: t(option.label)
  }))

  const selectedOption =
    translatedOptions.find((option) => option.value === timeoutMs) ||
    translatedOptions[0]

  return html`
    <${Container}>
      <${Wrapper}>
        <${SwitchWithLabel}
          isOn=${isAutoLockEnabled}
          onChange=${(isOn: boolean) => setAutoLockEnabled(isOn)}
          label=${t('Auto Log-out')}
          isSwitchFirst
          stretch=${false}
          description=${t(
            'Automatically logs you out after you stop interacting with the app, based on the timeout you select.'
          )}
        />
        ${isAutoLockEnabled &&
        html`
          <${Select}
            items=${translatedOptions}
            selectedItem=${selectedOption}
            onItemSelect=${(item: { label: string; value: number }) =>
              setTimeoutMs(item.value)}
            placeholder=${t('Select a timeout')}
          />
        `}
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
                  <li>
                    ${t(
                      "On desktop and browser, Pearpass keeps your session aligned—activity in one helps keep the other unlocked while you're working. Mobile auto-lock is managed separately."
                    )}
                  </li>
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
