/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CardUnlockPearPass } from './index'


type ElectronAPIMock = {
  isBiometricAvailable: ReturnType<typeof jest.fn>
  storeBiometricCredentials: ReturnType<typeof jest.fn>
  retrieveBiometricCredentials: ReturnType<typeof jest.fn>
  deleteBiometricCredentials: ReturnType<typeof jest.fn>
}

const createElectronAPI = (
  overrides: Partial<ElectronAPIMock> = {}
): ElectronAPIMock => ({
  isBiometricAvailable: jest.fn(() => Promise.resolve(true)),
  storeBiometricCredentials: jest.fn(() => Promise.resolve(true)),
  // Default: success=false so auto-login on mount exits harmlessly
  retrieveBiometricCredentials: jest.fn(() =>
    Promise.resolve({ success: false, credentials: null })
  ),
  deleteBiometricCredentials: jest.fn(() => Promise.resolve(true)),
  ...overrides
})

let mockNavigate: ReturnType<typeof jest.fn>
let mockLogIn: ReturnType<typeof jest.fn>
let mockInitVaults: ReturnType<typeof jest.fn>
let mockRefetchVaults: ReturnType<typeof jest.fn>
let mockIsVaultProtected: ReturnType<typeof jest.fn>
let mockRefetchVault: ReturnType<typeof jest.fn>
let mockCreateVault: ReturnType<typeof jest.fn>
let mockAddDevice: ReturnType<typeof jest.fn>
let mockRefreshMasterPasswordStatus: ReturnType<typeof jest.fn>

let mockPersonalSwarmInit: ReturnType<typeof jest.fn> | undefined
let mockEncryptionClose: ReturnType<typeof jest.fn> | undefined
let mockRunActionScan: ReturnType<typeof jest.fn> | undefined


jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

jest.mock('../../../context/LoadingContext', () => ({
  useGlobalLoading: jest.fn()
}))

jest.mock('../../../context/RouterContext', () => ({
  useRouter: () => ({
    currentPage: 'welcome',
    navigate: mockNavigate,
    data: {}
  })
}))

jest.mock('@tetherto/pearpass-lib-vault', () => {
  // Use getters so assignments in beforeEach take effect
  return {
    useCreateVault: () => ({
      get createVault() { return mockCreateVault }
    }),
    useUserData: () => ({
      get logIn() { return mockLogIn },
      get refreshMasterPasswordStatus() { return mockRefreshMasterPasswordStatus }
    }),
    useVault: () => ({
      get isVaultProtected() { return mockIsVaultProtected },
      get addDevice() { return mockAddDevice },
      get refetch() { return mockRefetchVault }
    }),
    useVaults: () => ({
      get initVaults() { return mockInitVaults },
      get refetch() { return mockRefetchVaults }
    }),
    get runActionScan() {
      return mockRunActionScan
    }
  }
})

jest.mock('@tetherto/pearpass-lib-vault/src/instances', () => ({
  get pearpassVaultClient() {
    return {
      personalSwarmInit: mockPersonalSwarmInit,
      encryptionClose: mockEncryptionClose
    }
  }
}))

jest.mock('@tetherto/pearpass-lib-vault/src/utils/buffer', () => ({
  clearBuffer: jest.fn(),
  stringToBuffer: (value: string) => Buffer.from(value, 'utf8')
}))

// jsdom document.hasFocus() returns false — stub to true so biometric
// auto-login fires as it would in a real browser.
Object.defineProperty(document, 'hasFocus', {
  value: () => true,
  configurable: true,
  writable: true
})

