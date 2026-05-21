import React from 'react'

import { Link, PageHeader, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import {
  PEARPASS_WEBSITE,
  PRIVACY_POLICY,
  TERMS_OF_USE
} from '@tetherto/pearpass-lib-constants'

import { useTranslation } from '../../../../hooks/useTranslation'
import { createStyles } from './styles'

const TEST_IDS = {
  root: 'settings-app-version',
  fieldVersion: 'settings-app-version-field'
} as const

type AppVersionContentProps = {
  currentVersion: string
}

export const AppVersionContent = ({
  currentVersion
}: AppVersionContentProps): React.ReactElement => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  return (
    <div data-testid={TEST_IDS.root} style={styles.root}>
      <PageHeader
        as="h1"
        title={t('App Version')}
        subtitle={
          <>
            {t('Here you can find all the info about your app.')}
            <br />
            {t('Check here to see the')}{' '}
            {/* @ts-ignore - plain CSS object */}
            <Link href={TERMS_OF_USE} isExternal style={styles.descriptionLink}>
              {t('Terms of Use')}
            </Link>
            {', '}
            {/* @ts-ignore - plain CSS object */}
            <Link href={PRIVACY_POLICY} isExternal style={styles.descriptionLink}>
              {t('Privacy Statement')}
            </Link>{' '}
            {t('and')}{' '}
            {/* @ts-ignore - plain CSS object */}
            <Link href={PEARPASS_WEBSITE} isExternal style={styles.descriptionLink}>
              {t('visit our website')}
            </Link>
            .
          </>
        }
      />

      <div style={styles.fieldContainer} data-testid={TEST_IDS.fieldVersion}>
        <Text variant="bodyEmphasized" color={theme.colors.colorTextPrimary}>
          {t('App version')}
        </Text>
        <Text variant="body" color={theme.colors.colorPrimary}>
          {currentVersion}
        </Text>
      </div>
    </div>
  )
}
