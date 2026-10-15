'use client'

import { FC } from 'react'
import { getImageProps } from 'next/image'
import NarrowImage from 'assets/images/gallows-narrow.jpg'
import WideImage from 'assets/images/gallows-wide.jpg'
import { useStage } from 'hooks/useStage'
import { STAGES_WITH_CLEAR_BACKGROUND } from 'helpers/constants/app'
import { combineClassNames } from 'helpers/utils/styles'
import styles from './styles.module.css'

// Phones get the narrow art; the 600px column on larger screens and landscape get the wider one.
// Both layers use the same sizes so the browser downloads one file.
const COMMON_IMAGE_PROPS = { alt: '', sizes: '(max-width: 600px) 100vw, 600px' }
const WIDE_MEDIA = '(min-width: 600px), (orientation: landscape)'

const {
  props: { srcSet: wideSrcSet },
} = getImageProps({ ...COMMON_IMAGE_PROPS, src: WideImage })
const {
  props: { srcSet: narrowSrcSet, ...narrowImgProps },
} = getImageProps({ ...COMMON_IMAGE_PROPS, src: NarrowImage })

const BackgroundPicture: FC<{ className: string; fetchPriority?: 'high' }> = ({ className, fetchPriority }) => (
  <picture className={className}>
    <source media={WIDE_MEDIA} srcSet={wideSrcSet} />
    {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative art; alt="" comes from getImageProps */}
    <img {...narrowImgProps} srcSet={narrowSrcSet} fetchPriority={fetchPriority} />
  </picture>
)

export const Background: FC = () => {
  const stage = useStage()
  const isBlurred = !STAGES_WITH_CLEAR_BACKGROUND.includes(stage)

  return (
    <div className={styles.background} aria-hidden='true'>
      {/* Fills the screen beside the game column on wide screens */}
      <BackgroundPicture className={styles.backdrop} />
      <BackgroundPicture
        className={combineClassNames(styles.column, isBlurred && styles.blurred)}
        fetchPriority='high'
      />
    </div>
  )
}
