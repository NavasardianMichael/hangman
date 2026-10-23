'use client'

import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { LetterKey } from 'components/shared/letterKey'
import { Countdown } from './countdown'
import { Hangman, THangmanStatus } from './hangman'

const CELL_CLASSES =
  'box-border flex min-h-[2.35rem] items-center justify-center rounded-card border border-solid border-[rgba(35,35,35,0.28)] shadow-card'

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
  const { guessedLetters, wastedLetters, result } = useGameStore(
    useShallow((state) => ({
      guessedLetters: state.round.guessedLetters,
      wastedLetters: state.round.wastedLetters,
      result: state.round.result,
    }))
  )
  const isTimerPaused = useUiStore(isTimerPausedByUi)

  const [finishedAudioTrigger, setFinishedAudioTrigger] = useState(false)
  const [countdownDeadline, setCountdownDeadline] = useState(() => getCountdownDeadline())
  // Seconds left on the countdown. Kept out of the store while ticking: saving the store writes localStorage, so
  // it's saved only when the page is hidden, closed or reloaded.
  const remainingSecondsRef = useRef<number | null>(null)

  // During the leave question or a hint dialog, the countdown pauses and then resumes where it stopped
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

  const countdownOnChange = (msLeft: number) => {
    remainingSecondsRef.current = Math.ceil(msLeft / 1000)
  }

  const handleTimerFinish = () => {
    if (isWordGuessed) return
    // Stay on the round, same as losing by mistakes, so the loss sound can play
    setFinishedAudioTrigger(true)
    endRound('lost')
  }

  return (
    // Column layout: the drawing takes whatever height is left between the word and the keyboard.
    // Phones turned sideways: word and drawing on the left, keyboard on the right.
    <div
      className={combineClassNames(
        'box-border flex flex-col phone-landscape:grid phone-landscape:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] phone-landscape:grid-rows-[auto_auto_auto_minmax(0,1fr)] phone-landscape:gap-x-2',
        // The continue button takes the bottom bar once the round is over
        isRoundOver
          ? 'h-[calc(100dvh_-_var(--ad-band-height)_-_var(--bottom-bar-height))]'
          : 'h-[calc(100dvh_-_var(--ad-band-height))]'
      )}
    >
      {/* Leaves room for the top-right buttons */}
      <div className='flex min-h-[2.5rem] flex-none items-center gap-3 pt-[4px] pr-(--top-bar-reserve) pb-0 pl-[16px] phone-landscape:col-start-1 phone-landscape:pr-[16px]'>
        {hasTimer && !isRoundOver && !isTimerPaused && (
          <Countdown deadline={countdownDeadline} onChange={countdownOnChange} onFinish={handleTimerFinish} />
        )}
      </div>
      {/* The app font has a single weight; a thin outline in the text color renders a consistent semibold */}
      <div className='mt-2 flex flex-none flex-wrap justify-center gap-2 p-4 text-center text-[1.75rem] leading-none font-normal [-webkit-text-stroke:0.045em_currentColor] [paint-order:stroke_fill] phone-landscape:col-start-1 phone-landscape:py-1 phone-landscape:text-[1.2rem]'>
        {currentWordLetters.map((letter, i) => {
          const isSpace = letter === ' '
          const isShown = isWordGuessed || isLost || (!isSpace && guessedLetters[letter])

          return (
            <span
              key={i}
              className={combineClassNames(
                'basis-[calc(100%/10_-_9*0.5rem/10)]',
                !isSpace &&
                  combineClassNames(
                    CELL_CLASSES,
                    isWordGuessed ? 'bg-[rgba(30,221,30,0.4)]' : isLost ? 'bg-[rgba(255,0,0,0.3)]' : 'bg-paper'
                  )
              )}
            >
              <span
                className={combineClassNames(
                  'block leading-none transition-[scale] duration-200 ease-[ease]',
                  isShown ? 'scale-100' : 'scale-0'
                )}
              >
                {letter}
              </span>
            </span>
          )
        })}
      </div>
      <Audio deps={[wastedLettersCount, currentWordLetters]} src='/scribble.mp3' />
      <Audio deps={[isWordGuessed]} src='/win.mp3' volume={0.7} />
      <Audio deps={[isLost, finishedAudioTrigger]} src='/loss.mp3' volume={0.7} />
      <Audio deps={[Object.keys(guessedLetters).length]} src='/correct.mp3' />
      <Hangman
        className='mx-auto my-1 block h-auto min-h-[80px] w-[min(100%,340px)] flex-[1_1_0] phone-landscape:col-start-1 phone-landscape:row-start-4 phone-landscape:size-full phone-landscape:min-h-0'
        step={wastedLettersCount}
        status={hangmanStatus}
      />
      <div
        className={combineClassNames(
          'box-border flex w-full flex-none flex-wrap gap-[0.2rem] p-4 text-center text-[1.35rem] font-medium text-primary phone-landscape:col-start-2 phone-landscape:row-[1/span_4] phone-landscape:self-center phone-landscape:px-2 phone-landscape:pt-[3.25rem] phone-landscape:pb-2',
          isRoundOver && 'pointer-events-none'
        )}
      >
        {LETTERS.map((letter) => {
          return (
            <LetterKey
              key={letter}
              name={letter}
              disabled={guessedLetters[letter] || wastedLetters[letter]}
              state={guessedLetters[letter] ? 'guessed' : wastedLetters[letter] ? 'wasted' : 'idle'}
              className={isRoundOver ? 'opacity-60' : undefined}
              onClick={handleAlphabetLetterClick}
            >
              {letter}
            </LetterKey>
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