// Call rAF synchronously so biometric auto-login completes without fake timers
window.requestAnimationFrame = (cb: FrameRequestCallback) => {
  cb(0)
  return 0
}

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const rawTokens = {
    spacing6: 6,
    spacing24: 24,
    radius8: 8,
    radius16: 16,
    fontSize12: 12,
    fontSize14: 14,
    fontSize16: 16,
    fontSize24: 24,
    fontSize28: 28,
    fontPrimary: 'Inter',
    fontDisplay: 'Humble Nostalgia',
    weightRegular: '400',
    weightMedium: '500'
  }

  return {
    rawTokens,
    useTheme: () => ({
      theme: {
        colors: {
          colorTextSecondary: '#BDC3AC',
          colorBorderPrimary: '#212814',
          colorPrimary: '#B0D944'
        }
      }
    }),
    Button: (props: {
      'data-testid'?: string
      children?: React.ReactNode
      onClick?: () => void
      type?: 'button' | 'submit' | 'reset'
      isLoading?: boolean
      iconAfter?: React.ReactNode
    }) => (
      <button
        type={props.type || 'button'}
        data-testid={props['data-testid']}
        disabled={props.isLoading}
        onClick={props.onClick}
      >
        {props.children}
        {props.iconAfter}
      </button>
    ),
    Link: (props: {
      'data-testid'?: string
      children?: React.ReactNode
      onClick?: () => void
    }) => (
      <button type="button" data-testid={props['data-testid']} onClick={props.onClick}>
        {props.children}
      </button>
    ),
    PasswordField: (props: {
      label?: string
      value?: string
      placeholder?: string
      onChange?: (e: { target: { value: string } }) => void
      error?: string
      testID?: string
    }) => (
      <div>
        <label>{props.label}</label>
        <input
          data-testid={props.testID}
          type="password"
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange?.(e)}
        />
        {props.error && <span data-testid="password-field-error">{props.error}</span>}
      </div>
    ),
    Text: (props: {
      children?: React.ReactNode
      as?: string
      variant?: string
      color?: string
      'data-testid'?: string
    }) => <div data-testid={props['data-testid']}>{props.children}</div>,
    Title: (props: {
      children?: React.ReactNode
      as?: string
      'data-testid'?: string
    }) => <h1 data-testid={props['data-testid']}>{props.children}</h1>
  }
})

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  KeyboardArrowRightRound: () => <span data-testid="icon-arrow-right" />
}))

jest.mock('../../../components/OnboardingShell', () => ({
  OnboardingShell: (props: {
    background: string
    children: React.ReactNode
  }) => (
    <div data-testid="onboarding-shell" data-background={props.background}>
      {props.children}
    </div>
  )
}))

jest.mock('../../../utils/sortByName', () => ({
  sortByName: (vaults: Array<{ name: string }>) =>
    [...vaults].sort((a, b) => a.name.localeCompare(b.name))
}))


const VAULTS_MOCK = [
  { id: 'vault-1', name: 'Personal', type: 'personal' }
]

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  delete (window as unknown as Record<string, unknown>).electronAPI

  mockNavigate = jest.fn()
  mockLogIn = jest.fn()
  mockInitVaults = jest.fn()
  mockRefetchVaults = jest.fn(() => Promise.resolve(VAULTS_MOCK))
  mockIsVaultProtected = jest.fn(() => Promise.resolve(true))
  mockRefetchVault = jest.fn()
  mockCreateVault = jest.fn()
  mockAddDevice = jest.fn()
  mockRefreshMasterPasswordStatus = jest.fn(() =>
    Promise.resolve({ isLocked: false })
  )

  mockPersonalSwarmInit = undefined
  mockEncryptionClose = jest.fn(() => Promise.resolve())
  mockRunActionScan = jest.fn(() => Promise.resolve())
})


const renderComponent = () => {
  return render(<CardUnlockPearPass />)
}

/** Set up biometric-configured state (localStorage flag + electronAPI mock). */
const setupBiometricEnabled = (
  overrides: Partial<ElectronAPIMock> = {}
) => {
  localStorage.setItem('biometric-login-enabled', 'true')
  const api = createElectronAPI(overrides)
  ;(window as unknown as Record<string, unknown>).electronAPI = api
  return api
}

/** Resolve all pending promises (microtasks). */
const flushMicrotasks = async () => {
  await Promise.resolve()
  await Promise.resolve()
}


