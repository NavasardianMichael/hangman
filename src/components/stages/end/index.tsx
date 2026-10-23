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

export const End: StageComponent = () => {
  const { playerWon, mode } = useGameStore(useShallow((state) => ({ playerWon: state.playerWon, mode: state.mode })))
  const isSingleMode = mode === PLAY_MODES.single

  useEffect(() => {
    trackEvent('game_end', { mode, winner: playerWon })
  }, [mode, playerWon])

  return (
    <div className='box-border flex min-h-[calc(100dvh_-_var(--ad-band-height)_-_var(--bottom-bar-height))] flex-col items-center justify-center gap-4 px-6 py-12 text-center'>
      <h3>
        Խաղն ավարտվեց
        <br />
        🥇Շնորհավորում ենք🥇
      </h3>
      <p className='text-[1.65rem] font-bold'>
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
        <div className='w-full max-w-[420px]'>
          <StatsPanel />
        </div>
      )}
      <CustomButton onClick={() => leaveGame(GAME_STAGES.end)}>Խաղալ նորից</CustomButton>
      <Audio deps={[playerWon]} src={'/win.mp3'} volume={0.7} />
    </div>
  )
}
