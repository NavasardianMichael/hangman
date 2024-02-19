import { FC } from 'react'
import styles from './styles.module.css'

type TProps = {
  
}

export const Loader: FC<TProps> = ({  }) => {
  return (
    <div className={styles.loader}>
        Loader
    </div>
  )
}