enum FlowType {
  DELETE = 'delete',
  KICK_OUT = 'kickOut'
}

type DeleteVaultModalContentProps = {
  vaultId?: string
  flowType?: FlowType
}

interface Device {
  id: string
  name: string
  createdAt: number
  vaultId: string
}

export { FlowType }
export type { Device, DeleteVaultModalContentProps }
