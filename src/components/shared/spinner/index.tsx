import { FC } from 'react'
import { combineClassNames } from 'helpers/utils/styles'

type TProps = {
  size?: 'small' | 'default'
  className?: string
}

// A spinning ring in the current text color
export const Spinner: FC<TProps> = ({ size = 'default', className }) => (
  <span
    aria-hidden='true'
    className={combineClassNames(
      'box-border inline-block flex-none animate-spin rounded-full border-2 border-solid border-current border-t-transparent',
      size === 'small' ? 'size-[14px]' : 'size-5',
      className
    )}
  />
)
