'use client'

import { FC, useEffect, useState } from 'react'
import { Button } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { useUiStore } from 'store/ui'
import { useBackClose } from 'hooks/useBackClose'
import { FREE_HINTS_PER_DAY } from 'helpers/constants/app'
import { trackEvent } from 'helpers/utils/analytics'
import { getLocalDateKey } from 'helpers/utils/date'
import { ContentModal } from 'components/contentModal'
import { IconButton } from 'components/shared/iconButton'
import { HintIcon } from 'components/shared/icons'

// 'hint': the round's hint; 'limit': today's free hints are used up
type THintDialog = 'hint' | 'limit'

const hintsUsedOn = (date: string, lastFreeHintDate: string | null, freeHintsUsed: number) =>
  lastFreeHintDate === date ? freeHintsUsed : 0

// The round's hint (single player). Mounted for one round in progress, so its state starts fresh each round.
export const HintButton: FC = () => {
  const { hint, hintRevealed, lastFreeHintDate, freeHintsUsed } = useGameStore(
    useShallow((state) => ({
      hint: state.round.hint,
      hintRevealed: state.round.hintRevealed,
      lastFreeHintDate: state.lastFreeHintDate,
      freeHintsUsed: state.freeHintsUsed,
    }))
  )
  const [today] = useState(getLocalDateKey)
  const [dialog, setDialog] = useState<THintDialog | null>(null)
  useBackClose(!!dialog, () => setDialog(null))

  // The timer waits while the hint dialog is open
  useEffect(() => {
    useUiStore.getState().setHintFlowActive(!!dialog)
  }, [dialog])
  useEffect(() => () => useUiStore.getState().setHintFlowActive(false), [])

  const handleClick = () => {
    if (hintRevealed) {
      setDialog('hint')
      return
    }

    if (hintsUsedOn(today, lastFreeHintDate, freeHintsUsed) >= FREE_HINTS_PER_DAY) {
      setDialog('limit')
      trackEvent('hint_locked')
      return
    }

    const { revealHint, markFreeHintUsed } = useGameStore.getState()
    revealHint()
    markFreeHintUsed(today)
    trackEvent('hint_used', { source: 'free' })
    setDialog('hint')
  }

  const closeDialog = () => setDialog(null)
  const label = hintRevealed ? 'Հուշումը բացված է' : 'Հուշում'

  if (!hint) return null

  return (
    <>
      <IconButton aria-label={label} title={label} onClick={handleClick}>
        <HintIcon />
      </IconButton>

      <ContentModal
        open={dialog === 'hint'}
        title='Հուշում'
        intro={<p>{hint}</p>}
        onClose={closeDialog}
        footer={
          <Button type='primary' onClick={closeDialog}>
            Վերադառնալ խաղին
          </Button>
        }
      />

      <ContentModal
        open={dialog === 'limit'}
        title='Այսօրվա հուշումները սպառվել են'
        intro={
          <p>Օրական երեք հուշում անվճար է։ Այսօրվա հուշումներն արդեն օգտագործված են, հաջորդները հասանելի կլինեն վաղը։</p>
        }
        onClose={closeDialog}
        footer={
          <Button type='primary' onClick={closeDialog}>
            Վերադառնալ խաղին
          </Button>
        }
      />
    </>
  )
}
