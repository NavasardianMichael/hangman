'use client'

import { FC, useState, useSyncExternalStore } from 'react'
import { Modal } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { useBackClose } from 'hooks/useBackClose'
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
import { combineClassNames } from 'helpers/utils/styles'
import { HintButton } from 'components/hintButton'
import { IconButton } from 'components/shared/iconButton'
import { DownloadIcon, HomeIcon, InfoIcon, SoundOffIcon, SoundOnIcon } from 'components/shared/icons'
import styles from './styles.module.css'

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
    <div className={styles.topBar}>
      {showInstall && (
        <IconButton
          className={styles.installButton}
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
        aria-label={soundEnabled ? 'Անջատել ձայնը' : 'Միացնել ձայնը'}
        title={soundEnabled ? 'Անջատել ձայնը' : 'Միացնել ձայնը'}
        aria-pressed={!soundEnabled}
        onClick={handleSoundClick}
      >
        {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
      </IconButton>

      <Modal
        centered
        open={infoModalOpen}
        onOk={() => setInfoModalOpen(false)}
        onCancel={() => setInfoModalOpen(false)}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div className={styles.turnInfo}>
          <p className={styles.turnText}>{turnText}</p>
          <p className={combineClassNames(styles.turnText, styles.nextTurn)}>{nextTurnText}</p>
        </div>
      </Modal>
    </div>
  )
}
