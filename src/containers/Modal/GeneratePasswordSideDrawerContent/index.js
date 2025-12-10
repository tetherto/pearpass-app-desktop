import { useMemo, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import {
  generatePassphrase,
  generatePassword
} from 'pearpass-utils-password-generator'

import { RadioSelect } from '../../../components/RadioSelect'
import { useModal } from '../../../context/ModalContext'
import { ModalHeader } from '../ModalHeader'
import { PassphraseChecker } from './PassphraseChecker'
import { PassphraseGenerator } from './PassphraseGenerator/index.'
import { PasswordChecker } from './PasswordChecker'
import { PasswordGenerator } from './PasswordGenerator'
import { HeaderButtonWrapper, RadioWrapper, Wrapper } from './styles'
import { useToast } from '../../../context/ToastContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard'
import { ButtonLittle, CopyIcon } from '../../../lib-react-components'

/**
 * @param {{
 * onPasswordInsert: (pass: string) => void
 * }} props
 */
export const GeneratePasswordSideDrawerContent = ({ onPasswordInsert }) => {
  const { i18n } = useLingui()
  const { closeModal } = useModal()
  const { setToast } = useToast()
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: i18n._('Copied to clipboard'),
        icon: CopyIcon
      })
    }
  })

  const [selectedOption, setSelectedOption] = useState('password')
  const [selectedRules, setSelectedRules] = useState({
    password: {
      specialCharacters: true,
      characters: 8
    },
    passphrase: {
      capitalLetters: true,
      symbols: true,
      numbers: true,
      words: 8
    }
  })

  const pass = useMemo(() => {
    if (selectedOption === 'passphrase') {
      return generatePassphrase(
        selectedRules.passphrase.capitalLetters,
        selectedRules.passphrase.symbols,
        selectedRules.passphrase.numbers,
        selectedRules.passphrase.words
      )
    }
    return generatePassword(selectedRules.password.characters, {
      includeSpecialChars: selectedRules.password.specialCharacters,
      lowerCase: true,
      upperCase: true,
      numbers: true
    })
  }, [selectedOption, selectedRules])

  const radioOptions = [
    { label: i18n._('Password'), value: 'password' },
    { label: i18n._('Passphrase'), value: 'passphrase' }
  ]

  const handleRuleChange = (optionName, value) => {
    setSelectedRules((prevRules) => ({
      ...prevRules,
      [optionName]: value
    }))
  }

  const handleCopyAndClose = () => {
    const copyText = selectedOption === 'passphrase' ? pass.join('-') : pass

    copyToClipboard(copyText)
    closeModal()
  }

  const handleInsertPassword = () => {
    const passText = selectedOption === 'passphrase' ? pass.join('-') : pass
    onPasswordInsert(passText)
    closeModal()
  }

  return html`
    <${Wrapper}>
      <${ModalHeader} onClose=${closeModal}>
        <${HeaderButtonWrapper}>
          ${onPasswordInsert
            ? html`<${ButtonLittle} onClick=${handleInsertPassword}>
                ${i18n._('Insert password')}
              <//> `
            : html`<${ButtonLittle} onClick=${handleCopyAndClose}>
                ${i18n._('Copy and close')}
              <//> `}
        <//>
      <//>

      ${selectedOption === 'passphrase'
        ? html` <${PassphraseChecker} pass=${pass} />`
        : html` <${PasswordChecker} pass=${pass} />`}

      <${RadioWrapper}>
        <${RadioSelect}
          title=${i18n._('Type')}
          options=${radioOptions}
          selectedOption=${selectedOption}
          onChange=${setSelectedOption}
        />
      <//>

      ${selectedOption === 'passphrase'
        ? html` <${PassphraseGenerator}
            onRuleChange=${handleRuleChange}
            rules=${selectedRules.passphrase}
          />`
        : html`<${PasswordGenerator}
            onRuleChange=${handleRuleChange}
            rules=${selectedRules.password}
          />`}
    <//>
  `
}
