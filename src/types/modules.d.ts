// TODO improve types

/* eslint-disable */

declare module '@tetherto/pearpass-lib-ui-theme-provider' {
  export const ThemeProvider: any
  export const colors: any
  export const themes: any
}

declare module '@tetherto/pearpass-lib-vault' {
  export interface Vault {
    id: string
    name: string
    createdAt?: string
    devices?: VaultDevice[]
  }

  export interface VaultDevice {
    id: string
    name: string
    createdAt?: string
  }

  export interface UseVaultsResult {
    isLoading: boolean
    isInitialized: boolean
    data: Vault[] | undefined
    refetch: () => Promise<Vault[]>
    initVaults: (params: {
      ciphertext?: string
      nonce?: string
      salt?: string
      hashedPassword?: string
      password?: string
    }) => Promise<void>
    resetState: () => void
  }

  export interface UseVaultResult {
    isLoading: boolean
    isInitialized: boolean
    data: Vault | undefined
    refetch: (
      vaultId?: string,
      params?: {
        password?: string
        ciphertext?: string
        nonce?: string
        hashedPassword?: string
      }
    ) => Promise<Vault | void>
    isVaultProtected: (vaultId: string | undefined) => Promise<boolean>
    addDevice: (deviceName: string) => Promise<void>
    resetState: () => void
    updateUnprotectedVault: (
      vaultId: string,
      vaultUpdate: { name: string; password?: string }
    ) => Promise<void>
    updateProtectedVault: (
      vaultId: string,
      vaultUpdate: { name: string; password: string; currentPassword: string }
    ) => Promise<void>
  }

  export const setPearpassVaultClient: any
  export const VaultProvider: any
  export function useVaults(options?: {
    onCompleted?: (payload: Vault[]) => void
    onInitialize?: (payload: Vault[]) => void
  }): UseVaultsResult
  export function useVault(options?: {
    shouldSkip?: boolean
    variables?: { vaultId: string }
  }): UseVaultResult
  export const useVaults: any
  export const useVault: any
  export const useCreateVault: any
  export const useInvite: any
  export const usePair: any
  export const authoriseCurrentProtectedVault: any
  export const RECORD_TYPES: any
  export const OTP_TYPE: { TOTP: 'TOTP'; HOTP: 'HOTP' }

  export function useOtp(params: { recordId: string; otpPublic: any }): {
    code: string | null
    timeRemaining: number | null
    type: string | null
    period: number | null
    generateNext: (() => Promise<void>) | null
    isLoading: boolean
  }

  export const OtpRefreshProvider: any
  export function useOtpRefresh(): (() => void) | null

  export function useTimerAnimation(
    timeRemaining: number | null,
    period: number,
    animated?: boolean
  ): {
    noTransition: boolean
    expiring: boolean
    targetTime: number
  }

  export function formatOtpCode(code: string | null): string
  export function createAlignedInterval(callback: () => void): () => void
  export function isExpiring(timeRemaining: number | null): boolean
  export const EXPIRY_THRESHOLD_SECONDS: number

  const otherExports: any
  export default otherExports

  export const useUserData: () => {
    data: {
      hasPasswordSet: boolean
      isLoggedIn: boolean
      isVaultOpen: boolean
      masterPasswordStatus: {
        isLocked: boolean
        lockoutRemainingMs: number
        remainingAttempts: number
      }
    }
    isInitialized: boolean
    hasPasswordSet: boolean
    masterPasswordStatus: {
      isLocked: boolean
      lockoutRemainingMs: number
      remainingAttempts: number
    }
    isLoading: boolean
    logIn: (params: {
      ciphertext?: string
      nonce?: string
      salt?: string
      hashedPassword?: string
      password?: string
    }) => Promise<void>
    createMasterPassword: (password: string) => Promise<{
      ciphertext: string
      nonce: string
      salt: string
      hashedPassword: string
    }>
    updateMasterPassword: (params: {
      newPassword: string
      currentPassword: string
    }) => Promise<{
      ciphertext: string
      nonce: string
      salt: string
      hashedPassword: string
    }>
    refetch: () => Promise<{
      hasPasswordSet: boolean
      isLoggedIn: boolean
      isVaultOpen: boolean
    }>
    refreshMasterPasswordStatus: () => Promise<{
      isLocked: boolean
      lockoutRemainingMs: number
      remainingAttempts: number
    }>
  }

