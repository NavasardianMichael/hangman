'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// Last-resort screen for a crash anywhere in the app. It replaces the root layout, so global styles don't apply here.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang='hy'>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 16,
          boxSizing: 'border-box',
          backgroundColor: '#8c8c8c',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          textAlign: 'center',
        }}
      >
        <title>Կախաղան | Hangman</title>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Ինչ-որ բան այն չէ</h1>
        <p style={{ margin: 0 }}>Տեղի ունեցավ անսպասելի սխալ։ Փորձեք վերաբեռնել էջը։</p>
        <button
          type='button'
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 24px',
            fontSize: '1rem',
            border: 'none',
            borderRadius: 4,
            backgroundColor: '#575757',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Վերաբեռնել
        </button>
      </body>
    </html>
  )
}
