import { StageComponent } from 'helpers/types/stage'
import styles from './styles.module.css'

export const Start: StageComponent = ({ toNextPage }) => {

  const handleClick = () => {
    toNextPage()
  }

  return (
    <div className={styles.start}>
      <button className={styles.startGameBtn} onClick={handleClick}>ՍԿՍԵԼ</button>
    </div>
  )
}