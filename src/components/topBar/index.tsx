'use client'

import { FC, useState, useSyncExternalStore } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { useBackClose } from 'hooks/useBackClose'
import { useIsClient } from 'hooks/useIsClient'
import { useStage } from 'hooks/useStage'
import { GAME_STAGES, PLAY_MODES, PLAYERS, STAGES_HIDE_BREADCRUMB } from 'helpers/constants/app'
import { trackEvent } from 'helpers/utils/analytics'
import { isInstalledApp, isInWebView } from 'helpers/utils/commons'
import { requestHome } from 'helpers/utils/gameFlow'
import {
  getInstallPrompt,
  getServerInstallPrompt,
  promptInstall,
  subscribeToInstallPrompt,
} from 'helpers/utils/installPrompt'
import { HintButton } from 'components/hintButton'
import { Dialog } from 'components/shared/dialog'
import { IconButton } from 'components/shared/iconButton'
import { DownloadIcon, HomeIcon, InfoIcon, SoundOffIcon, SoundOnIcon } from 'components/shared/icons'

// Install (when the browser offers it), turn info (multiplayer), home (asks first when a game would be lost),
// hint (single-player round) and sound buttons in the top-right corner
export const TopBar: FC = () => {
  const stage = useStage()
  const { currentPlayer, mode, soundEnabled, isRoundInProgress, hasHint } = useGameStore(
    useShallow((state) => ({
      currentPlayer: state.currentPlayer,
      mode: state.mode,
      soundEnabled: state.soundEnabled,
      isRoundInProgress: !!state.currentWord && !state.round.result,
      // Only the AI sends a hint; player-written and built-in words have none
      hasHint: !!state.round.hint,
    }))
  )
  // The server paints the start screen with sound on; the saved choice applies once the page loads
  const isSoundOn = !useIsClient() || soundEnabled
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  useBackClose(infoModalOpen, () => setInfoModalOpen(false))
  // Only Chromium browsers offer an install prompt (none once installed); Safari and Firefox never do
  const installPrompt = useSyncExternalStore(subscribeToInstallPrompt, getInstallPrompt, getServerInstallPrompt)

  const isFirstPlayer = currentPlayer === PLAYERS.player1
  const isDiscovery = stage === GAME_STAGES.discovery
  const turnText = [
    'Բառը',
    isDiscovery ? 'գուշակում է' : 'գրում է',
    isDiscovery === isFirstPlayer ? 'երկրորդ' : 'առաջին',
    'խաղացողը',
  ].join(' ')
  const nextTurnText = [
    'Հաջորդիվ բառը',
    isDiscovery ? 'գրելու է' : 'գուշակելու է',
    isFirstPlayer ? 'երկրորդ' : 'առաջին',
    'խաղացողը',
  ].join(' ')

  const showHome = !STAGES_HIDE_BREADCRUMB.includes(stage)
  const showInfo = showHome && mode === PLAY_MODES.multiplayer && stage !== GAME_STAGES.summary
  const showHint = stage === GAME_STAGES.discovery && mode === PLAY_MODES.single && isRoundInProgress && hasHint
  const showInstall = !!installPrompt && !isInstalledApp() && !isInWebView()

  const handleInstallClick = () => {
    trackEvent('pwa_prompt_shown', { source: 'header' })
    promptInstall()
  }

  const handleSoundClick = () => {
    trackEvent('sound_toggled', { enabled: !soundEnabled })
    useGameStore.getState().toggleSound()
  }

  return (
    <div className='absolute top-[calc(var(--ad-band-height)_+_12px)] right-[16px] z-2 flex gap-[10px]'>
      {showInstall && (
        <IconButton
          data-install-button
          aria-label='Ներբեռնել հավելվածը'
          title='Ներբեռնել հավելվածը'
          onClick={handleInstallClick}
        >
          <DownloadIcon />
        </IconButton>
      )}
      {showInfo && (
        <IconButton aria-label='Ով է խաղում' title='Ով է խաղում' onClick={() => setInfoModalOpen(true)}>
          <InfoIcon />
        </IconButton>
      )}
      {showHome && (
        <IconButton aria-label='Գլխավոր էջ' title='Գլխավոր էջ' onClick={() => requestHome(stage)}>
          <HomeIcon />
        </IconButton>
      )}
      {showHint && <HintButton />}
      <IconButton
        aria-label={isSoundOn ? 'Անջատել ձայնը' : 'Միացնել ձայնը'}
        title={isSoundOn ? 'Անջատել ձայնը' : 'Միացնել ձայնը'}
        aria-pressed={!isSoundOn}
        onClick={handleSoundClick}
      >
        {isSoundOn ? <SoundOnIcon /> : <SoundOffIcon />}
      </IconButton>

      <Dialog open={infoModalOpen} onClose={() => setInfoModalOpen(false)}>
        <div className='text-center'>
          <p className='mt-[0.45rem] mb-0 font-medium'>{turnText}</p>
          <p className='mt-4 mb-0 font-medium'>{nextTurnText}</p>
        </div>
      </Dialog>
    </div>
  )
}
