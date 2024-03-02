import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { ALPHABET } from 'helpers/constants/app'
import { MouseEventHandler, useState } from 'react'
import { useAppSelector } from 'hooks/useAppSelector'
import { selectAppOptions } from 'store/app/selectors'
import { combineClassNames } from 'helpers/utils/styles'

export const Discovery: StageComponent = ({  }) => {

  const { currentWord } = useAppSelector(selectAppOptions);
  const currentWordLettersArr = Array.from(currentWord) as (typeof ALPHABET[number])[];
  
  const [ guessedLetters, setGuessedLetters ] = useState<{[key in typeof ALPHABET[number]]?: boolean} >({})

  const handleAlphabetLetterClick: MouseEventHandler<HTMLButtonElement> = e => {
    const letter = e.currentTarget.name

    if(!currentWord.includes(letter)) return;

    setGuessedLetters(prev => ({ ...prev, [letter]: true}))
  }

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
                {letter}
              </span>
            )
          })
        }
      </div>
      <div className={styles.alphabet}>
        {
          ALPHABET.map(letter => {
            return (
              <button 
                key={letter} 
                name={letter}
                disabled={guessedLetters[letter]} 
                className={styles.letter} 
                onClick={handleAlphabetLetterClick}
              >
                {letter}
              </button>
            )
          })
        }
      </div>
    </div>
  )
}