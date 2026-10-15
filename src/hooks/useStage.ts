import { usePathname } from 'next/navigation'
import { TGameStage } from 'store/types'
import { stageFromPath } from 'helpers/constants/routes'

// The current game screen, read from the URL
export const useStage = (): TGameStage => stageFromPath(usePathname())
