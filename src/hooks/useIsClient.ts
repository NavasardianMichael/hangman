import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

// False during SSR and hydration, true afterwards
export const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
