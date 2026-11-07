'use client'

import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { isPremiumActive, usePremiumStore } from 'store/premium'
import { TPremiumDialog, useUiStore } from 'store/ui'
import { useBackClose } from 'hooks/useBackClose'
import {
  FREE_HINTS_PER_DAY,
  FREE_LETTERS_PER_DAY,
  PREMIUM_DAYS,
  PREMIUM_PRICE_AMD,
  PREMIUM_PRICE_TEXT,
} from 'helpers/constants/premium'
import { INFO_PATHS } from 'helpers/constants/routes'
import { trackEvent } from 'helpers/utils/analytics'
import { formatPremiumDate, refreshPremium, startCheckout } from 'helpers/utils/premium'
import { ContentModal } from 'components/contentModal'
import { Button } from 'components/shared/button'

const PENDING_POLL_MS = 4000
const PENDING_MAX_POLLS = 8

const FREE_TEXT = `Առանց պրեմիումի օրական անվճար է ${FREE_HINTS_PER_DAY} հուշում և ${FREE_LETTERS_PER_DAY} տառի բացում։`

const NOT_A_SUBSCRIPTION_TEXT =
  'Սա մեկանգամյա վճար է, ոչ թե բաժանորդագրություն․ ոչինչ ինքնաշխատ չի գանձվում և չի երկարաձգվում։ Ամիսը լրանալուց հետո պրեմիումը կրկին ստանալու համար անհրաժեշտ է նորից վճարել։'

const Offer: FC = () => (
  <>
    <p>
      <strong>
        Պրեմիում՝ {PREMIUM_PRICE_TEXT}՝ {PREMIUM_DAYS} օրով։
      </strong>{' '}
      Անսահմանափակ հուշումներ և տառերի բացում բոլոր խաղերում՝ վճարման պահից {PREMIUM_DAYS} օր։
    </p>
    <p>{NOT_A_SUBSCRIPTION_TEXT}</p>
    <p className='text-[0.8rem]'>
      Վճարումը կատարվում է Ամերիաբանկի անվտանգ էջում։ Պրեմիումը կապվում է այս դիտարկիչին կամ հավելվածին։ Վճարելով՝
      համաձայնում եք{' '}
      <a href={INFO_PATHS.terms} target='_blank' rel='noopener'>
        օգտագործման պայմաններին
      </a>{' '}
      և{' '}
      <a href={INFO_PATHS.refund} target='_blank' rel='noopener'>
        վերադարձի քաղաքականությանը
      </a>
      ։
    </p>
  </>
)

type TView = { title: string; body: ReactNode; canPay: boolean; payLabel?: string }

