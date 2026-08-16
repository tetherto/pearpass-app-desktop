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
      ) => Promise<{ enabled: boolean; forced: boolean }>
      getBackgroundMode: () => Promise<boolean>
      setBackgroundMode: (
        enabled: boolean
      ) => Promise<{ enabled: boolean }>
    }
  }
}
