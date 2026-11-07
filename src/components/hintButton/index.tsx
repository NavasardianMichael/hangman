'use client'

import { FC, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { isPremiumActive, usePremiumStore } from 'store/premium'
import { useUiStore } from 'store/ui'
import { useBackClose } from 'hooks/useBackClose'
import { FREE_HINTS_PER_DAY } from 'helpers/constants/premium'
import { trackEvent } from 'helpers/utils/analytics'
import { getLocalDateKey } from 'helpers/utils/date'
import { openPremiumDialog } from 'helpers/utils/premium'
import { ContentModal } from 'components/contentModal'
import { Button } from 'components/shared/button'
import { IconButton } from 'components/shared/iconButton'
import { HintIcon } from 'components/shared/icons'

// The round's hint (single player): one free a day, unlimited with premium. Mounted for one round in progress, so
// its state starts fresh each round.
export const HintButton: FC = () => {
  const { hint, hintRevealed } = useGameStore(
    useShallow((state) => ({ hint: state.round.hint, hintRevealed: state.round.hintRevealed }))
  )
  const [isOpen, setIsOpen] = useState(false)
  useBackClose(isOpen, () => setIsOpen(false))

  // The timer waits while the hint dialog is open
  useEffect(() => {
    useUiStore.getState().setHintFlowActive(isOpen)
  }, [isOpen])
  useEffect(() => () => useUiStore.getState().setHintFlowActive(false), [])

  const handleClick = () => {
    if (hintRevealed) {
      setIsOpen(true)
      return
    }

    const { freeUse, revealHint, markFreeUse } = useGameStore.getState()
    if (isPremiumActive(usePremiumStore.getState().until)) {
      revealHint()
      trackEvent('hint_used', { source: 'premium' })
      setIsOpen(true)
      return
    }

    const today = getLocalDateKey()
    if (freeUse.date === today && freeUse.hints >= FREE_HINTS_PER_DAY) {
      trackEvent('hint_locked')
      openPremiumDialog('hint-limit')
      return
    }

    revealHint()
    markFreeUse('hints', today)
    trackEvent('hint_used', { source: 'free' })
    setIsOpen(true)
  }

  const closeDialog = () => setIsOpen(false)
  const label = hintRevealed ? 'Հուշումը բացված է' : 'Հուշում'

  if (!hint) return null

  return (
    <>
      <IconButton aria-label={label} title={label} onClick={handleClick}>
        <HintIcon />
      </IconButton>

      <ContentModal
        open={isOpen}
        title='Հուշում'
        intro={<p>{hint}</p>}
        onClose={closeDialog}
        footer={
          <Button square onClick={closeDialog}>
            Վերադառնալ խաղին
          </Button>
        }
      />
    </>
  )
}
