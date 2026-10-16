import { GenerateContentConfig, GoogleGenAI, ThinkingLevel, Type } from '@google/genai'
import * as Sentry from '@sentry/nextjs'
import { CATEGORIES, DIFFICULTY_LEVELS, GET_WORD_ERROR_MESSAGE, MAX_PASSED_WORDS } from 'helpers/constants/app'
import { sanitizeWord } from 'helpers/utils/words'
import { GetWordAPI } from './types'

const IS_DEV = process.env.NODE_ENV !== 'production'

// Tried in order. Free-tier quotas are per model (e.g. 5 requests/min for gemini-3.8-flash), so falling back to the
// next model on a quota or "high demand" error also multiplies the free capacity. Flash-Lite is first: it answers this
// simple task well in about a second. Not every model accepts every thinking level (3.8-flash rejects MINIMAL).
const MODELS = [
  { name: 'gemini-3.5-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
  { name: 'gemini-3.6-flash', thinkingLevel: ThinkingLevel.LOW },
  { name: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
] as const

const MAX_ATTEMPTS = 3
const MIN_LETTERS = 1
const MAX_LETTERS = 20
const MAX_HINT_LENGTH = 200

const RATE_LIMIT = 20
const RATE_LIMIT_WINDOW_MS = 60_000

const CATEGORY_VALUES: readonly string[] = Object.values(CATEGORIES)
const DIFFICULTY_VALUES: readonly string[] = Object.values(DIFFICULTY_LEVELS)

const SYSTEM_INSTRUCTION = [
  'Դու բառեր ես առաջարկում հայերեն «Կախաղան» խաղի համար։',
  'word՝ միայն բառը, մեկ բառ, եթե թեման չի ենթադրում երկու բառ, օրինակ՝ անուն ազգանուն, առանց կետադրության և բացատրությունների։',
  'hint՝ կարճ հուշում (առավելագույնը 12 բառ), որը չի պարունակում բառը կամ նրա արմատը։',
].join(' ')

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    hint: { type: Type.STRING },
  },
  required: ['word', 'hint'],
  propertyOrdering: ['word', 'hint'],
}

const GENERATION_CONFIG: GenerateContentConfig = {
  systemInstruction: SYSTEM_INSTRUCTION,
  responseMimeType: 'application/json',
  responseSchema: RESPONSE_SCHEMA,
  // Thinking tokens count toward this limit; too low a cap cuts the JSON answer off
  maxOutputTokens: 1024,
}

// Quota exhausted / overloaded / internal: the next model may still answer
const FALLBACK_STATUSES = [429, 500, 503]
const OVERLOAD_COOLDOWN_MS = 15_000
const DEFAULT_QUOTA_COOLDOWN_MS = 60_000

// Models to skip until a time, so requests don't wait on a model that will refuse them
const modelCooldowns = new Map<string, number>()

const getStatus = (error: unknown) => (error as { status?: number } | null)?.status ?? 0

// A quota error says how long to wait ("retryDelay":"55s")
const getCooldownMs = (error: unknown) => {
  if (getStatus(error) !== 429) return OVERLOAD_COOLDOWN_MS
  const retryDelay = String((error as Error)?.message ?? '').match(/"retryDelay":\s*"(\d+(?:\.\d+)?)s"/)
  return retryDelay ? Number(retryDelay[1]) * 1000 : DEFAULT_QUOTA_COOLDOWN_MS
}

class AllModelsFailedError extends Error {
  constructor(readonly failures: { model: string; status: number; message: string }[]) {
    super(failures.map(({ model, status }) => `${model}: ${status}`).join(', '))
  }
}

const generateAnswerText = async (contents: string) => {
  const failures: AllModelsFailedError['failures'] = []
  const now = Date.now()
  const available = MODELS.filter(({ name }) => (modelCooldowns.get(name) ?? 0) <= now)

  // When every model is cooling down, try them anyway rather than fail without asking
  for (const { name, thinkingLevel } of available.length ? available : MODELS) {
    try {
      const response = await getAI().models.generateContent({
        model: name,
        contents,
        config: { ...GENERATION_CONFIG, thinkingConfig: { thinkingLevel } },
      })
      return { text: response.text ?? '', model: name }
    } catch (error) {
      if (!FALLBACK_STATUSES.includes(getStatus(error))) throw error
      modelCooldowns.set(name, Date.now() + getCooldownMs(error))
      failures.push({ model: name, status: getStatus(error), message: (error as Error)?.message ?? String(error) })
    }
  }
  throw new AllModelsFailedError(failures)
}

const clip = (text: unknown, maxLength: number) =>
  typeof text === 'string' ? text.trim().replace(/\s+/g, ' ').slice(0, maxLength) : ''

// Parses the model's JSON answer into a playable word with an optional hint
const parseAnswer = (text: string, minLettersCount: number): GetWordAPI['response'] | null => {
  let answer: Record<string, unknown>
  try {
    answer = JSON.parse(text)
  } catch {
    return null
  }

  const word = sanitizeWord(typeof answer.word === 'string' ? answer.word : '', minLettersCount)
  if (!word) return null

  const hint = clip(answer.hint, MAX_HINT_LENGTH)
  return {
    word,
    // A hint that gives the word away is dropped rather than shown
    hint: hint.toUpperCase().includes(word) ? '' : hint,
  }
}

let ai: GoogleGenAI | null = null
// Created lazily so the build doesn't need GEMINI_KEY
const getAI = () => (ai ??= new GoogleGenAI({ apiKey: process.env.GEMINI_KEY }))

// One server process (systemd unit hangman), so an in-memory sliding window is enough
const requestLog = new Map<string, number[]>()

