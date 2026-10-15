import { ButtonHTMLAttributes, FC } from 'react'
import { combineClassNames } from 'helpers/utils/styles'
import styles from './styles.module.css'

type TProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  // Accessible name: these buttons show only an icon
  'aria-label': string
}

// Round "paper and ink" button used in the game header
export const IconButton: FC<TProps> = ({ className, children, type = 'button', ...props }) => (
  <button type={type} className={combineClassNames(styles.iconButton, className)} {...props}>
    {children}
  </button>
)