  export function useFavicon(params: { url: string }): {
    faviconSrc: string | null
    isLoading: boolean
    hasError: boolean
  }

  export interface FolderRecord {
    id: string
    folder?: string | null
    isFavorite?: boolean
    type: string
    [key: string]: unknown
  }

  export interface FolderEntry {
    name: string
    records: FolderRecord[]
  }

  export interface FoldersData {
    favorites: { records: FolderRecord[] }
    noFolder: { records: FolderRecord[] }
    customFolders: Record<string, FolderEntry>
  }

  export interface UseFoldersResult {
    isLoading: boolean
    data: FoldersData | undefined
    renameFolder: (name: string, newName: string) => Promise<void>
    deleteFolder: (name: string) => Promise<void>
  }

  export function useFolders(options?: {
    variables?: { searchPattern?: string }
  }): UseFoldersResult

  export interface UseCreateFolderResult {
    isLoading: boolean
    createFolder: (folderName: string) => void
  }

  export function useCreateFolder(options?: {
    onCompleted?: (payload: { folder: string }) => void
    onError?: (error: string) => void
  }): UseCreateFolderResult

  export function decryptExportData(
    encryptedData: unknown,
    password: string
  ): Promise<unknown>
  export function useCreateRecord(options?: {
    onCompleted?: (payload: unknown) => void
    onError?: (error: Error) => void
  }): {
    createRecord: (
      record: unknown,
      onError?: (error: Error) => void
    ) => Promise<unknown>
    isLoading?: boolean
  }

  export const useRecords: any
  export const useBlindMirrors: any

  export function closeAllInstances(): Promise<void>

  export function useRecordCountsByType(): {
    data: Record<string, number> | undefined
    isLoading: boolean
  }
}

declare module '@tetherto/pearpass-utils-password-check' {
  export type PasswordStrengthType = 'error' | 'warning' | 'success'

  export function checkPasswordStrength(password: string): {
    strengthType: PasswordStrengthType
    type: string
    errors?: string[]
  }

  export function checkPassphraseStrength(words: string[]): {
    type: string
  }

  export function validatePasswordChange(params: {
    currentPassword: string
    newPassword: string
    repeatPassword: string
    messages: {
      newPasswordMustDiffer: string
      passwordsDontMatch: string
    }
  }): {
    success: boolean
    field: 'newPassword' | 'repeatPassword'
    error: string
  }
}

declare module '@tetherto/pear-apps-lib-ui-react-hooks' {
  export const useCountDown: any
  export const useForm: any
}

declare module '@tetherto/pear-apps-utils-qr' {
  export const generateQRCodeSVG: any
}

declare module '@tetherto/pear-apps-utils-avatar-initials' {
  export function generateAvatarInitials(name: string): string
}

declare module '@tetherto/pear-apps-utils-validator' {
  export const Validator: any
}

declare module '@tetherto/pear-apps-utils-date' {
  export function formatDate(
    date: string | Date,
    format: string,
    separator: string
  ): string
}

declare module '@tetherto/pearpass-lib-vault/src/utils/buffer' {
  export const clearBuffer: (buffer: any) => void
  export const stringToBuffer: (value: string) => any
}

