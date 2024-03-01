import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react'
import styles from './styles.module.css'

type TProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export const CustomButton: FC<TProps> = (props) => {
  return (
    <button className={styles.startGameBtn} {...props}>
      {props.children}
    </button>
  )
}