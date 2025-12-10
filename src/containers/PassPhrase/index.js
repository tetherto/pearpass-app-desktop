import { useState, useEffect } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import {
  PASSPHRASE_WORD_COUNTS,
  VALID_WORD_COUNTS,
  DEFAULT_SELECTED_TYPE
} from 'pearpass-lib-constants'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { PassPhraseSettings } from './PassPhraseSettings'
import {
  Container,
  PassPhraseHeader,
  HeaderText,
  CopyPasteButton,
  CopyPasteText,
  PassPhraseContainer,
  ErrorContainer,
  ErrorText
} from './styles'
import { BadgeTextItem } from '../../components/BadgeTextItem'
import { useToast } from '../../context/ToastContext'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { usePasteFromClipboard } from '../../hooks/usePasteFromClipboard'
import {
  CopyIcon,
  PassPhraseIcon,
  ErrorIcon,
  PasteIcon
} from '../../lib-react-components'

/**
 * @param {{
 *  isCreateOrEdit: boolean,
 *  onChange: (value: string) => void,
 *  value: string,
 *  error: string
 * }} props
 */

export const PassPhrase = ({ isCreateOrEdit, onChange, value, error }) => {
  const { i18n } = useLingui()
  const { setToast } = useToast()
  const [selectedType, setSelectedType] = useState(DEFAULT_SELECTED_TYPE)
  const [withRandomWord, setWithRandomWord] = useState(false)
  const [passphraseWords, setPassphraseWords] = useState([])
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: i18n._('Copied to clipboard!'),
        icon: CopyIcon
      })
    }
  })
  const { pasteFromClipboard } = usePasteFromClipboard()

  const parsePassphraseText = (text) =>
    text
      .trim()
      .split(/[-\s]+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0)

  const detectAndUpdateSettings = (words) => {
    const wordCount = words.length
    if (
      wordCount === PASSPHRASE_WORD_COUNTS.STANDARD_12 ||
      wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_12
    ) {
      setSelectedType(PASSPHRASE_WORD_COUNTS.STANDARD_12)
      setWithRandomWord(wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_12)
    } else if (
      wordCount === PASSPHRASE_WORD_COUNTS.STANDARD_24 ||
      wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_24
    ) {
      setSelectedType(PASSPHRASE_WORD_COUNTS.STANDARD_24)
      setWithRandomWord(wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_24)
    }
  }

  const isValidRange = (wordCount) =>
    !wordCount || VALID_WORD_COUNTS.includes(wordCount)

  const handlePasteFromClipboard = async () => {
    const pastedText = await pasteFromClipboard()

    if (pastedText) {
      const words = parsePassphraseText(pastedText)

      setPassphraseWords(words)
      detectAndUpdateSettings(words)
      if (onChange) {
        onChange(pastedText)
      }
    }
  }

  useEffect(() => {
    if (value) {
      const words = parsePassphraseText(value)
      setPassphraseWords(words)
      detectAndUpdateSettings(words)
    }
  }, [value])

  const isCreateOrEditWithValidRange =
    isCreateOrEdit && isValidRange(passphraseWords.length)
  return html`
    <${Container}>
      <${PassPhraseHeader}>
        <${PassPhraseIcon} />
        <${HeaderText}>${i18n._('PassPhrase')}<//>
      <//>
      <${PassPhraseContainer}>
        ${passphraseWords.map(
          (word, i) =>
            html`<${BadgeTextItem}
              key=${`${word}-${i}`}
              count=${i + 1}
              word=${word || ''}
            />`
        )}
      <//>

      <${CopyPasteButton}
        type="button"
        isPaste=${isCreateOrEdit}
        withExtraBottomSpace=${!isCreateOrEditWithValidRange}
        onClick=${isCreateOrEdit
          ? handlePasteFromClipboard
          : () => copyToClipboard(value)}
      >
        ${isCreateOrEdit
          ? html`
              <${PasteIcon} color=${colors.primary400?.mode1} />
              <${CopyPasteText}>${i18n._('Paste from clipboard')}<//>
            `
          : html`
              <${CopyIcon} color=${colors.primary400?.mode1} />
              <${CopyPasteText}>${i18n._('Copy')}<//>
            `}
      <//>
      ${isCreateOrEditWithValidRange &&
      html`<${PassPhraseSettings}
        selectedType=${selectedType}
        setSelectedType=${setSelectedType}
        withRandomWord=${withRandomWord}
        setWithRandomWord=${setWithRandomWord}
        isDisabled=${!!passphraseWords.length}
      />`}
      ${!!error?.length &&
      html`<${ErrorContainer}>
        <${ErrorIcon} size="10" />
        <${ErrorText}>${error}<//>
      <//>`}
    <//>
  `
}
