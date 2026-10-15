import { FC } from 'react'
import { TPlayMode } from 'store/types'

export type StageComponent = FC<{
  toNextPage: (mode?: TPlayMode | null) => void
}>
