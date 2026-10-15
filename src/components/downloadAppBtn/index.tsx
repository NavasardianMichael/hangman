'use client'

import { CSSProperties, FC, useEffect, useState } from 'react'
import { Carousel, Modal, Typography } from 'antd'
import Image from 'next/image'
import Hint1Img from 'assets/images/hint1.webp'
import Hint2Img from 'assets/images/hint2.webp'
import Hint3Img from 'assets/images/hint3.webp'
import { useBackClose } from 'hooks/useBackClose'
import { STORE_VARS } from 'helpers/constants/app'
import { trackEvent } from 'helpers/utils/analytics'
import { isInstalledApp, isIos } from 'helpers/utils/commons'
import { setAppInstalled } from 'helpers/utils/installPrompt'

const DOWNLOAD_BENEFIT = 'Տեղադրեք հավելվածը Ձեր էկրանին և ստացեք ավելի հարմար փորձառություն և հեշտ հասանելիություն'

// Screenshots fit the screen next to the title and text, keeping their proportions
const HINT_IMAGE_STYLE: CSSProperties = {
  margin: 'auto',
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: '55dvh',
  objectFit: 'contain',
}

// On short screens the body scrolls instead of running past the modal
const MODAL_STYLES = { body: { maxHeight: 'calc(100dvh - 10rem)', overflowY: 'auto' } } as const

// After the instructions are closed, they're not offered again for this long
const IOS_HINT_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000

// Set once the instructions open, so returning to the start screen doesn't reopen them until the page reloads
let wasIosHintShownThisVisit = false

const wasIosHintClosedRecently = () => {
  const closedDate = Number(localStorage.getItem(STORE_VARS.IOS_INSTALL_HINT_CLOSED_DATE))
  return !!closedDate && Date.now() - closedDate < IOS_HINT_COOLDOWN_MS
}

const handleAppInstalled = () => {
  setAppInstalled()
  trackEvent('pwa_installed')
}

// iOS has no install API, so it gets Add to Home Screen instructions; other browsers install from the top bar button
export const DownloadAppBtn: FC = () => {
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
    <Modal
      title='Ինչպե՞ս ներբեռնել հավելվածը'
      centered
      width='min(80vw, 420px)'
      styles={MODAL_STYLES}
      open={showIosDownloadAppHintModal}
      onCancel={closeIosHint}
      okButtonProps={{
        style: { display: 'none' },
      }}
      cancelButtonProps={{
        style: { display: 'none' },
      }}
    >
      <div>
        <Typography style={{ fontSize: '0.75rem', textAlign: 'center' }}>{DOWNLOAD_BENEFIT}</Typography>
        <Carousel autoplay arrows dots dotPlacement='bottom'>
          <div>
            <Image src={Hint1Img} alt='Hint 1' style={HINT_IMAGE_STYLE} />
          </div>
          <div>
            <Image src={Hint2Img} alt='Hint 2' style={HINT_IMAGE_STYLE} />
          </div>
          <div>
            <Image src={Hint3Img} alt='Hint 3' style={HINT_IMAGE_STYLE} />
          </div>
        </Carousel>
      </div>
    </Modal>
  )
}
