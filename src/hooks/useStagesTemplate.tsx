'use client'

import { JSX, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { TGameStage, TPlayMode } from 'store/types'
import { GAME_STAGES, PLAY_MODES, PLAYERS } from 'helpers/constants/app'
import { stageFromPath } from 'helpers/constants/routes'
import { StageComponent } from 'helpers/types/stage'
import { getResumeStage, isStageAllowed } from 'helpers/utils/gameFlow'
import { navigate, whenNavigationSettles } from 'helpers/utils/gameRouter'
import { Composition } from 'components/stages/composition'
import { Discovery } from 'components/stages/discovery'
import { End } from 'components/stages/end'
import { Settings } from 'components/stages/settings'
import { Share } from 'components/stages/share'
import { Start } from 'components/stages/start'
import { Summary } from 'components/stages/summary'
import { useStage } from './useStage'

const STAGE_COMPONENTS: Record<TGameStage, StageComponent> = {
  [GAME_STAGES.start]: Start,
  [GAME_STAGES.settings]: Settings,
  [GAME_STAGES.composition]: Composition,
  [GAME_STAGES.discovery]: Discovery,
  [GAME_STAGES.summary]: Summary,
  [GAME_STAGES.share]: Share,
  [GAME_STAGES.end]: End,
}

// The screen after each one, per mode (summary loops back to the next round, see toNextPage)
const NEXT_STAGES: Record<TPlayMode, Partial<Record<TGameStage, TGameStage>>> = {
  [PLAY_MODES.single]: {
    [GAME_STAGES.settings]: GAME_STAGES.discovery,
    [GAME_STAGES.discovery]: GAME_STAGES.summary,
    [GAME_STAGES.summary]: GAME_STAGES.end,
  },
  [PLAY_MODES.multiplayer]: {
    [GAME_STAGES.settings]: GAME_STAGES.composition,
    [GAME_STAGES.composition]: GAME_STAGES.discovery,
    [GAME_STAGES.discovery]: GAME_STAGES.summary,
    [GAME_STAGES.summary]: GAME_STAGES.end,
  },
  // The creator writes a word and shares the link; whoever opens it plays one round
  [PLAY_MODES.challenge]: {
    [GAME_STAGES.composition]: GAME_STAGES.share,
    [GAME_STAGES.discovery]: GAME_STAGES.summary,
  },
}

export const useStagesTemplate = (): JSX.Element | null => {
  const stage = useStage()
  const { currentPlayer, mode, player1, player2, pointsToWin, playerWon } = useGameStore(
    useShallow((state) => ({
      currentPlayer: state.currentPlayer,
      mode: state.mode,
      player1: state.points.player1,
      player2: state.points.player2,
      pointsToWin: state.settings.pointsToWin,
      playerWon: state.playerWon,
    }))
  )
  const isAllowed = useGameStore((state) => isStageAllowed(stage, state))

  // A screen that no longer fits the game (old link, history entry, cleared data) moves to one that does.
  // Transitions update the game before the URL, so this waits for pending navigation and checks the real URL.
  useEffect(() => {
    if (isAllowed) return
    let isCancelled = false
    whenNavigationSettles().then(() => {
      const state = useGameStore.getState()
      if (isCancelled || isStageAllowed(stageFromPath(window.location.pathname), state)) return
      navigate(getResumeStage(state) ?? GAME_STAGES.start)
    })
    return () => {
      isCancelled = true
    }
  }, [isAllowed, stage])

  if (!isAllowed) return null
  const Component = STAGE_COMPONENTS[stage]

  // Uses the values from this render on purpose: the win checks need the player from before Summary switches turns
  const toNextPage = (currentMode?: TPlayMode | null) => {
    const { setAppOptions, recordGameWon } = useGameStore.getState()
    const actualMode = currentMode ?? mode ?? PLAY_MODES.single
    const nextStage = NEXT_STAGES[actualMode][stage] ?? GAME_STAGES.start

    const finishGame = (winner: typeof playerWon) => {
      setAppOptions({ playerWon: winner })
      navigate(nextStage)
    }

    // A game can only be won once a round is over; the turn checks give both players an equal number of guesses
    const isRoundOver = stage === GAME_STAGES.discovery || stage === GAME_STAGES.summary
    if (actualMode !== PLAY_MODES.challenge && isRoundOver) {
      if (mode === PLAY_MODES.single && player1 >= pointsToWin) {
        if (!playerWon) recordGameWon()
        return finishGame(PLAYERS.player1)
      }
      if (player1 === player2 && player2 >= pointsToWin) return finishGame('draw')
      if (player1 >= pointsToWin && currentPlayer === PLAYERS.player1) return finishGame(PLAYERS.player1)
      if (player2 >= pointsToWin && currentPlayer === PLAYERS.player2) return finishGame(PLAYERS.player2)
    }

    const newStage =
      stage === GAME_STAGES.summary && actualMode !== PLAY_MODES.challenge
        ? actualMode === PLAY_MODES.single
          ? GAME_STAGES.discovery
          : GAME_STAGES.composition
        : nextStage
    navigate(newStage)
  }

  return <Component toNextPage={toNextPage} />
}
