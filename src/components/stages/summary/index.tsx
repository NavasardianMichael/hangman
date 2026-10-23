'use client'

import { useState } from 'react'
import { getWord } from 'app/getWord/client'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { TWordInfo } from 'store/types'
import { useOpponent } from 'hooks/useOpponent'
import { GAME_STAGES, GET_WORD_ERROR_MESSAGE, PLAY_MODES, PLAYERS } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { showInterstitial } from 'helpers/utils/ads'
import { navigate } from 'helpers/utils/gameRouter'
import { toast } from 'helpers/utils/toast'
import { CustomButton } from 'components/shared/customButton'
import { Spinner } from 'components/shared/spinner'

const SUMMARY_CLASSES = 'relative flex min-h-[calc(100dvh_-_var(--ad-band-height)_-_var(--bottom-bar-height))]'

const HINTS_CLASSES =
  'my-auto box-border flex w-full flex-col items-center gap-6 p-4 text-center text-[1.7rem] font-medium landscape:pt-0 landscape:[&_p]:m-0'

// The app font has a single weight; a thin outline in the text color renders a consistent semibold
const WORD_CLASSES = 'font-normal break-all [-webkit-text-stroke:0.045em_currentColor] [paint-order:stroke_fill]'

export const Summary: StageComponent = ({ toNextPage }) => {
  const [isPending, setIsPending] = useState(false)
  const { mode, currentPlayer, currentWord, playerWon, player1, player2, roundResult, currentStreak } = useGameStore(
    useShallow((state) => ({
      mode: state.mode,
      currentPlayer: state.currentPlayer,
      currentWord: state.currentWord,
      playerWon: state.playerWon,
      player1: state.points.player1,
      player2: state.points.player2,
      roundResult: state.round.result,
      currentStreak: state.stats.currentStreak,
    }))
  )
  const opponent = useOpponent()
  const isSingleMode = mode === PLAY_MODES.single
  const isChallenge = mode === PLAY_MODES.challenge

  const handleNextPlayerComposes = async () => {
    if (isPending) return
    const { settings, startRound, setAppOptions } = useGameStore.getState()
    let nextWord: TWordInfo | null = null

    setIsPending(true)
    try {
      if (isSingleMode && !playerWon) {
        nextWord = await getWord(settings)
      }
      // Between rounds is the natural break for an interstitial; it resolves at once when no ad shows
      if (!playerWon) await showInterstitial('round-complete')
    } catch {
      toast.error(GET_WORD_ERROR_MESSAGE)
      return
    } finally {
      setIsPending(false)
    }

    setAppOptions({ currentPlayer: isSingleMode ? PLAYERS.player1 : opponent })
    if (nextWord) startRound(nextWord)
    // The next multiplayer word is written from scratch
    else if (!playerWon && !isSingleMode) useGameStore.getState().clearRound()
    toNextPage()
  }

  const createOwnChallenge = () => {
    const { resetGame, setAppOptions } = useGameStore.getState()
    resetGame()
    setAppOptions({ mode: PLAY_MODES.challenge })
    navigate(GAME_STAGES.composition)
  }

  const playVsAI = () => {
    const { resetGame, setAppOptions } = useGameStore.getState()
    resetGame()
    setAppOptions({ mode: PLAY_MODES.single })
    navigate(GAME_STAGES.settings)
  }

  if (isChallenge) {
    return (
      <div className={SUMMARY_CLASSES}>
        <div className={HINTS_CLASSES}>
          <p>
            {roundResult === 'won' ? 'Դուք գուշակեցիք բառը՝' : 'Պահված բառն էր՝'}
            <br />
            <span className={WORD_CLASSES}>«{currentWord}»</span>
          </p>
          <button
            type='button'
            className='m-0 cursor-pointer border-0 bg-transparent p-0 text-[1.05rem] [font-weight:inherit] text-inherit underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary'
            onClick={createOwnChallenge}
          >
            Ստեղծել ձեր մարտահրավերը
          </button>
        </div>
        <CustomButton onClick={playVsAI}>Խաղալ արհեստական բանականության դեմ</CustomButton>
      </div>
    )
  }

  const isLongText = !playerWon && !isSingleMode

  return (
    <div className={SUMMARY_CLASSES}>
      <div className={HINTS_CLASSES}>
        <p>
          Պահված բառն էր՝
          <br />
          <span className={WORD_CLASSES}>«{currentWord}»</span>
        </p>
        <p className='m-0'>{isSingleMode ? `Դուք ունեք ${player1} միավոր` : `Խաղացող 1՝ ${player1} միավոր`}</p>
        {!isSingleMode && <p className='m-0'>Խաղացող 2՝ {player2} միավոր</p>}
        {isSingleMode && currentStreak > 1 && <p className='m-0 text-[1.15rem]'>🔥 {currentStreak} բառ անընդմեջ</p>}
      </div>

      <CustomButton
        onClick={handleNextPlayerComposes}
        disabled={isPending}
        className={isLongText ? 'text-[0.9rem]!' : undefined}
      >
        <span className='flex items-center justify-center gap-3'>
          {isPending && <Spinner />}
          {isLongText ? (
            `Բառ գրելու հերթը ${currentPlayer === PLAYERS.player1 ? 'երկրորդ' : 'առաջին'} խաղացողինն է`
          ) : (
            <span className={isPending && isSingleMode ? 'text-[.85rem]' : 'text-[1.15rem]'}>
              {isPending && isSingleMode ? 'Արհեստական բանականությունը մտածում է․․․' : 'Շարունակել'}
            </span>
          )}
        </span>
      </CustomButton>
    </div>
  )
}
