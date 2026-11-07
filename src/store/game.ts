import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { CATEGORIES, DIFFICULTY_LEVELS, PLAY_MODES, PLAYERS, STORE_VARS } from 'helpers/constants/app'
import { TAppSlice, TGameStore, TPreferences, TRound, TSettings } from './types'

const initialSettings: TSettings = {
  withTimeLimit: true,
  timeLimit: 60,
  pointsToWin: 10,
  minLettersCount: 3,
  category: CATEGORIES.ցանկացած,
  difficulty: DIFFICULTY_LEVELS.միջին,
}

// Challenge rounds (played from a friend's link) have no timer
const createRound = (settings: TSettings, hint = '', withTimer = true): TRound => ({
  guessedLetters: {},
  wastedLetters: {},
  remainingSeconds: withTimer && settings.withTimeLimit && settings.timeLimit > 0 ? settings.timeLimit : null,
  hint,
  hintRevealed: false,
  revealedLetters: 0,
  result: null,
})

export const initialAppState: TAppSlice = {
  mode: null,
  currentPlayer: PLAYERS.player1,
  currentWord: '',
  points: {
    player1: 0,
    player2: 0,
  },
  settings: initialSettings,
  playerWon: null,
  round: createRound(initialSettings),
  roundsPlayed: 0,
  challengeLink: '',
}

const initialPreferences: TPreferences = {
  soundEnabled: true,
  stats: {
    roundsWon: 0,
    roundsLost: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    bestStreak: 0,
  },
  freeUse: { date: null, hints: 0, letters: 0 },
}

export const useGameStore = create<TGameStore>()(
  persist(
    (set, get) => ({
      ...initialAppState,
      ...initialPreferences,

      setAppOptions: (options) => set(options),

      setGameSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),

      startRound: ({ word, hint }) =>
        set((state) => ({
          currentWord: word,
          round: createRound(state.settings, hint, state.mode !== PLAY_MODES.challenge),
        })),

      clearRound: () => set((state) => ({ currentWord: '', round: createRound(state.settings) })),

      guessLetter: (letter) =>
        set((state) => ({
          round: { ...state.round, guessedLetters: { ...state.round.guessedLetters, [letter]: true } },
        })),

      wasteLetter: (letter) =>
        set((state) => ({
          round: { ...state.round, wastedLetters: { ...state.round.wastedLetters, [letter]: true } },
        })),

      setRemainingSeconds: (seconds) => set((state) => ({ round: { ...state.round, remainingSeconds: seconds } })),

      // Idempotent, so a reload after the round ended doesn't count it twice
      finishRound: (result) => {
        const { round, mode, currentPlayer, points, stats, roundsPlayed } = get()
        if (round.result) return

        const updates: Partial<TGameStore> = { round: { ...round, result }, roundsPlayed: roundsPlayed + 1 }

        if (result === 'won' && mode !== PLAY_MODES.challenge) {
          // In multiplayer the current player composes the word, so the point goes to the opponent who guessed it
          const scorer =
            mode === PLAY_MODES.single
              ? PLAYERS.player1
              : currentPlayer === PLAYERS.player1
                ? PLAYERS.player2
                : PLAYERS.player1
          updates.points = { ...points, [scorer]: points[scorer] + 1 }
        }

        if (mode === PLAY_MODES.single) {
          const currentStreak = result === 'won' ? stats.currentStreak + 1 : 0
          updates.stats = {
            ...stats,
            roundsWon: stats.roundsWon + (result === 'won' ? 1 : 0),
            roundsLost: stats.roundsLost + (result === 'lost' ? 1 : 0),
            currentStreak,
            bestStreak: Math.max(stats.bestStreak, currentStreak),
          }
        }

        set(updates)
      },

      revealHint: () => set((state) => ({ round: { ...state.round, hintRevealed: true } })),

      revealLetter: (letter) =>
        set((state) => ({
          round: {
            ...state.round,
            guessedLetters: { ...state.round.guessedLetters, [letter]: true },
            revealedLetters: (state.round.revealedLetters ?? 0) + 1,
          },
        })),

      markFreeUse: (kind, date) =>
        set(({ freeUse }) => {
          const today = freeUse.date === date ? freeUse : { date, hints: 0, letters: 0 }
          return { freeUse: { ...today, [kind]: today[kind] + 1 } }
        }),

      recordGameStarted: () =>
        set((state) => ({ stats: { ...state.stats, gamesPlayed: state.stats.gamesPlayed + 1 } })),

      recordGameWon: () => set((state) => ({ stats: { ...state.stats, gamesWon: state.stats.gamesWon + 1 } })),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      // Keeps the chosen settings for the next game, along with sound, stats and the daily free counts
      resetGame: () => set((state) => ({ ...structuredClone(initialAppState), settings: state.settings })),
    }),
    {
      name: STORE_VARS.PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 4,
      // v2: the current screen moved from the store to the URL
      // v3: free hints are counted per day; a saved date without a count was the old single daily hint
      // v4: free hints and letter reveals are counted together in freeUse
      migrate: (persisted, version) => {
        const state: Record<string, unknown> = { roundsPlayed: 0, ...(persisted as Record<string, unknown>) }
        delete state.currentStage
        if (version < 3) state.freeHintsUsed = state.lastFreeHintDate ? 1 : 0
        if (version < 4) {
          const date = typeof state.lastFreeHintDate === 'string' ? state.lastFreeHintDate : null
          state.freeUse = { date, hints: date ? Number(state.freeHintsUsed) || 0 : 0, letters: 0 }
          delete state.lastFreeHintDate
          delete state.freeHintsUsed
        }
        return state as unknown as TGameStore
      },
    }
  )
)
