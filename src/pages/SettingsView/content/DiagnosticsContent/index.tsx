import React, { useCallback, useEffect, useState } from 'react'

import {
  Button,
  PageHeader,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { FolderOpen } from '@tetherto/pearpass-lib-ui-kit/icons'

import { useTranslation } from '../../../../hooks/useTranslation'
import { logger } from '../../../../utils/logger'
import { createStyles } from './styles'

const TEST_IDS = {
  root: 'settings-card-diagnostics',
  loggingToggle: 'settings-diagnostics-logging-toggle',
  openLogs: 'settings-diagnostics-open-logs-button'
} as const

export const DiagnosticsContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const [loggingEnabled, setLoggingEnabled] = useState(false)
  const [loggingForced, setLoggingForced] = useState(false)
  const [isTogglingLogging, setIsTogglingLogging] = useState(false)

  useEffect(() => {
    const electronAPI = window.electronAPI
    if (!electronAPI || typeof electronAPI.isLoggingEnabled !== 'function') {
      return
    }

    let cancelled = false
    electronAPI
      .isLoggingEnabled()
      .then((state) => {
        if (cancelled) return
        setLoggingEnabled(state.enabled)
        setLoggingForced(state.forced)
      })
      .catch((error) =>
        logger.error('DiagnosticsContent', 'isLoggingEnabled failed:', error)
      )
    return () => {
      cancelled = true
    }
  }, [])

  const handleLoggingToggle = useCallback(
    async (next: boolean) => {
      if (loggingForced || isTogglingLogging) return
      setIsTogglingLogging(true)
      try {
        const state = await window.electronAPI?.setLogging?.(next)
        if (state) {
          setLoggingEnabled(state.enabled)
          setLoggingForced(state.forced)
        }
      } finally {
        setIsTogglingLogging(false)
      }
    },
    [isTogglingLogging, loggingForced]
  )

  return (
    <div data-testid={TEST_IDS.root} style={styles.root}>
      <PageHeader
        title={t('Diagnostics')}
        subtitle={t(
          'Logs help us troubleshoot issues. Enable logging, reproduce the problem, then share the logs with us.'
        )}
      />
      <div style={styles.settingCard}>
        <ToggleSwitch
          data-testid={TEST_IDS.loggingToggle}
          checked={loggingEnabled}
          onChange={(checked) => {
            void handleLoggingToggle(checked)
          }}
          disabled={loggingForced || isTogglingLogging}
          label={t('Enable logs')}
          description={
            loggingForced
              ? t(
                  'Logging is enabled by this build (nightly or --enable-logging launch flag).'
                )
              : t('Capture verbose logs to share with us.')
          }
        />
      </div>
      <div style={styles.openLogsRow}>
        <Button
          data-testid={TEST_IDS.openLogs}
          variant="primary"
          size="small"
          disabled={!loggingEnabled}
          onClick={() => {
            void window.electronAPI?.openLogsFolder?.()
          }}
          iconBefore={<FolderOpen />}
        >
          {t('Open logs folder')}
        </Button>
      </div>
    </div>
  )
}
