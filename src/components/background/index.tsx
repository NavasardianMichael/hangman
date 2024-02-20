import { FC } from 'react'
import BgPaperImage from 'assets/images/bg-paper.svg'
import styles from './styles.module.css'

type TProps = {
  
}

export const Background: FC<TProps> = ({  }) => {
  return (
    <div className={styles.background}>
      <img src={BgPaperImage} />
    </div>
  )
}