'use client'

import { useState } from 'react'
import { App, Flex, Spin } from 'antd'
import { getWord } from 'app/getWord/client'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { TWordInfo } from 'store/types'
import { useOpponent } from 'hooks/useOpponent'
import { GAME_STAGES, GET_WORD_ERROR_MESSAGE, PLAY_MODES, PLAYERS } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { showInterstitial } from 'helpers/utils/ads'
import { navigate } from 'helpers/utils/gameRouter'
import { combineClassNames } from 'helpers/utils/styles'
import { CustomButton } from 'components/shared/customButton'
import styles from './styles.module.css'

export const Summary: StageComponent = ({ toNextPage }) => {
  const { message: messageApi } = App.useApp()
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
      messageApi.error(GET_WORD_ERROR_MESSAGE)
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
      <div className={styles.summary}>
        <div className={styles.hints}>
          <p className={styles.main}>
            {roundResult === 'won' ? 'Դուք գուշակեցիք բառը՝' : 'Պահված բառն էր՝'}
            <br />
            <span className={styles.currentWord}>«{currentWord}»</span>
          </p>
          <button type='button' className={styles.linkBtn} onClick={createOwnChallenge}>
            Ստեղծել ձեր մարտահրավերը
          </button>
        </div>
        <CustomButton onClick={playVsAI}>Խաղալ արհեստական բանականության դեմ</CustomButton>
      </div>
    )
  }

  const isLongText = !playerWon && !isSingleMode

  return (
    <div className={styles.summary}>
      <div className={styles.hints}>
        <p className={styles.main}>
          Պահված բառն էր՝
          <br />
          <span className={styles.currentWord}>«{currentWord}»</span>
        </p>
        <p className={styles.hint}>{isSingleMode ? `Դուք ունեք ${player1} միավոր` : `Խաղացող 1՝ ${player1} միավոր`}</p>
        {!isSingleMode && <p className={styles.hint}>Խաղացող 2՝ {player2} միավոր</p>}
        {isSingleMode && currentStreak > 1 && <p className={styles.streak}>🔥 {currentStreak} բառ անընդմեջ</p>}
      </div>

      <CustomButton
        onClick={handleNextPlayerComposes}
        disabled={isPending}
        className={combineClassNames(isLongText && styles.longTextButton)}
      >
        <Flex align='center' justify='center' gap={12}>
          {isPending && <Spin className='' />}
          {isLongText ? (
            `Բառ գրելու հերթը ${currentPlayer === PLAYERS.player1 ? 'երկրորդ' : 'առաջին'} խաղացողինն է`
          ) : (
            <span style={{ fontSize: isPending && isSingleMode ? '.85rem' : '1.15rem' }}>
              {isPending && isSingleMode ? 'Արհեստական բանականությունը մտածում է․․․' : 'Շարունակել'}
            </span>
          )}
        </Flex>
      </CustomButton>
    </div>
  )
}
