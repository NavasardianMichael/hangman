import { FC } from 'react'
import styles from './styles.module.css'

type TProps = {}

export const Start: FC<TProps> = ({  }) => {
  return (
    <div className={styles.start}>
      <button className={styles.startGameBtn}>ՍԿՍԵԼ</button>
    </div>
  )
}