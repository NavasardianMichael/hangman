import { SITE_URL } from 'helpers/constants/app'
import { sanitizeWord } from './words'

export const CHALLENGE_PARAM = 'c'

// Obfuscation only: keeps the word out of plain sight in the link, not a secret
const KEY = [0x4b, 0x61, 0x78, 0x61, 0x67, 0x68, 0x61, 0x6e]

const xorBytes = (bytes: Uint8Array) => bytes.map((byte, i) => byte ^ KEY[i % KEY.length])

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

export const createChallengeLink = (word: string) => {
  const token = toBase64Url(xorBytes(new TextEncoder().encode(word)))
  return `${SITE_URL}/?${CHALLENGE_PARAM}=${token}`
}

// Returns the challenge word from a token, or null if it isn't a playable word
export const decodeChallengeToken = (token: string) => {
  try {
    const word = new TextDecoder().decode(xorBytes(fromBase64Url(token)))
    return sanitizeWord(word, 1)
  } catch {
    return null
  }
}
