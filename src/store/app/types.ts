import { GAME_STAGES, PLAYERS } from 'helpers/constants/app'

export type TAppSlice = {
  currentStage: typeof GAME_STAGES[keyof typeof GAME_STAGES]
  currentPlayer: typeof PLAYERS[keyof typeof PLAYERS]
  currentWord: string
  points: Record<keyof typeof PLAYERS, number>
}

export type TAppActionPayloads = {
  setCurrentStage: TAppSlice['currentStage']
  setCurrentPlayer: TAppSlice['currentPlayer']
  setAppOptions: Partial<TAppSlice>
  incrementCurrentPlayerPoint: null
}
