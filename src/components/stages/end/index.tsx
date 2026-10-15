'use client'

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { GAME_STAGES, PLAY_MODES, PLAYERS } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { trackEvent } from 'helpers/utils/analytics'
import { leaveGame } from 'helpers/utils/gameFlow'
import { Audio } from 'components/shared/audio'
import { CustomButton } from 'components/shared/customButton'
import { StatsPanel } from 'components/stats'
import styles from './styles.module.css'

export const End: StageComponent = () => {
  const { playerWon, mode } = useGameStore(useShallow((state) => ({ playerWon: state.playerWon, mode: state.mode })))
  const isSingleMode = mode === PLAY_MODES.single

  useEffect(() => {
    trackEvent('game_end', { mode, winner: playerWon })
  }, [mode, playerWon])

  return (
    <div className={styles.end}>
      <h3>
        Խաղն ավարտվեց
        <br />
        🥇Շնորհավորում ենք🥇
      </h3>
      <p className={styles.winnerText}>
        🏆
        {isSingleMode
          ? `Դուք հաղթեցիք`
          : `${
              playerWon === PLAYERS.player1
                ? 'Հաղթեց առաջին խաղացողը'
                : playerWon === PLAYERS.player2
                  ? 'Հաղթեց երկրորդ խաղացողը'
                  : 'Խաղն ավարտվեց ոչ-ոքի'
            } `}
      </p>
      {isSingleMode && (
        <div className={styles.stats}>
          <StatsPanel />
        </div>
      )}
      <CustomButton onClick={() => leaveGame(GAME_STAGES.end)}>Խաղալ նորից</CustomButton>
      <Audio deps={[playerWon]} src={'/win.mp3'} />
    </div>
  )
}
