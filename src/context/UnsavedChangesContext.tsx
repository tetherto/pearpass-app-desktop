import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef
} from 'react'

export type UnsavedChangesGuard = {
  hasUnsavedChanges: boolean
  description: string
  save: () => Promise<boolean>
}

type UnsavedChangesContextValue = {
  setGuard: (guard: UnsavedChangesGuard | null) => void
  getGuard: () => UnsavedChangesGuard | null
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(
  null
)

type UnsavedChangesProviderProps = {
  children: ReactNode
}

export const UnsavedChangesProvider = ({
  children
}: UnsavedChangesProviderProps) => {
  const guardRef = useRef<UnsavedChangesGuard | null>(null)

  const setGuard = useCallback((guard: UnsavedChangesGuard | null) => {
    guardRef.current = guard
  }, [])

  const getGuard = useCallback(() => guardRef.current, [])

  const value = useMemo(() => ({ setGuard, getGuard }), [setGuard, getGuard])

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  )
}

export const useUnsavedChanges = () => {
  const ctx = useContext(UnsavedChangesContext)
  if (!ctx) {
    throw new Error(
      'useUnsavedChanges must be used within an UnsavedChangesProvider'
    )
  }
  return ctx
}
