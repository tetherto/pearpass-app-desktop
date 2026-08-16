export {}

declare global {
  interface Window {
    electronAPI?: {
      getConfig: () => Promise<{
        storage: string
        key: string | null
        upgrade: string | null
        version: string | number
        applink: string
      }>
      onRuntimeUpdating: (cb: () => void) => () => void
      onRuntimeUpdated: (cb: () => void) => () => void
      applyUpdate: () => Promise<void>
      restart: () => Promise<void>
      checkUpdated: () => Promise<boolean>
      vaultInvoke: (method: string, args?: unknown[]) => Promise<{ ok: boolean; data?: unknown; error?: string }>
      vaultOnUpdate: (cb: () => void) => () => void
      vaultOnMasterUpdate: (cb: () => void) => () => void
      vaultOnPersonalSwarmEnvelope: (
        cb: (payload: { envelope: string }) => void
      ) => () => void
      clearStaleVaultsDir: () => Promise<void>
      openExternal: (url: string) => Promise<void>
      openLogsFolder: () => Promise<void>
      isLoggingEnabled: () => Promise<{ enabled: boolean; forced: boolean }>
      setLogging: (
        enabled: boolean
      ) => Promise<{ enabled: boolean; forced: boolean }>,

      // Biometric / Touch ID
      isBiometricAvailable: () => Promise<boolean>
      storeBiometricCredentials: (credentials: {
        ciphertext: string
        nonce: string
        salt: string
        hashedPassword: string
      }) => Promise<boolean>
      retrieveBiometricCredentials: (reason?: string) => Promise<{
        success: boolean
        credentials: {
          ciphertext: string
          nonce: string
          salt: string
          hashedPassword: string
        } | null
      }>
      deleteBiometricCredentials: () => Promise<boolean>
    }
  }
}

// Augment the vault library with exports that are present at runtime
// but not yet declared in the library's own types.d.ts.
declare module '@tetherto/pearpass-lib-vault' {
  export function getMasterEncryption(): Promise<
    | undefined
    | {
        ciphertext: string
        nonce: string
        salt: string
        hashedPassword?: string
      }
  >
  export function runActionScan(): Promise<void>
}
