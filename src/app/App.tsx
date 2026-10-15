'use client'

import { FC, useEffect } from 'react'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { App as AntdApp } from 'antd'
import { useGameStore } from 'store/game'
import { TGameStage } from 'store/types'
import { useUiStore } from 'store/ui'
import { useIsClient } from 'hooks/useIsClient'
import { GAME_STAGES, PLAY_MODES } from 'helpers/constants/app'
import { configureAds } from 'helpers/utils/ads'
import { trackEvent } from 'helpers/utils/analytics'
import { CHALLENGE_PARAM, decodeChallengeToken } from 'helpers/utils/challenge'
import { getResumeStage, handleUserBack, handleUserForward, isStageAllowed } from 'helpers/utils/gameFlow'
import { initGameRouter } from 'helpers/utils/gameRouter'
import { AdRails } from 'components/adRails'
import { Background } from 'components/background'
import { LeaveGameDialog } from 'components/leaveGameDialog'
import { Stages } from 'components/stages/Stages'
import { TopBar } from 'components/topBar'

// A challenge link (?c=…) opens straight into its round; the router drops the parameter from the URL
const startChallengeFromUrl = () => {
  const token = new URL(window.location.href).searchParams.get(CHALLENGE_PARAM)
  const word = token && decodeChallengeToken(token)
  if (!word) return false

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
  // The store is restored from localStorage, which the server can't see, so the game renders on the client only
  const isClient = useIsClient()
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

  if (!isClient || !isRouterReady) return null

  return (
    <AntdRegistry>
      {/* Hosts toasts at the root so they outlive the stage that showed them */}
      <AntdApp component={false}>
        <Background />
        <div className='app dark'>
          <TopBar />
          <Stages />
        </div>
        <AdRails />
        <LeaveGameDialog />
      </AntdApp>
    </AntdRegistry>
  )
}

export default App
