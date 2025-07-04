import { GAME_STAGES, PLAY_MODES, PLAYERS } from 'helpers/constants/app'

export type TAppSlice = {
  mode: typeof PLAY_MODES[keyof typeof PLAY_MODES] | null
  currentStage: typeof GAME_STAGES[keyof typeof GAME_STAGES]
  currentPlayer: typeof PLAYERS[keyof typeof PLAYERS]
  currentWord: string
  points: Record<keyof typeof PLAYERS, number>
  settings: TSettings
}

type TSettings = {
  withTimeLimit: boolean
  timeLimit: number
  pointsToWin: number
  minLettersCount: number
}

export type TAppActionPayloads = {
  setCurrentStage: TAppSlice['currentStage']
  setCurrentPlayer: TAppSlice['currentPlayer']
  setAppOptions: Partial<TAppSlice>
  setGameSettings: Partial<TSettings>
  incrementCurrentPlayerPoint: null
}
