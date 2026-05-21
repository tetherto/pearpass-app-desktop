import React, { useCallback, useMemo, useState } from 'react'

import {
  Button,
  Dropdown,
  NavbarListItem,
  PageHeader,
  Text,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { KeyboardArrowBottom } from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  AUTO_LOCK_ENABLED,
  AUTO_LOCK_TIMEOUT_OPTIONS
} from '@tetherto/pearpass-lib-constants'

import { LOCAL_STORAGE_KEYS } from '../../../../constants/localStorage'
import { useAutoLockPreferences } from '../../../../hooks/useAutoLockPreferences'
import { useTranslation } from '../../../../hooks/useTranslation'
import { isPasswordChangeReminderDisabled } from '../../../../utils/isPasswordChangeReminderDisabled'
import { createStyles } from './styles'

const TEST_IDS = {
  root: 'settings-app-preferences',
  autoLockSelect: 'settings-auto-lock-select',
  autoLockOption: 'settings-auto-lock-option',
  copyToClipboardToggle: 'settings-copy-to-clipboard-toggle',
  remindersToggle: 'settings-reminders-toggle'
} as const

type TimeoutOption = {
  key: string
  label: string
  value: number
}

const TIMEOUT_OPTIONS: TimeoutOption[] = Object.entries(
  AUTO_LOCK_TIMEOUT_OPTIONS
).map(([key, option]) => ({ key, label: option.label, value: option.value }))

export const AppPreferencesContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { colors } = theme
  const styles = createStyles(colors)

  const { timeoutMs, setTimeoutMs } = useAutoLockPreferences()

  const [isTimeoutDropdownOpen, setIsTimeoutDropdownOpen] = useState(false)
  const [isClipboardDisabled, setIsClipboardDisabled] = useState(() =>
    localStorage.getItem(
      LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED
    ) === 'true'
  )
  const [isReminderDisabled, setIsReminderDisabled] = useState(() =>
    isPasswordChangeReminderDisabled()
  )

  const translatedTimeoutOptions = useMemo(
    () =>
      TIMEOUT_OPTIONS.map((option) => ({
        ...option,
        label: t(option.label)
      })),
    [t]
  )

  const selectedTimeoutOption = useMemo(
    () =>
      translatedTimeoutOptions.find((option) => option.value === timeoutMs) ??
      translatedTimeoutOptions[0],
    [translatedTimeoutOptions, timeoutMs]
  )

  const handleTimeoutSelect = useCallback(
    (option: TimeoutOption) => {
      setTimeoutMs(option.value)
      setIsTimeoutDropdownOpen(false)
    },
    [setTimeoutMs]
  )

  const handleClipboardToggle = useCallback((isOn: boolean) => {
    if (isOn) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED)
    } else {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED,
        'true'
      )
    }
    setIsClipboardDisabled(!isOn)
  }, [])

  const handleReminderToggle = useCallback((isOn: boolean) => {
    if (isOn) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED)
    } else {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
        'false'
      )
    }
    setIsReminderDisabled(!isOn)
  }, [])

  return (
    <div data-testid={TEST_IDS.root} style={styles.root}>
      <PageHeader
        as="h1"
        title={t('App Preferences')}
        subtitle={t('Control how PearPass works and keep your vault secure.')}
      />

      <div style={styles.sectionHeading}>
        <Text variant="caption" color={colors.colorTextSecondary}>
          {t('Security Awareness')}
        </Text>
      </div>

      <div style={styles.settingCard}>
        {AUTO_LOCK_ENABLED && (
          <div style={styles.row}>
            <div style={styles.toggleColumn}>
              <Text variant="labelEmphasized">{t('Auto Lock')}</Text>
              <Text variant="caption" color={colors.colorTextSecondary}>
                {t(
                  'Automatically lock the app after selected period of inactivity'
                )}
              </Text>
            </div>
            <Dropdown
              open={isTimeoutDropdownOpen}
              onOpenChange={setIsTimeoutDropdownOpen}
              trigger={
                <Button
                  variant="secondary"
                  size="small"
                  iconAfter={<KeyboardArrowBottom />}
                  data-testid={TEST_IDS.autoLockSelect}
                >
                  {selectedTimeoutOption?.label ?? t('Select a timeout')}
                </Button>
              }
            >
              {translatedTimeoutOptions.map((option) => (
                <NavbarListItem
                  key={option.key}
                  testID={`${TEST_IDS.autoLockOption}-${option.key.toLowerCase()}`}
                  label={option.label}
                  selected={option.value === timeoutMs}
                  onClick={() => handleTimeoutSelect(option)}
                />
              ))}
            </Dropdown>
          </div>
        )}

        <div style={AUTO_LOCK_ENABLED ? styles.rowDivider : undefined}>
          <ToggleSwitch
            data-testid={TEST_IDS.copyToClipboardToggle}
            checked={!isClipboardDisabled}
            onChange={handleClipboardToggle}
            label={t('Copy to Clipboard')}
            description={t(
              'Enable one-tap copying to move your credentials between apps effortlessly'
            )}
          />
        </div>

        <div style={styles.rowDivider}>
          <ToggleSwitch
            data-testid={TEST_IDS.remindersToggle}
            checked={!isReminderDisabled}
            onChange={handleReminderToggle}
            label={t('Reminders')}
            description={t("Get alerts when it's time to update your passwords")}
          />
        </div>
      </div>
    </div>
  )
}
