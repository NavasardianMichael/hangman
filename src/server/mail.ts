import { serverConfig } from './config'

/*
 * The client for the mail engine (the same engine and protocol as cv-builder's server/src/lib/mail.ts), and the only
 * reader of MAIL_API_KEY. Only the internal endpoint is used: it always reaches the admin inbox, so a visitor can
 * never aim mail anywhere else. The key is never logged or returned.
 */

// The engine rejects a body without it
const APP_ID = 'Hangman'

const MAIL_TIMEOUT_MS = 10_000

export type TInternalMail = {
  subject: string
  body: string
  senderEmail?: string
  firstName?: string
  // Free-form context rendered alongside the message. Small and non-sensitive.
  details?: Record<string, unknown>
}

export type TMailResult = { ok: true } | { ok: false; status: number; message: string }

export const isMailConfigured = () => Boolean(serverConfig.mail.apiUrl && serverConfig.mail.apiKey)

export const sendInternalMail = async (payload: TInternalMail): Promise<TMailResult> => {
  if (!isMailConfigured()) return { ok: false, status: 0, message: 'Mail engine is not configured' }

  let response: Response
  try {
    response = await fetch(`${serverConfig.mail.apiUrl}/mail/internal/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'x-api-key': serverConfig.mail.apiKey },
      body: JSON.stringify({ appId: APP_ID, ...payload }),
      signal: AbortSignal.timeout(MAIL_TIMEOUT_MS),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mail request failed'
    console.error(`[mail] internal send did not complete: ${message}`)
    return { ok: false, status: 0, message }
  }

  const parsed = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null
  if (!response.ok || parsed?.success === false) {
    const message = parsed?.message ?? `Mail engine responded ${response.status}`
    console.error(`[mail] internal send failed: ${response.status} ${message}`)
    return { ok: false, status: response.status, message }
  }
  return { ok: true }
}
