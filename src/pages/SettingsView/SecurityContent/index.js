import { useMemo, useState } from 'react'

import { html } from 'htm/react'
import { AUTO_LOCK_ENABLED } from 'pearpass-lib-constants'

import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { SwitchWithLabel } from '../../../components/SwitchWithLabel'
import { LOCAL_STORAGE_KEYS } from '../../../constants/localStorage'
import { RuleSelector } from '../../../containers/Modal/GeneratePasswordSideDrawerContent/RuleSelector'
import { useTranslation } from '../../../hooks/useTranslation'
import { isPasswordChangeReminderDisabled } from '../../../utils/isPasswordChangeReminderDisabled'
import { Description } from '../ExportTab/styles'
import { AutoLockConfiguration } from '../SettingsAdvancedTab/SettingsAutoLockConfiguration'
import { SwitchList } from '../SettingsAdvancedTab/styles'
import { SettingsPasswordsSection } from '../SettingsTab/SettingsPasswordsSection'

export const SecurityContent = () => {
  const { t } = useTranslation()

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
        description: t('Copy any password instantly with one tap.')
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
    <${SettingsPasswordsSection} />

    <${CardSingleSetting} title=${t('PearPass functions')}>
      <${Description}>
        ${t('Control how PearPass works and keep your vault secure.')}
      <//>

      <${SwitchList}>
        <${SwitchWithLabel}
          isOn=${!isPasswordReminderDisabled}
          onChange=${(isOn) => handlePasswordChangeReminder(isOn)}
          label=${t('Reminders')}
          isSwitchFirst
          stretch=${false}
          description=${t(
            "Get alerts when it's time to update your passwords."
          )}
        />
        <${RuleSelector}
          rules=${ruleOptions}
          selectedRules=${selectedRules}
          isSwitchFirst
          stretch=${false}
          setRules=${handleSetRules}
        />

        ${AUTO_LOCK_ENABLED ? html`<${AutoLockConfiguration} />` : null}
      <//>
    <//>
  `
}
