import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'
import { ALPHABET } from 'helpers/constants/app'

export const Composition: StageComponent = ({  }) => {
  return (
    <div className={styles.composition}>
      <div className={styles.alphabet}>
        {
          ALPHABET.map(letter => {
            return (
              <button className={styles.letter} key={letter}>
                {letter}
              </button>
            )
          })
        }
      </div>
    </div>
  )
}