describe('CardUnlockPearPass — renders', () => {
  it('renders the onboarding shell, title, password field, and continue button', () => {
    renderComponent()

    expect(screen.getByTestId('onboarding-shell')).toBeInTheDocument()
    expect(screen.getByText('Enter Your Master Password')).toBeInTheDocument()
    expect(
      screen.getByText('Please enter your master password to continue')
    ).toBeInTheDocument()
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-continue-button')).toBeInTheDocument()
  })

  it('renders the Touch ID link when biometric is configured', () => {
    setupBiometricEnabled()
    renderComponent()

    expect(screen.getByTestId('login-touchid-link')).toBeInTheDocument()
    expect(screen.getByText('Unlock with Touch ID')).toBeInTheDocument()
  })

  it('does NOT render the Touch ID link when biometric is not configured', () => {
    renderComponent()

    expect(
      screen.queryByTestId('login-touchid-link')
    ).not.toBeInTheDocument()
  })
})

describe('CardUnlockPearPass — Touch ID auto-login', () => {
  it('auto-triggers biometric login on mount when configured', async () => {
    const api = setupBiometricEnabled()
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: true,
      credentials: {
        ciphertext: 'enc-ciphertext',
        nonce: 'enc-nonce',
        salt: 'enc-salt',
        hashedPassword: 'enc-hashed-password'
      }
    })
    mockLogIn.mockResolvedValue(undefined)
    mockIsVaultProtected.mockResolvedValue(false)

    renderComponent()
    await flushMicrotasks()

    await waitFor(() => {
      expect(api.retrieveBiometricCredentials).toHaveBeenCalled()
    })

    expect(mockLogIn).toHaveBeenCalledWith({
      ciphertext: 'enc-ciphertext',
      nonce: 'enc-nonce',
      hashedPassword: 'enc-hashed-password'
    })

    expect(mockNavigate).toHaveBeenCalled()
  })

  it('calls personalSwarmInit and runActionScan during biometric login', async () => {
    const api = setupBiometricEnabled()
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: true,
      credentials: {
        ciphertext: 'enc-ciphertext',
        nonce: 'enc-nonce',
        salt: 'enc-salt',
        hashedPassword: 'enc-hashed-password'
      }
    })
    mockLogIn.mockResolvedValue(undefined)

    mockPersonalSwarmInit = jest.fn(() => Promise.resolve())
    mockRunActionScan = jest.fn(() => Promise.resolve())

    renderComponent()
    await flushMicrotasks()

    await waitFor(() => {
      expect(mockPersonalSwarmInit).toHaveBeenCalled()
      expect(mockRunActionScan).toHaveBeenCalled()
    })
  })

  it('handles missing personalSwarmInit gracefully', async () => {
    const api = setupBiometricEnabled()
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: true,
      credentials: {
        ciphertext: 'enc-ciphertext',
        nonce: 'enc-nonce',
        salt: 'enc-salt',
        hashedPassword: 'enc-hashed-password'
      }
    })
    mockLogIn.mockResolvedValue(undefined)

    renderComponent()
    await flushMicrotasks()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  it('handles personalSwarmInit rejection gracefully', async () => {
    const api = setupBiometricEnabled()
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: true,
      credentials: {
        ciphertext: 'enc-ciphertext',
        nonce: 'enc-nonce',
        salt: 'enc-salt',
        hashedPassword: 'enc-hashed-password'
      }
    })
    mockLogIn.mockResolvedValue(undefined)
    mockPersonalSwarmInit = jest.fn(() =>
      Promise.reject(new Error('Swarm init failed'))
    )

    renderComponent()
    await flushMicrotasks()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  it('does not trigger biometric login on subsequent focus events after auto-disable', async () => {
    const api = setupBiometricEnabled()
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: false,
      credentials: null
    })

    renderComponent()
    await flushMicrotasks()

    await waitFor(() => {
      expect(api.retrieveBiometricCredentials).toHaveBeenCalledTimes(1)
    })

    window.dispatchEvent(new FocusEvent('focus'))
    jest.advanceTimersByTime(100)
    await flushMicrotasks()

    expect(api.retrieveBiometricCredentials).toHaveBeenCalledTimes(1)
  })

  it('does not trigger biometric login if already succeeded', async () => {
    const api = setupBiometricEnabled()
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: true,
      credentials: {
        ciphertext: 'enc-ciphertext',
        nonce: 'enc-nonce',
        salt: 'enc-salt',
        hashedPassword: 'enc-hashed-password'
      }
    })
    mockLogIn.mockResolvedValue(undefined)
    mockIsVaultProtected.mockResolvedValue(false)

    renderComponent()
    await flushMicrotasks()

    await waitFor(() => {
      expect(api.retrieveBiometricCredentials).toHaveBeenCalledTimes(1)
    })

    window.dispatchEvent(new FocusEvent('focus'))
    jest.advanceTimersByTime(100)
    await flushMicrotasks()

    expect(api.retrieveBiometricCredentials).toHaveBeenCalledTimes(1)
  })

  it('shows error message on biometric login failure and calls encryptionClose', async () => {
    const api = setupBiometricEnabled()
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: true,
      credentials: {
        ciphertext: 'enc-ciphertext',
        nonce: 'enc-nonce',
        salt: 'enc-salt',
        hashedPassword: 'enc-hashed-password'
      }
    })
    mockLogIn.mockRejectedValue(new Error('Login failed') as never)
    mockEncryptionClose = jest.fn(() => Promise.resolve())

    renderComponent()
    await flushMicrotasks()

    await waitFor(() => {
      expect(
        screen.getByText('Biometric unlock failed. Please enter your password.')
      ).toBeInTheDocument()
    })

    expect(screen.getByTestId('login-password-input')).toBeInTheDocument()
    expect(mockEncryptionClose).toHaveBeenCalledTimes(1)
  })

  it('does not auto-trigger if localStorage flag is not set', async () => {
    const api = setupBiometricEnabled()
    localStorage.removeItem('biometric-login-enabled')

    renderComponent()
    await flushMicrotasks()

    expect(api.retrieveBiometricCredentials).not.toHaveBeenCalled()
  })

  it('does not auto-trigger if electronAPI is incomplete', async () => {
    localStorage.setItem('biometric-login-enabled', 'true')

    renderComponent()
    await flushMicrotasks()

    expect(screen.getByTestId('login-password-input')).toBeInTheDocument()
  })
})

