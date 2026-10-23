import { ButtonHTMLAttributes, FC } from 'react'
import { combineClassNames } from 'helpers/utils/styles'

// 'guessed' / 'wasted': already tried on the guessing screen, in the word or not
export type TLetterKeyState = 'idle' | 'guessed' | 'wasted'

const STATE_CLASSES: Record<TLetterKeyState, string> = {
  idle: 'bg-[rgba(var(--secondary-color-rgb-components),0.72)] shadow-key hover:enabled:bg-[rgba(var(--secondary-color-rgb-components),0.8)] active:enabled:translate-y-[2px] active:enabled:bg-[rgba(var(--secondary-color-rgb-components),0.55)] active:enabled:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.2)] disabled:bg-[rgba(var(--secondary-color-rgb-components),0.4)]',
  guessed: 'bg-[rgba(30,221,30,0.24)] shadow-none',
  // Struck through
  wasted:
    "bg-[rgba(255,0,0,0.096)] shadow-none before:absolute before:top-1/2 before:right-0 before:left-0 before:-rotate-35 before:border-t before:border-primary before:transition-all before:duration-300 before:content-['']",
}

type TProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: TLetterKeyState
}

// A key of the on-screen Armenian keyboard, ten to a row; it takes the font and text color of the keyboard
export const LetterKey: FC<TProps> = ({ state = 'idle', type = 'button', className, ...props }) => (
  <button
    type={type}
    className={combineClassNames(
      'relative m-0 box-border basis-[calc(100%/10_-_9*0.2rem/10)] cursor-pointer rounded-card border-0 p-0 text-center [font-size:inherit] leading-(--keyboard-key-height) [font-weight:inherit] text-inherit select-none disabled:cursor-default',
      'transition-[translate,box-shadow,background-color] duration-[120ms] ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-secondary',
      STATE_CLASSES[state],
      className
    )}
    {...props}
  />
)
