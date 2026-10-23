import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react'
import { combineClassNames } from 'helpers/utils/styles'
import { ArrowIcon } from 'components/shared/icons'

type TProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

// The bottom bar button that moves the game ahead
export const CustomButton: FC<TProps> = (props) => {
  const { className, children, ...restProps } = props
  return (
    <button
      className={combineClassNames(
        'fixed bottom-[0.55rem] left-1/2 z-1 box-border flex h-[calc(var(--bottom-bar-height)_-_1.1rem)] w-[min(calc(100%_-_1.6rem),calc(var(--column-width)_-_1.6rem))] -translate-x-1/2 cursor-pointer items-center justify-center gap-[0.55rem] rounded-card border-0 px-4',
        'bg-[linear-gradient(100deg,#575757,#575757b9)] text-[1.05rem] font-bold text-paper outline-0 [text-shadow:none]',
        'shadow-[0_3px_0_rgba(0,0,0,0.28),0_8px_16px_rgba(0,0,0,0.22)] transition-[translate,filter,box-shadow] duration-[120ms] ease-[ease]',
        'hover:enabled:brightness-112 active:enabled:translate-y-[2px] active:enabled:shadow-[0_1px_0_rgba(0,0,0,0.28),0_3px_8px_rgba(0,0,0,0.2)]',
        'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-paper disabled:cursor-default disabled:opacity-55',
        className
      )}
      {...restProps}
    >
      <span className='leading-none [&_span]:leading-none'>{children}</span>
      <ArrowIcon className='size-[1.15em] flex-none' />
    </button>
  )
}