describe('CardUnlockPearPass — manual password submit', () => {
  it('submits password and navigates to vault for unprotected vault', async () => {
    mockLogIn.mockResolvedValue(undefined)
    mockInitVaults.mockResolvedValue(undefined)
    mockIsVaultProtected.mockResolvedValue(false)

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'my-password' } })

    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(mockLogIn).toHaveBeenCalledWith({
        password: expect.any(Buffer)
      })
      expect(mockInitVaults).toHaveBeenCalledWith({
        password: expect.any(Buffer)
      })
      expect(mockRefetchVaults).toHaveBeenCalled()
      expect(mockIsVaultProtected).toHaveBeenCalledWith('vault-1')
      expect(mockRefetchVault).toHaveBeenCalledWith('vault-1')
      expect(mockNavigate).toHaveBeenCalledWith('vault', {
        recordType: 'all'
      })
    })
  })

  it('navigates to vault password screen for protected vault', async () => {
    mockLogIn.mockResolvedValue(undefined)
    mockInitVaults.mockResolvedValue(undefined)
    mockIsVaultProtected.mockResolvedValue(true)

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'my-password' } })
    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('welcome', {
        state: 'vaultPassword',
        vaultId: 'vault-1'
      })
    })
  })

  it('creates new vault when no vaults exist', async () => {
    mockLogIn.mockResolvedValue(undefined)
    mockInitVaults.mockResolvedValue(undefined)
    mockRefetchVaults.mockResolvedValue([])
    mockCreateVault.mockResolvedValue(undefined)

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'my-password' } })
    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(mockCreateVault).toHaveBeenCalledWith({ name: 'Personal' })
      expect(mockAddDevice).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('vault', {
        recordType: 'all'
      })
    })
  })

  it('shows empty password error', async () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    expect(mockLogIn).not.toHaveBeenCalled()
  })

  it('shows "Invalid password" on failed login', async () => {
    mockLogIn.mockRejectedValue(new Error('invalid') as never)
    mockRefreshMasterPasswordStatus.mockResolvedValue({
      isLocked: false,
      remainingAttempts: null
    })

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument()
    })
  })

  it('shows remaining attempts count on failed login', async () => {
    mockLogIn.mockRejectedValue(new Error('invalid') as never)
    mockRefreshMasterPasswordStatus.mockResolvedValue({
      isLocked: false,
      remainingAttempts: 3
    })

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Incorrect password. You have 3 attempts before the app will be temporarily locked'
        )
      ).toBeInTheDocument()
    })
  })

  it('navigates to locked screen when account is locked', async () => {
    mockLogIn.mockRejectedValue(new Error('invalid') as never)
    mockRefreshMasterPasswordStatus.mockResolvedValue({
      isLocked: true
    })

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('welcome', {
        state: 'screenLocked'
      })
    })
  })

  it('handles string error messages from submit', async () => {
    mockLogIn.mockRejectedValue('Custom string error' as never)
    mockRefreshMasterPasswordStatus.mockResolvedValue({
      isLocked: false,
      remainingAttempts: null
    })

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(
        screen.getByText('Custom string error')
      ).toBeInTheDocument()
    })
  })

  it('shows "1 attempt" singular form', async () => {
    mockLogIn.mockRejectedValue(new Error('invalid') as never)
    mockRefreshMasterPasswordStatus.mockResolvedValue({
      isLocked: false,
      remainingAttempts: 1
    })

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Incorrect password. You have 1 attempt before the app will be temporarily locked'
        )
      ).toBeInTheDocument()
    })
  })

  it('clears error on password change', async () => {
    mockLogIn.mockRejectedValue(new Error('invalid') as never)
    mockRefreshMasterPasswordStatus.mockResolvedValue({
      isLocked: false,
      remainingAttempts: null
    })

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByTestId('login-continue-button'))

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument()
    })

    fireEvent.change(input, { target: { value: 'new-password' } })

    expect(
      screen.queryByText('Invalid password')
    ).not.toBeInTheDocument()
  })

  it('does not submit when already loading', async () => {
    mockLogIn.mockImplementation(
      () => new Promise(() => {})
    )

    renderComponent()

    const input = screen.getByTestId('login-password-input')
    fireEvent.change(input, { target: { value: 'password' } })

    const button = screen.getByTestId('login-continue-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })

    fireEvent.click(button)
    expect(mockLogIn).toHaveBeenCalledTimes(1)
  })
})

