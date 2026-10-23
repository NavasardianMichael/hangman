'use client'

import { FC } from 'react'
import { useUiStore } from 'store/ui'
import { ErrorIcon, SuccessIcon } from 'components/shared/icons'

// Shows the notices raised with helpers/utils/toast, stacked at the top center
export const Toaster: FC = () => {
  const toasts = useUiStore((state) => state.toasts)

  return (
    <div
      role='status'
      aria-live='polite'
      className='pointer-events-none fixed inset-x-0 top-2 z-50 flex flex-col items-center gap-2 px-4'
    >
      {toasts.map(({ id, type, text }) => (
        <div
          key={id}
          className='pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-lg bg-white px-3 py-[9px] text-[14px] leading-[1.5] text-black/88 shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)] transition-[opacity,translate] duration-300 starting:-translate-y-2 starting:opacity-0'
        >
          {type === 'success' ? (
            <SuccessIcon className='flex-none text-[16px] text-[#52c41a]' />
          ) : (
            <ErrorIcon className='flex-none text-[16px] text-[#ff4d4f]' />
          )}
          <span className='leading-[1.5]'>{text}</span>
        </div>
      ))}
    </div>
  )
}
