'use client'

import { FC, FormEvent, useState } from 'react'
import { CONTACT_LIMITS } from 'helpers/constants/contact'
import { API_PATHS } from 'helpers/constants/premium'
import { combineClassNames } from 'helpers/utils/styles'
import { ArrowIcon, ErrorIcon, SuccessIcon } from 'components/shared/icons'
import { Spinner } from 'components/shared/spinner'

// A soft field set into the paper: a faint inset, a darker outline on hover, the game's grey ring on focus
const FIELD_CLASSES =
  'box-border block w-full appearance-none rounded-md border border-solid border-[rgba(35,35,35,0.2)] bg-transparent px-3 py-1.5 font-[inherit] text-[0.8rem] leading-normal tracking-[1px] text-ink shadow-[inset_0_1px_2px_rgba(35,35,35,0.07)] outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[#9b968c] placeholder:opacity-100 hover:enabled:border-[rgba(35,35,35,0.38)] focus:border-secondary focus:shadow-[inset_0_1px_2px_rgba(35,35,35,0.07),0_0_0_3px_rgba(87,87,87,0.16)] disabled:cursor-not-allowed disabled:opacity-60'

// Latin text (an email) reads better a little smaller and without the wide letter spacing of the Armenian fields
const LATIN_FIELD_CLASSES = combineClassNames(FIELD_CLASSES, 'text-[0.75rem] tracking-normal')

const LABEL_CLASSES = 'mb-1 block text-[0.75rem] leading-[1.4] tracking-[1px] text-secondary'

// The same raised grey button as the game's bottom bar, in the flow of the form
const SUBMIT_CLASSES =
  'box-border flex h-[2.2rem] w-full cursor-pointer items-center justify-center gap-2.5 rounded-card border-0 bg-[linear-gradient(100deg,#575757,#575757c4)] px-4 font-[inherit] text-[0.9rem] font-bold text-paper shadow-[0_3px_0_rgba(0,0,0,0.26),0_8px_16px_rgba(0,0,0,0.16)] transition-[translate,filter,box-shadow] duration-[120ms] hover:enabled:brightness-112 active:enabled:translate-y-[2px] active:enabled:shadow-[0_1px_0_rgba(0,0,0,0.26),0_3px_8px_rgba(0,0,0,0.16)] disabled:cursor-default disabled:opacity-70'

type TState = 'idle' | 'sending' | 'sent'

// The contact form (as in cv-builder): POST /api/contact sends it to the admin inbox. `website` is a honeypot: moved
// off-screen and out of the tab order, so only a bot fills it, and the server then drops the message.
export const ContactForm: FC = () => {
  const [state, setState] = useState<TState>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    setError('')
    setState('sending')
    let status = 0
    try {
      const response = await fetch(API_PATHS.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      status = response.status
      if (response.ok) {
        form.reset()
        setState('sent')
        return
      }
    } catch {
      // Network failure: status stays 0
    }
    setError(
      status === 429
        ? 'Չափազանց շատ հաղորդագրություններ։ Փորձեք մի փոքր ուշ։'
        : !status && !navigator.onLine
          ? 'Ուղարկելու համար միացեք համացանցին։'
          : 'Չհաջողվեց ուղարկել հաղորդագրությունը։ Փորձեք կրկին կամ գրեք մեր էլ. փոստին։'
    )
    setState('idle')
  }

  if (state === 'sent') {
    return (
      <div
        role='status'
        className='mt-6 flex flex-col items-center rounded-md border border-solid border-[rgba(35,35,35,0.14)] bg-white/45 px-5 py-7 text-center'
      >
        <SuccessIcon className='size-10 text-[#3f7d4e]' />
        <p className='mt-3 mb-1 text-[1rem] font-semibold'>Հաղորդագրությունն ուղարկված է</p>
        <p className='mt-0 mb-5 text-[0.85rem] text-[#4a4a4a]'>
          Շնորհակալություն։ Մենք կպատասխանենք Ձեր էլ. փոստին հնարավորինս շուտ։
        </p>
        <button
          type='button'
          onClick={() => setState('idle')}
          className='cursor-pointer rounded-md border border-solid border-secondary bg-transparent px-4 py-1.5 font-[inherit] text-[0.85rem] tracking-[1px] text-secondary transition-colors hover:bg-secondary hover:text-paper'
        >
          Գրել ևս մեկ հաղորդագրություն
        </button>
      </div>
    )
  }

  const isSending = state === 'sending'

  return (
    <form className='relative mt-5 flex flex-col gap-3' onSubmit={handleSubmit}>
      <div>
        <label htmlFor='contact-name' className={LABEL_CLASSES}>
          Անուն Ազգանուն
        </label>
        <input
          id='contact-name'
          name='fullName'
          required
          autoComplete='name'
          maxLength={CONTACT_LIMITS.fullName}
          disabled={isSending}
          className={FIELD_CLASSES}
        />
      </div>
      <div>
        <label htmlFor='contact-email' className={LABEL_CLASSES}>
          Էլ. փոստ
        </label>
        <input
          id='contact-email'
          name='email'
          type='email'
          required
          autoComplete='email'
          inputMode='email'
          placeholder='name@example.com'
          maxLength={CONTACT_LIMITS.email}
          disabled={isSending}
          className={LATIN_FIELD_CLASSES}
        />
      </div>
      <div>
        <label htmlFor='contact-message' className={LABEL_CLASSES}>
          Հաղորդագրություն
        </label>
        <textarea
          id='contact-message'
          name='message'
          required
          rows={4}
          placeholder='Ինչո՞վ կարող ենք օգնել'
          style={{ resize: 'none' }}
          maxLength={CONTACT_LIMITS.message}
          disabled={isSending}
          className={combineClassNames(FIELD_CLASSES, 'min-h-24 resize-y')}
        />
      </div>
      <div className='absolute left-[-10000px] h-px w-px overflow-hidden' aria-hidden='true'>
        <label htmlFor='contact-website'>Website</label>
        <input id='contact-website' name='website' tabIndex={-1} autoComplete='off' />
      </div>
      {error && (
        <p
          role='alert'
          className='m-0 flex items-start gap-2 rounded-md border border-solid border-[rgba(180,35,24,0.25)] bg-[rgba(180,35,24,0.06)] px-3 py-2.5 text-[0.8rem] leading-normal text-[#9a2a1f]'
        >
          <ErrorIcon className='mt-[0.15em] size-[1.1em] flex-none' />
          {error}
        </p>
      )}
      <button type='submit' disabled={isSending} className={combineClassNames(SUBMIT_CLASSES, 'mt-1')}>
        <span className='leading-none'>{isSending ? 'Ուղարկվում է…' : 'Ուղարկել'}</span>
        {isSending ? <Spinner size='small' /> : <ArrowIcon className='size-[1.1em] flex-none' />}
      </button>
    </form>
  )
}
