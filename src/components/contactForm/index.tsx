'use client'

import { FC, FormEvent, useState } from 'react'
import { CONTACT_LIMITS } from 'helpers/constants/contact'
import { API_PATHS } from 'helpers/constants/premium'
import { Button } from 'components/shared/button'

const FIELD_CLASSES =
  'box-border w-full rounded-none border border-solid border-[rgba(35,35,35,0.45)] bg-white px-3 py-2 font-[inherit] text-[0.95rem] tracking-[0.5px] text-[#2b2b2b] focus:border-[#2b2b2b] focus:outline-2 focus:outline-offset-1 focus:outline-[#2b2b2b]'

const LABEL_CLASSES = 'mb-1 block text-[0.85rem]'

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
      <div className='mt-5 text-[0.95rem]'>
        <p className='mt-0 mb-1 font-semibold'>Հաղորդագրությունն ուղարկված է</p>
        <p className='mt-0 mb-3'>Շնորհակալություն։ Մենք կպատասխանենք Ձեր էլ. փոստին հնարավորինս շուտ։</p>
        <Button square onClick={() => setState('idle')}>
          Գրել ևս մեկ հաղորդագրություն
        </Button>
      </div>
    )
  }

  const isSending = state === 'sending'

  return (
    <form className='relative mt-5 flex flex-col gap-4' onSubmit={handleSubmit}>
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
          maxLength={CONTACT_LIMITS.email}
          disabled={isSending}
          className={FIELD_CLASSES}
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
          rows={6}
          placeholder='Ինչո՞վ կարող ենք օգնել'
          maxLength={CONTACT_LIMITS.message}
          disabled={isSending}
          className={`${FIELD_CLASSES} resize-none`}
        />
      </div>
      <div className='absolute left-[-10000px] h-px w-px overflow-hidden' aria-hidden='true'>
        <label htmlFor='contact-website'>Website</label>
        <input id='contact-website' name='website' tabIndex={-1} autoComplete='off' />
      </div>
      {error && (
        <p role='alert' className='m-0 text-[0.85rem] text-[#b42318]'>
          {error}
        </p>
      )}
      <Button type='submit' square disabled={isSending} className='h-10 w-full text-[0.95rem]'>
        {isSending ? 'Ուղարկվում է…' : 'Ուղարկել'}
      </Button>
    </form>
  )
}