describe('CardUnlockPearPass — manual Touch ID link click', () => {
  it('triggers biometric login when link is clicked', async () => {
    const api = setupBiometricEnabled()
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: false,
      credentials: null
    })

    renderComponent()
    await flushMicrotasks()

    await waitFor(() => {
      expect(api.retrieveBiometricCredentials).toHaveBeenCalledTimes(1)
    })
    expect(mockLogIn).not.toHaveBeenCalled()

    // Mock successful response for manual click
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: true,
      credentials: {
        ciphertext: 'enc-ciphertext',
        nonce: 'enc-nonce',
        salt: 'enc-salt',
        hashedPassword: 'enc-hashed-password'
      }
    })
    mockLogIn.mockResolvedValue(undefined)
    mockIsVaultProtected.mockResolvedValue(false)

    fireEvent.click(screen.getByTestId('login-touchid-link'))
    await flushMicrotasks()

    await waitFor(() => {
      expect(api.retrieveBiometricCredentials).toHaveBeenCalledTimes(2)
    })
    expect(mockLogIn).toHaveBeenCalled()
  })

  it('manual link works even after auto-disable', async () => {
    const api = setupBiometricEnabled()
    api.retrieveBiometricCredentials.mockResolvedValue({
      success: false,
      credentials: null
    })

    renderComponent()
    await flushMicrotasks()

    await waitFor(() => {
      expect(api.retrieveBiometricCredentials).toHaveBeenCalledTimes(1)
    })

    api.retrieveBiometricCredentials.mockResolvedValue({
      success: true,
      credentials: {
        ciphertext: 'enc-ciphertext',
        nonce: 'enc-nonce',
        salt: 'enc-salt',
        hashedPassword: 'enc-hashed-password'
      }
    })
    mockLogIn.mockResolvedValue(undefined)
    mockIsVaultProtected.mockResolvedValue(false)

    fireEvent.click(screen.getByTestId('login-touchid-link'))
    await flushMicrotasks()

    await waitFor(() => {
      expect(api.retrieveBiometricCredentials).toHaveBeenCalledTimes(2)
    })
  })
})
