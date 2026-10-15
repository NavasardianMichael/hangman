import { GAME_STAGES } from './app'

type TStage = (typeof GAME_STAGES)[keyof typeof GAME_STAGES]

// Every game screen has its own URL; the stage name is the path
export const STAGE_PATHS: Record<TStage, string> = {
  [GAME_STAGES.start]: '/',
  [GAME_STAGES.settings]: '/settings',
  [GAME_STAGES.composition]: '/composition',
  [GAME_STAGES.discovery]: '/discovery',
  [GAME_STAGES.summary]: '/summary',
  [GAME_STAGES.share]: '/share',
  [GAME_STAGES.end]: '/end',
}

// Path segments of the screens other than start, for static generation
export const STAGE_SLUGS = Object.values(STAGE_PATHS)
  .filter((path) => path !== '/')
  .map((path) => path.slice(1))

export const stageFromPath = (pathname: string): TStage => {
  const match = (Object.keys(STAGE_PATHS) as TStage[]).find((stage) => STAGE_PATHS[stage] === pathname)
  return match ?? GAME_STAGES.start
}
