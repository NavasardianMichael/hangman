import { useGameStore } from 'store/game'
import { TGameStage, TGameStore } from 'store/types'
import { TLeaveDialogVariant, useUiStore } from 'store/ui'
import { GAME_STAGES, PLAY_MODES } from 'helpers/constants/app'
import { trackEvent } from './analytics'
import { navigate, restoreStage } from './gameRouter'

type TGameState = Pick<
  TGameStore,
  'mode' | 'currentWord' | 'playerWon' | 'round' | 'roundsPlayed' | 'challengeLink'
>

// Whether a screen makes sense for the saved game (a URL can point anywhere)
export const isStageAllowed = (stage: TGameStage, state: TGameState): boolean => {
  switch (stage) {
    case GAME_STAGES.start:
      return true
    case GAME_STAGES.settings:
      return state.mode === PLAY_MODES.single || state.mode === PLAY_MODES.multiplayer
    case GAME_STAGES.composition:
      return (
        !state.currentWord &&
        !state.playerWon &&
        (state.mode === PLAY_MODES.multiplayer || (state.mode === PLAY_MODES.challenge && !state.challengeLink))
      )
    case GAME_STAGES.discovery:
      return !!state.currentWord && !state.playerWon
    case GAME_STAGES.summary:
      return !!state.currentWord && !!state.round.result
    case GAME_STAGES.share:
      return state.mode === PLAY_MODES.challenge && !!state.challengeLink
    case GAME_STAGES.end:
      return !!state.playerWon
  }
}

// Where an unfinished saved game continues, or null when there's nothing worth resuming
export const getResumeStage = (state: TGameState): TGameStage | null => {
  if (!state.mode || state.playerWon) return null
  if (state.currentWord) return state.round.result ? GAME_STAGES.summary : GAME_STAGES.discovery
  if (state.mode === PLAY_MODES.multiplayer && state.roundsPlayed > 0) return GAME_STAGES.composition
  return null
}

// Ends the current game and returns to the start screen
export const leaveGame = (from: TGameStage) => {
  if (getResumeStage(useGameStore.getState())) trackEvent('game_abandoned', { stage: from })
  useGameStore.getState().resetGame()
  navigate(GAME_STAGES.start)
}

type TBackBehavior = { kind: 'confirm'; variant: TLeaveDialogVariant } | { kind: 'go'; run: () => void }

// What the back gesture (or the home button) does on each screen
const getBackBehavior = (from: TGameStage, state: TGameState): TBackBehavior => {
  const isChallenge = state.mode === PLAY_MODES.challenge
  const go = (run: () => void): TBackBehavior => ({ kind: 'go', run })
  const confirm: TBackBehavior = { kind: 'confirm', variant: isChallenge ? 'challenge' : 'game' }

  switch (from) {
    case GAME_STAGES.settings:
      return go(() => navigate(GAME_STAGES.start))
    case GAME_STAGES.composition:
      if (isChallenge) return go(() => leaveGame(from))
      // Nothing has been played yet: back to the game settings
      if (state.roundsPlayed === 0) return go(() => navigate(GAME_STAGES.settings))
      return confirm
    case GAME_STAGES.discovery:
      return isChallenge && state.round.result ? go(() => leaveGame(from)) : confirm
    case GAME_STAGES.summary:
      return isChallenge ? go(() => leaveGame(from)) : confirm
    case GAME_STAGES.share:
      // Back to editing the challenge word
      return go(() => {
        useGameStore.getState().setAppOptions({ challengeLink: '' })
        navigate(GAME_STAGES.composition)
      })
    default:
      return go(() => leaveGame(from))
  }
}

// The player used the device/browser back gesture on a game screen
export const handleUserBack = (from: TGameStage) => {
  const behavior = getBackBehavior(from, useGameStore.getState())
  if (behavior.kind === 'go') return behavior.run()

  // Stay on the screen until the player decides
  restoreStage(from)
  useUiStore.getState().openLeaveDialog({ variant: behavior.variant, onConfirm: () => leaveGame(from) })
}

// The home button: asks first when leaving would end a game in progress
export const requestHome = (from: TGameStage) => {
  const behavior = getBackBehavior(from, useGameStore.getState())
  if (behavior.kind === 'confirm') {
    useUiStore.getState().openLeaveDialog({ variant: behavior.variant, onConfirm: () => leaveGame(from) })
  } else {
    leaveGame(from)
  }
}

// The forward gesture can only reopen a screen that still fits the game
export const handleUserForward = (to: TGameStage) => {
  const state = useGameStore.getState()
  if (!isStageAllowed(to, state)) navigate(getResumeStage(state) ?? GAME_STAGES.start)
}
