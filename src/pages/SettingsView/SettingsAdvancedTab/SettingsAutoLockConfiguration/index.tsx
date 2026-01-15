import { html } from 'htm/react'
import { useTranslation } from '../../../../hooks/useTranslation'
import { SwitchWithLabel } from '../../../../components/SwitchWithLabel'
import { useAutoLockPreferences } from '../../../../hooks/useAutoLockPreferences'
import { Select } from '../../../../components/Select'
import { Wrapper } from './styles'
import { AUTO_LOCK_TIMEOUT_OPTIONS } from 'pearpass-lib-constants'

export const TIMEOUT_OPTIONS = Object.values(AUTO_LOCK_TIMEOUT_OPTIONS)

export const AutoLockConfiguration = () => {
  const { t } = useTranslation()

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
  `
}
