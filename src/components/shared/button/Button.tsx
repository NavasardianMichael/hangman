import { FC } from 'react'
import styles from './styles.module.css'

type TProps = {
  
}

export const Button: FC<TProps> = ({  }) => {
  return (
    <button className={styles.button}>
        Button
    </button>
  )
}