import { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import { combineClassNames } from 'helpers/utils/styles'

type TButtonVariant = 'primary' | 'default' | 'danger'

const VARIANT_CLASSES: Record<TButtonVariant, string> = {
  primary: 'border-transparent bg-secondary text-white hover:enabled:bg-[#707070]',
  default: 'border-[#d9d9d9] bg-white text-black/88 hover:enabled:border-[#4096ff] hover:enabled:text-[#4096ff]',
  danger: 'border-transparent bg-[#ff4d4f] text-white hover:enabled:bg-[#ff7875]',
}

type TProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: TButtonVariant
  // Square corners, like the paper cards
  square?: boolean
  icon?: ReactNode
}

// Compact button for dialogs and secondary actions
export const Button: FC<TProps> = ({
  variant = 'primary',
  square,
  icon,
  type = 'button',
  className,
  children,
  ...props
}) => (
  <button
    type={type}
    className={combineClassNames(
      'box-border inline-flex h-[32px] cursor-pointer items-center justify-center gap-2 border border-solid px-[15px] text-[14px] whitespace-nowrap transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
      square ? 'rounded-none' : 'rounded-md',
      VARIANT_CLASSES[variant],
      className
    )}
    {...props}
  >
    {icon}
    {children}
  </button>
)
