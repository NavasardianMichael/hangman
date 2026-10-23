import { ButtonHTMLAttributes, FC } from 'react'
import { combineClassNames } from 'helpers/utils/styles'

type TProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  // Accessible name: these buttons show only an icon
  'aria-label': string
}

// Round "paper and ink" button used in the game header
export const IconButton: FC<TProps> = ({ className, children, type = 'button', ...props }) => (
  <button
    type={type}
    className={combineClassNames(
      'm-0 box-border inline-flex size-[2.4rem] cursor-pointer items-center justify-center rounded-full border-[1.5px] border-solid border-[#2b2b2b] bg-[rgba(246,243,236,0.92)] p-0 text-[1.45rem] text-[#2b2b2b]',
      'shadow-[0_2px_6px_rgba(0,0,0,0.18),inset_0_0_0_2px_rgba(255,255,255,0.6)] transition-[rotate,scale,background-color,box-shadow] duration-200 ease-[ease]',
      'hover:enabled:-rotate-6 hover:enabled:bg-white hover:enabled:shadow-[0_3px_10px_rgba(0,0,0,0.22),inset_0_0_0_2px_rgba(255,255,255,0.6)]',
      'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2b2b2b] active:enabled:scale-92 disabled:cursor-default disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </button>
)
