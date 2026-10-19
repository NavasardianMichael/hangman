import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react'
import { combineClassNames } from 'helpers/utils/styles'
import { ArrowIcon } from 'components/shared/icons'
import styles from './styles.module.css'

type TProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export const CustomButton: FC<TProps> = (props) => {
  const { className, children, ...restProps } = props
  return (
    <button className={combineClassNames(styles.startGameBtn, className)} {...restProps}>
      <span className={styles.label}>{children}</span>
      <ArrowIcon className={styles.arrow} />
    </button>
  )
}