// One dialog for every premium moment (store/ui.ts TPremiumDialog), mounted once in the App
export const PremiumDialog: FC = () => {
  const dialog = useUiStore((state) => state.premiumDialog)
  const { until, buyerKey } = usePremiumStore(useShallow(({ until, buyerKey }) => ({ until, buyerKey })))
  const [isPaying, setIsPaying] = useState(false)
  const [polls, setPolls] = useState(0)
  const [pollTarget, setPollTarget] = useState<TPremiumDialog | null>(null)
  const trackedPurchase = useRef<number | null>(null)

  const close = () => useUiStore.getState().setPremiumDialog(null)
  useBackClose(!!dialog, close)

  const isResult = !!dialog?.startsWith('result-')
  const isActive = isPremiumActive(until)

  // A payment's result is read from the server, not from the redirect's word for it. "Pending" (or a success the
  // server hasn't settled yet) is read again a few times while the bank answers. A new result dialog starts over.
  if (pollTarget !== dialog) {
    setPollTarget(dialog)
    setPolls(0)
  }
  useEffect(() => {
    if (dialog?.startsWith('result-')) void refreshPremium()
  }, [dialog])
  const isWaiting = isResult && dialog !== 'result-failed' && !isActive && !!buyerKey && polls < PENDING_MAX_POLLS
  useEffect(() => {
    if (!isWaiting) return
    const timer = setTimeout(() => {
      void refreshPremium()
      setPolls((count) => count + 1)
    }, PENDING_POLL_MS)
    return () => clearTimeout(timer)
  }, [isWaiting, polls])

  // GA counts one purchase per transaction_id, so a revisited result isn't counted twice
  useEffect(() => {
    if (!isResult || !isActive || !until || trackedPurchase.current === until) return
    trackedPurchase.current = until
    trackEvent('purchase', { currency: 'AMD', value: PREMIUM_PRICE_AMD, transaction_id: String(until) })
  }, [isResult, isActive, until])

  if (!dialog) return null

  const pay = async () => {
    setIsPaying(true)
    await startCheckout(dialog)
    setIsPaying(false)
  }

  const activeText = until ? `Պրեմիումը գործում է մինչև ${formatPremiumDate(until)}։` : ''

  const view = ((): TView => {
    if (isResult && isActive) {
      return {
        title: 'Վճարումը հաջողվեց',
        body: (
          <>
            <p>
              <strong>{activeText}</strong> Հուշումները և տառերի բացումն այժմ անսահմանափակ են։
            </p>
            <p>{NOT_A_SUBSCRIPTION_TEXT}</p>
          </>
        ),
        canPay: false,
      }
    }
    if (dialog === 'result-failed') {
      return {
        title: 'Վճարումը չհաջողվեց',
        body: <p>Գումար չի գանձվել։ Կարող եք փորձել կրկին։</p>,
        canPay: true,
        payLabel: 'Փորձել կրկին',
      }
    }
    if (isResult && !buyerKey) {
      // The bank sent the player back to a different browser than the one that paid (e.g. the installed app opened
      // the bank in Safari): the premium belongs to the one that started the payment
      return {
        title: dialog === 'result-succeeded' ? 'Վճարումն ընդունված է' : 'Վճարումը ստուգվում է',
        body: (
          <p>
            Պրեմիումը կապված է այն դիտարկիչին կամ հավելվածին, որից սկսել եք վճարումը։ Բացեք խաղն այնտեղ․ պրեմիումը
            կակտիվանա ինքնաշխատ։
          </p>
        ),
        canPay: false,
      }
    }
    if (isResult) {
      return {
        title: 'Վճարումը ստուգվում է',
        body: (
          <p>
            {isWaiting
              ? 'Սպասում ենք բանկի հաստատմանը…'
              : 'Բանկը դեռ չի հաստատել վճարումը։ Պրեմիումը կակտիվանա հաստատվելուն պես՝ խաղը հաջորդ անգամ բացելիս։'}
          </p>
        ),
        canPay: false,
      }
    }
    if (isActive) {
      return {
        title: 'Պրեմիումն ակտիվ է',
        body: (
          <>
            <p>
              <strong>{activeText}</strong> Հուշումները և տառերի բացումն անսահմանափակ են։
            </p>
            <p>{NOT_A_SUBSCRIPTION_TEXT}</p>
          </>
        ),
        canPay: false,
      }
    }
    if (dialog === 'expired') {
      return {
        title: 'Պրեմիումի ամիսն ավարտվել է',
        body: (
          <>
            {until && <p>Ձեր պրեմիումը գործում էր մինչև {formatPremiumDate(until)}։</p>}
            <p>{FREE_TEXT}</p>
            <Offer />
          </>
        ),
        canPay: true,
        payLabel: `Վճարել ${PREMIUM_PRICE_TEXT} ևս մեկ ամսով`,
      }
    }
    const limitText =
      dialog === 'hint-limit'
        ? 'Այսօրվա անվճար հուշումն արդեն օգտագործված է։ Հաջորդը հասանելի կլինի վաղը։'
        : dialog === 'letter-limit'
          ? 'Այսօրվա անվճար տառերն արդեն օգտագործված են։ Հաջորդները հասանելի կլինեն վաղը։'
          : null
    return {
      title: dialog === 'offer' ? 'Պրեմիում' : 'Անվճար օգտագործումն այսօր ավարտվել է',
      body: (
        <>
          {limitText && <p>{limitText}</p>}
          <p>{FREE_TEXT}</p>
          <Offer />
        </>
      ),
      canPay: true,
    }
  })()

  return (
    <ContentModal
      open
      title={view.title}
      intro={view.body}
      onClose={close}
      footer={
        <div className='flex flex-wrap justify-end gap-2'>
          {view.canPay && (
            <Button square disabled={isPaying} onClick={pay}>
              {isPaying ? 'Բացվում է…' : (view.payLabel ?? `Վճարել ${PREMIUM_PRICE_TEXT}`)}
            </Button>
          )}
          <Button square variant={view.canPay ? 'default' : 'primary'} onClick={close}>
            {view.canPay ? 'Ոչ հիմա' : 'Լավ'}
          </Button>
        </div>
      }
    />
  )
}
