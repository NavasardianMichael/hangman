'use client'

import { CSSProperties, FC, MouseEventHandler, ReactEventHandler, ReactNode, useEffect, useRef } from 'react'
import { combineClassNames } from 'helpers/utils/styles'
import { CloseIcon } from 'components/shared/icons'

// 'plain': white card; 'square': white with square corners; 'paper': the paper card of the content pages
type TDialogVariant = 'plain' | 'square' | 'paper'

const VARIANT_CLASSES: Record<TDialogVariant, string> = {
  plain: 'rounded-lg bg-white',
  square: 'rounded-none bg-white',
  paper: 'rounded-none bg-paper',
}

type TProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  footer?: ReactNode
  variant?: TDialogVariant
  width?: CSSProperties['width']
  bodyClassName?: string
  children?: ReactNode
}

type TOpenDialogProps = Omit<TProps, 'open'>

// Mounted only while open, so nothing of a closed dialog is in the page
const OpenDialog: FC<TOpenDialogProps> = ({
  onClose,
  title,
  footer,
  variant = 'plain',
  width = 520,
  bodyClassName,
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  // Esc: the parent closes the dialog by unmounting it
  const handleCancel: ReactEventHandler<HTMLDialogElement> = (event) => {
    event.preventDefault()
    onClose()
  }

  // The card fills the dialog box, so a click on the dialog itself landed on the backdrop
  const handleClick: MouseEventHandler<HTMLDialogElement> = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      style={{ width }}
      className={combineClassNames(
        'm-auto max-h-[calc(100dvh_-_32px_-_var(--safe-top)_-_var(--safe-bottom))] max-w-[calc(100vw_-_16px)] overflow-visible border-0 p-0 text-black/88 min-[768px]:max-w-[calc(100vw_-_32px)]',
        'shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]',
        'transition-[opacity,scale] duration-200 backdrop:bg-black/45 starting:scale-90 starting:opacity-0',
        VARIANT_CLASSES[variant]
      )}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <div className='relative box-border p-3'>
        <button
          type='button'
          aria-label='Փակել'
          className='absolute top-[4px] right-[4px] flex size-8 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-[26px] text-black/45 transition-colors hover:bg-black/6 hover:text-black/88'
          onClick={onClose}
        >
          <CloseIcon strokeWidth={1.4} />
        </button>
        {title && (
          <h2 className='mx-0 mt-4 mb-2 text-center text-[1.2rem] leading-[1.5] font-semibold text-black/88'>
            {title}
          </h2>
        )}
        <div className={combineClassNames('text-[1rem] break-words', bodyClassName)}>{children}</div>
        {footer && <div className='mt-3 flex justify-center gap-2'>{footer}</div>}
      </div>
    </dialog>
  )
}

// A centered modal on the native <dialog>: Esc, a click beside it, the close button and the back gesture
// (useBackClose in the caller) all close it
export const Dialog: FC<TProps> = ({ open, ...props }) => (open ? <OpenDialog {...props} /> : null)
