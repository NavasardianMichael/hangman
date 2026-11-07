import { serverConfig } from 'server/config'
import { createRateLimiter, getClientIp, jsonError, readJsonBody } from 'server/http'
import { isMailConfigured, sendInternalMail } from 'server/mail'
import { CONTACT_LIMITS } from 'helpers/constants/contact'

/*
 * The contact form (as in cv-builder's server/src/routes/contact.ts). A message goes to the admin inbox through the
 * mail engine's internal endpoint, so a visitor can reach us but can never aim mail anywhere else.
 */

// Tight: the mail engine's budget is shared with the payment alerts
const isAllowed = createRateLimiter(5, 60 * 60 * 1000)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const asText = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  return text.length <= maxLength ? text : ''
}

export async function POST(request: Request) {
  if (!isAllowed(getClientIp(request))) return jsonError(429, 'Too many messages')

  const body = await readJsonBody(request)
  // Honeypot: the form hides `website` from people, so only a bot fills it. It is told the message went.
  if (asText(body?.website, 1000)) return Response.json({ ok: true })

  const fullName = asText(body?.fullName, CONTACT_LIMITS.fullName)
  const email = asText(body?.email, CONTACT_LIMITS.email)
  const message = asText(body?.message, CONTACT_LIMITS.message)
  if (!fullName || !EMAIL.test(email) || !message)
    return jsonError(400, 'Name, a valid email and a message are required')

  // Unconfigured is normal in dev (the message prints here) and an outage in production
  if (!isMailConfigured()) {
    if (serverConfig.isProduction) return jsonError(503, 'Mail engine is not configured')
    console.log(`[contact] ${fullName} <${email}>\n${message}`)
    return Response.json({ ok: true })
  }

  const result = await sendInternalMail({
    subject: 'Hangman / Contact',
    body: message,
    senderEmail: email,
    firstName: fullName,
  })
  if (!result.ok) return jsonError(502, 'Message could not be sent')
  return Response.json({ ok: true })
}
