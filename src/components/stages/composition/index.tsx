'use client'

import { CSSProperties, MouseEventHandler, useState } from 'react'
import { useGameStore } from 'store/game'
import { LETTERS, PLAY_MODES, SPACE_CHAR } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { trackEvent } from 'helpers/utils/analytics'
import { createChallengeLink } from 'helpers/utils/challenge'
import { normalizeSpaces } from 'helpers/utils/commons'
import { combineClassNames } from 'helpers/utils/styles'
import { splitWordToLetters } from 'helpers/utils/words'
import { CustomButton } from 'components/shared/customButton'
import { LetterKey } from 'components/shared/letterKey'

/*
  Tile size; the margins between tiles and the font follow it.
  Narrow screens: while typing, tiles shrink so the word stays on one row, down to a readable minimum, then wrap.
  Each tile takes its width plus a 0.2 share of margin, so n tiles fill the row at 100cqi / (1.2 * n).
  Margins stand in for gap: cqi resolves against the word only inside its children.
*/
const WORD_CLASSES =
  'flex flex-wrap items-center justify-center p-4 text-center leading-none font-bold select-none [--tile:2.6rem] max-[600px]:[container-type:inline-size] max-[600px]:[--tile:clamp(1.5rem,100cqi/(1.2*var(--cells,1)),2.6rem)] phone-landscape:box-border phone-landscape:w-1/2 phone-landscape:[container-type:inline-size] phone-landscape:[--tile:clamp(1.5rem,100cqi/(1.2*var(--cells,1)),2.6rem)]'

// A blinking cursor after the last tile
const CURSOR_CLASSES =
  "after:mx-[calc(var(--tile)*0.1)] after:animate-[cursor-blink_1s_steps(2)_infinite] after:[font-size:calc(var(--tile)*0.7)] after:font-normal after:text-black after:content-['|']"

const TILE_MARGIN_CLASSES = 'flex-none w-(--tile) m-[calc(var(--tile)*0.1)]'

export const Composition: StageComponent = ({ toNextPage }) => {
  const minLettersCount = useGameStore((state) => state.settings.minLettersCount)
  const isChallenge = useGameStore((state) => state.mode === PLAY_MODES.challenge)

  const [word, setWord] = useState('')

  const handleAlphabetLetterClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const letter = e.currentTarget.name
    setWord((prev) => prev + letter)
  }

  const handleAddSpaceCharClick: MouseEventHandler<HTMLButtonElement> = () => {
    setWord((prev) => prev + ' ')
  }

  const handleRemoveCharClick: MouseEventHandler<HTMLButtonElement> = () => {
    setWord((prev) => splitWordToLetters(prev).slice(0, -1).join(''))
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = () => {
    const finalWord = normalizeSpaces(word)
    const { startRound, setAppOptions } = useGameStore.getState()

    if (isChallenge) {
      setAppOptions({ challengeLink: createChallengeLink(finalWord) })
      trackEvent('challenge_created', { wordLength: finalWord.length })
    } else {
      startRound({ word: finalWord })
    }
    toNextPage()
  }

  // 'ՈՒ' is two code points and one keyboard letter, same as on the guessing screen
  const letters = splitWordToLetters(word)
  const letterCount = splitWordToLetters(normalizeSpaces(word)).filter((letter) => letter !== ' ').length

  return (
    <div>
      {isChallenge && (
        <p className='mx-4 mt-18 mb-0 text-center text-[1rem] phone-landscape:w-1/2'>
          Գրեք բառ, որը ընկերը պետք է գուշակի
        </p>
      )}
      {/* The tile count (plus the cursor) lets CSS size the tiles to the available width */}
      <div
        className={combineClassNames(
          WORD_CLASSES,
          CURSOR_CLASSES,
          // Right under the caption, otherwise lower down the screen
          isChallenge ? 'mt-8' : 'mt-32 phone-landscape:mt-12'
        )}
        style={{ '--cells': letters.length + 1 } as CSSProperties}
      >
        {letters.map((letter, i) => {
          return (
            <span
              key={i}
              className={
                letter === ' '
                  ? TILE_MARGIN_CLASSES
                  : combineClassNames(
                      TILE_MARGIN_CLASSES,
                      'box-border inline-flex h-[calc(var(--tile)*1.25)] items-center justify-center rounded-card border border-solid border-[rgba(35,35,35,0.28)] bg-paper [font-size:calc(var(--tile)*0.7)] shadow-card'
                    )
              }
            >
              {letter === ' ' ? '' : letter}
            </span>
          )
        })}
      </div>
      <div className='fixed bottom-(--bottom-inset) left-1/2 box-border flex w-[min(100%,var(--column-width))] -translate-x-1/2 flex-wrap gap-[0.2rem] p-4 text-center text-[1.35rem] font-medium text-primary phone-landscape:right-(--safe-right) phone-landscape:left-auto phone-landscape:w-[calc(var(--column-width)/2)] phone-landscape:translate-none phone-landscape:p-2'>
        {LETTERS.map((letter) => {
          return (
            <LetterKey key={letter} name={letter} onClick={handleAlphabetLetterClick}>
              {letter}
            </LetterKey>
          )
        })}
        <LetterKey
          disabled={!word.length || word.endsWith(' ')}
          name=' '
          aria-label='Բացատ'
          onClick={handleAddSpaceCharClick}
        >
          {SPACE_CHAR}
        </LetterKey>
        <LetterKey disabled={!word.length} name='✕' aria-label='Ջնջել' onClick={handleRemoveCharClick}>
          ✕
        </LetterKey>
      </div>
      <CustomButton disabled={letterCount < minLettersCount} onClick={handleSubmit}>
        {isChallenge ? 'Ստեղծել հղումը' : 'Անցնել գուշակելուն'}
      </CustomButton>
    </div>
  )
}
