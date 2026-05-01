import React, { useMemo, useState } from 'react'

import {
  checkPassphraseStrength,
  checkPasswordStrength
} from '@tetherto/pearpass-utils-password-check'
import { PassType } from '../../../shared/types'
import {
  generatePassphrase,
  generatePassword
} from '@tetherto/pearpass-utils-password-generator'
import {
  Button,
  Dialog,
  PasswordIndicator,
  Radio,
  Slider,
  Text,
  Title,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import type { PasswordIndicatorVariant } from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './GeneratePasswordModalContentV2.styles'
import { useModal } from '../../../context/ModalContext'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../hooks/useTranslation'
// @ts-ignore - JS module without type declarations
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'

const PASSWORD_OPTIONS = {
  password: 'password',
  passphrase: 'passphrase'
} as const

type PasswordOption = (typeof PASSWORD_OPTIONS)[keyof typeof PASSWORD_OPTIONS]

type PasswordRules = {
  specialCharacters: boolean
  characters: number
}

type PassphraseRules = {
  capitalLetters: boolean
  symbols: boolean
  numbers: boolean
  words: number
}

const STRENGTH_TO_INDICATOR: Record<string, PasswordIndicatorVariant> = {
  vulnerable: 'vulnerable',
  weak: 'decent',
  safe: 'strong'
}

export type GeneratePasswordModalContentV2Props = {
  onPasswordInsert?: (pass: string, type: PassType) => void
}

const renderHighlightedPassword = (
  text: string,
  primaryColor: string,
  secondaryColor: string
) => {
  const parts = text.split(/(\d+|[^a-zA-Z\d\s])/g)

  return parts.map((part, index) => {
    if (!part) return null

    if (/^\d+$/.test(part)) {
      return (
        <span key={`${part}-${index}`} style={{ color: primaryColor }}>
          {part}
        </span>
      )
    }

    if (/[^a-zA-Z\d\s]/.test(part)) {
      return (
        <span key={`${part}-${index}`} style={{ color: secondaryColor }}>
          {part}
        </span>
      )
    }

    return <span key={`${part}-${index}`}>{part}</span>
  })
}

export const GeneratePasswordModalContentV2 = ({
  onPasswordInsert
}: GeneratePasswordModalContentV2Props) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const { setToast } = useToast()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => setToast({ message: t('Copied to clipboard') })
  })

  const [selectedOption, setSelectedOption] = useState<PasswordOption>(
    PASSWORD_OPTIONS.password
  )
  const [selectedRules, setSelectedRules] = useState<{
    password: PasswordRules
    passphrase: PassphraseRules
  }>({
    password: { specialCharacters: true, characters: 8 },
    passphrase: {
      capitalLetters: true,
      symbols: true,
      numbers: true,
      words: 8
    }
  })

  const generatedValue = useMemo(() => {
    if (selectedOption === PASSWORD_OPTIONS.passphrase) {
      return (
        generatePassphrase(
          selectedRules.passphrase.capitalLetters,
          selectedRules.passphrase.symbols,
          selectedRules.passphrase.numbers,
          selectedRules.passphrase.words
        ) as string[]
      ).join('-')
    }

    return generatePassword(selectedRules.password.characters, {
      includeSpecialChars: selectedRules.password.specialCharacters,
      lowerCase: true,
      upperCase: true,
      numbers: true
    }) as string
  }, [selectedOption, selectedRules])

  const strength = useMemo(() => {
    if (selectedOption === PASSWORD_OPTIONS.passphrase) {
      return checkPassphraseStrength(generatedValue.split('-'))
    }
    return checkPasswordStrength(generatedValue)
  }, [generatedValue, selectedOption])

  const indicatorVariant: PasswordIndicatorVariant =
    STRENGTH_TO_INDICATOR[(strength as { type: string }).type] ?? 'vulnerable'

  const isAllPassphraseRulesSelected =
    selectedRules.passphrase.capitalLetters &&
    selectedRules.passphrase.symbols &&
    selectedRules.passphrase.numbers

  const handlePasswordRuleChange = (
    key: keyof PasswordRules,
    value: boolean | number
  ) => {
    setSelectedRules((prev) => ({
      ...prev,
      password: { ...prev.password, [key]: value }
    }))
  }

  const handlePassphraseRuleChange = (
    key: keyof PassphraseRules,
    value: boolean | number
  ) => {
    setSelectedRules((prev) => ({
      ...prev,
      passphrase: { ...prev.passphrase, [key]: value }
    }))
  }

  const handlePassphraseToggle = (rule: 'all' | keyof PassphraseRules) => {
    if (rule === 'all') {
      const nextValue = !isAllPassphraseRulesSelected
      setSelectedRules((prev) => ({
        ...prev,
        passphrase: {
          ...prev.passphrase,
          capitalLetters: nextValue,
          symbols: nextValue,
          numbers: nextValue
        }
      }))
      return
    }
    handlePassphraseRuleChange(rule, !selectedRules.passphrase[rule])
  }

  const handlePrimaryAction = () => {
    if (onPasswordInsert) {
      onPasswordInsert(
        generatedValue,
        selectedOption === PASSWORD_OPTIONS.passphrase
          ? PassType.PassPhrase
          : PassType.Password
      )
      closeModal()
      return
    }
    copyToClipboard(generatedValue)
    closeModal()
  }

  const passphraseRules: {
    key: 'all' | keyof PassphraseRules
    label: string
    value: boolean
  }[] = [
    { key: 'all', label: t('Select all'), value: isAllPassphraseRulesSelected },
    {
      key: 'capitalLetters',
      label: t('Capital letters'),
      value: selectedRules.passphrase.capitalLetters
    },
    {
      key: 'symbols',
      label: t('Symbols'),
      value: selectedRules.passphrase.symbols
    },
    {
      key: 'numbers',
      label: t('Numbers'),
      value: selectedRules.passphrase.numbers
    }
  ]

  return (
    <Dialog
      title={t('New Password Item')}
      onClose={closeModal}
      testID='generatepassword-dialog-v2'
      closeButtonTestID='generatepassword-close-v2'
      footer={
        <>
          <Button
            variant='secondary'
            size='small'
            type='button'
            onClick={closeModal}
            data-testid='generatepassword-button-discard-v2'
          >
            {t('Discard')}
          </Button>
          <Button
            variant='primary'
            size='small'
            type='button'
            iconBefore={
              onPasswordInsert ? undefined : (
                <ContentCopy width={16} height={16} />
              )
            }
            onClick={handlePrimaryAction}
            data-testid='generatepassword-button-primary-v2'
          >
            {onPasswordInsert ? t('Use Password') : t('Copy Password')}
          </Button>
        </>
      }
    >
      <div style={styles.body}>
        <div style={styles.section}>
          <Text variant='caption' color={theme.colors.colorTextSecondary}>
            {t('Generated Password')}
          </Text>

          <div style={styles.groupedCard}>
            <div style={styles.generatedPasswordBlock}>
              <Title as='h3'>
                {renderHighlightedPassword(
                  generatedValue,
                  theme.colors.colorPrimary,
                  theme.colors.colorTextSecondary
                )}
              </Title>
              <PasswordIndicator variant={indicatorVariant} />
            </div>

            {[
              {
                key: PASSWORD_OPTIONS.passphrase,
                label: t('Memorable Password'),
                description: t(
                  'Memorable password using random words, numbers, and symbols.'
                )
              },
              {
                key: PASSWORD_OPTIONS.password,
                label: t('Random Characters'),
                description: t(
                  'A fully random mix of letters, numbers, and symbols.'
                )
              }
            ].map((option, index, options) => (
              <div
                key={option.key}
                onClick={() => setSelectedOption(option.key)}
                style={{
                  ...styles.optionRow,
                  ...(index < options.length - 1 ? styles.optionRowDivider : {})
                }}
              >
                <Radio
                  builtIn
                  options={[
                    {
                      value: option.key,
                      label: option.label,
                      description: option.description
                    }
                  ]}
                  value={selectedOption === option.key ? option.key : undefined}
                  onChange={() => setSelectedOption(option.key)}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <Text variant='caption' color={theme.colors.colorTextSecondary}>
            {t('Password Length')}
          </Text>

          <div style={styles.singleRowCard}>
            <div style={styles.sliderRow}>
              <div style={styles.sliderLabel}>
                <Text variant='bodyEmphasized'>
                  {selectedOption === PASSWORD_OPTIONS.passphrase
                    ? `${selectedRules.passphrase.words} ${t('Words')}`
                    : `${selectedRules.password.characters} ${t('Chars')}`}
                </Text>
              </div>

              <div style={styles.slider}>
                <Slider
                  minimumValue={
                    selectedOption === PASSWORD_OPTIONS.passphrase ? 6 : 4
                  }
                  maximumValue={
                    selectedOption === PASSWORD_OPTIONS.passphrase ? 36 : 32
                  }
                  step={1}
                  value={
                    selectedOption === PASSWORD_OPTIONS.passphrase
                      ? selectedRules.passphrase.words
                      : selectedRules.password.characters
                  }
                  onValueChange={(value: number) => {
                    if (selectedOption === PASSWORD_OPTIONS.passphrase) {
                      handlePassphraseRuleChange('words', value)
                      return
                    }
                    handlePasswordRuleChange('characters', value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <Text variant='caption' color={theme.colors.colorTextSecondary}>
            {t('Password settings')}
          </Text>

          <div style={styles.groupedCard}>
            {selectedOption === PASSWORD_OPTIONS.passphrase ? (
              passphraseRules.map((rule, index, rules) => (
                <div
                  key={rule.key}
                  style={{
                    ...styles.settingRow,
                    ...(index < rules.length - 1 ? styles.optionRowDivider : {})
                  }}
                >
                  <Text variant='bodyEmphasized'>{rule.label}</Text>
                  <ToggleSwitch
                    checked={rule.value}
                    onChange={() => handlePassphraseToggle(rule.key)}
                    aria-label={rule.label}
                  />
                </div>
              ))
            ) : (
              <div style={styles.settingRow}>
                <Text variant='bodyEmphasized'>
                  {t('Special character (!&*)')}
                </Text>
                <ToggleSwitch
                  checked={selectedRules.password.specialCharacters}
                  onChange={() =>
                    handlePasswordRuleChange(
                      'specialCharacters',
                      !selectedRules.password.specialCharacters
                    )
                  }
                  aria-label={t('Special character toggle')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
