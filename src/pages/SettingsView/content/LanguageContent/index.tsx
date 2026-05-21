import React, { useState } from 'react'

import { useLingui } from '@lingui/react'
import {
  Button,
  Dropdown,
  NavbarListItem,
  PageHeader,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ExpandMore } from '@tetherto/pearpass-lib-ui-kit/icons'

import { useLanguageOptions } from '../../../../hooks/useLanguageOptions'
import { useTranslation } from '../../../../hooks/useTranslation'
import { createStyles } from './styles'

type LanguageOption = {
  label: string
  value: string
  testId: string
}

const TEST_IDS = {
  root: 'settings-language',
  field: 'settings-language-field',
  dropdown: 'settings-language-dropdown',
  dropdownTrigger: 'settings-language-dropdown-trigger'
} as const

export const LanguageContent = (): React.ReactElement => {
  const { t } = useTranslation()
  const { i18n } = useLingui()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const [isOpen, setIsOpen] = useState(false)

  const { languageOptions } = useLanguageOptions() as {
    languageOptions: LanguageOption[]
  }
  const selectedLanguage = languageOptions.find(
    (lang) => lang.value === i18n.locale
  )

  const handleLanguageSelect = (value: string) => {
    i18n.activate(value)
    setIsOpen(false)
  }

  return (
    <div data-testid={TEST_IDS.root} style={styles.root}>
      <PageHeader
        as="h1"
        title={t('Language')}
        subtitle={t('Choose the language of the app.')}
      />

      <div style={styles.fieldContainer} data-testid={TEST_IDS.field}>
        <div style={styles.fieldDetails}>
          <Text variant="bodyEmphasized" color={theme.colors.colorTextPrimary}>
            {t('App Language')}
          </Text>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Select the language used throughout PearPass.')}
          </Text>
        </div>

        <Dropdown
          open={isOpen}
          onOpenChange={setIsOpen}
          testID={TEST_IDS.dropdown}
          trigger={
            <Button
              variant="secondary"
              size="small"
              iconAfter={<ExpandMore />}
              data-testid={TEST_IDS.dropdownTrigger}
            >
              {selectedLanguage?.label ?? t('Select')}
            </Button>
          }
        >
          {languageOptions.map((option) => (
            <NavbarListItem
              key={option.value}
              label={option.label}
              selected={option.value === i18n.locale}
              onClick={() => handleLanguageSelect(option.value)}
              testID={option.testId}
            />
          ))}
        </Dropdown>
      </div>
    </div>
  )
}
