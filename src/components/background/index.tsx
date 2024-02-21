import { FC } from 'react'
import BgPaperImage from 'assets/images/gallow_scribble_by_infidel_absence_d4gvvvg-fullview1.jpg'
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