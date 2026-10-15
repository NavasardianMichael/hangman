'use client'

import { MouseEventHandler, useState } from 'react'
import { useGameStore } from 'store/game'
import { LETTERS, PLAY_MODES, SPACE_CHAR } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { trackEvent } from 'helpers/utils/analytics'
import { createChallengeLink } from 'helpers/utils/challenge'
import { normalizeSpaces } from 'helpers/utils/commons'
import { combineClassNames } from 'helpers/utils/styles'
import { CustomButton } from 'components/shared/customButton'
import styles from './styles.module.css'

export const Composition: StageComponent = ({ toNextPage }) => {
  const minLettersCount = useGameStore((state) => state.settings.minLettersCount)
  const isChallenge = useGameStore((state) => state.mode === PLAY_MODES.challenge)

  const [word, setWord] = useState('')

  const handleAlphabetLetterClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const letter = e.currentTarget.name
    setWord((prev) => prev + letter)
  }

  const handleAddSpaceCharClick: MouseEventHandler<HTMLButtonElement> = () => {
    setWord((prev) => prev + ' ')
  }

  const handleRemoveCharClick: MouseEventHandler<HTMLButtonElement> = () => {
    setWord((prev) => prev.substring(0, prev.length - 1))
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = () => {
    const finalWord = normalizeSpaces(word)
    const { startRound, setAppOptions } = useGameStore.getState()

    if (isChallenge) {
      setAppOptions({ challengeLink: createChallengeLink(finalWord) })
      trackEvent('challenge_created', { wordLength: finalWord.length })
    } else {
      startRound({ word: finalWord })
    }
    toNextPage()
  }

  return (
    <div className={styles.composition}>
      {isChallenge && <p className={styles.caption}>Գրեք բառ, որը ընկերը պետք է գուշակի</p>}
      <div className={styles.word}>
        {Array.from(word).map((letter, i) => {
          return (
            <span key={i} className={styles.letter}>
              {letter}
            </span>
          )
        })}
      </div>
      <div className={styles.alphabet}>
        {LETTERS.map((letter) => {
          return (
            <button className={styles.letter} key={letter} name={letter} onClick={handleAlphabetLetterClick}>
              {letter}
            </button>
          )
        })}
        <button
          disabled={!word.length || word.endsWith(' ')}
          className={combineClassNames(styles.letter, styles.space)}
          name=' '
          aria-label='Բացատ'
          onClick={handleAddSpaceCharClick}
        >
          {SPACE_CHAR}
        </button>
        <button
          disabled={!word.length}
          className={combineClassNames(styles.letter, styles.remove)}
          name='✕'
          aria-label='Ջնջել'
          onClick={handleRemoveCharClick}
        >
          ✕
        </button>
      </div>
      <CustomButton disabled={normalizeSpaces(word).length < minLettersCount} onClick={handleSubmit}>
        {isChallenge ? 'Ստեղծել հղումը' : 'Անցնել գուշակելուն'}
      </CustomButton>
    </div>
  )
}
