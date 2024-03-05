import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { ALPHABET, PLAYERS } from 'helpers/constants/app'
import { MouseEventHandler, useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'hooks/useAppSelector'
import { selectAppOptions } from 'store/app/selectors'
import { combineClassNames } from 'helpers/utils/styles'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { incrementCurrentPlayerPoint } from 'store/app/slice'
import { CustomButton } from 'components/shared/customButton'
import { Hangman } from './hangman'

export const Discovery: StageComponent = ({ toNextPage }) => {

  const dispatch = useAppDispatch()
  const { currentWord } = useAppSelector(selectAppOptions);
  const currentWordLettersArr = useMemo(() => {
    return Array.from(currentWord) as (typeof ALPHABET[number])[]
  }, [currentWord]);
  
  const [ guessedLetters, setGuessedLetters ] = useState<{[key in typeof ALPHABET[number]]?: boolean} >({})
  const [ wastedLetters, setWastedLetters ] = useState<{[key in typeof ALPHABET[number]]?: boolean} >({})

  const wastedLettersCount = useMemo(() => {
    return Object.keys(wastedLetters).length
  }, [wastedLetters])

  const handleAlphabetLetterClick: MouseEventHandler<HTMLButtonElement> = e => {
    const letter = e.currentTarget.name

    if(!currentWord.includes(letter)) {
      setWastedLetters(prev => ({ ...prev, [letter]: true}))
      if(Object.keys(wastedLetters).length + 1 >= 7) {
        toNextPage()
      }
      return
    };

    setGuessedLetters(prev => ({ ...prev, [letter]: true}))
  }

  const handleShowSummary = () => {
    toNextPage()
  }

  const isWordGuessed = useMemo(() => {
    return currentWordLettersArr.every(letter => guessedLetters[letter])
  }, [currentWordLettersArr, guessedLetters])

  useEffect(() => {
    if(isWordGuessed) dispatch(incrementCurrentPlayerPoint())
  }, [currentWordLettersArr, guessedLetters])

  return (
    <div className={styles.discovery}>
      <div className={styles.word}>
        {
          currentWordLettersArr.map((letter, i) => {
            return (
              <span 
                key={i} 
                className={combineClassNames(styles.cell, guessedLetters[letter] ? styles.guessed : undefined)}
              >
                <span>{letter === 'ւ' ? 'Ու' : letter}</span>
              </span>
            )
          })
        }
      </div>
      <Hangman step={wastedLettersCount} />
      <div className={combineClassNames(styles.alphabet, isWordGuessed ? styles.disabled : undefined)}>
        {
          ALPHABET.map(letter => {
            return (
              <button 
                key={letter} 
                name={letter}
                disabled={guessedLetters[letter] || wastedLetters[letter]} 
                className={combineClassNames(
                  styles.letter,
                  guessedLetters[letter] ? styles.guessed : undefined,
                  wastedLetters[letter] ? styles.wasted : undefined,
                )}
                 
                onClick={handleAlphabetLetterClick}
              >
                {letter === 'ւ' ? 'Ու' : letter}
              </button>
            )
          })
        }
      </div>
      {
        isWordGuessed &&
        <CustomButton onClick={handleShowSummary}>
          Անցնել հաջորդ խաղացողին
        </CustomButton>
      }
    </div>
  )
}