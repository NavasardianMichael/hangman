'use client'

import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Statistic, StatisticTimerProps } from 'antd'
import { prefetchWord } from 'app/getWord/client'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { TLetter, TRoundResult } from 'store/types'
import { useUiStore } from 'store/ui'
import { LETTERS, MAX_MISTAKES, PLAY_MODES } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { trackEvent } from 'helpers/utils/analytics'
import { combineClassNames } from 'helpers/utils/styles'
import { splitWordToLetters } from 'helpers/utils/words'
import { Audio } from 'components/shared/audio'
import { CustomButton } from 'components/shared/customButton'
import { Hangman, THangmanStatus } from './hangman'
import styles from './styles.module.css'

type TWordCell = TLetter | ' '

// Resumes from the seconds left before a pause, or from those saved before a reload
const getCountdownDeadline = (remainingSeconds: number | null = null) => {
  const { settings, round } = useGameStore.getState()
  if (!settings.withTimeLimit || settings.timeLimit <= 0) return 0
  return Date.now() + (remainingSeconds ?? round.remainingSeconds ?? settings.timeLimit) * 1000
}

const isTimerPausedByUi = ({ leaveDialog, isHintFlowActive }: ReturnType<typeof useUiStore.getState>) =>
  !!leaveDialog || isHintFlowActive

