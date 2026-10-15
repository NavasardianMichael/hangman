'use client'

import { CSSProperties, FC, useEffect, useState, useSyncExternalStore } from 'react'
import { DownloadOutlined } from '@ant-design/icons'
import { Button, Carousel, Modal, notification, Typography } from 'antd'
import Image from 'next/image'
import Hint1Img from 'assets/images/hint1.webp'
import Hint2Img from 'assets/images/hint2.webp'
import Hint3Img from 'assets/images/hint3.webp'
import { useBackClose } from 'hooks/useBackClose'
import { STORE_VARS } from 'helpers/constants/app'
import { trackEvent } from 'helpers/utils/analytics'
import { isInstalledApp, isInWebView, isIos } from 'helpers/utils/commons'
import {
  clearInstallPrompt,
  getInstallPrompt,
  getServerInstallPrompt,
  subscribeToInstallPrompt,
} from 'helpers/utils/installPrompt'

const NOTIFICATION_KEY = 'download-app'

const HINT_IMAGE_STYLE: CSSProperties = { margin: 'auto', maxWidth: '100%', maxHeight: '80vh', objectFit: 'cover' }

const setAppInstalled = () => {
  localStorage.setItem(STORE_VARS.PWA_INSTALLED_DATE, Date.now().toString())
}

const handleAppInstalled = () => {
  setAppInstalled()
  trackEvent('pwa_installed')
}

export const DownloadAppBtn: FC = () => {
  const [api, contextHolder] = notification.useNotification()
  const [isIosDevice] = useState(isIos)
  const [isInstalled] = useState(isInstalledApp)
  const [showIosDownloadAppHintModal, setShowIosDownloadAppHintModal] = useState(() => isIosDevice && !isInstalled)
  const installPrompt = useSyncExternalStore(subscribeToInstallPrompt, getInstallPrompt, getServerInstallPrompt)
  useBackClose(showIosDownloadAppHintModal, () => setShowIosDownloadAppHintModal(false))

  useEffect(() => {
    if (isInstalled) setAppInstalled()
  }, [isInstalled])

  useEffect(() => {
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => window.removeEventListener('appinstalled', handleAppInstalled)
  }, [])

  // The download notification is only offered when the browser actually allows installing
  useEffect(() => {
    if (isIosDevice || isInstalled || !installPrompt || isInWebView()) return

    const handleDownloadClick = async () => {
      api.destroy(NOTIFICATION_KEY)
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') setAppInstalled()
      clearInstallPrompt()
    }

    const timeoutId = setTimeout(() => {
      trackEvent('pwa_prompt_shown')
      api.info({
        key: NOTIFICATION_KEY,
        title: (
          <div style={{ textAlign: 'center' }}>
            <b>Ներբեռնե՞լ հավելվածը</b>
            <Typography style={{ fontSize: '8px', textAlign: 'center' }}>* Ինկոգնիտո ռեժիմում կարող է չաշխատել</Typography>
          </div>
        ),
        duration: 0,
        icon: ' ',
        description: (
          <Button type='primary' style={{ width: '100%' }} onClick={handleDownloadClick} icon={<DownloadOutlined />}>
            Ներբեռնել
          </Button>
        ),
        placement: 'top',
      })
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [api, installPrompt, isInstalled, isIosDevice])

  if (isInstalled) return null

  return (
    <>
      <Modal
        title='Ինչպե՞ս ներբեռնել հավելվածը'
        centered
        width='min(80vw, 420px)'
        open={showIosDownloadAppHintModal}
        onCancel={() => setShowIosDownloadAppHintModal(false)}
        okButtonProps={{
          style: { display: 'none' },
        }}
        cancelButtonProps={{
          style: { display: 'none' },
        }}
      >
        <div style={{ maxHeight: '80vh', boxSizing: 'border-box' }}>
          <Typography style={{ fontSize: '8px', textAlign: 'center' }}>* Ինկոգնիտո ռեժիմում կարող է չաշխատել</Typography>
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
      {contextHolder}
    </>
  )
}
