// TODO improve types

/* eslint-disable */

declare module 'pearpass-lib-ui-theme-provider' {
  export const ThemeProvider: any
  export const colors: any
  export const themes: any
}

declare module 'pearpass-lib-vault' {
  export interface Vault {
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
      vaultUpdate: { name: string; password: string }
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
  export const useInvite: any
  export const usePair: any
  export const authoriseCurrentProtectedVault: any
  export const RECORD_TYPES: any
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
}

declare module 'pear-apps-lib-ui-react-hooks' {
  export const useCountDown: any
}

declare module 'pear-apps-utils-qr' {
  export const generateQRCodeSVG: any
}

declare module 'pearpass-lib-constants' {
  export const DEFAULT_AUTO_LOCK_TIMEOUT: number
  export const AUTO_LOCK_TIMEOUT_OPTIONS: Record<string, { label: string, value: number }>
  export const AUTO_LOCK_ENABLED: boolean
}

