'use client'

import { FC, useState } from 'react'
import { useGameStore } from 'store/game'
import { isPremiumActive, usePremiumStore } from 'store/premium'
import { TLetter } from 'store/types'
import { FREE_LETTERS_PER_DAY } from 'helpers/constants/premium'
import { trackEvent } from 'helpers/utils/analytics'
import { getLocalDateKey } from 'helpers/utils/date'
import { openPremiumDialog } from 'helpers/utils/premium'
import { splitWordToLetters } from 'helpers/utils/words'
import { IconButton } from 'components/shared/iconButton'
import { RevealLetterIcon } from 'components/shared/icons'

// Letters of the word not opened yet; each appears once, however many times the word has it
const getHiddenLetters = () => {
  const { currentWord, round } = useGameStore.getState()
  const letters = splitWordToLetters(currentWord.toUpperCase()).filter((letter) => letter !== ' ') as TLetter[]
  return [...new Set(letters)].filter((letter) => !round.guessedLetters[letter])
}

// Opens one random letter of the word in every cell it appears (single player): three free a day, unlimited with
// premium. Opening the last hidden letter wins the round, like guessing it. Without premium, a badge counts the
// free letters left today. Mounted for one round in progress.
export const RevealLetterButton: FC = () => {
  const [today] = useState(getLocalDateKey)
  const lettersUsed = useGameStore((state) => (state.freeUse.date === today ? state.freeUse.letters : 0))
  const isPremium = usePremiumStore((state) => isPremiumActive(state.until))
  const freeLeft = Math.max(0, FREE_LETTERS_PER_DAY - lettersUsed)

  const handleClick = () => {
    const hidden = getHiddenLetters()
    if (!hidden.length) return

    const { revealLetter, markFreeUse } = useGameStore.getState()
    const letter = hidden[Math.floor(Math.random() * hidden.length)]

    if (isPremiumActive(usePremiumStore.getState().until)) {
      revealLetter(letter)
      trackEvent('letter_revealed', { source: 'premium' })
      return
    }

    if (freeLeft <= 0) {
      trackEvent('letter_locked')
      openPremiumDialog('letter-limit')
      return
    }

    revealLetter(letter)
    markFreeUse('letters', today)
    trackEvent('letter_revealed', { source: 'free' })
  }

  const label = isPremium ? 'Բացել մեկ տառ' : `Բացել մեկ տառ (այսօր՝ ${freeLeft} անվճար)`

  return (
    <IconButton data-reveal-button aria-label={label} title={label} onClick={handleClick} className='relative'>
      <RevealLetterIcon />
      {!isPremium && freeLeft > 0 && (
        <span
          aria-hidden='true'
          className='absolute -top-1 -right-1 flex size-[1.05rem] items-center justify-center rounded-full bg-[#2b2b2b] text-[0.62rem] leading-none font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
        >
          {freeLeft}
        </span>
      )}
    </IconButton>
  )
}
