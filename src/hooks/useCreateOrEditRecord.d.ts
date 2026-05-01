import { PassType } from '../shared/types'

export type CreateOrEditRecordParams = {
  recordType: string
  initialRecord?: unknown
  selectedFolder?: string
  isFavorite?: boolean
  setValue?: (value: string, type: PassType) => void
}

export function useCreateOrEditRecord(): {
  handleCreateOrEditRecord: (params: CreateOrEditRecordParams) => void
}
