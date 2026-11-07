// Small helpers shared by the API route handlers

// nginx sets X-Real-IP (deployment/hangman.eapps.site.conf)
export const getClientIp = (request: Request) =>
  request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

export type TRequestInfo = { ip: string; userAgent: string }

export const readRequestInfo = (request: Request): TRequestInfo => ({
  ip: getClientIp(request),
  userAgent: (request.headers.get('user-agent') ?? '').slice(0, 300),
})

// A per-key sliding window, in memory: one server process, so that is the whole limit
export const createRateLimiter = (limit: number, windowMs: number) => {
  const log = new Map<string, number[]>()
  return (key: string): boolean => {
    const now = Date.now()
    const recent = (log.get(key) ?? []).filter((time) => now - time < windowMs)
    recent.push(now)
    log.set(key, recent)
    if (log.size > 1000) {
      for (const [entry, times] of log) if (now - times[times.length - 1] >= windowMs) log.delete(entry)
    }
    return recent.length <= limit
  }
}

export const readJsonBody = async (request: Request): Promise<Record<string, unknown> | null> => {
  try {
    const body = await request.json()
    return typeof body === 'object' && body !== null && !Array.isArray(body) ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export const jsonError = (status: number, error: string, extra: Record<string, unknown> = {}) =>
  Response.json({ error, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } })
