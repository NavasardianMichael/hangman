import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { ALPHABET } from 'helpers/constants/app'
import { MouseEventHandler, useState } from 'react'

export const Composition: StageComponent = ({  }) => {

  const [word, setWord] = useState('')

  const handleAlphabetLetterClick: MouseEventHandler<HTMLButtonElement> = e => {
    setWord(word + e.currentTarget.name)
  }

  return (
    <div className={styles.composition}>
      <div className={styles.word}>
        {
          Array.from(word).map((letter, i) => {
            return (
              <span key={i} className={styles.letter}>{letter}</span>
            )
          })
        }
      </div>
      <div className={styles.alphabet}>
        {
          ALPHABET.map(letter => {
            return (
              <button className={styles.letter} key={letter} name={letter} onClick={handleAlphabetLetterClick}>
                {letter}
              </button>
            )
          })
        }
      </div>
    </div>
  )
}