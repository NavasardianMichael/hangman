'use client'

import { FC, useEffect, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import Hint1Img from 'assets/images/hint1.webp'
import Hint2Img from 'assets/images/hint2.webp'
import Hint3Img from 'assets/images/hint3.webp'
import { useBackClose } from 'hooks/useBackClose'
import { STORE_VARS } from 'helpers/constants/app'
import { trackEvent } from 'helpers/utils/analytics'
import { isInstalledApp, isIos } from 'helpers/utils/commons'
import { setAppInstalled } from 'helpers/utils/installPrompt'
import { combineClassNames } from 'helpers/utils/styles'
import { Dialog } from 'components/shared/dialog'
import { BackIcon, ForwardIcon } from 'components/shared/icons'

const DOWNLOAD_BENEFIT = 'Տեղադրեք հավելվածը Ձեր էկրանին և ստացեք ավելի հարմար փորձառություն և հեշտ հասանելիություն'

const HINT_IMAGES: { src: StaticImageData; alt: string }[] = [
  { src: Hint1Img, alt: 'Hint 1' },
  { src: Hint2Img, alt: 'Hint 2' },
  { src: Hint3Img, alt: 'Hint 3' },
]

const AUTOPLAY_INTERVAL_MS = 3000

// The download hint comes back an hour after install, in case the app was removed
const INSTALL_HINT_PAUSE_MS = 60 * 60 * 1000

// After the instructions are closed, they're not offered again for this long
const IOS_HINT_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000

// Set once the instructions open, so returning to the start screen doesn't reopen them until the page reloads
let wasIosHintShownThisVisit = false

const wasAppInstalledRecently = () => {
  const pwaInstalledDate = localStorage.getItem(STORE_VARS.PWA_INSTALLED_DATE)
  return pwaInstalledDate && !isNaN(+pwaInstalledDate) ? Date.now() - +pwaInstalledDate < INSTALL_HINT_PAUSE_MS : false
}

const wasIosHintClosedRecently = () => {
  const closedDate = Number(localStorage.getItem(STORE_VARS.IOS_INSTALL_HINT_CLOSED_DATE))
  return !!closedDate && Date.now() - closedDate < IOS_HINT_COOLDOWN_MS
}

const handleAppInstalled = () => {
  setAppInstalled()
  trackEvent('pwa_installed')
}

const CAROUSEL_ARROW_CLASSES =
  'absolute top-1/2 z-1 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/70 p-0 text-[18px] text-secondary'

// The install screenshots, one at a time, moving on by themselves
const HintCarousel: FC = () => {
  const [index, setIndex] = useState(0)
  const show = (next: number) => setIndex((next + HINT_IMAGES.length) % HINT_IMAGES.length)

  // Restarts after a manual change, so the chosen slide gets the full interval
  useEffect(() => {
    const timeoutId = setTimeout(() => setIndex((index + 1) % HINT_IMAGES.length), AUTOPLAY_INTERVAL_MS)
    return () => clearTimeout(timeoutId)
  }, [index])

  return (
    <div className='relative overflow-hidden'>
      <div className='flex transition-transform duration-500' style={{ transform: `translateX(-${index * 100}%)` }}>
        {HINT_IMAGES.map(({ src, alt }, i) => (
          <div key={alt} className='flex w-full flex-none justify-center' aria-hidden={i !== index}>
            <Image src={src} alt={alt} className='m-auto h-auto max-h-[55dvh] w-auto max-w-full object-contain' />
          </div>
        ))}
      </div>
      <button
        type='button'
        aria-label='Նախորդը'
        className={combineClassNames(CAROUSEL_ARROW_CLASSES, 'left-1')}
        onClick={() => show(index - 1)}
      >
        <BackIcon />
      </button>
      <button
        type='button'
        aria-label='Հաջորդը'
        className={combineClassNames(CAROUSEL_ARROW_CLASSES, 'right-1')}
        onClick={() => show(index + 1)}
      >
        <ForwardIcon />
      </button>
      <div className='mt-2 flex justify-center gap-1.5'>
        {HINT_IMAGES.map(({ alt }, i) => (
          <button
            key={alt}
            type='button'
            aria-label={`${i + 1}`}
            aria-current={i === index}
            className={combineClassNames(
              'h-[3px] cursor-pointer rounded-full border-0 bg-secondary p-0 transition-all duration-300',
              i === index ? 'w-6 opacity-100' : 'w-4 opacity-30'
            )}
            onClick={() => show(i)}
          />
        ))}
      </div>
    </div>
  )
}

// iOS has no install API, so it gets Add to Home Screen instructions; other browsers install from the top bar button
const IosInstallHint: FC = () => {
  const [isIosDevice] = useState(isIos)
  const [isInstalled] = useState(isInstalledApp)
  const [showIosDownloadAppHintModal, setShowIosDownloadAppHintModal] = useState(
    () => isIosDevice && !isInstalled && !wasIosHintShownThisVisit && !wasIosHintClosedRecently()
  )

  const closeIosHint = () => {
    setShowIosDownloadAppHintModal(false)
    localStorage.setItem(STORE_VARS.IOS_INSTALL_HINT_CLOSED_DATE, Date.now().toString())
  }

  useBackClose(showIosDownloadAppHintModal, closeIosHint)

  useEffect(() => {
    if (showIosDownloadAppHintModal) wasIosHintShownThisVisit = true
  }, [showIosDownloadAppHintModal])

  useEffect(() => {
    if (isInstalled) setAppInstalled()
  }, [isInstalled])

  useEffect(() => {
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => window.removeEventListener('appinstalled', handleAppInstalled)
  }, [])

  if (isInstalled) return null

  return (
    <Dialog
      title='Ինչպե՞ս ներբեռնել հավելվածը'
      width='min(80vw, 420px)'
      bodyClassName='max-h-[calc(100dvh_-_10rem)] overflow-y-auto'
      open={showIosDownloadAppHintModal}
      onClose={closeIosHint}
    >
      <div className='text-center text-[0.75rem]'>{DOWNLOAD_BENEFIT}</div>
      <HintCarousel />
    </Dialog>
  )
}

// Reads this device's storage, so it mounts only in the browser
export const DownloadAppBtn: FC = () => {
  const [isInstalledRecently] = useState(wasAppInstalledRecently)
  return isInstalledRecently ? null : <IosInstallHint />
}
