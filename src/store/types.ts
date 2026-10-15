import { CATEGORIES, DIFFICULTY_LEVELS, GAME_STAGES, LETTERS, PLAY_MODES, PLAYERS } from 'helpers/constants/app'

export type TPlayer = (typeof PLAYERS)[keyof typeof PLAYERS]
export type TPlayMode = (typeof PLAY_MODES)[keyof typeof PLAY_MODES]
export type TGameStage = (typeof GAME_STAGES)[keyof typeof GAME_STAGES]

export type TSettings = {
  withTimeLimit: boolean
  timeLimit: number
  pointsToWin: number
  minLettersCount: number
  category: (typeof CATEGORIES)[keyof typeof CATEGORIES]
  difficulty: (typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS]
}

export type TLetter = (typeof LETTERS)[number]
export type TLettersMap = Partial<Record<TLetter, true>>

export type TRoundResult = 'won' | 'lost'

export type TRound = {
  guessedLetters: TLettersMap
  wastedLetters: TLettersMap
  // Seconds left on the countdown, kept so a reload resumes the timer
  remainingSeconds: number | null
  hint: string
  hintRevealed: boolean
  result: TRoundResult | null
}

export type TStats = {
  roundsWon: number
  roundsLost: number
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  bestStreak: number
}

// The current screen isn't stored: it comes from the URL (helpers/constants/routes.ts)
export type TAppSlice = {
  mode: TPlayMode | null
  currentPlayer: TPlayer
  currentWord: string
  points: Record<TPlayer, number>
  settings: TSettings
  playerWon: TPlayer | 'draw' | null
  round: TRound
  // Finished rounds in this game
  roundsPlayed: number
  // Link created in challenge mode, shown on the share stage
  challengeLink: string
}

export type TPreferences = {
  soundEnabled: boolean
  stats: TStats
  // Local date (YYYY-MM-DD) of the last free hint
  lastFreeHintDate: string | null
}

export type TWordInfo = {
  word: string
  hint?: string
}

export type TGameActions = {
  setAppOptions: (options: Partial<TAppSlice>) => void
  setGameSettings: (settings: Partial<TSettings>) => void
  startRound: (wordInfo: TWordInfo) => void
  // Between multiplayer rounds, before the next word is written
  clearRound: () => void
  guessLetter: (letter: TLetter) => void
  wasteLetter: (letter: TLetter) => void
  setRemainingSeconds: (seconds: number) => void
  finishRound: (result: TRoundResult) => void
  revealHint: () => void
  markFreeHintUsed: (date: string) => void
  recordGameStarted: () => void
  recordGameWon: () => void
  toggleSound: () => void
  // Ends the game; keeps settings, sound, stats and the daily hint
  resetGame: () => void
}

export type TGameStore = TAppSlice & TPreferences & TGameActions
