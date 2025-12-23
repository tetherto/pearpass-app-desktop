import { useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { ArrowIconWrapper, DropDown, Label, Wrapper } from './styles'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CommonFileIcon,
  PlusIcon,
  ButtonFilter
} from '../../lib-react-components'

const OPTIONS = [
  // {
  //   name: 'Email',
  //   type: 'email',
  //   icon: EmailIcon
  // },
  // {
  //   name: 'Picture',
  //   type: 'picture',
  //   icon: ImageIcon
  // },
  {
    name: 'Note',
    type: 'note',
    icon: CommonFileIcon
  }
  // {
  //   name: 'Pin code',
  //   type: 'pinCode',
  //   icon: NineDotsIcon
  // },
  // {
  //   name: 'Date',
  //   type: 'date',
  //   icon: CalendarIcon
  // },
  // {
  //   name: 'Website',
  //   type: 'website',
  //   icon: WorldIcon
  // },
  // {
  //   name: 'Phone number',
  //   type: 'phoneNumber',
  //   icon: PhoneIcon
  // }
]

/**
 * @param {{
 *  onCreateCustom: (type: string) => void,
 *  testId?: string
 * }} props
 */
export const CreateCustomField = ({ onCreateCustom, testId }) => {
  const { i18n } = useLingui()

  const [isOpen, setIsOpen] = useState(false)

  const wrapperRef = useOutsideClick({
    onOutsideClick: () => {
      setIsOpen(false)
    }
  })

  const handleSelect = (type) => {
    onCreateCustom(type)

    setIsOpen(false)
  }

  return html`
    <${Wrapper} ref=${wrapperRef} data-testid=${testId}>
      <${Label}
        data-testid=${`createcustomfield-label-${isOpen ? 'open' : 'closed'}`}
        onClick=${() => setIsOpen(!isOpen)}
      >
        <${PlusIcon} size="21" />

        <div>${i18n._('Create Custom')}</div>

        <${ArrowIconWrapper}>
          <${isOpen ? ArrowUpIcon : ArrowDownIcon} size="21" />
        <//>
      <//>

      ${isOpen &&
      html`<${DropDown}>
        ${OPTIONS.map(
          (option) => html`
            <${ButtonFilter}
              testId=${`createcustomfield-option-${option.type}`}
              variant="secondary"
              startIcon=${option.icon}
              onClick=${() => handleSelect(option.type)}
            >
              ${option.name}
            <//>
          `
        )}
      <//>`}
    <//>
  `
}
