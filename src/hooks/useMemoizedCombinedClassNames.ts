import { useMemo } from 'react'
import { combineClassNames } from 'helpers/utils/styles'

export const useMemoizedCombinedClassNames = (
  list: ReadonlyArray<string | undefined>,
  deps: ReadonlyArray<unknown>
) => {
  return useMemo(() => combineClassNames(...list), deps)
}