declare module '@tetherto/pearpass-lib-constants' {
  export const BLIND_PEERS_LIMIT: number
  export const BLIND_PEER_TYPE: {
    DEFAULT: 'default'
    PERSONAL: 'personal'
  }
  export const PROTECTED_VAULT_ENABLED: boolean
  export const BE_AUTO_LOCK_ENABLED: boolean
  export const DEFAULT_AUTO_LOCK_TIMEOUT: number
  export const AUTO_LOCK_TIMEOUT_OPTIONS: Record<
    string,
    { label: string; value: number }
  >
  export const AUTO_LOCK_ENABLED: boolean
  export const DELETE_VAULT_ENABLED: boolean
  export const AUTHENTICATOR_ENABLED: boolean
  export const DESKTOP_DESIGN_VERSION: number
  export const DATE_FORMAT: string
  export const MAX_IMPORT_RECORDS: number
  export const NATIVE_MESSAGING_BRIDGE_PEAR_LINK_PRODUCTION: string
  export const NATIVE_MESSAGING_BRIDGE_PEAR_LINK_STAGING: string
  export const UNSUPPORTED: boolean
  export const PEARPASS_WEBSITE: string
  export const PRIVACY_POLICY: string
  export const TERMS_OF_USE: string
  export const BLIND_PEERS_LEARN_MORE: string
  export const DEFAULT_SELECTED_TYPE: number
  export const PASSPHRASE_WORD_COUNTS: {
    STANDARD_12: number
    STANDARD_24: number
    WITH_RANDOM_12: number
    WITH_RANDOM_24: number
  }
  export const VALID_WORD_COUNTS: number[]
}

declare module '@tetherto/pearpass-utils-password-generator' {
  export function generatePassword(
    length: number,
    rulesConfig?: {
      includeSpecialChars?: boolean
      lowerCase?: boolean
      upperCase?: boolean
      numbers?: boolean
    }
  ): string
  export function generatePassphrase(
    capitalLetters: boolean,
    symbols: boolean,
    numbers: boolean,
    wordsCount: number
  ): string[]
}

declare module '@tetherto/pearpass-lib-data-import' {
  export function decryptKeePassKdbx(
    fileContent: string | ArrayBuffer,
    password: string
  ): Promise<unknown>
  export function parse1PasswordData(
    data: unknown,
    fileType: string
  ): Promise<unknown[]>
  export function parseBitwardenData(
    data: unknown,
    fileType: string
  ): Promise<unknown[]>
  export function parseKeePassData(
    data: unknown,
    fileType: string
  ): Promise<unknown[]>
  export function parseLastPassData(
    data: unknown,
    fileType: string
  ): Promise<unknown[]>
  export function parseNordPassData(
    data: unknown,
    fileType: string
  ): Promise<unknown[]>
  export function parsePearPassData(
    data: unknown,
    fileType: string
  ): Promise<unknown[]>
  export function parseProtonPassData(
    data: unknown,
    fileType: string
  ): Promise<unknown[]>
}

declare module '@tetherto/pear-apps-lib-feedback' {
  export type FeedbackTopic =
    | 'BUG_REPORT'
    | 'FEATURE_REQUEST'
    | 'SECURITY_ISSUE'
  export type FeedbackApp = 'MOBILE' | 'DESKTOP' | 'BROWSER_EXTENSION'

  export interface SlackFeedbackPayload {
    webhookUrPath: string
    topic: FeedbackTopic
    app?: FeedbackApp
    operatingSystem?: string
    deviceModel?: string
    message: string
    appVersion?: string
    customFields?: unknown[]
    additionalAttachment?: Record<string, unknown>
  }

  export interface GoogleFormMapping {
    timestamp?: string
    topic?: string
    app?: string
    operatingSystem?: string
    deviceModel?: string
    message?: string
    appVersion?: string
  }

  export interface GoogleFormFeedbackPayload {
    formKey: string
    mapping?: GoogleFormMapping
    additionalFields?: Array<{ key: string; value: string }>
    topic?: FeedbackTopic | string
    app?: FeedbackApp | string
    operatingSystem?: string
    deviceModel?: string
    message?: string
    appVersion?: string
  }

  export function sendSlackFeedback(
    config: SlackFeedbackPayload
  ): Promise<boolean | void>

  export function sendGoogleFormFeedback(
    config: GoogleFormFeedbackPayload
  ): Promise<boolean | void>
}
