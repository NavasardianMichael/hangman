'use client'

import { FC, useEffect, useRef } from 'react'
import { useMediaQuery } from 'hooks/useMediaQuery'
import { ADS_ENABLED, ADSENSE_CLIENT, RAIL_MEDIA_QUERY, RAIL_SLOTS } from 'helpers/constants/ads'
import { combineClassNames } from 'helpers/utils/styles'
import styles from './styles.module.css'

type TAdsWindow = Window & { adsbygoogle?: unknown[] }

// Exact unit sizes per screen width, inline as AdSense requires (sizing via external stylesheets isn't supported)
const RAIL_SIZES = `
.hangman_rail { width: 160px; height: 600px; }
@media (min-width: 1520px) { .hangman_rail { width: 300px; height: 600px; } }
`

const AdRail: FC<{ side: 'left' | 'right'; slot: string }> = ({ side, slot }) => {
  const isPushed = useRef(false)

  useEffect(() => {
    if (isPushed.current) return
    isPushed.current = true
    try {
      const adsWindow = window as TAdsWindow
      adsWindow.adsbygoogle = adsWindow.adsbygoogle || []
      adsWindow.adsbygoogle.push({})
    } catch {
      // Ads are optional
    }
  }, [])

  return (
    <aside className={combineClassNames(styles.rail, styles[side])} aria-label='Գովազդ'>
      <span className={styles.label}>Գովազդ</span>
      <ins
        className='adsbygoogle hangman_rail'
        style={{ display: 'inline-block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
      />
    </aside>
  )
}

// Display ads beside the game column on wide screens, kept 150px from the game
export const AdRails: FC = () => {
  const hasRoom = useMediaQuery(RAIL_MEDIA_QUERY)
  if (!ADS_ENABLED || !hasRoom) return null

  return (
    <>
      <style>{RAIL_SIZES}</style>
      {RAIL_SLOTS.left && <AdRail side='left' slot={RAIL_SLOTS.left} />}
      {RAIL_SLOTS.right && <AdRail side='right' slot={RAIL_SLOTS.right} />}
    </>
  )
}
