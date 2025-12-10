import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { SettingsBlindPeersSection } from './index'

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str) => str
  })
}))

jest.mock('../../../../context/LoadingContext', () => ({
  useLoadingContext: () => ({
    setIsLoading: jest.fn()
  })
}))

const mockSetModal = jest.fn()
const mockCloseModal = jest.fn()
jest.mock('../../../../context/ModalContext', () => ({
  useModal: () => ({
    setModal: mockSetModal,
    closeModal: mockCloseModal
  })
}))

jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    setToast: jest.fn()
  })
}))

const mockRemoveAllBlindMirrors = jest.fn()
const mockGetBlindMirrors = jest.fn()
const mockAddBlindMirrors = jest.fn()
const mockAddDefaultBlindMirrors = jest.fn()

jest.mock('pearpass-lib-vault', () => {
  const stableData = []
  return {
    useBlindMirrors: () => ({
      removeAllBlindMirrors: mockRemoveAllBlindMirrors,
      data: stableData,
      getBlindMirrors: mockGetBlindMirrors,
      addBlindMirrors: mockAddBlindMirrors,
      addDefaultBlindMirrors: mockAddDefaultBlindMirrors
    })
  }
})

jest.mock('pearpass-lib-constants', () => ({
  BLIND_PEER_TYPE: {
    PERSONAL: 'personal',
    DEFAULT: 'default'
  }
}))

jest.mock('pearpass-lib-ui-theme-provider', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
  colors: {
    primary400: {
      mode1: '#007AFF'
    }
  }
}))

jest.mock('./styles', () => ({
  LearnMoreLink: ({ children, href }) => <a href={href}>{children}</a>,
  ListContainer: ({ children }) => <ul>{children}</ul>,
  TooltipContent: ({ children }) => <div>{children}</div>,
  TooltipText: ({ children }) => <div>{children}</div>,
  Wrapper: ({ children }) => <div>{children}</div>
}))

jest.mock('../../../../components/CardSingleSetting', () => ({
  CardSingleSetting: ({ children, title, additionalHeaderContent }) => (
    <div data-testid="card-single-setting">
      <div data-testid="card-title">{title}</div>
      {additionalHeaderContent && (
        <div data-testid="additional-header">{additionalHeaderContent}</div>
      )}
      <div data-testid="card-content">{children}</div>
    </div>
  )
}))

jest.mock('../../../../components/PopupMenu', () => ({
  PopupMenu: ({ children }) => <div data-testid="popup-menu">{children}</div>
}))

jest.mock('../../../../containers/Modal/BlindPeersModalContent', () => ({
  BlindPeersModalContent: () => <div data-testid="blind-peers-modal" />
}))

jest.mock(
  '../../../../containers/Modal/GeneratePasswordSideDrawerContent/RuleSelector',
  () => ({
    RuleSelector: ({ rules, selectedRules, setRules }) => (
      <div data-testid="rule-selector">
        {rules.map((rule) => (
          <div key={rule.name} data-testid={`rule-${rule.name}`}>
            <span data-testid={`rule-label-${rule.name}`}>{rule.label}</span>
            <span data-testid={`rule-description-${rule.name}`}>
              {rule.description}
            </span>
            <button
              data-testid={`toggle-${rule.name}`}
              onClick={() =>
                setRules({ [rule.name]: !selectedRules[rule.name] })
              }
            >
              {selectedRules[rule.name] ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    )
  })
)

jest.mock('../../../../lib-react-components', () => ({
  InfoIcon: () => <div data-testid="info-icon">Info</div>
}))

jest.mock('../../../../lib-react-components/components/TooltipWrapper', () => ({
  TooltipWrapper: ({ children }) => (
    <div data-testid="tooltip-wrapper">{children}</div>
  )
}))

jest.mock('../../../../lib-react-components/icons/OutsideLinkIcon', () => ({
  OutsideLinkIcon: () => <div data-testid="outside-link-icon">Link</div>
}))

describe('SettingsBlindPeersSection', () => {
  const renderWithProviders = (component) =>
    render(<ThemeProvider>{component}</ThemeProvider>)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const { container } = renderWithProviders(<SettingsBlindPeersSection />)
    expect(container).toMatchSnapshot()
  })

  it('renders the component with correct title', () => {
    const { getByTestId } = renderWithProviders(<SettingsBlindPeersSection />)

    expect(getByTestId('card-title')).toHaveTextContent('Blind Peering')
  })

  it('calls getBlindMirrors on component mount', () => {
    renderWithProviders(<SettingsBlindPeersSection />)

    expect(mockGetBlindMirrors).toHaveBeenCalledTimes(1)
  })

  it('renders rule selector with correct props', () => {
    const { getByTestId } = renderWithProviders(<SettingsBlindPeersSection />)

    const ruleSelector = getByTestId('rule-selector')
    expect(ruleSelector).toBeInTheDocument()

    const blindPeersRule = getByTestId('rule-blindPeers')
    expect(blindPeersRule).toBeInTheDocument()

    const ruleLabel = getByTestId('rule-label-blindPeers')
    expect(ruleLabel).toHaveTextContent('Private Connections')

    const ruleDescription = getByTestId('rule-description-blindPeers')
    expect(ruleDescription).toHaveTextContent(
      'Sync your encrypted vault securely with blind peers'
    )
  })

  it('renders learn more link', () => {
    const { getByText } = renderWithProviders(<SettingsBlindPeersSection />)

    expect(getByText('Learn more about blind peering.')).toBeInTheDocument()
  })

  it('opens modal when enabling blind peers', () => {
    const { getByTestId } = renderWithProviders(<SettingsBlindPeersSection />)

    const toggleButton = getByTestId('toggle-blindPeers')
    expect(toggleButton).toHaveTextContent('Enable')

    fireEvent.click(toggleButton)

    expect(mockSetModal).toHaveBeenCalledTimes(1)
  })

  it('displays correct initial state with disabled blind peers', () => {
    const { getByTestId } = renderWithProviders(<SettingsBlindPeersSection />)

    const toggleButton = getByTestId('toggle-blindPeers')
    expect(toggleButton).toHaveTextContent('Enable')
  })
})
