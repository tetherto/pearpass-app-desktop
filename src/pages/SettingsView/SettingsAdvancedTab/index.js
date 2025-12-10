import { useMemo, useState } from 'react'

import { html } from 'htm/react'

import { SettingsBlindPeersSection } from './SettingsBlindPeersSection'
import { SwitchList, SwitchWrapper } from './styles'
import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { SwitchWithLabel } from '../../../components/SwitchWithLabel'
import { LOCAL_STORAGE_KEYS } from '../../../constants/localStorage'
import { RuleSelector } from '../../../containers/Modal/GeneratePasswordSideDrawerContent/RuleSelector'
import { useConnectExtension } from '../../../hooks/useConnectExtension'
import { useTranslation } from '../../../hooks/useTranslation'
import { Switch } from '../../../lib-react-components'
import { isPasswordChangeReminderDisabled } from '../../../utils/isPasswordChangeReminderDisabled'
import { Description } from '../ExportTab/styles'

export const SettingsAdvancedTab = () => {
  const { t } = useTranslation()

  const { isBrowserExtensionEnabled, toggleBrowserExtension } =
    useConnectExtension()
  const [isPasswordReminderDisabled, setIsPasswordReminderDisabled] = useState(
    isPasswordChangeReminderDisabled()
  )

  const [selectedRules, setSelectedRules] = useState(() => {
    const isDisabled = localStorage.getItem(
      LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED
    )

    return {
      copyToClipboard: isDisabled !== 'true'
    }
  })

  const ruleOptions = useMemo(() => {
    const options = [
      {
        name: 'copyToClipboard',
        label: t('Copy to clipboard'),
        description: t(
          'When clicking a password you copy that into your clipboard'
        )
      }
    ]

    return options
  }, [t])

  const handleSetRules = (newRules) => {
    if (newRules.copyToClipboard !== selectedRules.copyToClipboard) {
      if (newRules.copyToClipboard) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED)
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED,
          'true'
        )
      }
    }

    setSelectedRules({ ...newRules })
  }

  const handlePasswordChangeReminder = (isEnabled) => {
    if (!isEnabled) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
        'false'
      )
    } else {
      localStorage.removeItem(
        LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED
      )
    }

    setIsPasswordReminderDisabled(!isEnabled)
  }

  return html`
    <${CardSingleSetting} title=${t('Custom settings')}>
      <${Description}>
        ${t(
          'Here you can choose your privacy settings and personalize your experience'
        )}
      <//>

      <${SwitchList}>
        <${SwitchWithLabel}
          isOn=${!isPasswordReminderDisabled}
          onChange=${(isOn) => handlePasswordChangeReminder(isOn)}
          label=${t('Reminders')}
          isSwitchFirst
          stretch=${false}
          description=${t('Enable the reminders to change your passwords')}
        />
        <${SwitchWrapper}>
          <${Switch}
            isOn=${isBrowserExtensionEnabled}
            onChange=${(isOn) => toggleBrowserExtension(isOn)}
          ><//>
          ${t('Activate browser extension')}
        <//>
        <${RuleSelector}
          rules=${ruleOptions}
          selectedRules=${selectedRules}
          isSwitchFirst
          stretch=${false}
          setRules=${handleSetRules}
        />
      <//>
    <//>

    <${SettingsBlindPeersSection} />
  `
}