const isRateLimited = (ip: string) => {
  const now = Date.now()
  const recent = (requestLog.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  requestLog.set(ip, recent)

  if (requestLog.size > 1000) {
    for (const [key, times] of requestLog) {
      if (now - times[times.length - 1] >= RATE_LIMIT_WINDOW_MS) requestLog.delete(key)
    }
  }

  return recent.length > RATE_LIMIT
}

const getClientIp = (request: Request) =>
  request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

// Development responses carry the real cause for debugging; production only gets a friendly message
const errorResponse = (status: number, devError: string, devDetails?: unknown) =>
  Response.json(IS_DEV ? { error: devError, details: devDetails } : { error: GET_WORD_ERROR_MESSAGE }, { status })

const describeError = (error: unknown) =>
  error instanceof Error
    ? { name: error.name, message: error.message, status: (error as { status?: number }).status, stack: error.stack }
    : { message: String(error) }

const validatePayload = (body: unknown): { payload: GetWordAPI['payload'] } | { reason: string } => {
  if (typeof body !== 'object' || body === null) return { reason: 'body must be a JSON object' }
  const { minLettersCount, category, difficulty, passedWords } = body as Record<string, unknown>

  if (typeof minLettersCount !== 'number' || !Number.isInteger(minLettersCount)) {
    return { reason: `minLettersCount must be an integer, got ${JSON.stringify(minLettersCount)}` }
  }
  if (minLettersCount < MIN_LETTERS || minLettersCount > MAX_LETTERS) {
    return { reason: `minLettersCount must be ${MIN_LETTERS}–${MAX_LETTERS}, got ${minLettersCount}` }
  }
  if (typeof category !== 'string' || !CATEGORY_VALUES.includes(category)) {
    return { reason: `unknown category ${JSON.stringify(category)}` }
  }
  if (typeof difficulty !== 'string' || !DIFFICULTY_VALUES.includes(difficulty)) {
    return { reason: `unknown difficulty ${JSON.stringify(difficulty)}` }
  }

  const validPassedWords = Array.isArray(passedWords)
    ? passedWords.filter((word): word is string => typeof word === 'string' && word.length <= 50).slice(-MAX_PASSED_WORDS)
    : []

  return {
    payload: {
      minLettersCount,
      category: category as GetWordAPI['payload']['category'],
      difficulty: difficulty as GetWordAPI['payload']['difficulty'],
      passedWords: validPassedWords,
    },
  }
}

const buildPrompt = (
  { minLettersCount, category, difficulty, passedWords }: GetWordAPI['payload'],
  rejectedWords: string[]
) => {
  const passedWordsText = passedWords.length
    ? ` Չկրկնել նախկինում օգտագործված բառերը, որոնք են՝ ${passedWords.join(', ')}։`
    : ''
  // Retries name what was rejected, otherwise the model tends to answer the same word again
  const rejectedWordsText = rejectedWords.length
    ? ` Հետևյալ բառերը չեն համապատասխանում պահանջներին, ընտրիր այլ բառ՝ ${rejectedWords.join(', ')}։`
    : ''

  return `Ստեղծել հայերեն բառ, որը համապատասխանում է հետևյալ չափանիշներին: Բառը պետք է լինի առնվազն ${minLettersCount} տառից բաղկացած, պատկանի "${category}" կատեգորիային  և ունենա "${difficulty}" բարդության մակարդակ հետևյալներից՝ "${DIFFICULTY_VALUES}":${passedWordsText}${rejectedWordsText}`
}

// The word the model proposed, even when it isn't playable
const getProposedWord = (text: string) => {
  try {
    const { word } = JSON.parse(text) as { word?: unknown }
    return typeof word === 'string' ? word.trim() : ''
  } catch {
    return ''
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  if (isRateLimited(ip)) {
    return errorResponse(429, `Too many requests: more than ${RATE_LIMIT} in ${RATE_LIMIT_WINDOW_MS / 1000}s from ${ip}`)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (error) {
    return errorResponse(400, 'Invalid request: body is not valid JSON', describeError(error))
  }
  const validation = validatePayload(body)
  if ('reason' in validation) return errorResponse(400, `Invalid request: ${validation.reason}`, { body })
  const { payload } = validation

  try {
    let repeatedAnswer: GetWordAPI['response'] | null = null
    const rejectedAnswers: string[] = []
    const rejectedWords: string[] = []

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const { text, model } = await generateAnswerText(buildPrompt(payload, rejectedWords))
      const answer = parseAnswer(text, payload.minLettersCount)
      if (answer && !payload.passedWords.includes(answer.word)) {
        // Development responses also say which model answered
        return Response.json(IS_DEV ? { ...answer, model } : answer)
      }
      if (answer) repeatedAnswer ??= answer
      else rejectedAnswers.push(text)
      const proposedWord = getProposedWord(text)
      if (proposedWord && !rejectedWords.includes(proposedWord)) rejectedWords.push(proposedWord)
    }

    if (repeatedAnswer) return Response.json(repeatedAnswer)
    console.warn('No playable word from the model:', rejectedAnswers)
    return errorResponse(502, `Models returned no playable word in ${MAX_ATTEMPTS} attempts`, { rejectedAnswers })
  } catch (error) {
    console.error('Error generating word:', error)
    // Handled here, so Next.js's onRequestError never sees it
    Sentry.captureException(error, {
      extra: error instanceof AllModelsFailedError ? { failures: error.failures } : undefined,
    })
    if (error instanceof AllModelsFailedError) {
      return errorResponse(502, `All Gemini models failed (${error.message})`, { failures: error.failures })
    }
    return errorResponse(502, `Gemini request failed: ${error instanceof Error ? error.message : String(error)}`, {
      ...describeError(error),
    })
  }
}
