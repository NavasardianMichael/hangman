import { LETTERS, STORE_VARS } from '../constants/app'

const KEYBOARD_LETTERS: ReadonlySet<string> = new Set(LETTERS)

export const getPassedWordsFromLocalStorage = () => {
  const passedWords: string[] = []

  try {
    const passedWordsJson = localStorage.getItem(STORE_VARS.PASSED_WORDS)
    if (passedWordsJson) {
      const parsedWordsFromStorage = JSON.parse(passedWordsJson)
      if (Array.isArray(parsedWordsFromStorage)) passedWords.push(...parsedWordsFromStorage)
    }
  } catch {
    console.error('Error parsing passed words from localStorage')
  }

  return passedWords
}

// Splits an uppercase word into keyboard letters, keeping 'ՈՒ' as a single letter
export const splitWordToLetters = (word: string) => {
  const letters: string[] = []
  let i = 0

  while (i < word.length) {
    if (word[i] === 'Ո' && word[i + 1] === 'Ւ') {
      letters.push('ՈՒ')
      i += 2
    } else {
      letters.push(word[i])
      i += 1
    }
  }

  return letters
}

// Turns a raw AI answer into an uppercase word that can be typed on the in-game keyboard, or null if it can't
export const sanitizeWord = (raw: string, minLettersCount: number): string | null => {
  const firstLine = raw.trim().split('\n')[0] ?? ''
  const word = firstLine
    .toLowerCase()
    .replaceAll('և', 'եվ')
    .toUpperCase()
    .replace(/[-‐–—]/g, ' ')
    .replace(/[^Ա-Ֆ\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ')

  const letters = splitWordToLetters(word).filter((letter) => letter !== ' ')
  if (letters.length < minLettersCount || letters.some((letter) => !KEYBOARD_LETTERS.has(letter))) return null

  return word
}