export const Discovery: StageComponent = ({ toNextPage }) => {
  const { currentWord, mode, withTimeLimit, timeLimit, minLettersCount, category, difficulty } = useGameStore(
    useShallow((state) => ({
      currentWord: state.currentWord,
      mode: state.mode,
      withTimeLimit: state.settings.withTimeLimit,
      timeLimit: state.settings.timeLimit,
      minLettersCount: state.settings.minLettersCount,
      category: state.settings.category,
      difficulty: state.settings.difficulty,
    }))
  )
  const { guessedLetters, wastedLetters, hint, hintRevealed, result } = useGameStore(
    useShallow((state) => ({
      guessedLetters: state.round.guessedLetters,
      wastedLetters: state.round.wastedLetters,
      hint: state.round.hint,
      hintRevealed: state.round.hintRevealed,
      result: state.round.result,
    }))
  )
  const isTimerPaused = useUiStore(isTimerPausedByUi)

  const [finishedAudioTrigger, setFinishedAudioTrigger] = useState(false)
  const [countdownDeadline, setCountdownDeadline] = useState(() => getCountdownDeadline())
  // Seconds left on the countdown. Kept out of the store while ticking: saving the store writes localStorage, so
  // it's saved only when the page is hidden, closed or reloaded.
  const remainingSecondsRef = useRef<number | null>(null)

  // During the leave question, a hint dialog or the rewarded ad, the countdown pauses and then resumes where it stopped
  useEffect(
    () =>
      useUiStore.subscribe((state, previous) => {
        if (isTimerPausedByUi(previous) && !isTimerPausedByUi(state)) {
          setCountdownDeadline(getCountdownDeadline(remainingSecondsRef.current))
        }
      }),
    []
  )

  useEffect(() => {
    const saveRemainingSeconds = () => {
      const seconds = remainingSecondsRef.current
      const { round, setRemainingSeconds } = useGameStore.getState()
      if (seconds === null || round.result || seconds === round.remainingSeconds) return
      setRemainingSeconds(seconds)
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveRemainingSeconds()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', saveRemainingSeconds)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', saveRemainingSeconds)
    }
  }, [])

  const isSingleMode = mode === PLAY_MODES.single
  // Challenge rounds from a friend's link are untimed
  const hasTimer = withTimeLimit && timeLimit > 0 && mode !== PLAY_MODES.challenge
  const currentWordLetters = useMemo(() => splitWordToLetters(currentWord.toUpperCase()) as TWordCell[], [currentWord])
  const wastedLettersCount = Object.keys(wastedLetters).length
  const isWordGuessed = currentWordLetters.filter((letter) => letter !== ' ').every((letter) => guessedLetters[letter])
  const isLost = result === 'lost' || (!isWordGuessed && wastedLettersCount > MAX_MISTAKES)
  const isRoundOver = isWordGuessed || isLost
  const hangmanStatus: THangmanStatus = isWordGuessed ? 'won' : isLost ? 'lost' : 'playing'

  const endRound = useCallback(
    (roundResult: TRoundResult) => {
      const { round, finishRound } = useGameStore.getState()
      if (round.result) return
      finishRound(roundResult)
      trackEvent('round_end', {
        mode,
        result: roundResult,
        wordLength: currentWordLetters.length,
        mistakes: Object.keys(round.wastedLetters).length,
        usedHint: round.hintRevealed,
      })
    },
    [currentWordLetters.length, mode]
  )

  useEffect(() => {
    if (isWordGuessed) endRound('won')
    else if (wastedLettersCount > MAX_MISTAKES) endRound('lost')
  }, [endRound, isWordGuessed, wastedLettersCount])

  // The next AI word loads while this round is played
  useEffect(() => {
    if (isSingleMode) prefetchWord({ minLettersCount, category, difficulty })
  }, [category, difficulty, isSingleMode, minLettersCount])

  const handleAlphabetLetterClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const letter = e.currentTarget.name as TLetter
    const { guessLetter, wasteLetter } = useGameStore.getState()
    if (currentWordLetters.includes(letter)) guessLetter(letter)
    else wasteLetter(letter)
  }

  const countdownOnChange = (value: StatisticTimerProps['value']) => {
    if (typeof value === 'number') remainingSecondsRef.current = Math.max(0, Math.ceil(value / 1000))
  }

  const handleTimerFinish: StatisticTimerProps['onFinish'] = () => {
    if (isWordGuessed) return
    setFinishedAudioTrigger(true)
    endRound('lost')
    setTimeout(() => {
      toNextPage()
    }, 100)
  }

  const showHintText = isSingleMode && !!hint && hintRevealed && !isRoundOver

  return (
    <div className={combineClassNames(styles.discovery, isRoundOver && styles.withBar)}>
      <div className={styles.info}>
        {hasTimer && !isRoundOver && !isTimerPaused && (
          <Statistic.Timer
            className={styles.timer}
            format='mm:ss'
            type='countdown'
            value={countdownDeadline}
            onChange={countdownOnChange}
            onFinish={handleTimerFinish}
          />
        )}
      </div>
      <div
        className={combineClassNames(
          styles.word,
          isWordGuessed ? styles.success : undefined,
          isLost ? styles.fail : undefined
        )}
      >
        {currentWordLetters.map((letter, i) => {
          const isSpace = letter === ' '
          const isShown = isWordGuessed || isLost || (!isSpace && guessedLetters[letter])

          return (
            <span key={i} className={combineClassNames(styles.cell, isSpace && styles.space, isShown && styles.guessed)}>
              <span>{letter}</span>
            </span>
          )
        })}
      </div>
      {showHintText && <p className={styles.hintText}>💡 {hint}</p>}
      <Audio deps={[wastedLettersCount, currentWordLetters]} src='/scribble.mp3' />
      <Audio deps={[isWordGuessed]} src='/win.mp3' />
      <Audio deps={[isLost, finishedAudioTrigger]} src='/loss.mp3' />
      <Audio deps={[Object.keys(guessedLetters).length]} src='/correct.mp3' />
      <Hangman step={wastedLettersCount} status={hangmanStatus} />
      <div className={combineClassNames(styles.alphabet, isRoundOver ? styles.disabled : undefined)}>
        {LETTERS.map((letter) => {
          return (
            <button
              key={letter}
              name={letter}
              disabled={guessedLetters[letter] || wastedLetters[letter]}
              className={combineClassNames(
                styles.letter,
                guessedLetters[letter] ? styles.guessed : undefined,
                wastedLetters[letter] ? styles.wasted : undefined
              )}
              onClick={handleAlphabetLetterClick}
            >
              {letter}
            </button>
          )
        })}
      </div>
      {isRoundOver && (
        <CustomButton onClick={() => toNextPage()}>
          {mode === PLAY_MODES.multiplayer ? 'Անցնել հաջորդ խաղացողին' : 'Շարունակել'}
        </CustomButton>
      )}
    </div>
  )
}
