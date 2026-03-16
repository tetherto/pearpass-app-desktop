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
      openExternal: (url: string) => Promise<void>
    }
  }
}
