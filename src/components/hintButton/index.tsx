'use client'

import { FC, useEffect, useState } from 'react'
import { Button } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from 'store/game'
import { useUiStore } from 'store/ui'
import { useBackClose } from 'hooks/useBackClose'
import { requestRewardedAd } from 'helpers/utils/ads'
import { trackEvent } from 'helpers/utils/analytics'
import { getLocalDateKey } from 'helpers/utils/date'
import { ContentModal } from 'components/contentModal'
import { IconButton } from 'components/shared/iconButton'
import { HintIcon } from 'components/shared/icons'

// 'offer': a rewarded ad is ready; 'unavailable': today's free hint is used and no ad can be shown
type THintDialog = 'offer' | 'unavailable'

// The round's hint (single player). Mounted for one round in progress, so its state starts fresh each round.
export const HintButton: FC = () => {
  const { hint, hintRevealed, lastFreeHintDate } = useGameStore(
    useShallow((state) => ({
      hint: state.round.hint,
      hintRevealed: state.round.hintRevealed,
      lastFreeHintDate: state.lastFreeHintDate,
    }))
  )
  const [today] = useState(getLocalDateKey)
  const [dialog, setDialog] = useState<THintDialog | null>(null)
  const [rewardOffer, setRewardOffer] = useState<(() => void) | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isAdShowing, setIsAdShowing] = useState(false)
  useBackClose(!!dialog, () => setDialog(null))

  // The timer waits while a hint dialog or the ad is open
  const isFlowActive = !!dialog || isAdShowing
  useEffect(() => {
    useUiStore.getState().setHintFlowActive(isFlowActive)
  }, [isFlowActive])
  useEffect(() => () => useUiStore.getState().setHintFlowActive(false), [])

  const revealHint = (source: 'free' | 'rewarded') => {
    const { revealHint: reveal, markFreeHintUsed } = useGameStore.getState()
    reveal()
    if (source === 'free') markFreeHintUsed(today)
    trackEvent('hint_used', { source })
  }

  const handleClick = () => {
    if (lastFreeHintDate !== today) return revealHint('free')

    setIsChecking(true)
    requestRewardedAd('unlock-hint', {
      onOffer: (showAd) => {
        setIsChecking(false)
        setRewardOffer(() => showAd)
        setDialog('offer')
      },
      onRewarded: () => revealHint('rewarded'),
      onDismissed: () => {},
      onUnavailable: () => {
        setIsChecking(false)
        setDialog('unavailable')
        trackEvent('hint_locked')
      },
      onDone: () => {
        setRewardOffer(null)
        setIsAdShowing(false)
      },
    })
  }

  const closeDialog = () => setDialog(null)

  const watchRewardedAd = () => {
    const showAd = rewardOffer
    setRewardOffer(null)
    setDialog(null)
    setIsAdShowing(true)
    showAd?.()
  }

  const label = hintRevealed ? 'Հուշումը բացված է' : 'Հուշում'
  const backButton = (
    <Button type='primary' onClick={closeDialog}>
      Վերադառնալ խաղին
    </Button>
  )

  if (!hint) return null

  return (
    <>
      <IconButton
        aria-label={label}
        title={label}
        aria-busy={isChecking}
        disabled={hintRevealed || isChecking}
        onClick={handleClick}
      >
        <HintIcon />
      </IconButton>

      <ContentModal
        open={dialog === 'offer'}
        title='Բացե՞լ հուշումը'
        intro={<p>Այսօրվա անվճար հուշումն արդեն օգտագործված է։ Դիտեք կարճ գովազդ՝ հուշումը բացելու համար։</p>}
        onClose={closeDialog}
        footer={
          <>
            <Button onClick={closeDialog}>Ոչ</Button>
            <Button type='primary' onClick={watchRewardedAd}>
              Դիտել գովազդը
            </Button>
          </>
        }
      />

      <ContentModal
        open={dialog === 'unavailable'}
        title='Հուշումն այս պահին հասանելի չէ'
        sections={[
          {
            title: 'Անվճար հուշում',
            body: <p>Օրական մեկ հուշում անվճար է։ Այսօրվա հուշումն արդեն օգտագործված է, հաջորդը հասանելի կլինի վաղը։</p>,
          },
          {
            title: 'Հուշում գովազդով',
            body: (
              <p>
                Լրացուցիչ հուշումը կարելի է բացել կարճ գովազդ դիտելով, բայց այս պահին գովազդ հասանելի չէ։ Փորձեք մի
                փոքր ուշ։
              </p>
            ),
          },
        ]}
        onClose={closeDialog}
        footer={backButton}
      />
    </>
  )
}
