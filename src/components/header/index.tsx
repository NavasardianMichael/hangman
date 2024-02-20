import { FC } from 'react'
import Gallows from 'assets/images/gallows.png'
import styles from './styles.module.css'
import { Button, Input } from 'antd'

type TProps = {
  
}

export const Header: FC<TProps> = ({  }) => {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        Hangman
        <img src={Gallows} />
      </div>
      <Button style={{background: '#393a59'}} type="primary">ՍԿՍԵԼ ԽԱՂԸ</Button>
    </div>
  )
}