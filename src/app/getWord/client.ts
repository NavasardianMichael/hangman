import { MAX_PASSED_WORDS, STORE_VARS } from 'helpers/constants/app'
import { ALL_OFFLINE_WORDS, OFFLINE_WORDS } from 'helpers/constants/offlineWords'
import { trackEvent } from 'helpers/utils/analytics'
import { getPassedWordsFromLocalStorage, sanitizeWord, splitWordToLetters } from 'helpers/utils/words'
import { GetWordAPI, TWordResult } from './types'

type TWordSettings = Omit<GetWordAPI['payload'], 'passedWords'>

const rememberPassedWord = (word: string) => {
  const passedWords = getPassedWordsFromLocalStorage()
  if (passedWords.includes(word)) return
  passedWords.push(word)
  try {
    localStorage.setItem(STORE_VARS.PASSED_WORDS, JSON.stringify(passedWords.slice(-MAX_PASSED_WORDS)))
  } catch {
    // Remembering used words is best effort
  }
}

const countLetters = (word: string) => splitWordToLetters(word).filter((letter) => letter !== ' ').length

// Picks a built-in word for the category, preferring ones not used recently
const pickOfflineWord = ({ category, minLettersCount }: TWordSettings): TWordResult | null => {
  const passedWords = getPassedWordsFromLocalStorage()
  const candidates = (OFFLINE_WORDS[category] ?? ALL_OFFLINE_WORDS)
    .map((word) => sanitizeWord(word, minLettersCount))
    .filter((word): word is string => !!word && countLetters(word) >= minLettersCount)
  if (!candidates.length) return null

  const fresh = candidates.filter((word) => !passedWords.includes(word))
  const pool = fresh.length ? fresh : candidates
  const word = pool[Math.floor(Math.random() * pool.length)]
  return { word, hint: '', source: 'offline' }
}

const requestWord = async (settings: TWordSettings): Promise<TWordResult> => {
  const passedWords = getPassedWordsFromLocalStorage().slice(-MAX_PASSED_WORDS)

  let response: Response | null = null
  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      response = await fetch('/getWord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, passedWords }),
      })
    } catch {
      response = null
    }
  }

  if (response?.ok) {
    const answer: GetWordAPI['response'] = await response.json()
    return { ...answer, source: 'ai' }
  }

  // Any failure quietly falls back to the built-in words; development logs the API's real error
  const status = response?.status ?? 'offline'
  if (process.env.NODE_ENV !== 'production') {
    const errorBody = response ? await response.json().catch(() => null) : null
    console.error(`[getWord] ${status}`, errorBody ?? 'network error or offline')
  }
  trackEvent('ai_word_failed', { status })

  const offlineWord = pickOfflineWord(settings)
  if (!offlineWord) throw new Error('No offline word available')
  trackEvent('offline_word_used', { category: settings.category })
  return offlineWord
}

const getSettingsKey = ({ minLettersCount, category, difficulty }: TWordSettings) =>
  `${minLettersCount}|${category}|${difficulty}`

// The next word is requested while the current round is played
let prefetched: { key: string; result: Promise<TWordResult | null> } | null = null

export const prefetchWord = (settings: TWordSettings) => {
  const key = getSettingsKey(settings)
  if (prefetched?.key === key) return
  prefetched = { key, result: requestWord(settings).catch(() => null) }
}

export const getWord = async (settings: TWordSettings): Promise<TWordResult> => {
  const key = getSettingsKey(settings)
  const pending = prefetched?.key === key ? prefetched.result : null
  prefetched = null

  const result = (await pending) ?? (await requestWord(settings))
  rememberPassedWord(result.word)
  return result
}
