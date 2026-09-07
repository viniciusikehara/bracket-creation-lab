import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { STORAGE_KEY, type AppData } from '../persistence'
import { Store } from './store'

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children, store }: { children: ReactNode; store?: Store }) {
  const instance = useMemo(() => store ?? new Store(), [store])

  // Another tab wrote to our key: pick up its data instead of drifting apart.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) instance.reload()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [instance])

  return <StoreContext.Provider value={instance}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (store === null) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}

/** The current data snapshot; re-renders on every committed mutation. */
export function useAppData(): AppData {
  const store = useStore()
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
