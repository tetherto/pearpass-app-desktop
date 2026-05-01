import React, { useEffect, useRef, useState } from 'react'

import {
  DEFAULT_SELECTED_TYPE,
  PASSPHRASE_WORD_COUNTS,
  VALID_WORD_COUNTS
} from '@tetherto/pearpass-lib-constants'
import {
  Button,
  FieldError,
  InputField,
  Radio,
  useTheme,
  Text
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ContentCopy,
  ContentPaste
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.electron'
import { usePasteFromClipboard } from '../../hooks/usePasteFromClipboard'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from '../../hooks/useTranslation'
import { createStyles } from './PassPhraseV2.styles'

type PassPhraseV2Props = {
  error?: string
  isCreateOrEdit?: boolean
  onChange?: (value: string) => void
  value?: string
}

const parsePassphraseText = (text: string): string[] =>
  text
    .trim()
    .split(/[-\s]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0)

const isValidRange = (wordCount: number): boolean =>
  !wordCount || VALID_WORD_COUNTS.includes(wordCount)

const getWordLabel = (index: number): string => {
  const position = index + 1
  const remainder10 = position % 10
  const remainder100 = position % 100

  let suffix = 'th'
  if (remainder10 === 1 && remainder100 !== 11) suffix = 'st'
  else if (remainder10 === 2 && remainder100 !== 12) suffix = 'nd'
  else if (remainder10 === 3 && remainder100 !== 13) suffix = 'rd'

  return `${position}${suffix} Word`
}

const getSelectedTypeForWords = (wordCount: number): number => {
  if (
    wordCount === PASSPHRASE_WORD_COUNTS.STANDARD_24 ||
    wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_24
  ) {
    return PASSPHRASE_WORD_COUNTS.STANDARD_24
  }
  if (
    wordCount === PASSPHRASE_WORD_COUNTS.STANDARD_12 ||
    wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_12
  ) {
    return PASSPHRASE_WORD_COUNTS.STANDARD_12
  }
  return DEFAULT_SELECTED_TYPE
}

export const PassPhraseV2 = ({
  error,
  isCreateOrEdit = false,
  onChange,
  value = ''
}: PassPhraseV2Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { copyToClipboard } = useCopyToClipboard()
  const { pasteFromClipboard } = usePasteFromClipboard()
  const { setToast } = useToast()
  const lastCommittedValueRef = useRef(value)

  const initialWords = parsePassphraseText(value)

  const [selectedType, setSelectedType] = useState<number>(
    getSelectedTypeForWords(initialWords.length)
  )
  const [passphraseWords, setPassphraseWords] = useState<string[]>(initialWords)

  const detectAndUpdateSettings = (words: string[]) => {
    setSelectedType(getSelectedTypeForWords(words.length))
  }

  useEffect(() => {
    if (value === lastCommittedValueRef.current) return
    if (!value?.trim().length) {
      setPassphraseWords([])
      lastCommittedValueRef.current = value
      return
    }
    const words = parsePassphraseText(value)
    setPassphraseWords(words)
    detectAndUpdateSettings(words)
    lastCommittedValueRef.current = value
  }, [value])

  const handlePasteFromClipboard = async () => {
    const pastedText = await pasteFromClipboard()
    if (!pastedText) return

    const words = parsePassphraseText(pastedText)

    if (!isValidRange(words.length)) {
      setToast({ message: t('Only 12 or 24 words are allowed') })
      return
    }

    setPassphraseWords(words)
    detectAndUpdateSettings(words)
    lastCommittedValueRef.current = pastedText
    onChange?.(pastedText)
  }

  const expandedWords = Array.from(
    { length: Math.max(selectedType, passphraseWords.length || selectedType) },
    (_, index) => passphraseWords[index] ?? ''
  )

  const handleWordChange = (index: number, nextValue: string) => {
    const sanitized = nextValue.replace(/\s+/g, '').trim()
    const nextWords = [...expandedWords]
    nextWords[index] = sanitized
    setPassphraseWords(nextWords)

    const serialized = nextWords.filter(Boolean).join(' ')
    lastCommittedValueRef.current = serialized
    onChange?.(serialized)
  }

  const handleTypeSelect = (wordCount: number) => {
    setSelectedType(wordCount)

    if (passphraseWords.length > wordCount) {
      const nextWords = passphraseWords.slice(0, wordCount)
      setPassphraseWords(nextWords)
      const serialized = nextWords.filter(Boolean).join(' ')
      lastCommittedValueRef.current = serialized
      onChange?.(serialized)
    }
  }

  const optionsToRender = isCreateOrEdit
    ? [PASSPHRASE_WORD_COUNTS.STANDARD_12, PASSPHRASE_WORD_COUNTS.STANDARD_24]
    : [selectedType]
  const detailWords = passphraseWords.length
    ? passphraseWords
    : parsePassphraseText(value)

  const styles = createStyles(theme.colors, { hasError: !!error })

  return (
    <div style={styles.section}>
      <div style={styles.groupContainer}>
        {!isCreateOrEdit ? (
          <div style={styles.optionSection}>
            <div style={styles.copyIconWrapper}>
              <Text variant='caption'>{t(`Recovery Phrase`)}</Text>
              <Button
                variant="tertiary"
                size="small"
                type="button"
                aria-label={t('Copy recovery phrase')}
                iconBefore={
                  <ContentCopy
                    width={16}
                    height={16}
                    color={theme.colors.colorTextPrimary}
                  />
                }
                onClick={() => {
                  copyToClipboard(value)
                }}
              />

            </div>
            <div style={styles.grid}>
              {detailWords.map((word, inputIndex) => (
                <div
                  key={`details-word-${inputIndex}`}
                  style={styles.wordInputWrapper}
                >
                  <InputField
                    label={getWordLabel(inputIndex)}
                    value={word}
                    placeholder={t('Enter Word')}
                    readOnly
                    testID={`passphrase-word-input-${inputIndex}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          optionsToRender.map((wordCount: number, index: number) => {
            const isSelected = selectedType === wordCount
            const description = t(
              `Paste or enter ${wordCount} words. Optional +1 works only when pasted`
            )
            const borderStyle: React.CSSProperties =
              index > 0 ? styles.optionSectionWithBorder : {}

            return (
              <div
                key={wordCount}
                style={{ ...styles.optionSection, ...borderStyle }}
              >
                <div style={styles.headerRow}>
                  <div style={styles.headerInfo}>
                    <Radio
                      builtIn
                      options={[
                        {
                          value: String(wordCount),
                          label: `${wordCount} Words`,
                          description
                        }
                      ]}
                      value={isSelected ? String(wordCount) : undefined}
                      onChange={
                        isCreateOrEdit
                          ? () => handleTypeSelect(wordCount)
                          : undefined
                      }
                      disabled={!isCreateOrEdit}
                    />
                  </div>

                  <Button
                    variant="tertiary"
                    size="small"
                    type="button"
                    aria-label={
                      isCreateOrEdit
                        ? t('Paste recovery phrase')
                        : t('Copy recovery phrase')
                    }
                    iconBefore={
                      isCreateOrEdit ? (
                        <ContentPaste
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      ) : (
                        <ContentCopy
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      )
                    }
                    onClick={() => {
                      if (isCreateOrEdit) {
                        handleTypeSelect(wordCount)
                        void handlePasteFromClipboard()
                        return
                      }
                      copyToClipboard(value)
                    }}
                  />
                </div>

                {isSelected ? (
                  <div style={styles.grid}>
                    {expandedWords.map((word, inputIndex) => (
                      <div
                        key={`${wordCount}-${inputIndex}`}
                        style={styles.wordInputWrapper}
                      >
                        <InputField
                          label={getWordLabel(inputIndex)}
                          value={word}
                          placeholder={t('Enter Word')}
                          onChange={(e) =>
                            handleWordChange(inputIndex, e.target.value)
                          }
                          readOnly={!isCreateOrEdit}
                          testID={`passphrase-word-input-${inputIndex}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>

      {!!error?.length && <FieldError>{error}</FieldError>}
    </div>
  )
}
