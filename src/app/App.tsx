'use client'

import { FC, useEffect } from 'react'
import { useGameStore } from 'store/game'
import { TGameStage } from 'store/types'
import { useUiStore } from 'store/ui'
import { useStage } from 'hooks/useStage'
import { GAME_STAGES, PLAY_MODES } from 'helpers/constants/app'
import { configureAds } from 'helpers/utils/ads'
import { trackEvent } from 'helpers/utils/analytics'
import { CHALLENGE_PARAM, decodeChallengeToken, endChallengeOpening } from 'helpers/utils/challenge'
import { getResumeStage, handleUserBack, handleUserForward, isStageAllowed } from 'helpers/utils/gameFlow'
import { initGameRouter } from 'helpers/utils/gameRouter'
import { LeaveGameDialog } from 'components/leaveGameDialog'
import { Stages } from 'components/stages/Stages'
import { Toaster } from 'components/toaster'
import { TopBar } from 'components/topBar'

// A challenge link (?c=…) opens straight into its round; the router drops the parameter from the URL
const startChallengeFromUrl = () => {
  const token = new URL(window.location.href).searchParams.get(CHALLENGE_PARAM)
  const word = token && decodeChallengeToken(token)
  if (!word) {
    // Not a playable link: the start screen shows after all
    endChallengeOpening()
    return false
  }

  const { resetGame, setAppOptions, startRound } = useGameStore.getState()
  resetGame()
  setAppOptions({ mode: PLAY_MODES.challenge })
  startRound({ word })
  trackEvent('challenge_opened')
  return true
}

// The URL decides the screen, as long as it fits the saved game
const resolveInitialStage = (urlStage: TGameStage): TGameStage => {
  if (startChallengeFromUrl()) return GAME_STAGES.discovery
  const state = useGameStore.getState()
  if (isStageAllowed(urlStage, state)) return urlStage
  return getResumeStage(state) ?? GAME_STAGES.start
}

// Offline support: the worker also caches the assets this first visit loaded before it took control
const registerServiceWorker = async () => {
  try {
    await navigator.serviceWorker.register('/sw.js')
    const registration = await navigator.serviceWorker.ready
    const urls = performance.getEntriesByType('resource').map((entry) => entry.name)
    registration.active?.postMessage({ type: 'CACHE_URLS', urls })
  } catch {
    // Offline mode is optional
  }
}

export const App: FC = () => {
  const stage = useStage()
  const isRouterReady = useUiStore((state) => state.isRouterReady)
  const soundEnabled = useGameStore((state) => state.soundEnabled)

  useEffect(
    () =>
      initGameRouter({
        resolveInitialStage,
        onUserBack: handleUserBack,
        onUserForward: handleUserForward,
        onReady: () => useUiStore.getState().setRouterReady(),
      }),
    []
  )

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      registerServiceWorker()
    }
  }, [])

  useEffect(() => {
    configureAds(soundEnabled)
  }, [soundEnabled])

  // The challenge round from a link is on screen
  useEffect(() => {
    if (stage !== GAME_STAGES.start) endChallengeOpening()
  }, [stage])

  // The start screen is the same for everyone, so the server renders it. Every other screen depends on the game
  // saved on this device, so it waits for the router to check the URL against that game.
  const isScreenKnown = isRouterReady || stage === GAME_STAGES.start

  return (
    <>
      {isScreenKnown && (
        <div className='relative box-border min-h-dvh w-[min(100%,var(--column-width))] mx-auto pt-(--top-inset) text-secondary in-data-challenge-opening:invisible'>
          <TopBar />
          <Stages />
        </div>
      )}
      <LeaveGameDialog />
      <Toaster />
    </>
  )
}

export default App
