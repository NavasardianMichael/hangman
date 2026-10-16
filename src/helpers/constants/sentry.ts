// Sentry error tracking. Everything stays off while NEXT_PUBLIC_SENTRY_DSN is unset (see docs/SENTRY.md).
// NEXT_PUBLIC_ values are inlined at build time, for both the browser and the server bundle.
const SENTRY_DSN_PATTERN = /^https:\/\/[a-f0-9]+@[a-z0-9.]+\.sentry\.io\/\d+$/i

const readDsn = () => {
  const raw = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
  if (!raw) return ''
  if (SENTRY_DSN_PATTERN.test(raw)) return raw
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[sentry] NEXT_PUBLIC_SENTRY_DSN does not look like a Sentry DSN.')
  }
  return ''
}

export const SENTRY_DSN = readDsn()

export const SENTRY_ENABLED = SENTRY_DSN.length > 0

export const SENTRY_ENVIRONMENT = process.env.NODE_ENV

// Share of page loads and requests traced for performance; lower it if the Sentry quota runs out
export const SENTRY_TRACES_SAMPLE_RATE = process.env.NODE_ENV === 'production' ? 0.2 : 1.0
